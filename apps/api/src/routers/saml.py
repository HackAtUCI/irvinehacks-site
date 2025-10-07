import json
import os
from urllib.parse import urlparse
from functools import lru_cache
from logging import getLogger
from pathlib import Path
from typing import Annotated, Any, Mapping

from fastapi import APIRouter, Form, HTTPException, Request, status
from fastapi.datastructures import URL
from fastapi.responses import RedirectResponse, Response
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings

from auth.user_identity import NativeUser, issue_user_identity, utc_now
from services import mongodb_handler
from services.mongodb_handler import Collection

from utils.hackathon_context import hackathon_name_ctx, HackathonName

log = getLogger(__name__)

router = APIRouter()

STAGING_ENV = os.getenv("DEPLOYMENT") == "STAGING"
SP_CRT = os.getenv("SP_CRT")
SP_KEY = os.getenv("SP_KEY")


ALLOWED_RELAY_HOSTS = {"zothacks.com", "www.zothacks.com"}


def _is_valid_relay_state(relay_state: str) -> bool:
    # allow same-origin relative paths
    if relay_state.startswith("/"):
        return True

    # allow absolute https URLs only for hosts in ALLOWED_RELAY_HOSTS
    try:
        parsed = urlparse(relay_state)
    except Exception:
        return False

    if parsed.scheme != "https":
        return False

    hostname = parsed.hostname or ""
    if hostname in ALLOWED_RELAY_HOSTS:
        return True

    return False


def _get_settings_file_name() -> str:
    hackathon_name = hackathon_name_ctx.get()
    if hackathon_name == HackathonName.IRVINEHACKS:
        if STAGING_ENV:
            return "irvinehacks-settings-staging.json"
        return "irvinehacks-settings-prod.json"

    # TODO: Create staging settings for zothacks
    elif hackathon_name == HackathonName.ZOTHACKS:
        return "zothacks-settings-prod.json"


@lru_cache
def _get_saml_settings() -> OneLogin_Saml2_Settings:
    """
    Loads settings along with SP certificate and key.
    Similar to OneLogin_Saml2_Settings._load_settings_from_file,
    but chooses values based on staging or production environment
    and can load values from environment variables instead of files.
    """
    BASE_PATH = Path("configuration/saml")

    if not SP_KEY:
        raise ValueError("SP_KEY is not defined")

    def _read_json(filename: str) -> dict[str, Any]:
        with open(BASE_PATH / filename) as file:
            data: dict[str, Any] = json.load(file)
            return data

    settings_filename = _get_settings_file_name()
    advanced_settings_filename = "advanced_settings.json"
    settings = {
        **_read_json(settings_filename),
        **_read_json(advanced_settings_filename),
    }

    settings["sp"]["x509cert"] = settings["sp"]["x509cert"] or SP_CRT
    if not settings["sp"]["x509cert"]:
        sp_crt_filename = "sp-staging.crt" if STAGING_ENV else "sp-prod.crt"
        with open(BASE_PATH / "certs" / sp_crt_filename) as sp_crt_file:
            settings["sp"]["x509cert"] = sp_crt_file.read()

    settings["sp"]["privateKey"] = SP_KEY

    return OneLogin_Saml2_Settings(settings, custom_base_path=str(BASE_PATH))


def _get_saml_auth(url: URL, post_data: Mapping[str, str]) -> OneLogin_Saml2_Auth:
    """Package Starlette request into data compatible with OneLogin_Saml2_Auth."""
    settings = _get_saml_settings()
    assert url.hostname

    return OneLogin_Saml2_Auth(
        {
            "http_host": url.hostname,
            "script_name": url.path,
            "https": "on",
            "post_data": post_data,
        },
        old_settings=settings,
    )


async def _update_last_login(user: NativeUser) -> None:
    now = utc_now()
    await mongodb_handler.update_one(
        Collection.USERS, {"_id": user.uid}, {"last_login": now}, upsert=True
    )


@router.get("/login")
async def login(req: Request, return_to: str = "/") -> RedirectResponse:
    """Initiate login to SSO identity provider."""
    auth = _get_saml_auth(req.url, {})
    if not _is_valid_relay_state(return_to):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Cannot return to different origin."
        )

    sso_url = auth.login(return_to=return_to)

    # Redirect user to SSO url to complete authentication
    return RedirectResponse(sso_url)


@router.post("/acs")
async def acs(
    req: Request,
    saml_response: Annotated[str, Form(alias="SAMLResponse")],
    relay_state: Annotated[str, Form(alias="RelayState")],
) -> RedirectResponse:
    """
    SAML Assertion Consumer Service.
    Accepts the response returned by the SAML Identity Provider and
    sets a cookie with a JWT token which validates the user's identity.

    RelayState should be the same as the URL provided in the SAMLRequest.
    To prevent Open Redirect attacks, AuthN requests should be signed.
    """
    log.info(
        "SAML ACS received response of %s bytes and RelayState=%s",
        len(saml_response),
        relay_state,
    )

    if not _is_valid_relay_state(relay_state):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "RelayState is not allowed.")

    auth = _get_saml_auth(req.url, {"SAMLResponse": saml_response})
    auth.process_response()
    errors = auth.get_errors()

    if errors:
        log.error(f"SAML Error: {', '.join(errors)}, {auth.get_last_error_reason()}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "An error occurred while processing the SAML response",
        )

    if not auth.is_authenticated():
        log.warning("SAML Response received but user is not authenticated")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User was not authenticated")

    # TODO: check `auth.get_last_assertion_id` to protect against replay attacks

    log.info(f"User Authenticated with SAML: {auth.get_friendlyname_attributes()}")
    try:
        (email,) = auth.get_friendlyname_attribute("email")
        (display_name,) = auth.get_friendlyname_attribute("displayName")
        (ucinetid,) = auth.get_friendlyname_attribute("ucinetid")
        affiliations = auth.get_friendlyname_attribute("uciaffiliation")
    except (ValueError, TypeError) as e:
        log.exception("Error decoding SAML Attributes: %s", e)
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "Error decoding user identity"
        )

    user = NativeUser(
        ucinetid=ucinetid,
        display_name=display_name,
        email=email,
        affiliations=affiliations,
    )

    await _update_last_login(user)

    res = RedirectResponse(relay_state, status_code=status.HTTP_303_SEE_OTHER)
    issue_user_identity(user, res)
    return res


@router.get("/sls")
async def sls(req: Request) -> str:
    """SAML Single Logout Service, not yet implemented"""
    # auth = await _get_saml_auth(req)
    # auth.logout()
    return "SAML SLS"


@router.get("/metadata")
async def get_saml_metadata() -> Response:
    """Provides SAML metadata, used when registering service with IdP"""
    saml_settings = _get_saml_settings()
    metadata = saml_settings.get_sp_metadata()

    errors = saml_settings.validate_metadata(metadata)
    if errors:
        log.error(f"Error found on Metadata: {', '.join(errors)}")
        raise HTTPException(500, "Could not prepare SP metadata")

    return Response(metadata, media_type="application/xml")
