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
    frq_change: Union[str, None] = Field(None, max_length=2048)
    frq_video_game: str = Field(max_length=2048)





class BaseMentorApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    experienced_technologies: str
    pronouns: str

    school: str
    major: str
    education_level: str
    is_18_older: str
    git_experience: str
    github: NullableHttpUrl = None
    portfolio: NullableHttpUrl = None
    linkedin: NullableHttpUrl = None
    mentor_prev_experience_saq1: Union[str, None] = Field(None, max_length=2048)
    mentor_interest_saq2: Union[str, None] = Field(None, max_length=2048)
    mentor_team_help_saq3: Union[str, None] = Field(None, max_length=2048)
    mentor_team_help_saq4: Union[str, None] = Field(None, max_length=2048)
    other_questions: Union[str, None] = Field(None, max_length=2048)


class RawHackerApplicationData(BaseApplicationData):
    """Expected to be sent by the form on the site."""

    first_name: str
    last_name: str
    resume: Union[UploadFile, None] = None
    application_type: str


class RawMentorApplicationData(BaseMentorApplicationData):
    """Expected to be sent by the form on the site."""

    first_name: str
    last_name: str
    resume: Union[UploadFile, None] = None
    application_type: str


class ProcessedHackerApplicationData(BaseApplicationData):
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []

    @field_serializer("linkedin", "portfolio", "resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val


class ProcessedMentorApplicationData(BaseMentorApplicationData):
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []

    @field_serializer("linkedin", "portfolio", "resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val
