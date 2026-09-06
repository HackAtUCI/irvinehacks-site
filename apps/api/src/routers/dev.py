from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from auth import user_identity
from auth.user_identity import NativeUser
from utils.hackathon_context import HackathonName, hackathon_name_ctx

router = APIRouter()


@router.get("/impersonate/{ucinetid}")
async def impersonate(ucinetid: str) -> RedirectResponse:
    """Simulate a user identity during local development (does not require https)."""
    user = NativeUser(
        ucinetid=ucinetid,
        display_name="Local Dev",
        email=f"{ucinetid}@uci.edu",
        affiliations=[],
    )

    redirect_path = (
        "/"
        if hackathon_name_ctx.get() == HackathonName.ZOTHACKS
        else "/admin/dashboard"
    )
    res = RedirectResponse(redirect_path, status_code=303)
    user_identity.issue_user_identity(user, res)
    return res
