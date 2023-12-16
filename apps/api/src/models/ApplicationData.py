from datetime import datetime
from enum import Enum
from typing import Union

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
    pronouns: str
    ethnicity: str
    is_18_older: bool
    university: str
    education_level: str
    major: str
    is_first_hackathon: bool
    portfolio_link: Union[HttpUrl, None] = None
    linkedin_link: Union[HttpUrl, None] = None
    collaboration_question: Union[str, None] = Field(None, max_length=1024)
    any_job_question: str = Field(max_length=1024)


class ProcessedApplicationData(RawApplicationData):
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []
