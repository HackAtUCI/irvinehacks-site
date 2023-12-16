from logging import getLogger
from urllib.parse import urlencode

from fastapi import APIRouter, Cookie, Depends, Form, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import EmailStr

from auth import guest_auth, user_identity

log = getLogger(__name__)

router = APIRouter()


def guest_email(email: EmailStr = Form()) -> str:
    """Require a university guest (non-UCI) email as a form field."""
    if user_identity.uci_email(email):
        log.info("%s attempted to log in as guest.", email)
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "UCI affiliates must log in with SSO."
        )
    if email.endswith("@hackuci.com"):
        # TODO: sponsor authentication
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED)
    if not email.endswith(".edu"):
        log.info("%s attempted to log in as guest.", email)
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "Only .edu emails are allowed to log in."
        )
    return email


@router.post("/login")
async def guest_login(email: EmailStr = Depends(guest_email)) -> RedirectResponse:
    """Generate login passphrase and set cookie with confirmation token.
    The initiation will send an email with the passphrase."""
    try:
        confirmation = await guest_auth.initiate_guest_login(email)
    except RuntimeError as err:
        log.exception("During guest login: %s", err)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    if not confirmation:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS)

    # Redirect to guest login page on client
    # which displays a message to check email and enter passphrase
    query = urlencode({"email": email})
    response = RedirectResponse(f"/guest-login?{query}", status.HTTP_303_SEE_OTHER)
    response.set_cookie(
        "guest_confirmation", confirmation, max_age=600, secure=True, httponly=True
    )
    return response


@router.post("/verify")
async def verify_guest(
    email: EmailStr = Depends(guest_email),
    passphrase: str = Form(),
    guest_confirmation: str = Cookie(),
) -> RedirectResponse:
    """Verify guest token"""
    if not await guest_auth.verify_guest_credentials(
        email, passphrase, guest_confirmation
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unauthorized")

    log.info("%s authenticated as guest.", email)
    guest = guest_auth.acquire_guest_identity(email)

    res = RedirectResponse("/portal", status_code=status.HTTP_303_SEE_OTHER)
    user_identity.issue_user_identity(guest, res)
    return res
