from logging import getLogger
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, TypeAdapter, ValidationError

from auth.authorization import require_role
from auth.user_identity import User
from models.user_record import Role
from services import mongodb_handler
from services.mongodb_handler import BaseRecord, Collection


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
