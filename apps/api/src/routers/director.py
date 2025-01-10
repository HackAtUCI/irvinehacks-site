from logging import getLogger
from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, TypeAdapter, ValidationError

from auth.authorization import require_role
from auth.user_identity import User, uci_email
from models.user_record import Role
from services import mongodb_handler, sendgrid_handler
from services.mongodb_handler import BaseRecord, Collection
from services.sendgrid_handler import ApplicationUpdatePersonalization, Template
from routers.admin import recover_email_from_uid
from utils.email_handler import IH_SENDER

log = getLogger(__name__)

router = APIRouter()

require_director = require_role({Role.DIRECTOR})


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


@router.post("/apply-reminder", dependencies=[Depends(require_director)])
async def apply_reminder() -> None:
    """Send email to users who haven't submitted an app"""
    not_yet_applied: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {"last_login": {"$exists": True}, "roles": {"$exists": False}},
        ["_id", "first_name"],
    )

    personalizations = []
    for record in not_yet_applied:
        personalizations.append(
            ApplicationUpdatePersonalization(
                email=recover_email_from_uid(record["_id"]),
                first_name=record["first_name"],
            )
        )

    log.info(f"Sending RSVP reminder emails to {len(not_yet_applied)} applicants")

    await sendgrid_handler.send_email(
        Template.APPLY_REMINDER,
        IH_SENDER,
        personalizations,
        True,
    )
