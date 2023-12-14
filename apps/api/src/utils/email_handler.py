from enum import Enum
from typing import Protocol

from pydantic import EmailStr

from services import sendgrid_handler
from services.sendgrid_handler import PersonalizationData

IH_SENDER = ("apply@irvinehacks.com", "IrvineHacks 2024 Applications")


class ContactInfo(Protocol):
    email: EmailStr
    first_name: str
    last_name: str


class Template(str, Enum):
    # TODO: provide actual template IDs
    CONFIRMATION_EMAIL = "d-e053b7a4bedd449bafda46c6512d531c"
    GUEST_TOKEN = "d-d962252a87844188880d7bd19a5b2fbf"


async def send_application_confirmation_email(user: ContactInfo) -> None:
    """Send a confirmation email after a user submits an application.
    Will propagate exceptions from SendGrid."""
    send_data: PersonalizationData = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    await sendgrid_handler.send_email(Template.CONFIRMATION_EMAIL, IH_SENDER, send_data)


async def send_guest_login_email(email: EmailStr, passphrase: str) -> None:
    """Email login passphrase to guest."""
    send_data: PersonalizationData = {
        "email": email,
        "passphrase": passphrase,
    }
    await sendgrid_handler.send_email(Template.GUEST_TOKEN, IH_SENDER, send_data)
