# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
import os
from enum import Enum
from logging import getLogger
from typing import Iterable, Literal, Tuple, TypedDict, Union, overload

import aiosendgrid
from httpx import HTTPStatusError
from sendgrid.helpers.mail import Email, Mail, Personalization
from typing_extensions import TypeAlias

log = getLogger(__name__)

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")


class Template(str, Enum):
    CONFIRMATION_EMAIL = "d-3f5484a1aa4b4403a8b1f1f80c779dea"  # for zothacks

    GUEST_TOKEN = "d-19a126a867294a56b8db9d94a23f7b5d"  # for irvinehacks 2026
    HACKER_ACCEPTED_EMAIL = "d-07fa796cf6c34518a7124a68d4790d82"
    HACKER_WAITLISTED_EMAIL = "d-0e0cde2bfcc14dbfa069422801b6cf58"
    HACKER_REJECTED_EMAIL = "d-4edf53090e42417ea9c065645d8c55c2"
    MENTOR_ACCEPTED_EMAIL = "d-b98f516aedc24b83a1ad913610d6994a"
    MENTOR_REJECTED_EMAIL = "d-d7edf0ed4acd4fd084d619f9dab181fc"
    VOLUNTEER_ACCEPTED_EMAIL = "d-32ec9c6b7b00474a833778e276f65e50"
    VOLUNTEER_REJECTED_EMAIL = "d-29c4bbb0fedb48cb8869a0f43d058b80"
    APPLY_REMINDER = "d-9fe9988991b9420c86ba7bf2b5cd7357"
    HACKER_RSVP_REMINDER = "d-50090289b60947198def96e5bbc9e8c4"
    MENTOR_RSVP_REMINDER = "d-44da492ad79945a8932904904c39141b"
    VOLUNTEER_RSVP_REMINDER = "d-10a22149e4594cdf85d861f9e420dbe8"
    WAITLIST_RELEASE_EMAIL = "d-467b8de41d214f33ad9b6cc98cbb6c05"
    HACKER_LOGISTICS_EMAIL = "d-daa64b617d914a5996d51003e6d900a6"
    MENTOR_LOGISTICS_EMAIL = "d-2fb645c51c1a450babe5434162884ee4"
    VOLUNTEER_LOGISTICS_EMAIL = "d-c1cb63658bfe412aa9c8b327cceb29a7"
    HACKER_WAITLISTED_LOGISTICS_EMAIL = "d-96dee09b12ef49b3977353fb96ee866e"
    WAITLIST_TRANSFER_EMAIL = "d-d31a55e147e74d1689d859c88de19d9d"


class PersonalizationData(TypedDict):
    email: str


class ConfirmationPersonalization(PersonalizationData):
    first_name: str
    last_name: str
    application_type: str


class GuestTokenPersonalization(PersonalizationData):
    passphrase: str


class ApplicationUpdatePersonalization(PersonalizationData):
    first_name: str


ApplicationUpdateTemplates: TypeAlias = Literal[
    Template.HACKER_ACCEPTED_EMAIL,
    Template.HACKER_WAITLISTED_EMAIL,
    Template.HACKER_REJECTED_EMAIL,
    Template.MENTOR_ACCEPTED_EMAIL,
    Template.MENTOR_REJECTED_EMAIL,
    Template.VOLUNTEER_ACCEPTED_EMAIL,
    Template.VOLUNTEER_REJECTED_EMAIL,
    Template.HACKER_RSVP_REMINDER,
    Template.MENTOR_RSVP_REMINDER,
    Template.VOLUNTEER_RSVP_REMINDER,
    Template.WAITLIST_RELEASE_EMAIL,
    Template.WAITLIST_TRANSFER_EMAIL,
]

LogisticsTemplates: TypeAlias = Literal[
    Template.HACKER_LOGISTICS_EMAIL,
    Template.MENTOR_LOGISTICS_EMAIL,
    Template.VOLUNTEER_LOGISTICS_EMAIL,
    Template.HACKER_WAITLISTED_LOGISTICS_EMAIL,
]


@overload
async def send_email(
    template_id: Literal[Template.CONFIRMATION_EMAIL],
    sender_email: Tuple[str, str],
    receiver_data: ConfirmationPersonalization,
    send_to_multiple: Literal[False] = False,
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: Literal[Template.GUEST_TOKEN],
    sender_email: Tuple[str, str],
    receiver_data: GuestTokenPersonalization,
    send_to_multiple: Literal[False] = False,
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: Literal[Template.CONFIRMATION_EMAIL],
    sender_email: Tuple[str, str],
    receiver_data: Iterable[ConfirmationPersonalization],
    send_to_multiple: Literal[True],
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: ApplicationUpdateTemplates,
    sender_email: Tuple[str, str],
    receiver_data: Iterable[ApplicationUpdatePersonalization],
    send_to_multiple: Literal[True],
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: ApplicationUpdateTemplates,
    sender_email: Tuple[str, str],
    receiver_data: ApplicationUpdatePersonalization,
    send_to_multiple: Literal[False],
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: Literal[Template.APPLY_REMINDER],
    sender_email: Tuple[str, str],
    receiver_data: PersonalizationData,
    send_to_multiple: Literal[False],
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: Literal[Template.APPLY_REMINDER],
    sender_email: Tuple[str, str],
    receiver_data: Iterable[PersonalizationData],
    send_to_multiple: Literal[True],
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: LogisticsTemplates,
    sender_email: Tuple[str, str],
    receiver_data: ApplicationUpdatePersonalization,
    send_to_multiple: Literal[False],
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


@overload
async def send_email(
    template_id: LogisticsTemplates,
    sender_email: Tuple[str, str],
    receiver_data: Iterable[ApplicationUpdatePersonalization],
    send_to_multiple: Literal[True],
    reply_to: Union[Tuple[str, str], None] = None,
) -> None: ...


async def send_email(
    template_id: Template,
    sender_email: Tuple[str, str],
    receiver_data: Union[PersonalizationData, Iterable[PersonalizationData]],
    send_to_multiple: bool = False,
    reply_to: Union[Tuple[str, str], None] = None,
) -> None:
    """
    Send a personalized templated email to one or multiple receivers via SendGrid
    """
    try:
        email_message = Mail()

        if send_to_multiple:
            if isinstance(receiver_data, dict):
                raise TypeError(
                    f"Expected {list} for receiver_data but got {type(receiver_data)}"
                )
            for r in receiver_data:
                p = Personalization()
                p.add_to(Email(email=r["email"], dynamic_template_data=r))
                email_message.add_personalization(p)
        else:
            if not isinstance(receiver_data, dict):
                raise TypeError(
                    f"Expected {dict} for receiver_data but got {type(receiver_data)}"
                )
            p = Personalization()
            p.add_to(
                Email(
                    email=receiver_data["email"],
                    dynamic_template_data=receiver_data,
                )
            )
            email_message.add_personalization(p)

        if reply_to is not None:
            email_message.reply_to = reply_to

        email_message.from_email = sender_email
        email_message.template_id = template_id

        async with aiosendgrid.AsyncSendGridClient(api_key=SENDGRID_API_KEY) as client:
            response = await client.send_mail_v3(body=email_message.get())
            log.debug(response.status_code)
            log.debug(response.headers)
    except HTTPStatusError as e:
        log.exception("During SendGrid processing: %s", e)
        raise RuntimeError("Could not send email with SendGrid")
