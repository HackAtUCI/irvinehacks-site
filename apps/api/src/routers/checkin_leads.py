import asyncio

from logging import getLogger
from typing import Any, Literal, Optional, Sequence

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from admin import participant_manager
from auth.authorization import require_role
from models.ApplicationData import Decision
from models.user_record import Role, Status, UserPromotionRecord
from services import mongodb_handler, sendgrid_handler
from services.mongodb_handler import Collection
from services.sendgrid_handler import (
    ApplicationUpdatePersonalization,
    Template,
)
from utils.email_handler import IH_SENDER, recover_email_from_uid
from utils.batched import batched
from routers.user import DEFAULT_CHECKIN_TIME
from routers.director import _process_decision

log = getLogger(__name__)

router = APIRouter()

HACKER_WAITLIST_MAX = 400

RSVP_REMINDER_EMAIL_TEMPLATES: dict[
    Role,
    Literal[
        Template.HACKER_RSVP_REMINDER,
        Template.MENTOR_RSVP_REMINDER,
        Template.VOLUNTEER_RSVP_REMINDER,
    ],
] = {
    Role.HACKER: Template.HACKER_RSVP_REMINDER,
    Role.MENTOR: Template.MENTOR_RSVP_REMINDER,
    Role.VOLUNTEER: Template.VOLUNTEER_RSVP_REMINDER,
}


@router.post(
    "/queue-removal",
    dependencies=[Depends(require_role({Role.DIRECTOR, Role.CHECKIN_LEAD}))],
)
async def queue_removal() -> None:
    """Remove CONFIRMED participants that did not show up to in person check in"""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "roles": Role.HACKER,
            "status": Status.CONFIRMED,
            "arrival_time": DEFAULT_CHECKIN_TIME,
        },
    )

    if not records:
        log.info(
            "All CONFIRMED participants who didn't specify a late arrival showed up."
        )
        return

    log.info(f"Changing {len(records)} status to {Status.WAIVER_SIGNED}.")
    log.info(f"Changing {len(records)} decision to {Decision.WAITLISTED}.")

    await asyncio.gather(
        *(
            _process_decision(batch, Decision.WAITLISTED, no_modifications_ok=True)
            for batch in batched([str(record["_id"]) for record in records], 100)
        )
    )

    await asyncio.gather(
        *(
            _process_status(batch, Status.WAIVER_SIGNED)
            for batch in batched([str(record["_id"]) for record in records], 100)
        )
    )


@router.post(
    "/queue-participants",
    dependencies=[Depends(require_role({Role.DIRECTOR, Role.CHECKIN_LEAD}))],
)
async def queue_participants() -> None:
    """Remove QUEUED participants from queue and send them email notification."""

    await queue_removal()

    records = []
    settings = await mongodb_handler.retrieve_one(
        Collection.SETTINGS, {"_id": "queue"}, ["users_queue"]
    )
    num_spots = HACKER_WAITLIST_MAX - len(
        await participant_manager.get_attending_and_late_hackers()
    )

    if not settings or "users_queue" not in settings:
        log.error("Queue settings or users_queue field is missing.")
        return

    if len(settings["users_queue"]) == 0:
        raise HTTPException(status_code=400, detail="QUEUE EMPTY")
    if num_spots <= 0:
        raise HTTPException(status_code=400, detail="VENUE FULL")
    num_queued = min(len(settings["users_queue"]), num_spots)
    uids_to_promote = settings["users_queue"][:num_queued]

    await mongodb_handler.raw_update_one(
        Collection.SETTINGS,
        {"_id": "queue"},
        {"$pull": {"users_queue": {"$in": uids_to_promote}}},
    )
    records = await mongodb_handler.retrieve(
        Collection.USERS, {"_id": {"$in": uids_to_promote}}, ["_id", "first_name"]
    )

    validated_records = [UserPromotionRecord.model_validate(r) for r in records]

    await asyncio.gather(
        *(
            _process_status(batch, Status.CONFIRMED)
            for batch in batched([record.uid for record in validated_records], 100)
        )
    )

    personalizations = []
    for record in validated_records:
        personalizations.append(
            ApplicationUpdatePersonalization(
                email=recover_email_from_uid(record.uid),
                first_name=record.first_name,
            )
        )

    log.info(f"Sending queued emails to {len(records)} hackers")

    if len(records) > 0:
        await sendgrid_handler.send_email(
            Template.WAITLIST_QUEUED_EMAIL,
            IH_SENDER,
            personalizations,
            True,
        )


class LateArrivalRecord(BaseModel):
    id: str
    first_name: str
    last_name: str
    arrival_time: str
    status: str
    decision: Optional[str] = None


@router.get(
    "/late-arrivals",
    dependencies=[Depends(require_role({Role.DIRECTOR, Role.CHECKIN_LEAD}))],
)
async def late_arrivals() -> list[LateArrivalRecord]:
    """Return all CONFIRMED hackers who specified a non-default arrival time."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "roles": Role.HACKER,
            "status": Status.CONFIRMED,
            "arrival_time": {"$exists": True, "$ne": DEFAULT_CHECKIN_TIME},
        },
        ["_id", "first_name", "last_name", "arrival_time", "status", "decision"],
    )

    return [
        LateArrivalRecord(
            id=str(r["_id"]),
            first_name=r["first_name"],
            last_name=r["last_name"],
            arrival_time=r["arrival_time"],
            status=r["status"],
            decision=r.get("decision"),
        )
        for r in records
    ]


@router.post(
    "/move-to-waitlist/{uid}",
    dependencies=[Depends(require_role({Role.DIRECTOR, Role.CHECKIN_LEAD}))],
)
async def move_to_waitlist(uid: str) -> None:
    """Set the given user's status to WAIVER_SIGNED and decision to WAITLISTED."""
    record = await mongodb_handler.retrieve_one(Collection.USERS, {"_id": uid}, ["_id"])
    if not record:
        raise HTTPException(status_code=404, detail="User not found.")

    log.info(
        f"Changing {uid} status to {Status.WAIVER_SIGNED}"
        + f" and decision to {Decision.WAITLISTED}."
    )

    await _process_decision([uid], Decision.WAITLISTED, no_modifications_ok=True)
    await _process_status([uid], Status.WAIVER_SIGNED, no_modifications_ok=True)


@router.get(
    "/close-walkins",
    dependencies=[Depends(require_role({Role.DIRECTOR, Role.CHECKIN_LEAD}))],
)
async def close_walkins() -> None:
    """Notify queued participants that we have reached maximum capacity."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "roles": Role.HACKER,
            "decision": {"$in": [Decision.WAITLISTED]},
        },
        ["_id", "first_name"],
    )

    validated_records = [UserPromotionRecord.model_validate(r) for r in records]

    personalizations = []
    for record in validated_records:
        personalizations.append(
            ApplicationUpdatePersonalization(
                email=recover_email_from_uid(record.uid),
                first_name=record.first_name,
            )
        )

    log.info(f"Sending emails to {len(validated_records)} hackers that we are full.")

    if len(validated_records) > 0:
        await sendgrid_handler.send_email(
            Template.WAITLIST_CLOSED_EMAIL,
            IH_SENDER,
            personalizations,
            True,
        )


async def _process_status(
    uids: Sequence[str], status: Status, *, no_modifications_ok: bool = False
) -> None:
    any_modified = await mongodb_handler.update(
        Collection.USERS, {"_id": {"$in": uids}}, {"status": status}
    )
    if not any_modified and not no_modifications_ok:
        raise RuntimeError(
            "Expected to modify at least one document, but none were modified."
        )
