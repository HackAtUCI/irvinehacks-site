from typing import Any, Iterable, Literal, Protocol

from pydantic import EmailStr

from models.ApplicationData import Decision
from models.user_record import Role, Status
from services import mongodb_handler, ses_handler

SES_ROLE_NAMES: dict[Role, ses_handler.RoleName] = {
    Role.HACKER: "Hacker",
    Role.MENTOR: "Mentor",
    Role.VOLUNTEER: "Volunteer",
}

SES_DECISION_NAMES: dict[Decision, ses_handler.DecisionName] = {
    Decision.ACCEPTED: "ACCEPTED",
    Decision.WAITLISTED: "WAITLISTED",
    Decision.REJECTED: "REJECTED",
}


class ContactInfo(Protocol):
    first_name: str
    last_name: str


async def send_application_confirmation_email(
    email: EmailStr, user: ContactInfo, application_type: str
) -> None:
    """Send a confirmation email after a user submits an application.
    Will propagate exceptions from SES."""
    await ses_handler.send_application_confirmation_email(
        str(email), user.first_name, user.last_name, application_type
    )


async def send_rsvp_confirmation_email(email: EmailStr, first_name: str) -> None:
    """Send a confirmation email after a user submits an RSVP.
    Will propagate exceptions from SES."""
    await ses_handler.send_rsvp_confirmation_email(str(email), first_name)


async def send_guest_login_email(email: EmailStr, passphrase: str) -> None:
    """Email login passphrase to guest."""
    await ses_handler.send_guest_login_email(str(email), passphrase)


async def send_decision_email(
    applicant_batch: Iterable[tuple[str, EmailStr]],
    decision: Decision,
    application_type: Literal[Role.HACKER, Role.MENTOR, Role.VOLUNTEER],
) -> None:
    """Send a specific decision email to a group of applicants."""
    recipients = [
        (first_name, str(email))
        for first_name, email in applicant_batch
    ]

    await ses_handler.send_decision_emails(
        recipients,
        SES_DECISION_NAMES[decision],
        SES_ROLE_NAMES[application_type],
    )


async def send_waitlist_release_email(first_name: str, email: EmailStr) -> None:
    """Send the waitlist release email to an applicant."""
    await ses_handler.send_waitlist_release_email(first_name, str(email))


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
            (record["first_name"], recover_email_from_uid(record["_id"]))
        )

    if len(records) > 0:
        await ses_handler.send_logistics_emails(
            personalizations,
            SES_ROLE_NAMES[application_type],
        )


def recover_email_from_uid(uid: str) -> str:
    """For NativeUsers, the email should still delivery properly."""
    uid = uid.replace("..", "\n")
    *reversed_domain, local = uid.split(".")
    local = local.replace("\n", ".")
    domain = ".".join(reversed(reversed_domain))
    return f"{local}@{domain}"
