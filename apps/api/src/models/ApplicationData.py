from datetime import datetime
from enum import Enum
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
    SerializerFunctionWrapHandler,
    Tag,
    field_validator,
    field_serializer,
    model_serializer,
)


class Decision(str, Enum):
    ACCEPTED = "ACCEPTED"
    WAITLISTED = "WAITLISTED"
    REJECTED = "REJECTED"
    VOIDED = "VOIDED"


Review = tuple[
    datetime, str, float, Optional[Annotated[str, Field(max_length=2048)]]
]  # (timestamp, reviewer_uid, score, notes)


class DirectorPreviousExperienceReview(BaseModel):
    reviewer: str
    reviewed_at: datetime
    previous_experience: Optional[float] = None
    has_socials: Optional[float] = None


def make_empty_none(val: Any) -> Any:
    """Browser will send empty strings for unspecified form inputs."""
    if val == "":
        return None
    return val


def make_list(val: Any) -> Any:
    """Older records may store single-select fields as scalars."""
    if val is None:
        return []
    if isinstance(val, list):
        return val
    return [val]


def count_words(value: str) -> int:
    return len(value.split())


def validate_100_words(value: str) -> str:
    if count_words(value) > 100:
        raise ValueError("Response must be 100 words or fewer.")
    return value


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
NullableStr = Annotated[Union[None, str], BeforeValidator(make_empty_none)]
NullableInt = Annotated[Union[None, int], BeforeValidator(make_empty_none)]
StringList = Annotated[list[str], BeforeValidator(make_list)]


# hacker application model
class BaseApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    pronouns: StringList = []

    ethnicity: str
    is_first_hackathon: bool

    school: str
    major: str
    education_level: str
    t_shirt_size: Literal["S", "M", "L", "XL"]
    dietary_restrictions: StringList = []
    allergies: Union[str, None] = Field(None, max_length=2048)
    # Field for question: "How did you hear about IrvineHacks?"
    ih_reference: list[str] = []

    portfolio: NullableHttpUrl = None
    linkedin: NullableHttpUrl = None

    areas_interested: list[str] = []
    frq_change: str = Field(max_length=2048)
    frq_ambition: str = Field(max_length=2048)
    frq_character: str = Field(max_length=2048)

    character_head_index: int
    character_body_index: int
    character_feet_index: int
    character_companion_index: int

    is_18_older: bool


Hour = Annotated[int, Field(ge=7, lt=24)]


class BaseMentorApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=254)

    mentor_type: list[str]

    pronouns: StringList = []
    # ethnicity: str
    school: str
    major: str
    education_level: str
    t_shirt_size: Literal["S", "M", "L", "XL"]
    dietary_restrictions: StringList
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

    character_head_index: int
    character_body_index: int
    character_feet_index: int
    character_companion_index: int

    friday_availability: list[Hour] = []
    saturday_availability: list[Hour] = []
    sunday_availability: list[Hour] = []

    resume_share_to_sponsors: bool = False
    # other_questions: Union[str, None] = Field(None, max_length=2048)
    is_18_older: bool


class BaseVolunteerApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=1024)

    pronouns: StringList = []
    # ethnicity: str
    is_18_older: bool
    t_shirt_size: Literal["S", "M", "L", "XL"]
    school: str
    education_level: str
    major: str
    # Field for question: "How did you hear about IrvineHacks?"
    ih_reference: list[str] = []
    frq_volunteer: str = Field(max_length=2048)
    frq_memory: str = Field(max_length=2048)
    dietary_restrictions: StringList = []
    allergies: Union[str, None] = Field(None, max_length=2048)
    frq_volunteer_allergy: Optional[str] = ""

    character_head_index: int
    character_body_index: int
    character_feet_index: int
    character_companion_index: int

    friday_availability: list[Hour] = []
    saturday_availability: list[Hour] = []
    sunday_availability: list[Hour] = []


class BaseZotHacksHackerApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=1024)

    pronouns: StringList = []
    is_18_older: bool
    discord_username: str
    school_year: str
    dietary_restrictions: StringList = []
    allergies: Union[str, None] = Field(None, max_length=2048)

    major: str
    hackathon_experience: Literal["first_time", "some_experience", "veteran"]

    collaboration_saq: str = Field(max_length=1024)
    tech_inspiration_saq: str = Field(max_length=1024)
    uci_gift_saq: str = Field(max_length=1024)
    drawing_response: str = Field(min_length=1, max_length=2_000_000)
    peter_thought_process_saq: str = Field(min_length=1, max_length=1024)
    comments: Union[str, None] = Field(None, max_length=2048)

    _validate_collaboration_words = field_validator("collaboration_saq")(
        validate_100_words
    )
    _validate_tech_inspiration_words = field_validator("tech_inspiration_saq")(
        validate_100_words
    )
    _validate_uci_gift_words = field_validator("uci_gift_saq")(validate_100_words)
    _validate_peter_thought_process_words = field_validator(
        "peter_thought_process_saq"
    )(validate_100_words)


class BaseZotHacksMentorApplicationData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=1024)

    is_18_older: bool
    pronouns: StringList = []
    dietary_restrictions: StringList = []
    allergies: Union[str, None] = Field(None, max_length=2048)

    phone_number: str
    discord_username: str
    major: str
    academic_status: str

    linkedin: NullableHttpUrl = None
    github: NullableHttpUrl = None
    portfolio: NullableHttpUrl = None

    tech_stack_frq: str = Field(max_length=2048)
    frontend_backend_frq: str = Field(max_length=2048)
    teaching_experience_frq: str = Field(max_length=2048)
    team_leadership_frq: str = Field(max_length=2048)
    comments: Union[str, None] = Field(None, max_length=2048)

    skill_python: NullableInt = None
    skill_java: NullableInt = None
    skill_c__: NullableInt = None
    skill_javascript: NullableInt = None
    other_languages_name: NullableStr = None

    skill_html_css: NullableInt = None
    skill_react_js: NullableInt = None
    skill_next_js_vite: NullableInt = None
    skill_fastapi_node_js: NullableInt = None
    other_frameworks_name: NullableStr = None

    skill_git: NullableInt = None
    skill_sql__any_variation_: NullableInt = None
    skill_aws_services: NullableInt = None
    skill_vercel_github_pages: NullableInt = None
    other_tools_platforms_name: NullableStr = None


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
    resume: Union[UploadFile, None] = None
    application_type: Literal["Mentor"]

    skill_python: int
    skill_java: int
    skill_c__: int
    skill_javascript: int
    skill_html_css: int
    skill_react_js: int
    skill_next_js_vite: intclass ProcessedZotHacksMentorApplication(BaseZotHacksMentorApplicationData):
    email: EmailStr
    resume_url: NullableHttpUrl = None
    submission_time: datetime
    reviews: list[Review] = []

    @field_serializer("linkedin", "github", "portfolio", "resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val
    skill_fastapi_node_js: int
    skill_git: int
    skill_sql__any_variation_: int
    skill_aws_services: int
    skill_vercel_github_pages: int


class ProcessedHackerApplicationData(BaseApplicationData):
    email: EmailStr
    resume_url: Union[HttpUrl, None] = None
    submission_time: datetime
    reviews: list[Review] = []
    review_breakdown: dict[str, dict[str, float]] = {}
    # TODO: Create aliases for review_breakdown
    # dict[reviewer_uid, dict[field_name, score]]
    global_field_scores: dict[str, float] = {}
    # TODO: Create aliases for these global_field_scores
    # dict[field that can have detailed reviews, score]
    director_previous_experience_review: Optional[DirectorPreviousExperienceReview] = (
        None
    )

    @model_serializer(mode="wrap")
    def omit_empty_director_review(
        self, handler: SerializerFunctionWrapHandler
    ) -> dict[str, Any]:
        data: dict[str, Any] = handler(self)
        if self.director_previous_experience_review is None:
            data.pop("director_previous_experience_review", None)
        return data

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
    review_breakdown: dict[str, dict[str, float]] = {}
    # TODO: Create aliases for review_breakdown
    # dict[reviewer_uid, dict[field_name, score]]
    global_field_scores: dict[str, float] = {}
    # TODO: Create aliases for these global_field_scores
    # dict[field that can have detailed reviews, score]

    @field_serializer("resume_url")
    def url2str(self, val: Union[HttpUrl, None]) -> Union[str, None]:
        if val is not None:
            return str(val)
        return val


class ProcessedZotHacksMentorApplication(BaseZotHacksMentorApplicationData):
    email: EmailStr
    resume_url: NullableHttpUrl = None
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
        if "tech_inspiration_saq" in v:
            return "zothacks_hacker"
        if "tech_stack_frq" in v:
            return "zothacks_mentor"

    if "frq_ambition" in dir(v):
        return "hacker"
    if "mentor_prev_experience_saq1" in dir(v):
        return "mentor"
    if "frq_volunteer" in dir(v):
        return "volunteer"
    if "tech_inspiration_saq" in dir(v):
        return "zothacks_hacker"
    if "tech_stack_frq" in dir(v):
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
        if "tech_inspiration_saq" in v:
            return "zothacks_hacker"

    # For object instances, check attributes
    if hasattr(v, "frq_ambition"):
        return "hacker"
    if hasattr(v, "tech_inspiration_saq"):
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
        if "tech_stack_frq" in v:
            return "zothacks_mentor"

    # For object instances, check attributes
    if hasattr(v, "mentor_prev_experience_saq1"):
        return "mentor"
    if hasattr(v, "tech_stack_frq"):
        return "zothacks_mentor"

    return ""


RawMentorApplicationDataUnion = Annotated[
    Union[
        Annotated[RawMentorApplicationData, Tag("mentor")],
        Annotated[RawZotHacksMentorApplicationData, Tag("zothacks_mentor")],
    ],
    Discriminator(get_raw_mentor_discriminator_value),
]
