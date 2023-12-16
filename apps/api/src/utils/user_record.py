from enum import Enum

from pydantic import Field

from services.mongodb_handler import BaseRecord


class Role(str, Enum):
    APPLICANT = "applicant"
    DIRECTOR = "director"
    HACKER = "hacker"
    MENTOR = "mentor"
    REVIEWER = "reviewer"
    TECH_ORGANIZER = "tech_organizer"
    VOLUNTEER = "volunteer"


class UserRecord(BaseRecord):
    uid: str = Field(alias="_id")
    role: Role
