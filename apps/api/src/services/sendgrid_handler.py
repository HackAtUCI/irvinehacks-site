# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
import os
from logging import getLogger
from typing import Iterable, Optional, Tuple, TypedDict, Union

import aiosendgrid
from httpx import HTTPStatusError
from sendgrid.helpers.mail import Email, Mail, Personalization

log = getLogger(__name__)

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

PersonalizationData = TypedDict(
    "PersonalizationData",
    {
        "email": str,
        "first_name": Optional[str],
        "last_name": Optional[str],
        "passphrase": Optional[str],
    },
)


async def send_email(
    template_id: str,
    sender_email: Tuple[str, str],
    receiver_data: Union[PersonalizationData, Iterable[PersonalizationData]],
    send_to_multiple: bool = False,
) -> None:
    """
    Send a personalized templated email to one or multiple receivers via SendGrid
    """
    try:
        email_message = Mail()

        if send_to_multiple:
            if not isinstance(receiver_data, list):
                raise TypeError(
                    f"Expected {list} for receiver_data but got {type(receiver_data)}"
                )
            else:
                for r in receiver_data:
                    p = Personalization()
                    p.add_to(Email(email=r["email"], dynamic_template_data=r))
                    email_message.add_personalization(p)
        else:
            if not isinstance(receiver_data, dict):
                raise TypeError(
                    f"Expected {dict} for receiver_data but got {type(receiver_data)}"
                )
            else:
                p = Personalization()
                p.add_to(
                    Email(
                        email=receiver_data["email"],
                        dynamic_template_data=receiver_data,
                    )
                )
                email_message.add_personalization(p)

        email_message.from_email = sender_email
        email_message.template_id = template_id

        async with aiosendgrid.AsyncSendGridClient(api_key=SENDGRID_API_KEY) as client:
            response = await client.send_mail_v3(body=email_message.get())
            log.debug(response.status_code)
            log.debug(response.headers)
    except HTTPStatusError as e:
        log.exception("During SendGrid processing: %s", e)
        raise RuntimeError("Could not send email with SendGrid")
