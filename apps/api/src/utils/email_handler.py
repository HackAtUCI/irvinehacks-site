from typing import Any, Iterable, Literal, Protocol

from pydantic import EmailStr

from models.ApplicationData import Decision
from models.user_record import Role, Status
from services import mongodb_handler, sendgrid_handler
from services.sendgrid_handler import (
    ApplicationUpdatePersonalization,
    ApplicationUpdateTemplates,
    LogisticsTemplates,
    Template,
)

IH_SENDER = ("apply@irvinehacks.com", "IrvineHacks 2025 Applications")

DECISION_TEMPLATES: dict[Role, dict[Decision, ApplicationUpdateTemplates]] = {
    Role.HACKER: {
        Decision.ACCEPTED: Template.HACKER_ACCEPTED_EMAIL,
        Decision.REJECTED: Template.HACKER_REJECTED_EMAIL,
        Decision.WAITLISTED: Template.HACKER_WAITLISTED_EMAIL,
    },
    Role.MENTOR: {
        Decision.ACCEPTED: Template.MENTOR_ACCEPTED_EMAIL,
        Decision.REJECTED: Template.MENTOR_REJECTED_EMAIL,
    },
    Role.VOLUNTEER: {
        Decision.ACCEPTED: Template.VOLUNTEER_ACCEPTED_EMAIL,
        Decision.REJECTED: Template.VOLUNTEER_REJECTED_EMAIL,
    },
}


LOGISTICS_TEMPLATES: dict[Role, LogisticsTemplates] = {
    Role.HACKER: Template.HACKER_LOGISTICS_EMAIL,
    Role.MENTOR: Template.MENTOR_LOGISTICS_EMAIL,
    Role.VOLUNTEER: Template.VOLUNTEER_LOGISTICS_EMAIL,
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
    applicant_batch: Iterable[tuple[str, EmailStr]],
    decision: Decision,
    application_type: Literal[Role.HACKER, Role.MENTOR, Role.VOLUNTEER],
) -> None:
    """Send a specific decision email to a group of applicants."""
    personalizations = [
        ApplicationUpdatePersonalization(email=email, first_name=first_name)
        for first_name, email in applicant_batch
    ]

    template = DECISION_TEMPLATES[application_type][decision]
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


async def send_logistics_email(
    application_type: Literal[Role.HACKER, Role.MENTOR, Role.VOLUNTEER]
) -> None:
    """Send logistics emails to a particular group of attendees."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        mongodb_handler.Collection.USERS,
        {"roles": Role(application_type), "status": Status.ATTENDING},
        ["_id", "first_name"],
    )

    personalizations = []
    for record in records:
        personalizations.append(
            ApplicationUpdatePersonalization(
                email=recover_email_from_uid(record["_id"]),
                first_name=record["first_name"],
            )
        )

    template = LOGISTICS_TEMPLATES[application_type]
    if len(records) > 0:
        await sendgrid_handler.send_email(template, IH_SENDER, personalizations, True)


def recover_email_from_uid(uid: str) -> str:
    """For NativeUsers, the email should still delivery properly."""
    uid = uid.replace("..", "\n")
    *reversed_domain, local = uid.split(".")
    local = local.replace("\n", ".")
    domain = ".".join(reversed(reversed_domain))
    return f"{local}@{domain}"
