import base64
import hashlib
import hmac
import os
import urllib.parse
from datetime import datetime
from logging import getLogger
from typing import Sequence
from uuid import UUID

from pydantic import UUID4, BaseModel, EmailStr

from auth import user_identity
from utils import waiver_handler
from utils.hackathon_context import HackathonName, hackathon_name_ctx

log = getLogger(__name__)


class PowerForm(BaseModel):
    powerFormId: UUID4


class Signer(BaseModel):
    name: str
    email: EmailStr


class Recipients(BaseModel):
    signers: list[Signer]


class EnvelopeSummary(BaseModel):
    status: str
    recipients: Recipients
    powerForm: PowerForm
    completedDateTime: datetime


class EnvelopeCompletedData(BaseModel):
    accountId: UUID4
    userId: UUID4
    envelopeId: UUID4
    envelopeSummary: EnvelopeSummary


class WebhookPayload(BaseModel):
    event: str
    data: EnvelopeCompletedData


DOCUSIGN_HMAC_KEY = os.getenv("DOCUSIGN_HMAC_KEY", "").strip()
STAGING_ENV = os.getenv("DEPLOYMENT") == "STAGING"

if STAGING_ENV:
    POWERFORM_ID = UUID("155a2cee-437f-4aa4-bc58-bd1cb01cde20")
    ZOTHACKS_POWERFORM_ID = UUID("af2330a2-d3b5-4510-a83b-90e6ab15d54c")
    ACCOUNT_ID = UUID("e6262c0d-c7c1-444b-99b1-e5c6ceaa4b40")
    DOCUSIGN_ENV = "na3"
    POWERFORM_IDS = {
        HackathonName.IRVINEHACKS: POWERFORM_ID,
        HackathonName.ZOTHACKS: ZOTHACKS_POWERFORM_ID,
    }
else:
    # If POWERFORM_ID changed here, also update PowerFormId in next.config.js
    POWERFORM_ID = UUID("155a2cee-437f-4aa4-bc58-bd1cb01cde20")
    ZOTHACKS_POWERFORM_ID = UUID("af2330a2-d3b5-4510-a83b-90e6ab15d54c")
    ACCOUNT_ID = UUID("e6262c0d-c7c1-444b-99b1-e5c6ceaa4b40")
    DOCUSIGN_ENV = "na3"
    POWERFORM_IDS = {
        HackathonName.IRVINEHACKS: POWERFORM_ID,
        HackathonName.ZOTHACKS: ZOTHACKS_POWERFORM_ID,
    }


def _powerform_id_for_current_hackathon() -> UUID:
    return POWERFORM_IDS.get(hackathon_name_ctx.get(), POWERFORM_ID)


def _hackathon_for_powerform(powerform_id: UUID) -> HackathonName:
    for hackathon_name, configured_powerform_id in POWERFORM_IDS.items():
        if configured_powerform_id == powerform_id:
            return hackathon_name

    raise ValueError("PowerForm IDs do not match")


def waiver_form_url(email: EmailStr, user_name: str) -> str:
    """Provide URL to DocuSign PowerForm for waiver with pre-filled user info."""
    role_name = "Participant"
    powerform_id = _powerform_id_for_current_hackathon()
    query = urllib.parse.urlencode(
        {
            "env": DOCUSIGN_ENV,
            "PowerFormId": str(powerform_id),
            "acct": str(ACCOUNT_ID),
            f"{role_name}_Email": email,
            f"{role_name}_UserName": user_name,
            "v": "2",
        }
    )

    return f"https://{DOCUSIGN_ENV}.docusign.net/Member/PowerFormSigning.aspx?{query}"


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify POST request content is signed according to the secret key."""
    signature = signature.strip()
    hmac_hash = hmac.new(DOCUSIGN_HMAC_KEY.encode(), payload, hashlib.sha256)
    result = base64.b64encode(hmac_hash.digest())
    is_valid = hmac.compare_digest(result, signature.encode())

    if not is_valid:
        log.warning(
            "DocuSign HMAC mismatch: key_configured=%s key_length=%d",
            bool(DOCUSIGN_HMAC_KEY),
            len(DOCUSIGN_HMAC_KEY),
        )

    return is_valid


async def process_webhook_event(payload: WebhookPayload) -> None:
    """Process webhook event from DocuSign for waiver signing."""
    envelope_summary = payload.data.envelopeSummary
    signers = envelope_summary.recipients.signers
    hackathon_name = _hackathon_for_powerform(envelope_summary.powerForm.powerFormId)
    _verify_envelope_content(envelope_summary.powerForm, signers)

    email = signers[0].email
    uid = _acquire_uid(email)

    token = hackathon_name_ctx.set(hackathon_name)
    try:
        await waiver_handler.process_waiver_completion(uid, email)
    finally:
        hackathon_name_ctx.reset(token)


def _verify_envelope_content(power_form: PowerForm, signers: Sequence[Signer]) -> None:
    """Raises ValueError if envelope data is invalid."""
    # checked template id
    if power_form.powerFormId not in POWERFORM_IDS.values():
        log.error("Received DocuSign event for an unexpected PowerForm ID.")
        raise ValueError("PowerForm IDs do not match")

    # parse applicant from recipient
    if len(signers) != 1:
        log.error("DocuSign envelope had multiple signers.")
        raise ValueError("PowerForm should only contain one signer")


def _acquire_uid(email: EmailStr) -> str:
    """Get UID from the user's email address."""
    if user_identity.uci_email(email):
        # Note: this is technically not correct since could have custom email,
        # but most users have email addresses based on their UCInetID
        ucinetid, _ = email.split("@")
        return f"edu.uci.{ucinetid}"
    else:
        return user_identity.scoped_uid(email)
