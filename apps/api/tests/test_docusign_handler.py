from unittest.mock import AsyncMock, patch

from test_user_apply import EXPECTED_APPLICATION_DATA

from models.ApplicationData import Decision
from services import docusign_handler
from services.docusign_handler import ACCOUNT_ID, POWERFORM_ID, WebhookPayload
from services.mongodb_handler import Collection
from utils.user_record import Role, Status

SAMPLE_WEBHOOK_PAYLOAD = {
    "event": "envelope-completed",
    "data": {
        "accountId": str(ACCOUNT_ID),
        "userId": "bc820e37-b38b-4dba-9650-139c3ae5e89c",  # fake
        "envelopeId": "d5e52004-450c-41a4-99da-761d52c3876b",  # fake
        "envelopeSummary": {
            "status": "completed",
            "completedDateTime": "1776-08-02T19:38:11.06Z",
            "recipients": {
                "signers": [
                    {
                        "name": "John Hancock",
                        "email": "john@founders.gov",
                    }
                ],
            },
            "powerForm": {
                "powerFormId": str(POWERFORM_ID),
            },
        },
    },
}

SAMPLE_WEBHOOK_DATA = WebhookPayload.model_validate(SAMPLE_WEBHOOK_PAYLOAD)
SAMPLE_UID = "gov.founders.john"


@patch("services.mongodb_handler.update_one")
@patch("services.mongodb_handler.retrieve_one")
async def test_new_waiver_submission_can_be_processed(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """Waiver signing event from accepted participant can be processed properly."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": SAMPLE_UID,
        "role": Role.APPLICANT,
        "status": Decision.ACCEPTED,
        "application_data": EXPECTED_APPLICATION_DATA,
    }
    await docusign_handler.process_webhook_event(SAMPLE_WEBHOOK_DATA)
    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS, {"_id": SAMPLE_UID}, {"status": Status.WAIVER_SIGNED}
    )


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_no_op_when_user_already_signed_waiver(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """If user has already signed waiver, ignore so RSVP status is maintained."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": SAMPLE_UID,
        "role": Role.APPLICANT,
        "status": Status.CONFIRMED,
        "application_data": EXPECTED_APPLICATION_DATA,
    }
    await docusign_handler.process_webhook_event(SAMPLE_WEBHOOK_DATA)
    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_no_op_for_rejected_applicant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """If applicant was not accepted, ignore waiv.r signing"""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": SAMPLE_UID,
        "role": Role.APPLICANT,
        "status": Decision.REJECTED,
        "application_data": EXPECTED_APPLICATION_DATA,
    }
    await docusign_handler.process_webhook_event(SAMPLE_WEBHOOK_DATA)
    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.insert", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_new_user_record_when_unknown_external_participant_signs_waiver(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_insert: AsyncMock,
) -> None:
    """Waiver signing event from an external participant should still be stored."""
    mock_mongodb_handler_retrieve_one.return_value = None
    await docusign_handler.process_webhook_event(SAMPLE_WEBHOOK_DATA)
    mock_mongodb_handler_insert.assert_awaited_once_with(
        Collection.USERS, {"_id": SAMPLE_UID, "status": Status.WAIVER_SIGNED}
    )


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_user_record_updated_even_for_non_applicant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """Test waiver status stored even for external participants with user record."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": SAMPLE_UID,
        "role": Role.VOLUNTEER,
    }
    await docusign_handler.process_webhook_event(SAMPLE_WEBHOOK_DATA)
    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS, {"_id": SAMPLE_UID}, {"status": Status.WAIVER_SIGNED}
    )
