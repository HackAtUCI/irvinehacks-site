import json
import os
from functools import lru_cache
from logging import getLogger
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse, Response
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings

from auth.user_identity import NativeUser, utc_now, issue_user_identity
from services.mongodb_handler import Collection, update_one

log = getLogger(__name__)

router = APIRouter()

STAGING_ENV = os.getenv("DEPLOYMENT") == "STAGING"
SP_CRT = os.getenv("SP_CRT")
SP_KEY = os.getenv("SP_KEY")


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

    settings_filename = "settings-staging.json" if STAGING_ENV else "settings-prod.json"
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


async def _prepare_saml_req(req: Request) -> dict[str, object]:
    """Packages a FastAPI Request into a request dict for SAML Auth"""
    return {
        "http_host": req.url.hostname,
        "script_name": req.url.path,
        "get_data": req.query_params,
        "post_data": await req.form(),
        # Advanced request options
        "https": "on",
        # "request_uri": "",
        # "query_string": "",
        # "validate_signature_from_qs": False,
        # "lowercase_urlencoding": False,
    }


async def _get_saml_auth(req: Request) -> OneLogin_Saml2_Auth:
    """Initializes a SAML Auth instance based on the request"""
    request_data = await _prepare_saml_req(req)
    settings = _get_saml_settings()

    return OneLogin_Saml2_Auth(request_data, old_settings=settings)


async def _insert_native_record(user: NativeUser) -> None:
    now = utc_now()
    await update_one(
        Collection.USERS, {"_id": user.uid}, {"last_login": now}, upsert=True
    )


@router.get("/login")
async def login(req: Request) -> RedirectResponse:
    auth = await _get_saml_auth(req)
    sso_url = auth.login()

    # Redirect user to SSO url to complete authentication
    return RedirectResponse(sso_url)


@router.post("/acs")
async def acs(req: Request) -> RedirectResponse:
    """
    SAML Assertion Consumer Service.
    Accepts the response returned by the SAML Identity Provider and
    sets a cookie with a JWT token which validates the user's identity.
    """
    auth = await _get_saml_auth(req)
    auth.process_response()
    errors = auth.get_errors()

    if errors:
        log.error(f"SAML Error: {', '.join(errors)}, {auth.get_last_error_reason()}")
        raise HTTPException(500, "An error occurred while processing the SAML response")

    if not auth.is_authenticated():
        log.warning("SAML Response received but user is not authenticated")
        raise HTTPException(401, "User was not authenticated")

    log.info(f"User Authenticated with SAML: {auth.get_friendlyname_attributes()}")
    try:
        (email,) = auth.get_friendlyname_attribute("email")
        (display_name,) = auth.get_friendlyname_attribute("displayName")
        (ucinetid,) = auth.get_friendlyname_attribute("ucinetid")
        affiliations = auth.get_friendlyname_attribute("uciaffiliation")
    except (ValueError, TypeError) as e:
        log.exception("Error decoding SAML Attributes: %s", e)
        raise HTTPException(500, "Error decoding user identity")

    user = NativeUser(
        ucinetid=ucinetid,
        display_name=display_name,
        email=email,
        affiliations=affiliations,
    )

    await _insert_native_record(user)

    res = RedirectResponse("/portal", status_code=303)
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
