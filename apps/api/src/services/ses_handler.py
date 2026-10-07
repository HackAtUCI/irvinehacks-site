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
SES_RECIPIENT_OVERRIDE_EMAIL = os.getenv("SES_RECIPIENT_OVERRIDE_EMAIL")
SES_FROM_EMAIL = os.getenv("SES_FROM_EMAIL", "apply@zothacks.com")
SES_FROM_NAME = os.getenv("SES_FROM_NAME", "ZotHacks 2026 Applications")
SES_HACKER_FROM_EMAIL = os.getenv("SES_HACKER_FROM_EMAIL", SES_FROM_EMAIL)
SES_HACKER_FROM_NAME = os.getenv("SES_HACKER_FROM_NAME", SES_FROM_NAME)
SES_MENTOR_FROM_EMAIL = os.getenv("SES_MENTOR_FROM_EMAIL", SES_FROM_EMAIL)
SES_MENTOR_FROM_NAME = os.getenv("SES_MENTOR_FROM_NAME", SES_FROM_NAME)
CONTACT_EMAIL = "zothacks2026@gmail.com"
Recipient = tuple[str, str]
RoleName = Literal["Hacker", "Mentor", "Volunteer"]
DecisionName = Literal["ACCEPTED", "WAITLISTED", "REJECTED"]

ROLE_SENDERS: dict[str, tuple[str, str]] = {
    "Hacker": (SES_HACKER_FROM_EMAIL, SES_HACKER_FROM_NAME),
    "Mentor": (SES_MENTOR_FROM_EMAIL, SES_MENTOR_FROM_NAME),
}


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
    message["To"] = SES_RECIPIENT_OVERRIDE_EMAIL or email
    if SES_RECIPIENT_OVERRIDE_EMAIL:
        message["X-Original-To"] = email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")
    return message


async def _send_personalized_messages(
    recipients: Iterable[Recipient],
    build_content: Callable[[str], tuple[str, str, str]],
    *,
    from_email: str = SES_FROM_EMAIL,
    from_name: str = SES_FROM_NAME,
) -> int:
    messages = []
    for first_name, email in recipients:
        subject, text_body, html_body = build_content(first_name)
        messages.append(
            _build_message(
                email,
                subject,
                text_body,
                html_body,
                from_email=from_email,
                from_name=from_name,
            )
        )

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
    if application_type == "Hacker":
        return _hacker_decision_copy(decision)

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


def _hacker_decision_copy(decision: DecisionName) -> tuple[str, str, str]:
    subject = "[ZotHacks 2026] Hacker Application Decisions"

    if decision == "ACCEPTED":
        text_body = (
            "Hello!\n\n"
            "Congratulations, you've been accepted to ZotHacks 2026! We're so "
            "excited to welcome you to attend our beginner-friendly, 12-hour "
            "hackathon.\n\n"
            "ZotHacks will take place from Friday, October 16 to Sunday, "
            "October 18 at the Student Center @ Pacific Ballroom. Here is a brief overview of "
            "what you can expect on the weekend of ZotHacks:\n\n"
            "Friday, October 16 (7 PM - 10 PM) - Hacker Orientation and Team "
            "Formation\n"
            "Saturday, October 17 (8 AM - 10 PM) - Opening ceremony and "
            "hacking period\n"
            "Sunday, October 18 (9 AM - 1 PM) - Project showcase and closing "
            "ceremony\n\n"
            "You'll be working on a project in assigned teams of four to "
            "compete for some exclusive prizes! If that sounds a bit daunting "
            "to you, don't worry - we'll teach you how to build an application "
            "from scratch with comprehensive workshops and starter packs to get "
            "you started. Meals, snacks, and beverages will also be provided "
            "throughout the event, so you won't have to worry about that "
            "either! For a more detailed breakdown of the schedule and food "
            "options, please visit our website.\n\n"
            "To confirm your attendance/participation at ZotHacks, make sure "
            "to RSVP and fill out the waiver on the portal by Thursday, "
            "October 8 at 11:59 PM PT. Make sure to complete these steps by "
            "then or we will have to forfeit your spot to a hacker on the "
            "waitlist!\n\n"
            "We also highly encourage that you attend our upcoming workshops:\n"
            "- Intro to Git - Wednesday, October 7, 8-9 PM at DBH 3011\n"
            "- Starter Packs & Resources - Thursday, October 8, 7-8 PM at DBH "
            "6011\n"
            "These workshops are essential for getting started for ZotHacks.\n\n"
            "Feel free to check out the FAQ section at https://zothacks.com "
            "for additional information about the hackathon. If you have any "
            "further questions, please feel free to reach out to us directly by "
            "replying to this email.\n\n"
            "Once again, congratulations on your acceptance to ZotHacks 2026! "
            "Further information regarding the schedule and logistics will be "
            "provided in the coming days. We can't wait to see you there!\n\n"
            "Regards,\n\n"
            "ZotHacks Team\n"
            "https://zothacks.com\n"
            "Create | Connect | Inspire\n"
        )

        html_body = """
<p>Hello!</p>

<p>Congratulations, you've been accepted to ZotHacks 2026! We're so excited to
welcome you to attend our beginner-friendly, 12-hour hackathon.</p>

<p>ZotHacks will take place from <strong>Friday, October 16 to Sunday, October
18</strong> at <a href="https://map.uci.edu/?id=463#!m/1117786?s/">Student 
Center @ Pacific Ballroom</a>. Here is a brief overview of what you can expect on the weekend
of ZotHacks:</p>

<p style="margin-left: 2rem;"><em>Friday, October 16 (7 PM - 10 PM)</em> -
Hacker Orientation and Team Formation<br>
<em>Saturday, October 17 (8 AM - 10 PM)</em> - Opening ceremony and hacking
period<br>
<em>Sunday, October 18 (9 AM - 1 PM)</em> - Project showcase and closing
ceremony</p>

<p>You'll be working on a project in assigned teams of four to compete for some
exclusive prizes! If that sounds a bit daunting to you, don't worry - we'll
teach you how to build an application from scratch with comprehensive workshops
and starter packs to get you started. Meals, snacks, and beverages will also be
provided throughout the event, so you won't have to worry about that either! For
a more detailed breakdown of the schedule and food options, please visit
<a href="https://zothacks.com">our website</a>.</p>

<p><strong>To confirm your attendance/participation at ZotHacks</strong>, make
sure to RSVP and fill out the waiver on the
<a href="https://zothacks.com/portal">portal</a> by <strong>Thursday, October 8
at 11:59 PM PT.</strong> <em>Make sure to complete these steps by then or we
will have to forfeit your spot to a hacker on the waitlist!</em></p>

<p>We also <strong>highly encourage</strong> that you attend our upcoming
workshops:</p>

<ul>
<li><strong>Intro to Git - Wednesday, October 7, 8-9 PM at DBH 3011</strong></li>
<li><strong>Starter Packs &amp; Resources - Thursday, October 8, 7-8 PM at DBH
6011</strong></li>
</ul>

<p>These workshops are <em>essential</em> for getting started for ZotHacks.</p>

<p>Feel free to check out the FAQ section at
<a href="https://zothacks.com">zothacks.com</a> for additional information about
the hackathon. If you have any further questions, please feel free to reach out
to us directly by replying to this email.</p>

<p>Once again, <strong>congratulations</strong> on your acceptance to ZotHacks
2026! Further information regarding the schedule and logistics will be provided
in the coming days. We can't wait to see you there!</p>

<p>Regards,</p>

<p><strong>ZotHacks Team</strong><br>
<a href="https://zothacks.com">https://zothacks.com</a><br>
Create | Connect | Inspire</p>
"""
    elif decision == "WAITLISTED":
        text_body = (
            "Hello!\n\n"
            "Thank you for taking the time to apply for ZotHacks. We received "
            "an overwhelming amount of applications, and we had a great time "
            "reviewing your unique submission. Unfortunately, due to space "
            "constraints, we can only offer you a spot on our waitlist. RSVPs "
            "for the waitlist will open on a first-come, first-serve basis on "
            "Friday, October 9 at 12 PM PST. You will receive a separate email "
            "when the waitlist RSVP officially opens.\n\n"
            "We also highly encourage that you attend our upcoming workshops:\n"
            "- Intro to Git - Wednesday, October 7, 8-9 PM at DBH 3011\n"
            "- Starter Packs & Resources - Thursday, October 8, 7-8 PM at DBH "
            "6011\n"
            "These workshops are essential for getting started for ZotHacks.\n\n"
            "We also encourage you to continue staying in touch with Hack at "
            "UCI by continuing to attend our other workshops and events. You "
            "can follow our website and socials at https://linktr.ee/hackatuci "
            "for the most up-to-date and comprehensive information about our "
            "club's upcoming events. Most importantly, make sure to keep an eye "
            "out for news about IrvineHacks, our largest hackathon, in winter "
            "quarter!\n\n"
            "Regards,\n\n"
            "ZotHacks Team\n"
            "https://zothacks.com\n"
            "Create | Connect | Inspire\n"
        )

        html_body = """
<p>Hello!</p>

<p>Thank you for taking the time to apply for ZotHacks. We received an
overwhelming amount of applications, and we had a great time reviewing your
unique submission. Unfortunately, due to space constraints, we can only offer
you a spot on our waitlist. RSVPs for the waitlist will open on a
<strong>first-come, first-serve basis</strong> on <strong>Friday, October 9 at
12 PM PST.</strong> You will receive a separate email when the waitlist RSVP
officially opens.</p>

<p>We also highly encourage that you attend our upcoming workshops:</p>

<ul>
<li><strong>Intro to Git - Wednesday, October 7, 8-9 PM at DBH 3011</strong></li>
<li><strong>Starter Packs &amp; Resources - Thursday, October 8, 7-8 PM at DBH
6011</strong></li>
</ul>

<p>These workshops are essential for getting started for ZotHacks.</p>

<p>We also encourage you to continue staying in touch with Hack at UCI by
continuing to attend our other workshops and events. You can follow our website
and socials at <a href="https://linktr.ee/hackatuci">https://linktr.ee/hackatuci</a>
for the most up-to-date and comprehensive information about our club's upcoming
events. Most importantly, make sure to keep an eye out for news about
IrvineHacks, our largest hackathon, in winter quarter!</p>

<p>Regards,</p>

<p><strong>ZotHacks Team</strong><br>
<a href="https://zothacks.com">https://zothacks.com</a><br>
Create | Connect | Inspire</p>
"""
    else:
        text_body = (
            "Hello!\n\n"
            "Thank you for taking the time to apply for ZotHacks. We received "
            "an overwhelming amount of applications, and we had a great time "
            "reviewing your unique submission. However, due to space "
            "constraints, we are unfortunately unable to extend you an invite "
            "to ZotHacks this year.\n\n"
            "That being said, we do encourage you to continue staying in touch "
            "with Hack at UCI by continuing to attend our other workshops and "
            "events. You can follow our website and socials at "
            "https://linktr.ee/hackatuci for the most up-to-date and "
            "comprehensive information about our club's upcoming events. Most "
            "importantly, make sure to keep an eye out for IrvineHacks 2027 "
            "applications!\n\n"
            "Regards,\n\n"
            "ZotHacks Team\n"
            "https://zothacks.com\n"
            "Create | Connect | Inspire\n"
        )

        html_body = """
<p>Hello!</p>

<p>Thank you for taking the time to apply for ZotHacks. We received an
overwhelming amount of applications, and we had a great time reviewing your
unique submission. However, due to space constraints, we are unfortunately
unable to extend you an invite to ZotHacks this year.</p>

<p>That being said, we do encourage you to continue staying in touch with Hack at
UCI by continuing to attend our other workshops and events. You can follow our
website and socials at
<a href="https://linktr.ee/hackatuci">https://linktr.ee/hackatuci</a>
for the most up-to-date and comprehensive information about our club's upcoming
events. Most importantly, make sure to keep an eye out for IrvineHacks 2027
applications!</p>

<p>Regards,</p>

<p><strong>ZotHacks Team</strong><br>
<a href="https://zothacks.com">https://zothacks.com</a><br>
Create | Connect | Inspire</p>
"""

    return subject, text_body, html_body


async def send_decision_emails(
    recipients: Iterable[Recipient],
    decision: DecisionName,
    application_type: RoleName,
) -> None:
    from_email, from_name = ROLE_SENDERS.get(
        application_type, (SES_FROM_EMAIL, SES_FROM_NAME)
    )
    count = await _send_personalized_messages(
        recipients,
        lambda first_name: _decision_copy(first_name, decision, application_type),
        from_email=from_email,
        from_name=from_name,
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
    def build_content(first_name: str) -> tuple[str, str, str]:
        subject = "[ZotHacks 2026] Hacker RSVP Deadline Reminder!"
        text_body = f"""Hello {first_name}!

Congratulations again on your acceptance to ZotHacks 2026 as a hacker! Our
records indicate that you may not have RSVP-ed for the event. Please remember
to RSVP on the portal by tomorrow, Thursday, October 8, by 11:59 PM PT.

Portal: https://zothacks.com/portal

If you have any questions or concerns, please feel free to reply to this email.
We would love to see you at the event!

Best regards,

ZotHacks Team
https://zothacks.com
Create | Connect | Inspire
"""

        html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>Congratulations again on your acceptance to ZotHacks 2026 as a hacker! Our
records indicate that you may not have RSVP-ed for the event. Please remember
to RSVP on the <a href="https://zothacks.com/portal">portal</a> by
<strong>tomorrow, Thursday, October 8, by 11:59 PM PT</strong>.</p>

<p>If you have any questions or concerns, please feel free to reply to this
email. We would love to see you at the event!</p>

<p>Best regards,</p>

<p><strong>ZotHacks Team</strong><br>
<a href="https://zothacks.com">https://zothacks.com</a><br>
Create | Connect | Inspire</p>
"""
        return subject, text_body, html_body

    count = await _send_personalized_messages(
        recipients,
        build_content,
        from_email=SES_HACKER_FROM_EMAIL,
        from_name=SES_HACKER_FROM_NAME,
    )
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
    def build_content(first_name: str) -> tuple[str, str, str]:
        if application_type != "Hacker" or waitlisted:
            if waitlisted:
                subject = "ZotHacks 2026 waitlist logistics"
                intro = (
                    "We are sending logistics information for waitlisted ZotHacks "
                    "2026 hackers. Please keep an eye on your email and portal for "
                    "updates."
                )
            else:
                role = application_type.lower()
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

        subject = "IMPORTANT: [ZotHacks 2026] Logistics and Team Assignments"

        text_body = f"""Hello {first_name}!

Thank you for confirming your attendance to ZotHacks 2026. Before the event,
it is crucial that you read through the following event logistics in its
entirety and complete the required tasks. We look forward to seeing you at
ZotHacks!

Pre-ZotHacks Checklist
- Sign the liability waiver: https://zothacks.com/portal
- Download all software listed on the prerequisite document: https://zothacks.com
- Join the Discord: https://zothacks.com
- Be sure to wear your badge for the entire duration of the event after checking in!
- Bring your laptop + charger, a refillable water bottle, and a positive attitude to the event!

Communication
Communication during the event will primarily be done through Discord. Please
review our starter pack if you are unfamiliar with using Discord.

Team Assignment
The team assignments can be found on the spreadsheet below. We highly recommend
reaching out to your teammates via email or Discord before the event to get to
know each other better and start building your team dynamic.

Team Assignment Spreadsheet: https://zothacks.com

General ZotHacks Schedule
ZotHacks 2026 will take place Friday evening, all-day Saturday, and
approximately the first half of Sunday in-person at the Student Center. If you
cannot get inside the building at any point, please let an organizer know via
Discord.

Map: https://map.uci.edu/?id=463#!m/1117786?s/

Food will be provided all day Saturday and Sunday breakfast only.

Saturday (10/17):
8:00 AM - Check In
8:30 AM - Opening Ceremony
9:00 AM - Breakfast
10:00 AM - Hacking Begins
12:00 PM - Lunch
1:00 PM - Cookie Social
4:30 PM - Jeopardy Social
6:00 PM - Dinner
10:00 PM - Hacking Ends

Sunday (10/18):
9:00 AM - Check In/Breakfast
10:00 AM - Project Expo and Judging
12:00 PM - Closing Ceremony
1:00 PM - ZotHacks Ends

The full event schedule will be posted on our live site in the coming days:
https://zothacks.com. The latest check in time is 9pm. If you plan on arriving
later than 7:30pm, please email us at {CONTACT_EMAIL} and let us know the
reason, so we can save your spot.

Health and Safety Protocols
Please be mindful of your personal health and of those around you. If you feel
sick, please stay home. To help us ensure your safety at the venue, keep your
badge visible at all times.

Resources and Starter Packs
Make sure to check out these starter packs and resources to get more familiar
with the technologies, terminology, and syntax you'll be using during ZotHacks.
They're a great way to prepare and build confidence before you start hacking!
We know this is a lot of information, but don't worry, you'll be supported by
your team and mentor every step of the way!

- ZotHacks 2026 Prerequisites: https://zothacks.com
- ZotHacks 2026 Resources and Starter Packs: https://zothacks.com?overlay=resources
- hack-intro-js-react: https://github.com/HackAtUCI/zothacks-frontend-startercode
- starter-pack-full-stack-web-app: https://github.com/HackAtUCI/starter-pack-full-stack-web-app
- zothacks-frontend-startercode: https://github.com/HackAtUCI/zothacks-frontend-startercode

Questions/Comments
If you have any questions that have not yet been answered or if you are unable
to attend the event anymore, please reach out to us at {CONTACT_EMAIL}, and we
will be glad to assist you with your concerns.

Best Regards,
The ZotHacks 2026 Team
"""

        html_body = f"""
<p>Hello {escape(first_name)}!</p>

<p>Thank you for confirming your attendance to ZotHacks 2026. Before the event,
it is crucial that you read through the following event logistics in its
entirety and complete the required tasks. We look forward to seeing you at
ZotHacks!</p>

<h2>Pre-ZotHacks Checklist</h2>
<ul>
  <li>Sign the <a href="https://zothacks.com/portal">liability waiver</a>!</li>
  <li>Download all software listed on the
  <a href="https://zothacks.com">prerequisite document</a>!</li>
  <li>Join the Discord <a href="https://zothacks.com">here</a>!</li>
  <li>Be sure to wear your badge for the entire duration of the event after
  checking in!</li>
  <li>Bring your laptop + charger, a refillable water bottle, and a positive
  attitude to the event!</li>
</ul>

<h2>Communication</h2>
<p>Communication during the event will primarily be done through Discord. Please
review our starter pack if you are unfamiliar with using Discord.</p>

<h2>Team Assignment</h2>
<p>The team assignments can be found on the spreadsheet below. We highly
recommend reaching out to your teammates via email or Discord before the event
to get to know each other better and start building your team dynamic.</p>

<p><a href="https://zothacks.com"><strong>Team Assignment
Spreadsheet</strong></a></p>

<h2>General ZotHacks Schedule</h2>
<p>ZotHacks 2026 will take place Friday evening, all-day Saturday, and
approximately the first half of Sunday in-person at the <strong>Student
Center</strong>. If you cannot get inside the building at any point, please let
an organizer know via Discord.</p>

<p><a href="https://map.uci.edu/?id=463#!m/1117786?s/"><strong>Map</strong></a></p>

<p>Food will be provided all day Saturday and Sunday breakfast only.</p>

<p><strong><em>Saturday (10/17):</em></strong><br>
8:00 AM - Check In<br>
8:30 AM - Opening Ceremony<br>
9:00 AM - Breakfast<br>
10:00 AM - Hacking Begins<br>
12:00 PM - Lunch<br>
1:00 PM - Cookie Social<br>
4:30 PM - Jeopardy Social<br>
6:00 PM - Dinner<br>
10:00 PM - Hacking Ends</p>

<p><strong><em>Sunday (10/18):</em></strong><br>
9:00 AM - Check In/Breakfast<br>
10:00 AM - Project Expo and Judging<br>
12:00 PM - Closing Ceremony<br>
1:00 PM - ZotHacks Ends</p>

<p>The full event schedule will be posted on our live site in the coming days:
<a href="https://zothacks.com">https://zothacks.com</a>. The latest check in time
is 9pm. If you plan on arriving later than 7:30pm, please email us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> and let us know the
reason, so we can save your spot.</p>

<h2>Health and Safety Protocols</h2>
<p>Please be mindful of your personal health and of those around you. If you
feel sick, please stay home. To help us ensure your safety at the venue, keep
your <strong>badge</strong> visible at all times.</p>

<h2>Resources and Starter Packs</h2>
<p>Make sure to check out these starter packs and resources to get more familiar
with the technologies, terminology, and syntax you'll be using during ZotHacks.
They're a great way to prepare and build confidence before you start hacking!
We know this is a lot of information, but don't worry, you'll be supported by
your team and mentor every step of the way!</p>

<ul>
  <li><a href="https://zothacks.com">ZotHacks 2026 Prerequisites</a></li>
  <li><a href="https://zothacks.com?overlay=resources">ZotHacks 2026 Resources and Starter
  Packs</a></li>
  <li><a href="https://github.com/HackAtUCI/zothacks-frontend-startercode">hack-intro-js-react</a></li>
  <li><a href="https://github.com/HackAtUCI/starter-pack-full-stack-web-app">starter-pack-full-stack-web-app</a></li>
  <li><a href="https://github.com/HackAtUCI/zothacks-frontend-startercode">zothacks-frontend-startercode</a></li>
</ul>

<h2>Questions/Comments</h2>
<p>If you have any questions that have not yet been answered or if you are
unable to attend the event anymore, please reach out to us at
<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>, and we will be glad to
assist you with your concerns.</p>

<p>Best Regards,<br>
The ZotHacks 2026 Team</p>
"""
        return subject, text_body, html_body

    count = await _send_personalized_messages(
        recipients,
        build_content,
        from_email=SES_HACKER_FROM_EMAIL,
        from_name=SES_HACKER_FROM_NAME,
    )
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
