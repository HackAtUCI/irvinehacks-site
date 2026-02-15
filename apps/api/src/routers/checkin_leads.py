import asyncio

from logging import getLogger
from typing import Any, Sequence

from fastapi import APIRouter, Depends

from admin import participant_manager
from auth.authorization import require_role
from models.user_record import Role, Status, UserPromotionRecord
from pydantic import TypeAdapter
from services import mongodb_handler, sendgrid_handler
from services.mongodb_handler import Collection
from services.sendgrid_handler import (
    ApplicationUpdatePersonalization,
    Template,
)
from utils.email_handler import IH_SENDER, recover_email_from_uid
from utils.batched import batched

log = getLogger(__name__)

router = APIRouter()

HACKER_WAITLIST_MAX = 400


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
        },
    )

    if not records:
        log.info("All CONFIRMED participants showed up.")
        return

    log.info(f"Changing status of {len(records)} to {Status.WAIVER_SIGNED}")

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
    records = []
    settings = await mongodb_handler.retrieve_one(
        Collection.SETTINGS, {"_id": "queue"}, ["users_queue"]
    )
    if not settings or "users_queue" not in settings:
        log.error("Queue settings or users_queue field is missing.")
        return
    num_queued = min(
        len(settings["users_queue"]),
        HACKER_WAITLIST_MAX - len(await participant_manager.get_participants()),
    )
    uids_to_promote = settings["users_queue"][:num_queued]

    await mongodb_handler.raw_update_one(
        Collection.SETTINGS, 
        {"_id": "queue"}, 
        {"$pull": {"users_queue": {"$in": uids_to_promote}}}
    )
    records = await mongodb_handler.retrieve(
        Collection.USERS, {"_id": {"$in": uids_to_promote}}, ["_id", "first_name"]
    )

    validated_records = TypeAdapter(list[UserPromotionRecord]).validate_python(records)

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
            "status": {"$in": [Status.QUEUED, Status.WAIVER_SIGNED, Status.CONFIRMED]},
        },
        ["_id", "first_name"],
    )

    personalizations = []
    for record in records:
        personalizations.append(
            ApplicationUpdatePersonalization(
                email=recover_email_from_uid(record["_id"]),
                first_name=record["first_name"],
            )
        )

    log.info(f"Sending emails to {len(records)} hackers that we are at max capacity.")

    if len(records) > 0:
        await sendgrid_handler.send_email(
            Template.WAITLIST_CLOSED_EMAIL,
            IH_SENDER,
            personalizations,
            True,
        )


async def _process_status(uids: Sequence[str], status: Status) -> None:
    ok = await mongodb_handler.update(
        Collection.USERS, {"_id": {"$in": uids}}, {"status": status}
    )
    if not ok:
        raise RuntimeError("gg wp")
