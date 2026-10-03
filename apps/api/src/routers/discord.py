import os
from logging import getLogger
from typing import Any, Optional

import httpx
from fastapi import APIRouter, HTTPException, status
from pymongo import UpdateOne

from services import mongodb_handler
from services.mongodb_handler import Collection

log = getLogger(__name__)

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DISCORD_GUILD_ID = os.getenv("DISCORD_GUILD_ID")

router = APIRouter()


def _normalize_discord_name(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    normalized = value.strip().lower()
    if normalized.startswith("@"):
        normalized = normalized[1:]
    if "#" in normalized:
        normalized = normalized.split("#", 1)[0]

    return normalized or None


def _member_names(member: dict[str, Any]) -> set[str]:
    user = member.get("user", {})
    names = {
        _normalize_discord_name(member.get("nick")),
        _normalize_discord_name(user.get("username")),
        _normalize_discord_name(user.get("global_name")),
    }
    return {name for name in names if name}


async def _fetch_discord_member_names() -> set[str]:
    if not DISCORD_BOT_TOKEN or not DISCORD_GUILD_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Discord sync is not configured",
        )

    names: set[str] = set()
    after = "0"

    async with httpx.AsyncClient() as client:
        while True:
            response = await client.get(
                f"https://discord.com/api/v10/guilds/{DISCORD_GUILD_ID}/members",
                headers={"Authorization": f"Bot {DISCORD_BOT_TOKEN}"},
                params={"limit": 1000, "after": after},
            )

            if response.status_code >= 400:
                log.error(
                    "Discord API error: status=%s body=%s",
                    response.status_code,
                    response.text,
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Discord API error",
                )

            members = response.json()
            for member in members:
                names.update(_member_names(member))

            if len(members) < 1000:
                break

            after = members[-1]["user"]["id"]

    return names


@router.post("/sync")
async def sync_discord_users() -> dict[str, Any]:
    """Mark participants as added to Discord by matching application usernames."""
    if not DISCORD_BOT_TOKEN or not DISCORD_GUILD_ID:
        return {
            "status": "disabled",
            "updated_count": 0,
            "message": "Discord sync is not configured",
        }

    discord_names = await _fetch_discord_member_names()
    if not discord_names:
        return {
            "status": "success",
            "updated_count": 0,
            "discord_user_count": 0,
        }

    applicants = await mongodb_handler.retrieve(
        Collection.USERS,
        {"application_data.discord_username": {"$exists": True, "$ne": ""}},
        ["_id", "application_data.discord_username"],
    )

    operations = []
    for applicant in applicants:
        application_data = applicant.get("application_data", {})
        if not isinstance(application_data, dict):
            continue

        discord_username = _normalize_discord_name(
            application_data.get("discord_username")
        )
        if discord_username in discord_names:
            operations.append(
                UpdateOne(
                    {"_id": applicant["_id"]},
                    {"$set": {"is_added_to_discord": True}},
                )
            )

    updated = await mongodb_handler.bulk_update(Collection.USERS, operations)

    return {
        "status": "success",
        "updated": updated,
        "updated_count": len(operations),
        "discord_user_count": len(discord_names),
    }
