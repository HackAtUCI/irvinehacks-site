from unittest.mock import AsyncMock, patch

from models.ApplicationData import Decision
from models.user_record import Role
from utils import email_handler


class User:
    first_name = "Peter"
    last_name = "Anteater"


@patch("services.ses_handler.send_application_confirmation_email")
async def test_send_application_confirmation_email_uses_ses(
    mock_ses_send_application_confirmation_email: AsyncMock,
) -> None:
    await email_handler.send_application_confirmation_email(
        "peter@uci.edu", User(), "Hacker"
    )

    mock_ses_send_application_confirmation_email.assert_awaited_once_with(
        "peter@uci.edu", "Peter", "Anteater", "Hacker"
    )


@patch("services.ses_handler.send_decision_emails")
async def test_send_hacker_decision_email(
    mock_send_decision_emails: AsyncMock,
) -> None:
    users = [
        ("test1", "test1@uci.edu"),
        ("test2", "test2@uci.edu"),
        ("test3", "test3@uci.edu"),
    ]

    await email_handler.send_decision_email(users, Decision.ACCEPTED, Role.HACKER)

    mock_send_decision_emails.assert_called_once_with(
        users, "ACCEPTED", "Hacker"
    )


@patch("services.ses_handler.send_decision_emails")
async def test_send_mentor_decision_email(
    mock_send_decision_emails: AsyncMock,
) -> None:
    users = [
        ("mentor1", "mentor1@uci.edu"),
        ("mentor2", "mentor2@uci.edu"),
        ("mentor3", "mentor3@uci.edu"),
    ]

    await email_handler.send_decision_email(users, Decision.REJECTED, Role.MENTOR)

    mock_send_decision_emails.assert_called_once_with(
        users, "REJECTED", "Mentor"
    )


@patch("services.ses_handler.send_decision_emails")
async def test_send_volunteer_decision_email(
    mock_send_decision_emails: AsyncMock,
) -> None:
    users = [
        ("volunteer1", "volunteer1@uci.edu"),
        ("volunteer2", "volunteer2@uci.edu"),
        ("volunteer3", "volunteer3@uci.edu"),
    ]

    await email_handler.send_decision_email(users, Decision.REJECTED, Role.VOLUNTEER)

    mock_send_decision_emails.assert_called_once_with(
        users, "REJECTED", "Volunteer"
    )
