from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class Hour(BaseModel):
    time: datetime
    director_on_shift: list[str] = []


class Shift(BaseModel):
    shift_name: str
    min_num_organizers: int
    organizers: list[str] = []
    hour: Hour
    committee_prereq: str
    subcommittee_prereq: str
    preassigned_orgs: list[str] = []


class ScheduleTemplateInfo(BaseModel):
    event_dates: list[datetime] = []
    shifts: list[Shift] = []
    org_availabilities: dict[str, list[datetime]] = {}


class DraftInfo(BaseModel):
    minimum_pts: int = Field(ge=0)
    draft: ScheduleTemplateInfo


class Draft(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    draft_name: str
    draft_info: DraftInfo


class ScheduleTemplate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    template_name: str
    template_info: ScheduleTemplateInfo
    drafts: list[Draft]


class PublishedDraft(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    draft_name: str
    template_name: str
    publish_time: datetime
