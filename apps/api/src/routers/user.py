from logging import getLogger
from typing import Annotated, Union

from fastapi import APIRouter, Depends, Form, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr

from auth import user_identity
from auth.user_identity import User, use_user_identity
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils.user_record import Role

log = getLogger(__name__)

router = APIRouter()


class IdentityResponse(BaseModel):
    uid: Union[str, None] = None
    status: Union[str, None] = None
    role: Union[Role, None] = None


@router.post("/login")
async def login(email: EmailStr = Form()) -> RedirectResponse:
    log.info("%s requested to log in", email)
    if user_identity.uci_email(email):
        # redirect user to UCI SSO login endpoint, changing to GET method
        return RedirectResponse("/api/saml/login", status.HTTP_303_SEE_OTHER)
    return RedirectResponse("/api/guest/login", status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/logout")
async def log_out() -> RedirectResponse:
    """Clear user identity cookie."""
    response = RedirectResponse("/", status.HTTP_303_SEE_OTHER)
    user_identity.remove_user_identity(response)
    return response


@router.get("/me", response_model=IdentityResponse)
async def me(
    user: Annotated[Union[User, None], Depends(use_user_identity)]
) -> dict[str, object]:
    log.info(user)
    if not user:
        return dict()
    user_record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": user.uid}
    )
    if not user_record:
        return {"uid": user.uid}
    return {**user_record, "uid": user.uid}
