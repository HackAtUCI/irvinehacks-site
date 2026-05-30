from datetime import datetime
from typing import Annotated, Optional

from pydantic import BaseModel, Field

from models.Schedule import Shift
from services.mongodb_handler import BaseRecord

AVAILABILITY_DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"
AVAILABILITY_START_TIME_PATTERN = r"^([01]\d|2[0-3]):(00|30)$"

AvailabilityDate = Annotated[str, Field(pattern=AVAILABILITY_DATE_PATTERN)]
AvailabilityStartTime = Annotated[
    str,
    Field(pattern=AVAILABILITY_START_TIME_PATTERN),
]


class AvailabilitySlot(BaseModel):
    date: AvailabilityDate
    start_time: AvailabilityStartTime


class OrganizerAvailability(BaseRecord):
    availability: list[AvailabilitySlot] = []
    template_name: Optional[str] = None
    submitted_at: datetime
    updated_at: datetime


class OrganizerAvailabilityResponse(BaseModel):
    availability: list[AvailabilitySlot] = []
    template_name: Optional[str] = None
    submitted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AvailabilityPayload(BaseModel):
    availability: list[AvailabilitySlot]


class AvailabilityLockResponse(BaseModel):
    locked: bool = False


class AvailabilityTemplateResponse(BaseModel):
    template_name: Optional[str] = None
    event_dates: list[datetime] = []
    shifts: list[Shift] = []
