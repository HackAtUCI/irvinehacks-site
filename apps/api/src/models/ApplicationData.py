from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl

from .utils import form_body


class Decision(str, Enum):
    ACCEPTED = "ACCEPTED"
    WAITLISTED = "WAITLISTED"
    REJECTED = "REJECTED"


Review = tuple[datetime, str, Decision]


@form_body
class RawApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    first_name: str
    last_name: str
    email: EmailStr
    pronouns: list[str]
    ethnicity: str
    is_18_older: bool
    university: str
    education_level: str
    major: str
    is_first_hackathon: bool
    portfolio_link: Optional[HttpUrl]
    linkedin_link: Optional[HttpUrl]
    collaboration_question: Optional[str] = Field()
    any_job_question: str = Field()


class ProcessedApplicationData(RawApplicationData):
    resume_url: Optional[HttpUrl]
    submission_time: datetime
    reviews: list[Review] = []
