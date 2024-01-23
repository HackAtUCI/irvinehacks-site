from logging import getLogger
from typing import Any, Optional, Union

from auth.user_identity import User, utc_now
from models.ApplicationData import Decision
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils.user_record import Role, Status, UserRecord

log = getLogger(__name__)


class Participant(UserRecord):
    """Participants attending the event."""

    first_name: str
    last_name: str
    status: Union[Status, Decision]


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
        [
            "_id",
            "status",
            "role",
            "application_data.first_name",
            "application_data.last_name",
        ],
    )

    return [Participant(**user, **user["application_data"]) for user in records]


async def check_in_applicant(
    record: Optional[dict[str, object]], associate: User
) -> None:
    """Check in applicant at IrvineHacks"""
    if not record or record["status"] != Status.ATTENDING:
        raise ValueError

    await check_in(record, associate)


async def check_in(record: dict[str, object], associate: User) -> None:
    """Check in applicant at IrvineHacks"""
    new_checkin_entry = (utc_now(), associate.uid)

    update_status = await mongodb_handler.raw_update_one(
        Collection.USERS,
        {"_id": record["uid"]},
        {
            "$push": {"checkins": new_checkin_entry},
        },
    )
    if not update_status:
        raise RuntimeError(f"Could not update check-in record for {record['uid']}.")

    log.info(f"User {record['uid']} checked in by {associate.uid}")
