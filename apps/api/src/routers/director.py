from logging import getLogger
from typing import Annotated, Any, Literal, Mapping, Optional, Sequence

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


class Organizer(BaseRecord):
    first_name: str
    last_name: str
    roles: list[Role]


@router.get("/organizers")
async def organizers(
    user: Annotated[User, Depends(require_director)]
) -> list[Organizer]:
    """Get records of all organizers"""
    log.info("%s requested organizer", user)

    records: list[dict[str, object]] = await mongodb_handler.retrieve(
        Collection.USERS, {"roles": Role.ORGANIZER}
    )

    try:
        return TypeAdapter(list[Organizer]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")
