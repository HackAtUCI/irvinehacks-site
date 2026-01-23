from datetime import datetime
from enum import Enum
import json
from typing import Annotated, Any, Literal, Union, Optional

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
    field_validator,
)


class Decision(str, Enum):
    ACCEPTED = "ACCEPTED"
    WAITLISTED = "WAITLISTED"
    REJECTED = "REJECTED"


Review = tuple[
    datetime, str, float, Optional[str]
]  # (timestamp, reviewer_uid, score, notes)


def make_empty_none(val: Union[str, None]) -> Union[str, None]:
    """Browser will send empty strings for unspecified form inputs."""
    if val == "":
        return None
    return val


# Ensure this array matches FIELDS_With_OTHER in frontend BaseForm.tsx
FIELDS_SUPPORTING_OTHER = [
    "pronouns",
    "ethnicity",
    "school",
    "major",
    "tech_experienced_technologies",
    "hardware_experienced_technologies",
    "design_experienced_tools",
    "dietary_restrictions",
    "ih_reference",
]


NullableHttpUrl = Annotated[Union[None, HttpUrl], BeforeValidator(make_empty_none)]


# hacker application model
class BaseApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    pronouns: list[str] = []

    ethnicity: str
    is_first_hackathon: bool

    school: str
    major: str
    education_level: str
    t_shirt_size: Literal["S", "M", "L", "XL"]
    dietary_restrictions: list[str] = []
    allergies: Union[str, None] = Field(None, max_length=2048)
    # Field for question: "How did you hear about IrvineHacks?"
    ih_reference: list[str] = []

    portfolio: NullableHttpUrl = None
    linkedin: NullableHttpUrl = None

    areas_interested: list[str] = []
    frq_change: str = Field(max_length=2048)
    frq_ambition: str = Field(max_length=2048)
    frq_character: str = Field(max_length=2048)

    is_18_older: bool


class BaseMentorApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    mentor_type: list[str]

    pronouns: list[str] = []
    # ethnicity: str
    school: str
    major: str
    education_level: str
    t_shirt_size: Literal["S", "M", "L", "XL"]
    dietary_restrictions: list[str]
    allergies: Union[str, None] = Field(None, max_length=2048)
    # Field for question: "How did you hear about IrvineHacks?"
    ih_reference: list[str] = []

    tech_experienced_technologies: list[str] = []
    hardware_experienced_technologies: list[str] = []
    design_experienced_tools: list[str] = []

    git_experience: str
    arduino_experience: str
    figma_experience: str

    github: NullableHttpUrl = None
    portfolio: NullableHttpUrl = None
    linkedin: NullableHttpUrl = None
    mentor_prev_experience_saq1: Union[str, None] = Field(None, max_length=2048)
    mentor_interest_saq2: str = Field(max_length=2048)
    mentor_tech_saq3: str = Field(max_length=2048)
    mentor_design_saq4: str = Field(max_length=2048)
    mentor_interest_saq5: str = Field(max_length=2048)
    resume_share_to_sponsors: bool = False
    # other_questions: Union[str, None] = Field(None, max_length=2048)
    is_18_older: bool


Hour = Annotated[int, Field(ge=7, lt=24)]


class BaseVolunteerApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=1024)

    pronouns: list[str] = []
    # ethnicity: str
    is_18_older: bool
    t_shirt_size: Literal["S", "M", "L", "XL"]
    school: str
    education_level: str
    major: str
    # Field for question: "How did you hear about IrvineHacks?"
    ih_reference: list[str] = []
    frq_volunteer: str = Field(max_length=150)
    frq_memory: str = Field(max_length=100)
    dietary_restrictions: list[str] = []
    allergies: Union[str, None] = Field(None, max_length=2048)
    frq_volunteer_allergy: Optional[str] = ""

    friday_availability: list[Hour] = []
    saturday_availability: list[Hour] = []
    sunday_availability: list[Hour] = []


class BaseZotHacksHackerApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=1024)

    pronouns: list[str] = []
    is_18_older: bool
    school_year: str
    dietary_restrictions: list[str] = []
    allergies: Union[str, None] = Field(None, max_length=2048)
    major: str
    hackathon_experience: Literal["first_time", "some_experience", "veteran"]

    elevator_pitch_saq: str = Field(max_length=1024)
    tech_experience_saq: str = Field(max_length=2048)
    learn_about_self_saq: str = Field(max_length=2048)
    pixel_art_saq: str = Field(max_length=2048)
    pixel_art_data: list[int] = Field(..., min_length=64, max_length=64)

    comments: Union[str, None] = Field(None, max_length=2048)

    @field_validator("pixel_art_data", mode="before")
    def parse_pixel_art(cls, v: str) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v


# Not tested for ZH 2025
class BaseZotHacksMentorApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=1024)

    is_18_older: bool
    pronouns: str
    degree: str
    major: str
    graduation_year: int
    mentoring_experience: str = Field(max_length=2048)
    help_participants_frq: str = Field(max_length=2048)
    new_team_help_frq: str = Field(max_length=2048)
    tech_stack_frq: str = Field(max_length=2048)
    frontend_backend_frq: str = Field(max_length=2048)
    skills: list[str] = []

    github: NullableHttpUrl = None
    portfolio: NullableHttpUrl = None
    linkedin: NullableHttpUrl = None
    comments: Union[str, None] = Field(None, max_length=2048)


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


class RawZotHacksHackerApplicationData(BaseZotHacksHackerApplicationData):
    first_name: str
    last_name: str
    resume: Union[UploadFile, None] = None
    application_type: Literal["Hacker"]


class RawZotHacksMentorApplicationData(BaseZotHacksMentorApplicationData):
    first_name: str
    last_name: str
    resume: UploadFile
    application_type: Literal["Mentor"]


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


class ProcessedZotHacksHackerApplicationData(BaseZotHacksHackerApplicationData):
    email: EmailStr
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []
    review_breakdown: dict[str, dict[str, int]] = {}
    # TODO: Create aliases for review_breakdown
    # dict[reviewer_uid, dict[field_name, score]]
    global_field_scores: dict[str, int] = {}
    # TODO: Create aliases for these global_field_scores
    # dict[field that can have detailed reviews, score]

    @field_serializer("resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val


class ProcessedZotHacksMentorApplication(BaseZotHacksMentorApplicationData):
    email: EmailStr
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []

    @field_serializer("linkedin", "github", "portfolio", "resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val


# To add more discriminating values, add a string
# that doesn't appear in any other form
def get_discriminator_value(v: Any) -> str:
    if isinstance(v, dict):
        if "frq_ambition" in v:
            return "hacker"
        if "mentor_prev_experience_saq1" in v:
            return "mentor"
        if "frq_volunteer" in v:
            return "volunteer"
        if "elevator_pitch_saq" in v:
            return "zothacks_hacker"
        if "help_participants_frq" in v:
            return "zothacks_mentor"

    if "frq_ambition" in dir(v):
        return "hacker"
    if "mentor_prev_experience_saq1" in dir(v):
        return "mentor"
    if "frq_volunteer" in dir(v):
        return "volunteer"
    if "elevator_pitch_saq" in dir(v):
        return "zothacks_hacker"
    if "help_participants_frq" in dir(v):
        return "zothacks_mentor"
    return ""


ProcessedApplicationDataUnion = Annotated[
    Union[
        Annotated[ProcessedHackerApplicationData, Tag("hacker")],
        Annotated[ProcessedMentorApplicationData, Tag("mentor")],
        Annotated[ProcessedVolunteerApplication, Tag("volunteer")],
        Annotated[ProcessedZotHacksHackerApplicationData, Tag("zothacks_hacker")],
        Annotated[ProcessedZotHacksMentorApplication, Tag("zothacks_mentor")],
    ],
    Discriminator(get_discriminator_value),
]


def get_raw_hacker_discriminator_value(v: Any) -> str:
    """Discriminator function for raw hacker application data."""
    if isinstance(v, dict):
        if "frq_ambition" in v:
            return "hacker"
        if "elevator_pitch_saq" in v:
            return "zothacks_hacker"

    # For object instances, check attributes
    if hasattr(v, "frq_ambition"):
        return "hacker"
    if hasattr(v, "elevator_pitch_saq"):
        return "zothacks_hacker"
    return ""


RawHackerApplicationDataUnion = Annotated[
    Union[
        Annotated[RawHackerApplicationData, Tag("hacker")],
        Annotated[RawZotHacksHackerApplicationData, Tag("zothacks_hacker")],
    ],
    Discriminator(get_raw_hacker_discriminator_value),
]


def get_raw_mentor_discriminator_value(v: Any) -> str:
    """Discriminator function for raw mentor application data."""
    if isinstance(v, dict):
        # Check for unique fields to distinguish between the two types
        if "mentor_prev_experience_saq1" in v:
            return "mentor"
        if "help_participants_frq" in v:
            return "zothacks_mentor"

    # For object instances, check attributes
    if hasattr(v, "mentor_prev_experience_saq1"):
        return "mentor"
    if hasattr(v, "help_participants_frq"):
        return "zothacks_mentor"

    return ""


RawMentorApplicationDataUnion = Annotated[
    Union[
        Annotated[RawMentorApplicationData, Tag("mentor")],
        Annotated[RawZotHacksMentorApplicationData, Tag("zothacks_mentor")],
    ],
    Discriminator(get_raw_mentor_discriminator_value),
]
