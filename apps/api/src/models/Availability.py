from datetime import datetime
from typing import Annotated, Optional

from pydantic import BaseModel, Field

from services.mongodb_handler import BaseRecord

AvailabilityDate = Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}$")]
AvailabilityStartTime = Annotated[str, Field(pattern=r"^([01]\d|2[0-3]):(00|30)$")]


class AvailabilitySlot(BaseModel):
    date: AvailabilityDate
    start_time: AvailabilityStartTime


class OrganizerAvailability(BaseRecord):
    availability: list[AvailabilitySlot] = []
    submitted_at: datetime
    updated_at: datetime


class OrganizerAvailabilityResponse(BaseModel):
    availability: list[AvailabilitySlot] = []
    submitted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AvailabilityPayload(BaseModel):
    availability: list[AvailabilitySlot]


class AvailabilityLockResponse(BaseModel):
    locked: bool = False
