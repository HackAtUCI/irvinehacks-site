import os
import httpx
from typing import Any
from logging import getLogger
from pydantic import BaseModel, ConfigDict


from fastapi import APIRouter, Depends, HTTPException, status

from services.slack_handler import require_slack
from services import mongodb_handler
from services.mongodb_handler import Collection

log = getLogger(__name__)

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")

router = APIRouter()


class SlackUserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str


class SlackUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    profile: SlackUserProfile


class SlackTeamJoinEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user: SlackUser


@router.post("/events")
async def handle_events(body: dict[Any, Any] = Depends(require_slack)) -> str:
    event_type = body.get("type")
    if event_type == "url_verification":
        return str(body["challenge"])
    elif event_type == "event_callback":
        await handle_event(body)
    return "invalid event"


async def handle_event(body: dict[Any, Any]) -> None:
    inner_event = body.get("event")
    if not inner_event:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY)

    if inner_event.get("type") == "team_join":
        await _handle_team_join(inner_event)


async def _handle_team_join(event_data: dict[Any, Any]) -> None:
    log.info(event_data)
    try:
        event = SlackTeamJoinEvent.model_validate(event_data)
    except Exception as e:
        log.error("Failed to validate Slack team_join event: %s", e)
        return

    email = event.user.profile.email
    log.info("Processing team_join for email: %s", email)

    # Search for a document where application_data.email matches
    user_record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"application_data.email": email}, ["_id"]
    )

    if not user_record:
        log.warning("No applicant record found for email: %s", email)
        return

    # Update doc to set is_added_to_slack: True
    await mongodb_handler.update_one(
        Collection.USERS, {"_id": user_record["_id"]}, {"is_added_to_slack": True}
    )
    log.info("Marked user %s as added to Slack", user_record["_id"])


@router.post("/sync")
async def sync_slack_users() -> dict[str, Any]:
    """Fetches Slack users and marks them as added to Slack in MongoDB."""
    if not SLACK_BOT_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SLACK_BOT_TOKEN not configured",
        )

    all_emails: list[str] = []
    cursor = None

    async with httpx.AsyncClient() as client:
        while True:
            params: dict[Any, Any] = {}
            if cursor:
                params["cursor"] = cursor

            response = await client.get(
                "https://slack.com/api/users.list",
                headers={"Authorization": f"Bearer {SLACK_BOT_TOKEN}"},
                params=params,
            )
            data = response.json()

            if not data.get("ok"):
                log.error("Slack API error: %s", data.get("error"))
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Slack API error: {data.get('error')}",
                )

            for member in data.get("members", []):
                profile = member.get("profile", {})
                email = profile.get("email")
                if email:
                    all_emails.append(email)

            cursor = data.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                break

    if not all_emails:
        return {
            "status": "success",
            "updated_count": 0,
            "message": "No emails found in Slack",
        }

    # Update all users whose application_data.email is in the list
    updated = await mongodb_handler.update(
        Collection.USERS,
        {"application_data.email": {"$in": all_emails}},
        {"is_added_to_slack": True},
    )

    return {
        "status": "success",
        "updated": updated,
        "slack_user_count": len(all_emails),
    }
