from datetime import datetime
from enum import Enum
from typing import Union

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_serializer

from .utils import form_body


class Decision(str, Enum):
    ACCEPTED = "ACCEPTED"
    WAITLISTED = "WAITLISTED"
    REJECTED = "REJECTED"


Review = tuple[datetime, str, Decision]


# hacker application model
class BaseApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    pronouns: str
    ethnicity: str
    is_18_older: bool
    school: str
    education_level: str
    major: str
    is_first_hackathon: bool
    linkedin: Union[HttpUrl, None] = None
    portfolio: Union[HttpUrl, None] = None
    frq_collaboration: Union[str, None] = Field(None, max_length=2048)
    frq_dream_job: str = Field(max_length=2048)


@form_body
class RawApplicationData(BaseApplicationData):
    """Expected to be sent by the form on the site."""

    first_name: str
    last_name: str
    application_type: str


class ProcessedApplicationData(BaseApplicationData):
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []

    @field_serializer("linkedin", "portfolio", "resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val
