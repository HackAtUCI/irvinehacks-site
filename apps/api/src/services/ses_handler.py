import asyncio
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from html import escape
from logging import getLogger

log = getLogger(__name__)

SES_SMTP_HOST = os.getenv("SES_SMTP_HOST", "email-smtp.us-west-2.amazonaws.com")
SES_SMTP_PORT = int(os.getenv("SES_SMTP_PORT", "587"))
SES_SMTP_USERNAME = os.getenv("SES_SMTP_USERNAME")
SES_SMTP_PASSWORD = os.getenv("SES_SMTP_PASSWORD")
SES_FROM_EMAIL = os.getenv("SES_FROM_EMAIL", "apply@zothacks.com")
SES_FROM_NAME = os.getenv("SES_FROM_NAME", "ZotHacks 2026 Applications")
CONTACT_EMAIL = "zothacks2026@gmail.com"


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
    subject = "Thank You For Applying!"
    confirmation_text = (
        f"Thank you for applying to ZotHacks 2026 as a {application_type}! "
        "You should expect to hear back from us in early October after "
        "applications close. If you have any additional questions, please do "
        f"not hesitate to email us at {CONTACT_EMAIL}!"
    )
    confirmation_html = (
        "Thank you for applying to ZotHacks 2026 as a "
        f"{escape(application_type)}! You should expect to hear back from us "
        "in early October after applications close. If you have any additional "
        "questions, please do not hesitate to email us at "
        f'<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>!'
    )

    text_body = f"""Hello {first_name}!

{confirmation_text}

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>{confirmation_html}</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = formataddr((SES_FROM_NAME, SES_FROM_EMAIL))
    message["To"] = email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    await asyncio.to_thread(_send_message, message)
    log.info("Sent SES application confirmation email to %s", email)


async def send_guest_login_email(email: str, passphrase: str) -> None:
    subject = "Your ZotHacks login code"

    text_body = f"""Hello!

Use this login code to continue signing in to ZotHacks:

{passphrase}

This code expires in 10 minutes. If you did not request this code, you can ignore this email.

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello!</p>

<p>Use this login code to continue signing in to ZotHacks:</p>

<p><strong>{escape(passphrase)}</strong></p>

<p>This code expires in 10 minutes. If you did not request this code, you can ignore this email.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = formataddr((SES_FROM_NAME, SES_FROM_EMAIL))
    message["To"] = email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    await asyncio.to_thread(_send_message, message)
    log.info("Sent SES guest login email to %s", email)
