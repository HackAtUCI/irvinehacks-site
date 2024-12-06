from enum import Enum
from typing import Literal, Union

from typing_extensions import TypeAlias

from models.ApplicationData import Decision, ProcessedApplicationData
from services.mongodb_handler import BaseRecord


class Role(str, Enum):
    APPLICANT = "applicant"
    DIRECTOR = "director"
    HACKER = "hacker"
    MENTOR = "mentor"
    REVIEWER = "reviewer"
    ORGANIZER = "organizer"
    VOLUNTEER = "volunteer"
    CHECKIN_LEAD = "checkin_lead"
    SPONSOR = "sponsor"
    JUDGE = "judge"
    WORKSHOP_LEAD = "workshop_lead"


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
    role: Role


ApplicantStatus: TypeAlias = Union[Status, Decision]


class BareApplicant(UserRecord):
    """Applicant without the application data."""

    role: Literal[Role.APPLICANT]
    status: ApplicantStatus


class Applicant(BareApplicant):
    """Applicant with application data."""

    role: Literal[Role.APPLICANT] = Role.APPLICANT
    application_data: ProcessedApplicationData
