from unittest.mock import AsyncMock, patch

from models.ApplicationData import Decision
from services.sendgrid_handler import ApplicationUpdatePersonalization, Template
from utils import email_handler
from utils.email_handler import IH_SENDER


@patch("services.sendgrid_handler.send_email")
async def test_send_decision_email(mock_sendgrid_handler_send_email: AsyncMock) -> None:
    users = [
        ("test1", "test1@uci.edu"),
        ("test2", "test2@uci.edu"),
        ("test3", "test3@uci.edu"),
    ]

    expected_personalizations = [
        ApplicationUpdatePersonalization(first_name=name, email=email)
        for name, email in users
    ]

    await email_handler.send_decision_email(users, Decision.ACCEPTED)

    mock_sendgrid_handler_send_email.assert_called_once_with(
        Template.HACKER_ACCEPTED_EMAIL, IH_SENDER, expected_personalizations, True
    )
