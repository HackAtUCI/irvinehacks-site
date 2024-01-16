from logging import getLogger

from pydantic import EmailStr

from models.ApplicationData import Decision
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils.user_record import Applicant, Role, Status, UserRecord

log = getLogger(__name__)


async def process_waiver_completion(uid: str, email: EmailStr) -> None:
    """
    Update user record with WAIVER_SIGNED status if the user is filling out the
    waiver for the first time and if the user has a status of ACCEPTED.

    If no user record exists, insert a new record. In all other cases, ignore
    the submission.
    """
    record = await mongodb_handler.retrieve_one(Collection.USERS, {"_id": uid})

    if not record:
        # external participant, create database record
        log.info(f"external participant {email} signed waiver.")
        await mongodb_handler.insert(
            Collection.USERS, {"_id": uid, "status": Status.WAIVER_SIGNED}
        )
        return

    user_record = UserRecord.model_validate(record)
    if user_record.role == Role.APPLICANT:
        applicant_record = Applicant.model_validate(record)
        if applicant_record.status in (Status.WAIVER_SIGNED, Status.CONFIRMED):
            log.warning(
                f"User {uid} attempted to sign waiver but already signed it previously."
            )
            return
        elif applicant_record.status != Decision.ACCEPTED:
            log.warning(f"User {uid} attempted to sign waiver but was not accepted.")
            return

    log.info(f"User {uid} signed waiver.")
    # Note: this should be able to account for other participant types
    # including mentors, volunteers, etc.
    await mongodb_handler.update_one(
        Collection.USERS, {"_id": uid}, {"status": Status.WAIVER_SIGNED}
    )
