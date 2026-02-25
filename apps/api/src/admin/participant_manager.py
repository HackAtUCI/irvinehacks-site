from datetime import datetime
from logging import getLogger
from typing import Any, cast, Optional, Union

from typing_extensions import TypeAlias

from auth.user_identity import User, utc_now
from models.ApplicationData import Decision
from models.user_record import Role, Status, UserRecord
from services import mongodb_handler
from services.mongodb_handler import Collection
from routers.user import DEFAULT_CHECKIN_TIME

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
    decision: Optional[Decision]
    is_added_to_slack: bool = False
    is_waiver_signed: bool = False
    badge_number: Union[str, None] = None


PARTICIPANT_FIELDS = [
    "_id",
    "first_name",
    "last_name",
    "roles",
    "status",
    "decision",
    "checkins",
    "badge_number",
    "is_added_to_slack",
    "is_waiver_signed",
]


async def get_participants() -> list[Participant]:
    """
    Fetch all Sponsors, Judges, and Workshop Leads,
    all applicants who have a status of:
    - WAITLISTED, QUEUED, ATTENDING, WAIVER_SIGNED, CONFIRMED, ACCEPTED, or WAITLISTED,
    and all applicants who have a decisoin of:
    - ACCEPTED or WAITLISTED
    """
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
                    # TODO: Should deprecate the use of decisions in the status
                    # i.e. Status.WAITLISTED, Status.ACCEPTED, Status.REJECTED
                    # should be removed.
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
                {
                    "roles": {
                        "$in": [
                            Role.HACKER,
                            Role.MENTOR,
                            Role.VOLUNTEER,
                        ]
                    },
                    "decision": {
                        "$in": [
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
        # Error message ties to exception raised in routers/admin.py
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
    status = record.get("status")
    roles = cast(list[Role], record.get("roles"))

    if Role.HACKER not in roles:
        raise ValueError(f"Applicant is a {roles}, not a hacker.")
    if status == Status.ATTENDING:
        raise ValueError("Participant has checked in. Not eligible for queue.")
    elif status == Status.QUEUED:
        raise ValueError("Participant is already on the queue.")
    elif status == Status.CONFIRMED:
        raise ValueError("Participant should be checked in instead.")
    elif status != Status.WAIVER_SIGNED:
        raise ValueError("Participant has not signed waiver. Not eligible for queue.")

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


async def get_attending_and_late_hackers() -> list[Participant]:
    """Fetch all hackers with status ATTENDING and
    hackers with status CONFIRMED who specified an arrival_time that's not the default.
    """
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "$or": [
                {
                    "roles": Role.HACKER,
                    "status": Status.ATTENDING,
                },
                {
                    "roles": Role.HACKER,
                    "status": Status.CONFIRMED,
                    "arrival_time": {"$exists": 1, "$ne": DEFAULT_CHECKIN_TIME},
                },
            ]
        },
        PARTICIPANT_FIELDS,
    )

    return [Participant(**user) for user in records]


async def update_waiver_status(uid: str, is_signed: bool) -> bool:
    """Update is_waiver_signed field and conditionally update status."""
    record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid}, ["status"]
    )
    if not record:
        return False

    current_status = record.get("status")
    update_data: dict[str, Union[bool, Status]] = {"is_waiver_signed": is_signed}

    if current_status in (Status.WAIVER_SIGNED, Status.REVIEWED):
        update_data["status"] = Status.WAIVER_SIGNED if is_signed else Status.REVIEWED

    return await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": uid},
        update_data,
    )
