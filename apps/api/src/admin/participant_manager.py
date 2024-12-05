from datetime import datetime
from logging import getLogger
from typing import Any, Optional, Union

from typing_extensions import TypeAlias

from auth.user_identity import User, utc_now
from models.ApplicationData import Decision
from models.user_record import Role, Status, UserRecord
from services import mongodb_handler
from services.mongodb_handler import Collection

log = getLogger(__name__)

Checkin: TypeAlias = tuple[datetime, str]

NON_HACKER_ROLES = (
    Role.MENTOR,
    Role.VOLUNTEER,
    Role.SPONSOR,
    Role.JUDGE,
    Role.WORKSHOP_LEAD,
)


class Participant(UserRecord):
    """Participants attending the event."""

    checkins: list[Checkin] = []
    status: Union[Status, Decision] = Status.REVIEWED
    badge_number: Union[str, None] = None


PARTICIPANT_FIELDS = [
    "_id",
    "first_name",
    "last_name",
    "role",
    "status",
    "role",
    "checkins",
    "badge_number",
]


async def get_hackers() -> list[Participant]:
    """Fetch all applicants who have a status of ATTENDING, WAIVER_SIGNED, CONFIRMED,
    or WAITLISTED."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "role": Role.APPLICANT,
            "status": {
                "$in": [
                    Status.ATTENDING,
                    Status.WAIVER_SIGNED,
                    Status.CONFIRMED,
                    Decision.ACCEPTED,
                    Decision.WAITLISTED,
                ]
            },
        },
        PARTICIPANT_FIELDS,
    )

    return [Participant(**user) for user in records]


async def get_non_hackers() -> list[Participant]:
    """Fetch all non-hackers participating in the event."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS, {"role": {"$in": NON_HACKER_ROLES}}, PARTICIPANT_FIELDS
    )
    return [Participant(**user) for user in records]


async def check_in_participant(uid: str, badge_number: str, associate: User) -> None:
    """Check in participant at IrvineHacks"""
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid, "role": {"$exists": True}}
    )

    if not record or record.get("status", "") not in (
        Status.ATTENDING,
        Status.CONFIRMED,
    ):
        raise ValueError

    new_checkin_entry: Checkin = (utc_now(), associate.uid)

    update_status = await mongodb_handler.raw_update_one(
        Collection.USERS,
        {"_id": uid},
        {
            "$push": {"checkins": new_checkin_entry},
            "$set": {"badge_number": badge_number},
        },
    )
    if not update_status:
        raise RuntimeError(f"Could not update check-in record for {uid}.")

    log.info(f"Applicant {uid} ({badge_number}) checked in by {associate.uid}")


async def confirm_attendance_non_hacker(uid: str, director: User) -> None:
    """Update status for Role.Attending for non-hackers."""

    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid, "status": Status.WAIVER_SIGNED}
    )

    if not record or record["role"] not in NON_HACKER_ROLES:
        raise ValueError

    update_status = await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": uid},
        {"status": Status.ATTENDING},
    )

    if not update_status:
        raise RuntimeError(f"Could not update status to ATTENDING for {uid}.")

    log.info(f"Non-hacker {uid} status updated to attending by {director.uid}")


async def subevent_checkin(event_id: str, uid: str, organizer: User) -> None:
    checkin = (uid, utc_now())
    res = await mongodb_handler.raw_update_one(
        Collection.EVENTS, {"_id": event_id}, {"$push": {"checkins": checkin}}
    )
    if not res:
        raise RuntimeError(f"Could not update events table for {event_id} with {uid}")
    log.info(f"{organizer.uid} checked in {uid} to {event_id}")
