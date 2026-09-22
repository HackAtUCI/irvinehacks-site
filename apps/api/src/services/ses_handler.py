import asyncio
import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr
from html import escape
from logging import getLogger
from zoneinfo import ZoneInfo

log = getLogger(__name__)

SES_SMTP_HOST = os.getenv("SES_SMTP_HOST", "email-smtp.us-west-2.amazonaws.com")
SES_SMTP_PORT = int(os.getenv("SES_SMTP_PORT", "587"))
SES_SMTP_USERNAME = os.getenv("SES_SMTP_USERNAME")
SES_SMTP_PASSWORD = os.getenv("SES_SMTP_PASSWORD")
SES_FROM_EMAIL = os.getenv("SES_FROM_EMAIL", "apply@zothacks.com")
SES_FROM_NAME = os.getenv("SES_FROM_NAME", "ZotHacks 2026 Applications")
CONTACT_EMAIL = "zothacks2026@gmail.com"


def _sent_at() -> str:
    return datetime.now(ZoneInfo("America/Los_Angeles")).strftime(
        "%B %-d, %Y at %-I:%M %p %Z"
    )


def _send_message(message: EmailMessage) -> None:
    if not SES_SMTP_USERNAME or not SES_SMTP_PASSWORD:
        raise RuntimeError("SES SMTP credentials are not configured")

    with smtplib.SMTP(SES_SMTP_HOST, SES_SMTP_PORT, timeout=10) as smtp:
        smtp.starttls()
        smtp.login(SES_SMTP_USERNAME, SES_SMTP_PASSWORD)
        smtp.send_message(message)


async def send_application_confirmation_email(
    email: str,
    first_name: str,
    last_name: str,
    application_type: str,
) -> None:
    sent_at = _sent_at()
    subject = "Thank You For Applying!"

    text_body = f"""Hello {first_name}!

Thank you for applying to ZotHacks 2026 as a {application_type}! You should expect to hear back from us in early October after applications close. If you have any additional questions, please do not hesitate to email us at {CONTACT_EMAIL}!

Best regards,

The ZotHacks 2026 Team

Sent at: {sent_at}
"""

    html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>Thank you for applying to ZotHacks 2026 as a {escape(application_type)}! You should expect to hear back from us in early October after applications close. If you have any additional questions, please do not hesitate to email us at <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>!</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>

<p>Sent at: {escape(sent_at)}</p>
"""

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = formataddr((SES_FROM_NAME, SES_FROM_EMAIL))
    message["To"] = email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    await asyncio.to_thread(_send_message, message)
    log.info("Sent SES application confirmation email to %s", email)
