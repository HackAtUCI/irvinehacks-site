import hashlib
import json
import os
import re
import time
from typing import Any, Optional, cast

from jose import jwt

SAVE_URL_BASE = "https://pay.google.com/gp/v/save/"

GENERIC_CLASS_ID = "3388000000023162467.zothacks-2026"
ISSUER_ID = GENERIC_CLASS_ID.split(".")[0]

GENERIC_TYPE = "GENERIC_ENTRY_TICKET"
CARD_TITLE = "ZotHacks 2026"
CARD_SUBHEADER = "Check-In Pass"
DEFAULT_HEADER = "Check-In Pass"

# Google Wallet object identifiers may only contain alphanumeric characters,
# '.', '_', or '-'. See:
# https://developers.google.com/wallet/generic/rest/v1/genericobject
_OBJECT_ID_UNSAFE_CHARS = re.compile(r"[^A-Za-z0-9._-]")

# Number of hex digits of the uid's hash appended to the sanitized suffix.
# Since sanitization is lossy (distinct uids can sanitize to the same string),
# this keeps the resulting Wallet object ID unique per uid while remaining
# deterministic, so re-saving a pass reuses the same object.
_UID_HASH_LENGTH = 10


def _get_service_account() -> dict[str, Any]:
    """Get the Wallet-authorized service account key used to sign pass JWTs."""
    service_account_file = os.getenv("WALLET_SERVICE_ACCOUNT_FILE")
    service_account_credentials = os.getenv("GOOGLE_WALLET_SERVICE_ACCOUNT_CREDENTIALS")

    if service_account_file:
        with open(service_account_file) as f:
            return cast(dict[str, Any], json.load(f))
    elif service_account_credentials:
        service_account_credentials = service_account_credentials.replace("\n", "\\n")
        return cast(dict[str, Any], json.loads(service_account_credentials))
    else:
        raise RuntimeError("Google Wallet service account credentials not found")


def _sanitized_object_suffix(uid: str) -> str:
    """Return a Wallet-legal object ID suffix derived from the given uid.

    Sanitization alone is lossy (e.g. "a+b" and "a_b" both become "a_b"), so
    a short deterministic hash of the raw uid is appended to keep the
    resulting suffix unique per uid while remaining stable across calls.
    """
    sanitized = _OBJECT_ID_UNSAFE_CHARS.sub("_", uid)
    uid_hash = hashlib.sha256(uid.encode()).hexdigest()[:_UID_HASH_LENGTH]
    return f"{sanitized}-{uid_hash}"


def _build_generic_object(uid: str, full_name: Optional[str]) -> dict[str, Any]:
    """Build a Google Wallet genericObject whose barcode encodes the given uid."""
    header_value = full_name if full_name else DEFAULT_HEADER

    generic_object: dict[str, Any] = {
        "id": f"{ISSUER_ID}.{_sanitized_object_suffix(uid)}",
        "classId": GENERIC_CLASS_ID,
        "genericType": GENERIC_TYPE,
        "state": "ACTIVE",
        "cardTitle": {"defaultValue": {"language": "en-US", "value": CARD_TITLE}},
        "header": {"defaultValue": {"language": "en-US", "value": header_value}},
        "subheader": {"defaultValue": {"language": "en-US", "value": CARD_SUBHEADER}},
        "barcode": {"type": "QR_CODE", "value": uid, "alternateText": uid},
    }

    return generic_object


def build_checkin_pass_save_url(uid: str, full_name: Optional[str] = None) -> str:
    """Build a signed 'Add to Google Wallet' save URL for a ZotHacks check-in
    pass, encoding the given applicant uid as the barcode value."""
    service_account = _get_service_account()
    generic_object = _build_generic_object(uid, full_name)

    claims = {
        "iss": service_account["client_email"],
        "aud": "google",
        "typ": "savetowallet",
        "iat": int(time.time()),
        "origins": [],
        "payload": {"genericObjects": [generic_object]},
    }

    token = jwt.encode(claims, service_account["private_key"], algorithm="RS256")
    return f"{SAVE_URL_BASE}{token}"
