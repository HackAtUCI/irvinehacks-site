from unittest.mock import MagicMock, patch

import pytest

from services import ses_handler


@patch("services.ses_handler.SES_SMTP_USERNAME", "smtp-user")
@patch("services.ses_handler.SES_SMTP_PASSWORD", "smtp-password")
@patch("services.ses_handler.smtplib.SMTP")
async def test_send_application_confirmation_email_uses_ses_smtp(
    mock_smtp_class: MagicMock,
) -> None:
    mock_smtp = mock_smtp_class.return_value.__enter__.return_value

    await ses_handler.send_application_confirmation_email(
        "peter@uci.edu", "Peter", "Anteater", "Hacker"
    )

    mock_smtp.starttls.assert_called_once()
    mock_smtp.login.assert_called_once_with("smtp-user", "smtp-password")
    mock_smtp.send_message.assert_called_once()
    message = mock_smtp.send_message.call_args.args[0]
    assert message["To"] == "peter@uci.edu"
    assert message["From"] == "ZotHacks 2026 Applications <apply@zothacks.com>"
    assert message["Subject"] == "Thank You For Applying!"
    assert (
        "ZotHacks 2026 as a Hacker"
        in message.get_body(preferencelist=("html",)).get_content()
    )
    assert (
        "zothacks2026@gmail.com"
        in message.get_body(preferencelist=("html",)).get_content()
    )


@patch("services.ses_handler.SES_SMTP_USERNAME", None)
@patch("services.ses_handler.SES_SMTP_PASSWORD", None)
async def test_send_application_confirmation_email_requires_smtp_credentials() -> None:
    try:
        await ses_handler.send_application_confirmation_email(
            "peter@uci.edu", "Peter", "Anteater", "Hacker"
        )
    except RuntimeError as err:
        assert str(err) == "SES SMTP credentials are not configured"
    else:
        raise AssertionError("Expected RuntimeError")


@patch("services.ses_handler.SES_SMTP_USERNAME", "smtp-user")
@patch("services.ses_handler.SES_SMTP_PASSWORD", "smtp-password")
@patch("services.ses_handler.SES_RECIPIENT_OVERRIDE_EMAIL", "nathan@uci.edu")
@patch(
    "services.ses_handler.ROLE_SENDERS",
    {"Hacker": ("decisions@zothacks.com", "ZotHacks Decisions")},
)
@patch("services.ses_handler.smtplib.SMTP")
async def test_send_hacker_decision_email_uses_role_sender_and_recipient_override(
    mock_smtp_class: MagicMock,
) -> None:
    mock_smtp = mock_smtp_class.return_value.__enter__.return_value

    await ses_handler.send_decision_emails(
        [("Peter", "peter@uci.edu")],
        "ACCEPTED",
        "Hacker",
    )

    message = mock_smtp.send_message.call_args.args[0]
    assert message["To"] == "nathan@uci.edu"
    assert message["X-Original-To"] == "peter@uci.edu"
    assert message["From"] == "ZotHacks Decisions <decisions@zothacks.com>"
    assert message["Subject"] == "[ZotHacks 2026] Hacker Application Decisions"


@pytest.mark.parametrize(
    ("decision", "expected_text"),
    [
        ("ACCEPTED", "congratulations"),
        ("WAITLISTED", "spot on our waitlist"),
        ("REJECTED", "unable to extend you an invite"),
    ],
)
@patch("services.ses_handler.SES_SMTP_USERNAME", "smtp-user")
@patch("services.ses_handler.SES_SMTP_PASSWORD", "smtp-password")
@patch("services.ses_handler.smtplib.SMTP")
async def test_send_hacker_decision_email_uses_decision_copy(
    mock_smtp_class: MagicMock,
    decision: ses_handler.DecisionName,
    expected_text: str,
) -> None:
    mock_smtp = mock_smtp_class.return_value.__enter__.return_value

    await ses_handler.send_decision_emails(
        [("Peter", "peter@uci.edu")],
        decision,
        "Hacker",
    )

    message = mock_smtp.send_message.call_args.args[0]
    html = message.get_body(preferencelist=("html",)).get_content().lower()
    assert expected_text in html


@patch("services.ses_handler.SES_SMTP_USERNAME", "smtp-user")
@patch("services.ses_handler.SES_SMTP_PASSWORD", "smtp-password")
@patch("services.ses_handler.smtplib.SMTP")
async def test_send_hacker_rsvp_reminder_uses_zothacks_copy(
    mock_smtp_class: MagicMock,
) -> None:
    mock_smtp = mock_smtp_class.return_value.__enter__.return_value

    await ses_handler.send_rsvp_reminder_emails(
        [("Peter", "peter@uci.edu")],
        "Hacker",
    )

    message = mock_smtp.send_message.call_args.args[0]
    html = message.get_body(preferencelist=("html",)).get_content()
    assert message["Subject"] == "[ZotHacks 2026] Hacker RSVP Deadline Reminder!"
    assert "Thursday, October 8" in html
    assert "11:59 PM PT" in html
    assert "portal" in html


@patch("services.ses_handler.SES_SMTP_USERNAME", "smtp-user")
@patch("services.ses_handler.SES_SMTP_PASSWORD", "smtp-password")
@patch("services.ses_handler.smtplib.SMTP")
async def test_send_hacker_logistics_uses_zothacks_copy(
    mock_smtp_class: MagicMock,
) -> None:
    mock_smtp = mock_smtp_class.return_value.__enter__.return_value

    await ses_handler.send_logistics_emails(
        [("Peter", "peter@uci.edu")],
        "Hacker",
    )

    message = mock_smtp.send_message.call_args.args[0]
    html = message.get_body(preferencelist=("html",)).get_content()
    assert (
        message["Subject"]
        == "IMPORTANT: [ZotHacks 2026] Logistics and Team Assignments"
    )
    assert "Pre-ZotHacks Checklist" in html
    assert "Team Assignment" in html
    assert "Resources and Starter Packs" in html
