from unittest.mock import MagicMock, patch

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
