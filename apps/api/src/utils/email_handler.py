from typing import Iterable, Protocol

from pydantic import EmailStr

from models.ApplicationData import Decision
from services import sendgrid_handler
from services.sendgrid_handler import (
    ApplicationUpdatePersonalization,
    ApplicationUpdateTemplates,
    Template,
)

IH_SENDER = ("apply@irvinehacks.com", "IrvineHacks 2025 Applications")

DECISION_TEMPLATES: dict[Decision, ApplicationUpdateTemplates] = {
    Decision.ACCEPTED: Template.ACCEPTED_EMAIL,
    Decision.REJECTED: Template.REJECTED_EMAIL,
    Decision.WAITLISTED: Template.WAITLISTED_EMAIL,
}


class ContactInfo(Protocol):
    first_name: str
    last_name: str


async def send_application_confirmation_email(
    email: EmailStr, user: ContactInfo, application_type: str
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
            "application_type": application_type,
        },
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
    )


async def send_decision_email(
    applicant_batch: Iterable[tuple[str, EmailStr]], decision: Decision
) -> None:
    """Send a specific decision email to a group of applicants."""
    personalizations = [
        ApplicationUpdatePersonalization(email=email, first_name=first_name)
        for first_name, email in applicant_batch
    ]

    template = DECISION_TEMPLATES[decision]
    await sendgrid_handler.send_email(template, IH_SENDER, personalizations, True)


async def send_waitlist_release_email(first_name: str, email: EmailStr) -> None:
    """Send the waitlist release email to an applicant."""
    personalization = ApplicationUpdatePersonalization(
        email=email, first_name=first_name
    )

    await sendgrid_handler.send_email(
        Template.WAITLIST_RELEASE_EMAIL,
        IH_SENDER,
        personalization,
        send_to_multiple=False,
    )
