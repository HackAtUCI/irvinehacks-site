from datetime import datetime
from enum import Enum
from typing import Annotated, Any, Literal, Union

from fastapi import UploadFile
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Discriminator,
    EmailStr,
    Field,
    HttpUrl,
    Tag,
    field_serializer,
)


class Decision(str, Enum):
    ACCEPTED = "ACCEPTED"
    WAITLISTED = "WAITLISTED"
    REJECTED = "REJECTED"


Review = tuple[datetime, str, float]


def make_empty_none(val: Union[str, None]) -> Union[str, None]:
    """Browser will send empty strings for unspecified form inputs."""
    if val == "":
        return None
    return val


FIELDS_SUPPORTING_OTHER = [
    "pronouns",
    "ethnicity",
    "school",
    "major",
    "experienced_technologies",
]


NullableHttpUrl = Annotated[Union[None, HttpUrl], BeforeValidator(make_empty_none)]


# hacker application model
class BaseApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    pronouns: list[str] = []

    ethnicity: str
    is_18_older: bool
    school: str
    education_level: str
    major: str
    is_first_hackathon: bool
    linkedin: NullableHttpUrl = None
    portfolio: NullableHttpUrl = None
    frq_change: str = Field(max_length=2048)
    frq_video_game: str = Field(max_length=2048)


class BaseMentorApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    experienced_technologies: list[str] = []
    pronouns: list[str] = []

    ethnicity: str
    school: str
    major: str
    education_level: str
    is_18_older: bool
    git_experience: str
    github: NullableHttpUrl = None
    portfolio: NullableHttpUrl = None
    linkedin: NullableHttpUrl = None
    mentor_prev_experience_saq1: Union[str, None] = Field(None, max_length=2048)
    mentor_interest_saq2: str = Field(max_length=2048)
    mentor_team_help_saq3: str = Field(max_length=2048)
    mentor_team_help_saq4: str = Field(max_length=2048)
    resume_share_to_sponsors: bool = False
    other_questions: Union[str, None] = Field(None, max_length=2048)


Hour = Annotated[int, Field(ge=7, lt=24)]


class BaseVolunteerApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=1024)

    pronouns: list[str] = []
    ethnicity: str
    is_18_older: bool
    school: str
    education_level: str
    major: str
    frq_volunteer: str = Field(max_length=2048)
    frq_utensil: str = Field(max_length=2048)
    allergies: Union[str, None] = Field(None, max_length=2048)
    extra_questions: Union[str, None] = Field(None, max_length=2048)

    friday_availability: list[Hour] = []
    saturday_availability: list[Hour] = []
    sunday_availability: list[Hour] = []


class RawHackerApplicationData(BaseApplicationData):
    """Expected to be sent by the form on the site."""

    first_name: str
    last_name: str
    resume: Union[UploadFile, None] = None
    application_type: Literal["Hacker"]


class RawMentorApplicationData(BaseMentorApplicationData):
    """Expected to be sent by the form on the site."""

    first_name: str
    last_name: str
    resume: UploadFile
    application_type: Literal["Mentor"]


class RawVolunteerApplicationData(BaseVolunteerApplicationData):
    """Expected to be sent by the volunteer form on the site."""

    first_name: str
    last_name: str
    resume: None = None  # to simplify usage of union
    application_type: Literal["Volunteer"]


class ProcessedHackerApplicationData(BaseApplicationData):
    email: EmailStr
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []

    @field_serializer("linkedin", "portfolio", "resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val


class ProcessedMentorApplicationData(BaseMentorApplicationData):
    email: EmailStr
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []

    @field_serializer("linkedin", "github", "portfolio", "resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val


class ProcessedVolunteerApplication(BaseVolunteerApplicationData):
    # TODO: specify common attributes in mixin
    email: EmailStr
    submission_time: datetime
    reviews: list[Review] = []


# To add more discriminating values, add a string
# that doesn't appear in any other form
def get_discriminator_value(v: Any) -> str:
    if isinstance(v, dict):
        if "frq_video_game" in v:
            return "hacker"
        if "mentor_prev_experience_saq1" in v:
            return "mentor"
        if "frq_volunteer" in v:
            return "volunteer"

    if "frq_video_game" in dir(v):
        return "hacker"
    if "mentor_prev_experience_saq1" in dir(v):
        return "mentor"
    if "frq_volunteer" in dir(v):
        return "volunteer"
    return ""


ProcessedApplicationDataUnion = Annotated[
    Union[
        Annotated[ProcessedHackerApplicationData, Tag("hacker")],
        Annotated[ProcessedMentorApplicationData, Tag("mentor")],
        Annotated[ProcessedVolunteerApplication, Tag("volunteer")],
    ],
    Discriminator(get_discriminator_value),
]
