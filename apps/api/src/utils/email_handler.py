from typing import Protocol

from pydantic import EmailStr

from services import sendgrid_handler
from services.sendgrid_handler import Template

IH_SENDER = ("apply@irvinehacks.com", "IrvineHacks 2024 Applications")


class ContactInfo(Protocol):
    email: EmailStr
    first_name: str
    last_name: str


async def send_application_confirmation_email(user: ContactInfo) -> None:
    """Send a confirmation email after a user submits an application.
    Will propagate exceptions from SendGrid."""
    await sendgrid_handler.send_email(
        Template.CONFIRMATION_EMAIL,
        IH_SENDER,
        {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
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
