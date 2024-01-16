from unittest.mock import AsyncMock, call, patch

from test_sendgrid_handler import SAMPLE_SENDER

from models.ApplicationData import Decision
from services.sendgrid_handler import ApplicationUpdatePersonalization, Template
from utils import email_handler


@patch("services.sendgrid_handler.send_email")
async def test_send_decision_email(mock_sendgrid_handler_send_email: AsyncMock) -> None:
    applicants = {
        ("test1", "test1@uci.edu"): Decision.ACCEPTED,
        ("test2", "test2@uci.edu"): Decision.REJECTED,
        ("test3", "test3@uci.edu"): Decision.WAITLISTED,
    }

    accepted = [
        ApplicationUpdatePersonalization(first_name="test1", email="test1@uci.edu")
    ]
    rejected = [
        ApplicationUpdatePersonalization(first_name="test2", email="test2@uci.edu")
    ]
    waitlisted = [
        ApplicationUpdatePersonalization(first_name="test3", email="test3@uci.edu")
    ]

    await email_handler.send_decision_email(SAMPLE_SENDER, applicants)

    mock_sendgrid_handler_send_email.assert_has_calls(
        [
            call(Template.ACCEPTED_EMAIL, SAMPLE_SENDER, accepted, True),
            call(Template.REJECTED_EMAIL, SAMPLE_SENDER, rejected, True),
            call(Template.WAITLISTED_EMAIL, SAMPLE_SENDER, waitlisted, True),
        ]
    )
