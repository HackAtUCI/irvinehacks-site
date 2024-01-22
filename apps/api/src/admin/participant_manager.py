from logging import getLogger
from typing import Optional

from auth.user_identity import User, utc_now
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils.user_record import Role, Status

log = getLogger(__name__)


async def get_attending_applicants() -> list[dict[str, object]]:
    """Fetch all applicants who have a status of ATTENDING"""
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"role": Role.APPLICANT, "status": Status.ATTENDING},
        [
            "_id",
            "status",
            "role",
            "application_data.first_name",
            "application_data.last_name",
        ],
    )

    return records


async def check_in_applicant(uid: str, associate: User) -> None:
    """Check in applicant at IrvineHacks"""
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid, "role": Role.APPLICANT}
    )
    if not record or record["status"] != Status.ATTENDING:
        raise ValueError

    new_checkin_entry = (utc_now(), associate.uid)

    update_status = await mongodb_handler.raw_update_one(
        Collection.USERS,
        {"_id": uid},
        {
            "$push": {"checkins": new_checkin_entry},
        },
    )
    if not update_status:
        raise RuntimeError(f"Could not update check-in record for {uid}.")

    log.info(f"Applicant {uid} checked in by {associate.uid}")
