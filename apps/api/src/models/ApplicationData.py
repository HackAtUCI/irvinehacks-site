from datetime import datetime
from enum import Enum
from typing import Annotated, Union

from fastapi import UploadFile
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    HttpUrl,
    field_serializer,
)


class Decision(str, Enum):
    ACCEPTED = "ACCEPTED"
    WAITLISTED = "WAITLISTED"
    REJECTED = "REJECTED"


Review = tuple[datetime, str, Decision]


def make_empty_none(val: Union[str, None]) -> Union[str, None]:
    """Browser will send empty strings for unspecified form inputs."""
    if val == "":
        return None
    return val


NullableHttpUrl = Annotated[Union[None, HttpUrl], BeforeValidator(make_empty_none)]


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
    linkedin: NullableHttpUrl = None
    portfolio: NullableHttpUrl = None
    frq_collaboration: Union[str, None] = Field(None, max_length=2048)
    frq_dream_job: str = Field(max_length=2048)


# volunteer application model
class VolunteerApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    pronouns: str
    ethnicity: str
    is_18_older: bool
    school: str
    education_level: str
    major: str
    applied_before: bool
    friday_availability: str
    saturday_availability: str
    sunday_availability: str
    frq_volunteer: str = Field(max_length=2048)
    frq_utensil: str = Field(max_length=2048)
    allergies: Union[str, None] = Field(None, max_length=2048)
    extra_questions: Union[str, None] = Field(None, max_length=2048)


class RawVolunteerData(VolunteerApplicationData):
    first_name: str
    last_name: str
    application_type: str


class ProcessedVolunteerData(BaseApplicationData):
    submission_time: datetime
    reviews: list[Review] = []


class RawApplicationData(BaseApplicationData):
    """Expected to be sent by the form on the site."""

    first_name: str
    last_name: str
    resume: Union[UploadFile, None] = None
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
