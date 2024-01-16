from typing import Protocol

from pydantic import EmailStr

from models.ApplicationData import Decision
from services import sendgrid_handler
from services.sendgrid_handler import ApplicationUpdatePersonalization, Template

IH_SENDER = ("apply@irvinehacks.com", "IrvineHacks 2024 Applications")
REPLY_TO_HACK_AT_UCI = ("hack@uci.edu", "Hack at UCI")


class ContactInfo(Protocol):
    first_name: str
    last_name: str


async def send_application_confirmation_email(
    email: EmailStr, user: ContactInfo
) -> None:
    """Send a confirmation email after a user submits an application.
    Will propagate exceptions from SendGrid."""
    await sendgrid_handler.send_email(
        Template.CONFIRMATION_EMAIL,
        IH_SENDER,
        {
            "email": email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        },
        reply_to=REPLY_TO_HACK_AT_UCI,
    )


async def send_guest_login_email(email: EmailStr, passphrase: str) -> None:
    """Email login passphrase to guest."""
    await sendgrid_handler.send_email(
        Template.GUEST_TOKEN,
        IH_SENDER,
        {
            "email": email,
            "passphrase": passphrase,
        },
        reply_to=REPLY_TO_HACK_AT_UCI,
    )


async def send_decision_email(
    sender_email: tuple[str, str], applicant_batch: dict[tuple[str, EmailStr], Decision]
) -> None:
    personalization_dict: dict[Decision, list[ApplicationUpdatePersonalization]] = {
        Decision.ACCEPTED: [],
        Decision.REJECTED: [],
        Decision.WAITLISTED: [],
    }

    for (first_name, email), status in applicant_batch.items():
        personalization = ApplicationUpdatePersonalization(
            email=email, first_name=first_name
        )
        if status in (Decision.ACCEPTED, Decision.REJECTED, Decision.WAITLISTED):
            personalization_dict[status].append(personalization)

    template_data = {
        Template.ACCEPTED_EMAIL: personalization_dict[Decision.ACCEPTED],
        Template.REJECTED_EMAIL: personalization_dict[Decision.REJECTED],
        Template.WAITLISTED_EMAIL: personalization_dict[Decision.WAITLISTED],
    }

    for template, data in template_data.items():
        if data:
            await sendgrid_handler.send_email(template, sender_email, data, True)
