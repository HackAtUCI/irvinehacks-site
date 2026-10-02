import asyncio
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from html import escape
from logging import getLogger
from typing import Callable, Iterable, Literal

log = getLogger(__name__)

SES_SMTP_HOST = os.getenv("SES_SMTP_HOST", "email-smtp.us-west-2.amazonaws.com")
SES_SMTP_PORT = int(os.getenv("SES_SMTP_PORT", "587"))
SES_SMTP_USERNAME = os.getenv("SES_SMTP_USERNAME")
SES_SMTP_PASSWORD = os.getenv("SES_SMTP_PASSWORD")
SES_FROM_EMAIL = os.getenv("SES_FROM_EMAIL", "apply@zothacks.com")
SES_FROM_NAME = os.getenv("SES_FROM_NAME", "ZotHacks 2026 Applications")
CONTACT_EMAIL = "zothacks2026@gmail.com"
Recipient = tuple[str, str]
RoleName = Literal["Hacker", "Mentor", "Volunteer"]
DecisionName = Literal["ACCEPTED", "WAITLISTED", "REJECTED"]


def _send_message(message: EmailMessage) -> None:
    _send_messages([message])


def _send_messages(messages: Iterable[EmailMessage]) -> None:
    if not SES_SMTP_USERNAME or not SES_SMTP_PASSWORD:
        raise RuntimeError("SES SMTP credentials are not configured")

    with smtplib.SMTP(SES_SMTP_HOST, SES_SMTP_PORT, timeout=10) as smtp:
        smtp.starttls()
        smtp.login(SES_SMTP_USERNAME, SES_SMTP_PASSWORD)
        for message in messages:
            smtp.send_message(message)


def _build_message(
    email: str,
    subject: str,
    text_body: str,
    html_body: str,
    *,
    from_email: str = SES_FROM_EMAIL,
    from_name: str = SES_FROM_NAME,
) -> EmailMessage:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = formataddr((from_name, from_email))
    message["To"] = email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")
    return message


async def _send_personalized_messages(
    recipients: Iterable[Recipient],
    build_content: Callable[[str], tuple[str, str, str]],
) -> int:
    messages = []
    for first_name, email in recipients:
        subject, text_body, html_body = build_content(first_name)
        messages.append(_build_message(email, subject, text_body, html_body))

    if not messages:
        return 0

    await asyncio.to_thread(_send_messages, messages)
    return len(messages)


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

This code expires in 10 minutes. If you did not request this code, you can ignore
this email.

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello!</p>

<p>Use this login code to continue signing in to ZotHacks:</p>

<p><strong>{escape(passphrase)}</strong></p>

<p>This code expires in 10 minutes. If you did not request this code, you can
ignore this email.</p>

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


async def send_apply_reminder_emails(emails: Iterable[str]) -> None:
    subject = "Finish your ZotHacks 2026 application"
    text_body = f"""Hello!

Our records show that you started signing in for ZotHacks 2026 but have not
submitted your application yet.

Applications close tonight, October 2, 2026. If you still want to apply, please
finish and submit your application at https://zothacks.com/apply as soon as
possible.

If you have any questions or run into issues, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello!</p>

<p>Our records show that you started signing in for ZotHacks 2026 but have not
submitted your application yet.</p>

<p>Applications close tonight, October 2, 2026. If you still want to apply,
please finish and submit your application at
<a href="https://zothacks.com/apply">https://zothacks.com/apply</a> as soon as
possible.</p>

<p>If you have any questions or run into issues, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    messages = []
    for email in emails:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = formataddr((SES_FROM_NAME, SES_FROM_EMAIL))
        message["To"] = email
        message.set_content(text_body)
        message.add_alternative(html_body, subtype="html")
        messages.append(message)

    if not messages:
        return

    await asyncio.to_thread(_send_messages, messages)
    log.info("Sent SES apply reminder emails to %d recipients", len(messages))


def _decision_copy(
    first_name: str,
    decision: DecisionName,
    application_type: RoleName,
) -> tuple[str, str, str]:
    role = application_type.lower()
    subject = f"ZotHacks 2026 {application_type} application update"
    greeting = f"Hello {first_name}!"
    escaped_name = escape(first_name)

    if decision == "ACCEPTED":
        message = (
            f"Congratulations! Your ZotHacks 2026 {role} application has "
            "been accepted. Please visit the portal for next steps."
        )
    elif decision == "WAITLISTED":
        message = (
            f"Your ZotHacks 2026 {role} application has been waitlisted. "
            "Please visit the portal for more details and next steps."
        )
    else:
        message = (
            f"Thank you for applying to ZotHacks 2026 as a {role}. "
            "Unfortunately, we are not able to offer you a spot this year."
        )

    text_body = f"""{greeting}

{message}

Portal: https://zothacks.com/portal

If you have any questions, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello {escaped_name}!</p>

<p>{escape(message)}</p>

<p>Portal: <a href="https://zothacks.com/portal">https://zothacks.com/portal</a></p>

<p>If you have any questions, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    return subject, text_body, html_body


async def send_decision_emails(
    recipients: Iterable[Recipient],
    decision: DecisionName,
    application_type: RoleName,
) -> None:
    count = await _send_personalized_messages(
        recipients,
        lambda first_name: _decision_copy(first_name, decision, application_type),
    )
    log.info(
        "Sent SES %s %s decision emails to %d recipients",
        application_type,
        decision,
        count,
    )


async def send_rsvp_reminder_emails(
    recipients: Iterable[Recipient],
    application_type: RoleName,
) -> None:
    role = application_type.lower()

    def build_content(first_name: str) -> tuple[str, str, str]:
        subject = f"Reminder: RSVP for ZotHacks 2026 as a {application_type}"
        text_body = f"""Hello {first_name}!

You have been accepted to ZotHacks 2026 as a {role}, but our records show that
you have not completed your RSVP yet.

Please visit https://zothacks.com/portal to RSVP as soon as possible.

If you have any questions, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

        html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>You have been accepted to ZotHacks 2026 as a {escape(role)}, but our records
show that you have not completed your RSVP yet.</p>

<p>Please visit
<a href="https://zothacks.com/portal">https://zothacks.com/portal</a> to RSVP
as soon as possible.</p>

<p>If you have any questions, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""
        return subject, text_body, html_body

    count = await _send_personalized_messages(recipients, build_content)
    log.info(
        "Sent SES %s RSVP reminder emails to %d recipients",
        application_type,
        count,
    )


async def send_logistics_emails(
    recipients: Iterable[Recipient],
    application_type: RoleName,
    *,
    waitlisted: bool = False,
) -> None:
    role = application_type.lower()

    def build_content(first_name: str) -> tuple[str, str, str]:
        if waitlisted:
            subject = "ZotHacks 2026 waitlist logistics"
            intro = (
                "We are sending logistics information for waitlisted ZotHacks "
                "2026 hackers. Please keep an eye on your email and portal for "
                "updates."
            )
        else:
            subject = f"ZotHacks 2026 {application_type} logistics"
            intro = (
                f"We are sending logistics information for ZotHacks 2026 {role}s. "
                "Please review the portal and future emails for event details."
            )

        text_body = f"""Hello {first_name}!

{intro}

Portal: https://zothacks.com/portal

If you have any questions, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

        html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>{escape(intro)}</p>

<p>Portal: <a href="https://zothacks.com/portal">https://zothacks.com/portal</a></p>

<p>If you have any questions, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""
        return subject, text_body, html_body

    count = await _send_personalized_messages(recipients, build_content)
    log.info("Sent SES logistics emails to %d recipients", count)


async def send_waitlist_transfer_emails(recipients: Iterable[Recipient]) -> None:
    def build_content(first_name: str) -> tuple[str, str, str]:
        subject = "ZotHacks 2026 waitlist update"
        text_body = f"""Hello {first_name}!

Our RSVP deadline has passed, and your ZotHacks 2026 status has been moved to
the waitlist. Please visit the portal for the latest status information.

Portal: https://zothacks.com/portal

If you have any questions, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

        html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>Our RSVP deadline has passed, and your ZotHacks 2026 status has been moved
to the waitlist. Please visit the portal for the latest status information.</p>

<p>Portal: <a href="https://zothacks.com/portal">https://zothacks.com/portal</a></p>

<p>If you have any questions, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""
        return subject, text_body, html_body

    count = await _send_personalized_messages(recipients, build_content)
    log.info("Sent SES waitlist transfer emails to %d recipients", count)


async def send_rsvp_confirmation_email(email: str, first_name: str) -> None:
    subject = "ZotHacks 2026 RSVP confirmation"
    text_body = f"""Hello {first_name}!

Thank you for confirming your attendance for ZotHacks 2026.

Please keep an eye on your email and portal for event logistics.

Portal: https://zothacks.com/portal

If you have any questions, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>Thank you for confirming your attendance for ZotHacks 2026.</p>

<p>Please keep an eye on your email and portal for event logistics.</p>

<p>Portal: <a href="https://zothacks.com/portal">https://zothacks.com/portal</a></p>

<p>If you have any questions, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    await asyncio.to_thread(
        _send_message,
        _build_message(email, subject, text_body, html_body),
    )
    log.info("Sent SES RSVP confirmation email to %s", email)


async def send_waitlist_release_email(first_name: str, email: str) -> None:
    subject = "ZotHacks 2026 waitlist update"
    text_body = f"""Hello {first_name}!

We have an update for your ZotHacks 2026 waitlist status. Please visit the
portal for the latest information and next steps.

Portal: https://zothacks.com/portal

If you have any questions, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>We have an update for your ZotHacks 2026 waitlist status. Please visit the
portal for the latest information and next steps.</p>

<p>Portal: <a href="https://zothacks.com/portal">https://zothacks.com/portal</a></p>

<p>If you have any questions, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    await asyncio.to_thread(
        _send_message,
        _build_message(email, subject, text_body, html_body),
    )
    log.info("Sent SES waitlist release email to %s", email)


async def send_waitlist_queued_emails(recipients: Iterable[Recipient]) -> None:
    def build_content(first_name: str) -> tuple[str, str, str]:
        subject = "ZotHacks 2026 waitlist spot available"
        text_body = f"""Hello {first_name}!

A spot may be available for you at ZotHacks 2026. Please check the portal and
your email for next steps.

Portal: https://zothacks.com/portal

If you have any questions, please email us at {CONTACT_EMAIL}.

Best regards,

The ZotHacks 2026 Team
"""

        html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>A spot may be available for you at ZotHacks 2026. Please check the portal
and your email for next steps.</p>

<p>Portal: <a href="https://zothacks.com/portal">https://zothacks.com/portal</a></p>

<p>If you have any questions, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""
        return subject, text_body, html_body

    count = await _send_personalized_messages(recipients, build_content)
    log.info("Sent SES waitlist queued emails to %d recipients", count)


async def send_waitlist_closed_emails(recipients: Iterable[Recipient]) -> None:
    def build_content(first_name: str) -> tuple[str, str, str]:
        subject = "ZotHacks 2026 waitlist update"
        text_body = f"""Hello {first_name}!

We have reached event capacity for ZotHacks 2026 and are no longer able to
release additional spots from the waitlist.

Thank you for your interest in ZotHacks.

Best regards,

The ZotHacks 2026 Team
"""

        html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>We have reached event capacity for ZotHacks 2026 and are no longer able to
release additional spots from the waitlist.</p>

<p>Thank you for your interest in ZotHacks.</p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""
        return subject, text_body, html_body

    count = await _send_personalized_messages(recipients, build_content)
    log.info("Sent SES waitlist closed emails to %d recipients", count)


async def send_late_arrival_approved_email(
    email: str,
    first_name: str,
    arrival_time: str,
) -> None:
    subject = "ZotHacks 2026 late arrival update approved"
    text_body = f"""Hello {first_name}!

Your late arrival update for ZotHacks 2026 has been approved.

Approved arrival time: {arrival_time}

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>Your late arrival update for ZotHacks 2026 has been approved.</p>

<p>Approved arrival time: <strong>{escape(arrival_time)}</strong></p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    await asyncio.to_thread(
        _send_message,
        _build_message(email, subject, text_body, html_body),
    )
    log.info("Sent SES late arrival approved email to %s", email)


async def send_late_arrival_rejected_email(
    email: str,
    first_name: str,
    requested_time: str,
) -> None:
    subject = "ZotHacks 2026 late arrival update rejected"
    text_body = f"""Hello {first_name}!

Your late arrival update request for ZotHacks 2026 was not approved.

Requested arrival time: {requested_time}

Best regards,

The ZotHacks 2026 Team
"""

    html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>Your late arrival update request for ZotHacks 2026 was not approved.</p>

<p>Requested arrival time: <strong>{escape(requested_time)}</strong></p>

<p>Best regards,</p>

<p>The ZotHacks 2026 Team</p>
"""

    await asyncio.to_thread(
        _send_message,
        _build_message(email, subject, text_body, html_body),
    )
    log.info("Sent SES late arrival rejected email to %s", email)
