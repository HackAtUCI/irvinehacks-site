from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from typing import Optional

from auth import user_identity
from auth.user_identity import COOKIE_NAME, NativeUser

router = APIRouter()


@router.get("/impersonate/{ucinetid}")
async def impersonate(ucinetid: str, application: Optional[str] = None) -> RedirectResponse:
    """Simulate a user identity during local development (does not require https)."""
    user = NativeUser(
        ucinetid=ucinetid,
        display_name="Local Dev",
        email="dev@irvinehacks.com",
        affiliations=[],
    )
    if application is not None:
        res = RedirectResponse(f"/portal?application={application}", status_code=303)
    else:
        res = RedirectResponse("/portal", status_code=303)

    jwt_token = user_identity._generate_jwt_token(user)
    res.set_cookie(COOKIE_NAME, jwt_token, max_age=4000, httponly=True)
    return res
