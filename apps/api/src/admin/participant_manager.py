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

OUTSIDE_ROLES = (
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
    "roles",
    "status",
    "checkins",
    "badge_number",
]


async def get_participants() -> list[Participant]:
    """Fetch all Sponsors, Judges, and Workshop Leads. Also applicants who have a
    status of ATTENDING, WAIVER_SIGNED, CONFIRMED, or WAITLISTED."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "$or": [
                {
                    "roles": {
                        "$in": [
                            Role.SPONSOR,
                            Role.JUDGE,
                            Role.WORKSHOP_LEAD,
                        ]
                    }
                },
                {
                    "roles": {
                        "$in": [
                            Role.HACKER,
                            Role.MENTOR,
                            Role.VOLUNTEER,
                        ]
                    },
                    "status": {
                        "$in": [
                            Status.WAITLISTED,
                            Status.QUEUED,
                            Status.ATTENDING,
                            Status.WAIVER_SIGNED,
                            Status.CONFIRMED,
                            Decision.ACCEPTED,
                            Decision.WAITLISTED,
                        ]
                    },
                },
            ],
        },
        PARTICIPANT_FIELDS,
    )

    return [Participant(**user) for user in records]


async def check_in_participant(uid: str, associate: User) -> None:
    """Check in participant at IrvineHacks"""
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid, "roles": {"$exists": True}}, ["status"]
    )
    if not record:
        raise ValueError("No application record found.")
    elif record.get("status", "") not in (
        Status.ATTENDING,
        Status.CONFIRMED,
    ):
        raise ValueError(
            f'User is {record.get("status", "")} and can not be checked in.'
        )

    new_checkin_entry: Checkin = (utc_now(), associate.uid)

    update_status = await mongodb_handler.raw_update_one(
        Collection.USERS,
        {"_id": uid},
        {
            "$push": {"checkins": new_checkin_entry},
            "$set": {"status": Status.ATTENDING},
        },
    )
    if not update_status:
        raise RuntimeError(f"Could not update check-in record for {uid}.")
    log.info(f"Applicant {uid} checked in by {associate.uid}")


async def add_participant_to_queue(uid: str, associate: User) -> None:
    """Add waitlisted participant to queue at IrvineHacks"""
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": uid, "roles": {"$exists": True}},
        ["status", "decision", "roles"],
    )

    if record is None:
        raise ValueError("No application record found.")
    roles = record.get("roles")

    if Role.HACKER not in roles:
        raise ValueError(f'Applicant is a {record.get("roles", "")}, not a hacker.')
    if record.get("decision") == Decision.ACCEPTED:
        raise ValueError("Applicant decision is accepted and should be checked in.")
    elif record.get("decision") == Decision.REJECTED:
        raise ValueError("Applicant decision is rejected. Not eligible for hackathon.")
    if record.get("status", "") == Status.ATTENDING:
        raise ValueError("Participant has checked in. Not eligible for queue.")
    elif record.get("status", "") != Status.WAIVER_SIGNED:
        raise ValueError("Participant has checked in. Not eligible for queue.")

    update_status = await mongodb_handler.raw_update_one(
        Collection.USERS, {"_id": uid}, {"$set": {"status": Status.QUEUED}}
    )

    if not update_status:
        log.info(f"{uid} has been queued before.")

    await mongodb_handler.raw_update_one(
        Collection.SETTINGS,
        {"_id": "queue"},
        {"$push": {"users_queue": uid}},
        upsert=True,
    )
    log.info(f"Applicant {uid} added to queue by {associate.uid}")


async def confirm_attendance_outside_participants(uid: str, director: User) -> None:
    """Update status from WAIVER_SIGNED to ATTENDING for outside participants."""

    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": uid, "roles": {"$in": OUTSIDE_ROLES}},
        ["status"],
    )

    if not record:
        raise ValueError

    status = record.get("status")
    if status != Status.WAIVER_SIGNED:
        log.error("Cannot confirm attendance for %s with status %s", uid, status)
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
