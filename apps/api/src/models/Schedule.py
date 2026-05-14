from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class Hour(BaseModel):
    time: datetime
    director_on_shift: str


class Shift(BaseModel):
    shift_name: str
    num_organizers: int
    organizers: list[str] = []
    hour: Hour
    committee_prereq: str
    subcommittee_prereq: str
    preassigned_orgs: list[str] = []


class ScheduleTemplateInfo(BaseModel):
    event_dates: list[datetime] = []
    shifts: list[Shift] = []


class ScheduleTemplate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    template_name: str
    temp_info: ScheduleTemplateInfo


class PublishedDraft(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    draft_name: str
    publish_time: datetime


class DraftInfo(BaseModel):
    minimum_pts: int = Field(ge=0)
    template_name: str
    draft: ScheduleTemplateInfo


class Draft(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    draft_name: str
    drafts: list[DraftInfo]
