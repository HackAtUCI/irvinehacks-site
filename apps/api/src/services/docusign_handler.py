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


DOCUSIGN_HMAC_KEY = os.getenv("DOCUSIGN_HMAC_KEY", "")
POWERFORM_ID = UUID("d5120219-dec1-41c5-b579-5e6b45c886e8")  # temporary
ACCOUNT_ID = UUID("cc0e3157-358d-4e10-acb0-ef39db7e3071")  # temporary


def waiver_form_url(email: EmailStr, user_name: str) -> str:
    """Provide URL to DocuSign PowerForm for waiver with pre-filled user info."""
    role_name = "Participant"
    query = urllib.parse.urlencode(
        {
            "env": "demo",  # temporary
            "PowerFormId": str(POWERFORM_ID),
            "acct": str(ACCOUNT_ID),
            f"{role_name}_Email": email,
            f"{role_name}_UserName": user_name,
            "v": "2",
        }
    )

    return (
        f"https://demo.docusign.net/Member/PowerFormSigning.aspx?{query}"  # temporary
    )


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify POST request content is signed according to the secret key."""
    hmac_hash = hmac.new(DOCUSIGN_HMAC_KEY.encode(), payload, hashlib.sha256)
    result = base64.b64encode(hmac_hash.digest())
    return hmac.compare_digest(result, signature.encode())


async def process_webhook_event(payload: WebhookPayload) -> None:
    """Process webhook event from DocuSign for waiver signing."""
    envelope_summary = payload.data.envelopeSummary
    signers = envelope_summary.recipients.signers
    _verify_envelope_content(envelope_summary.powerForm, signers)

    email = signers[0].email
    uid = _acquire_uid(email)

    await waiver_handler.process_waiver_completion(uid, email)


def _verify_envelope_content(power_form: PowerForm, signers: Sequence[Signer]) -> None:
    """Raises ValueError if envelope data is invalid."""
    # checked template id
    if power_form.powerFormId != POWERFORM_ID:
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
