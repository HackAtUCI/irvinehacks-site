from enum import Enum
from typing import Literal, Union

from pydantic import Field

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


class Status(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    REVIEWED = "REVIEWED"
    WAIVER_SIGNED = "WAIVER_SIGNED"
    CONFIRMED = "CONFIRMED"
    ATTENDING = "ATTENDING"
    VOID = "VOID"


class UserRecord(BaseRecord):
    uid: str = Field(alias="_id")
    role: Role


class Applicant(UserRecord):
    role: Literal[Role.APPLICANT] = Role.APPLICANT
    status: Union[Status, Decision]
    application_data: ProcessedApplicationData
