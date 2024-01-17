from copy import deepcopy
from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient
from test_docusign_handler import SAMPLE_WEBHOOK_PAYLOAD
from test_user_apply import SAMPLE_APPLICATION

from auth.authorization import require_accepted_applicant
from auth.user_identity import User
from models.ApplicationData import Decision
from routers import user
from services import docusign_handler
from utils.user_record import Applicant, Role, Status

app = FastAPI()
app.include_router(user.router)

client = TestClient(app)


def test_accepted_user_can_request_waiver() -> None:
    """Test accepted applicant can request signing waiver."""
    uid = "edu.uci.hack"
    app.dependency_overrides[require_accepted_applicant] = lambda: (
        User(uid=uid, email="hack@uci.edu"),
        Applicant(
            uid=uid,
            role=Role.APPLICANT,
            status=Decision.ACCEPTED,
            application_data={
                **SAMPLE_APPLICATION,  # type: ignore[arg-type]
                "submission_time": datetime.now(),
                "first_name": "Riley",
                "last_name": "Wong",
            },
        ),
    )

    res = client.get("/waiver", follow_redirects=False)

    assert res.status_code == 303
    location = res.headers["location"]
    assert "docusign.net" in location
    assert "Participant_Email=hack%40uci.edu" in location
    assert "Participant_UserName=Riley+Wong" in location

    app.dependency_overrides = {}


def test_cannot_request_waiver_if_already_signed() -> None:
    """Test applicant who already signed waiver cannot re-request signing."""
    uid = "edu.uci.hack"
    app.dependency_overrides[require_accepted_applicant] = lambda: (
        User(uid=uid, email="hack@uci.edu"),
        Applicant(
            uid="edu.uci.hack",
            role=Role.APPLICANT,
            status=Status.WAIVER_SIGNED,
            application_data={
                **SAMPLE_APPLICATION,  # type: ignore[arg-type]
                "submission_time": datetime.now(),
            },
        ),
    )

    res = client.get("/waiver")
    assert res.status_code == 403

    app.dependency_overrides = {}


def test_invalid_webhook_payload_is_rejected() -> None:
    """Webhook endpoint rejects payloads that are not signed properly."""
    res = client.post(
        "/waiver",
        json=SAMPLE_WEBHOOK_PAYLOAD,
        headers={"x-docusign-signature-1": "bad-signature"},
    )
    assert res.status_code == 400


@patch("services.docusign_handler.verify_webhook_signature", autospec=True)
def test_unknown_powerform_is_rejected(mock_verify_webhook_signature: Mock) -> None:
    """Webhook endpoint rejects unknown PowerForms."""
    mock_verify_webhook_signature.return_value = True

    invalid_webhook_payload = deepcopy(SAMPLE_WEBHOOK_PAYLOAD)
    summary = invalid_webhook_payload["data"]["envelopeSummary"]  # type: ignore[index]
    summary["powerForm"]["powerFormId"] = str(uuid4())
    res = client.post(
        "/waiver",
        json=invalid_webhook_payload,
        headers={"x-docusign-signature-1": "test-signature"},
    )

    mock_verify_webhook_signature.assert_called_once()
    assert res.status_code == 400


@patch("services.docusign_handler.process_webhook_event", autospec=True)
def test_valid_webhook_payload_is_fine(mock_process_webhook_event: AsyncMock) -> None:
    """Test valid content signature can be verified."""
    docusign_handler.DOCUSIGN_HMAC_KEY = "sample-key"
    res = client.post(
        "/waiver",
        json=SAMPLE_WEBHOOK_PAYLOAD,
        headers={
            "x-docusign-signature-1": "r3eOIE4RkCGA1w2rBX9uprQuL+dV1BCUw3UI4qvQcI4="
        },
    )

    assert res.status_code == 200
    mock_process_webhook_event.assert_awaited_once()

    docusign_handler.DOCUSIGN_HMAC_KEY = ""
