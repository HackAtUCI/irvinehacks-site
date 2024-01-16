from unittest.mock import AsyncMock, call, patch

import pytest
from aiosendgrid import AsyncSendGridClient
from httpx import HTTPStatusError, Request, Response

from models.ApplicationData import Decision
from services import sendgrid_handler
from services.sendgrid_handler import (
    ApplicationUpdatePersonalization,
    ConfirmationPersonalization,
    Template,
)

SAMPLE_SENDER = ("noreply@irvinehacks.com", "No Reply IrvineHacks")
SAMPLE_RECIPIENTS: list[ConfirmationPersonalization] = [
    {
        "email": "hacker0@uci.edu",
        "first_name": "Hacker",
        "last_name": "Zero",
    },
    {
        "email": "hacker1@uci.edu",
        "first_name": "Hacker",
        "last_name": "One",
    },
]


@patch("aiosendgrid.AsyncSendGridClient")
async def test_send_single_email(mock_AsyncClient: AsyncMock) -> None:
    """Tests that sending a single email calls the AsyncClient as expected"""
    mock_client = AsyncMock(AsyncSendGridClient)
    mock_client.send_mail_v3.return_value = Response(202)
    mock_AsyncClient.return_value.__aenter__.return_value = mock_client

    recipient_data = SAMPLE_RECIPIENTS[0]

    await sendgrid_handler.send_email(
        Template.CONFIRMATION_EMAIL, SAMPLE_SENDER, recipient_data
    )
    mock_client.send_mail_v3.assert_awaited_once_with(
        body={
            "from": {
                "name": SAMPLE_SENDER[1],
                "email": SAMPLE_SENDER[0],
            },
            "personalizations": [
                {
                    "to": [{"email": recipient_data["email"]}],
                    "dynamic_template_data": recipient_data,
                }
            ],
            "template_id": Template.CONFIRMATION_EMAIL,
        }
    )


@patch("aiosendgrid.AsyncSendGridClient")
async def test_send_single_email_with_reply_to(mock_AsyncClient: AsyncMock) -> None:
    """Tests that sending a single email calls the AsyncClient as expected"""
    mock_client = AsyncMock(AsyncSendGridClient)
    mock_client.send_mail_v3.return_value = Response(202)
    mock_AsyncClient.return_value.__aenter__.return_value = mock_client

    recipient_data = SAMPLE_RECIPIENTS[0]

    await sendgrid_handler.send_email(
        Template.CONFIRMATION_EMAIL,
        SAMPLE_SENDER,
        recipient_data,
        reply_to=SAMPLE_SENDER,
    )
    mock_client.send_mail_v3.assert_awaited_once_with(
        body={
            "from": {
                "name": SAMPLE_SENDER[1],
                "email": SAMPLE_SENDER[0],
            },
            "personalizations": [
                {
                    "to": [{"email": recipient_data["email"]}],
                    "dynamic_template_data": recipient_data,
                }
            ],
            "template_id": Template.CONFIRMATION_EMAIL,
            "reply_to": {
                "name": SAMPLE_SENDER[1],
                "email": SAMPLE_SENDER[0],
            },
        }
    )


@patch("aiosendgrid.AsyncSendGridClient")
async def test_send_multiple_emails(mock_AsyncClient: AsyncMock) -> None:
    """Tests that sending multiple emails calls the AsyncClient as expected"""
    mock_client = AsyncMock(AsyncSendGridClient)
    mock_client.send_mail_v3.return_value = Response(202)
    mock_AsyncClient.return_value.__aenter__.return_value = mock_client

    await sendgrid_handler.send_email(
        Template.CONFIRMATION_EMAIL,
        SAMPLE_SENDER,
        SAMPLE_RECIPIENTS,
        True,
    )
    mock_client.send_mail_v3.assert_awaited_once_with(
        body={
            "from": {"name": SAMPLE_SENDER[1], "email": SAMPLE_SENDER[0]},
            "personalizations": [
                {
                    "to": [{"email": SAMPLE_RECIPIENTS[1]["email"]}],
                    "dynamic_template_data": SAMPLE_RECIPIENTS[1],
                },
                {
                    "to": [{"email": SAMPLE_RECIPIENTS[0]["email"]}],
                    "dynamic_template_data": SAMPLE_RECIPIENTS[0],
                },
            ],
            "template_id": Template.CONFIRMATION_EMAIL,
        }
    )


@patch("aiosendgrid.AsyncSendGridClient")
async def test_sendgrid_error_causes_runtime_error(mock_AsyncClient: AsyncMock) -> None:
    """Test that an issue with SendGrid causes a RuntimeError"""
    mock_client = AsyncMock(AsyncSendGridClient)
    mock_client.send_mail_v3.side_effect = HTTPStatusError(
        "SendGrid error",
        request=Request("POST", "/v3/mail/send"),
        response=Response(500),
    )

    mock_AsyncClient.return_value.__aenter__.return_value = mock_client

    with pytest.raises(RuntimeError):
        await sendgrid_handler.send_email(
            Template.CONFIRMATION_EMAIL,
            SAMPLE_SENDER,
            SAMPLE_RECIPIENTS,
            True,
        )


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

    await sendgrid_handler.send_decision_email(SAMPLE_SENDER, applicants)

    mock_sendgrid_handler_send_email.assert_has_calls(
        [
            call(Template.ACCEPTED_EMAIL, SAMPLE_SENDER, accepted, True),
            call(Template.REJECTED_EMAIL, SAMPLE_SENDER, rejected, True),
            call(Template.WAITLISTED_EMAIL, SAMPLE_SENDER, waitlisted, True),
        ]
    )
