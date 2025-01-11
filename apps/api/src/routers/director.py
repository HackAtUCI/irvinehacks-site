from datetime import datetime
from logging import getLogger
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, TypeAdapter, ValidationError

from auth.authorization import require_role
from auth.user_identity import User, uci_email, utc_now
from models.user_record import Role
from services import mongodb_handler, sendgrid_handler
from services.mongodb_handler import BaseRecord, Collection
from services.sendgrid_handler import PersonalizationData, Template
from routers.admin import recover_email_from_uid
from utils.email_handler import IH_SENDER

log = getLogger(__name__)

router = APIRouter()

require_director = require_role({Role.DIRECTOR})


class ApplyReminderSenders(BaseModel):
    _id: str
    senders: list[tuple[datetime, str, int]]


class ApplyReminderRecipients(BaseModel):
    _id: str
    recipients: list[str]


class OrganizerSummary(BaseRecord):
    first_name: str
    last_name: str
    roles: list[Role]


class RawOrganizerData(BaseModel):
    email: str
    first_name: str
    last_name: str
    roles: list[Role]


def uci_scoped_uid(email: EmailStr) -> str:
    """Provide a scoped unique identifier based on the UCI email"""
    local, domain = email.split("@")
    reversed_domains = ".".join(reversed(domain.split(".")))
    cleaned_local = local.replace(".", "..")
    return f"{reversed_domains}.{cleaned_local}"


def roles_includes_organizer(roles: list[Role]) -> bool:
    return Role.ORGANIZER in roles


def roles_includes_applicant(roles: list[Role]) -> bool:
    return Role.APPLICANT in roles


async def _get_apply_reminder_email_recipients() -> Optional[dict[str, Any]]:
    try:
        apply_reminder_recipients = await mongodb_handler.retrieve_one(
            Collection.EMAILS, {"_id": "apply_reminder"}, ["recipients"]
        )
    except RuntimeError:
        log.error("Could not get apply reminder email recipients")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    return apply_reminder_recipients


@router.get("/organizers")
async def organizers(
    user: Annotated[User, Depends(require_director)]
) -> list[OrganizerSummary]:
    """Get records of all organizers"""
    log.info("%s requested organizer", user)

    records: list[dict[str, object]] = await mongodb_handler.retrieve(
        Collection.USERS, {"roles": Role.ORGANIZER}
    )

    try:
        return TypeAdapter(list[OrganizerSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.post("/organizers", status_code=status.HTTP_201_CREATED)
async def add_organizer(
    user: Annotated[User, Depends(require_director)],
    email: EmailStr = Body(),
    first_name: str = Body(),
    last_name: str = Body(),
    roles: list[Role] = Body(),
) -> None:
    """Adds an organizer record"""
    log.info("%s adding organizer", user)

    if not uci_email(email):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "User doesn't have a UCI email."
        )

    if not roles_includes_organizer(roles):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "User doesn't have organizer role."
        )

    if roles_includes_applicant(roles):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "User has submitted an application."
        )

    uid = uci_scoped_uid(email)
    await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": uid},
        {
            "_id": uid,
            "first_name": first_name,
            "last_name": last_name,
            "roles": roles,
        },
        upsert=True,
    )


@router.get("/apply-reminder", dependencies=[Depends(require_director)])
async def get_apply_reminder_senders() -> list[tuple[datetime, str, int]]:
    """Get data about every sender that sent out apply reminder emails"""
    records = await mongodb_handler.retrieve_one(
        Collection.EMAILS, {"_id": "apply_reminder"}, ["senders"]
    )

    if not records:
        log.error("Could not retrieve apply reminder email senders")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    senders = ApplyReminderSenders.model_validate(records)

    try:
        return TypeAdapter(list[tuple[datetime, str, int]]).validate_python(
            senders.senders
        )
    except ValidationError:
        raise RuntimeError("Could not parse apply reminder email sender data")


@router.post("/apply-reminder")
async def apply_reminder(user: Annotated[User, Depends(require_director)]) -> None:
    """Send email to users who haven't submitted an app"""
    not_yet_applied: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {"last_login": {"$exists": True}, "roles": {"$exists": False}},
        ["_id"],
    )

    apply_reminder_recipients: Optional[dict[str, Any]] = (
        await _get_apply_reminder_email_recipients()
    )

    if not apply_reminder_recipients:
        log.error("Could not retrieve apply reminder email recipients")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    validated_recipients = ApplyReminderRecipients.model_validate(
        apply_reminder_recipients
    )

    recipients = set(validated_recipients.recipients)

    personalizations = []
    new_recipients = []
    for record in not_yet_applied:
        if record["_id"] not in recipients:
            new_recipients.append(record["_id"])
            personalizations.append(
                PersonalizationData(
                    email=recover_email_from_uid(record["_id"]),
                )
            )

    log.info(f"{user} sending apply reminder emails to {len(new_recipients)} users")

    try:
        await mongodb_handler.raw_update_one(
            Collection.EMAILS,
            {"_id": "apply_reminder"},
            {
                "$push": {
                    "senders": (utc_now(), user.uid, len(new_recipients)),
                    "recipients": {"$each": new_recipients},
                },
            },
            upsert=True,
        )
    except RuntimeError:
        log.error("Error when attempting to update list of senders and recipients")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    if len(new_recipients) > 0:
        await sendgrid_handler.send_email(
            Template.APPLY_REMINDER,
            IH_SENDER,
            personalizations,
            True,
        )
