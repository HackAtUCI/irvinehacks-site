from enum import Enum
from typing import Annotated, Union

from pydantic import AfterValidator, Field
from typing_extensions import TypeAlias

from models.ApplicationData import Decision, ProcessedApplicationDataUnion
from services.mongodb_handler import BaseRecord


class Role(str, Enum):
    """
    Possible roles of organizers and participants.
    The values are the display labels to be shown throughout the site.
    """

    APPLICANT = "Applicant"
    DIRECTOR = "Director"
    HACKER = "Hacker"
    MENTOR = "Mentor"
    REVIEWER = (
        "Reviewer"  # leaving this role in for now, but might be removed down the line
    )
    HACKER_REVIEWER = "Hacker Reviewer"
    MENTOR_REVIEWER = "Mentor Reviewer"
    VOLUNTEER_REVIEWER = "Volunteer Reviewer"
    ORGANIZER = "Organizer"
    VOLUNTEER = "Volunteer"
    CHECKIN_LEAD = "Check-in Lead"
    LEAD = "Lead"  # Applications/Mentors/Volunteer Committee Leads
    SPONSOR = "Sponsor"
    JUDGE = "Judge"
    WORKSHOP_LEAD = "Workshop Lead"


class Status(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    REVIEWED = "REVIEWED"
    WAIVER_SIGNED = "WAIVER_SIGNED"
    CONFIRMED = "CONFIRMED"
    ATTENDING = "ATTENDING"
    VOID = "VOID"


class UserRecord(BaseRecord):
    """
    Represents any user with an intent to participate in the event.
    This does not include people who have logged in but not applied.
    - Anybody with a role should have a name
    - Organizers do not have statuses
    - `uid` is inherited from `BaseRecord`
    """

    first_name: str
    last_name: str
    roles: Annotated[tuple[Role, ...], Field(min_length=1)]


def has_applicant_role(val: tuple[Role, ...]) -> tuple[Role, ...]:
    if Role.APPLICANT not in val:
        raise ValueError
    return val


RoleWithApplicant = Annotated[tuple[Role, ...], AfterValidator(has_applicant_role)]
ApplicantStatus: TypeAlias = Union[Status, Decision]


class BareApplicant(UserRecord):
    """Applicant without the application data."""

    roles: RoleWithApplicant
    status: ApplicantStatus


class Applicant(BareApplicant):
    """Applicant with application data."""

    roles: RoleWithApplicant
    application_data: ProcessedApplicationDataUnion
