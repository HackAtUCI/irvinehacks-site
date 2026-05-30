from datetime import datetime, timezone
from logging import getLogger
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import TypeAdapter, ValidationError

from auth.authorization import require_role
from auth.user_identity import User
from models.Availability import (
    AvailabilityLockResponse,
    AvailabilityPayload,
    AvailabilityTemplateResponse,
    OrganizerAvailability,
    OrganizerAvailabilityResponse,
)
from models.Schedule import ScheduleTemplate
from models.user_record import Role
from services import mongodb_handler
from services.mongodb_handler import Collection

log = getLogger(__name__)

router = APIRouter()

require_organizer = require_role({Role.ORGANIZER})
require_director = require_role({Role.DIRECTOR})
require_availability_viewer = require_role({Role.ORGANIZER, Role.DIRECTOR})

AVAILABILITY_SETTINGS_ID = "availability"


async def _get_settings(fields: list[str]) -> dict[str, Any]:
    record = await mongodb_handler.retrieve_one(
        Collection.SETTINGS, {"_id": AVAILABILITY_SETTINGS_ID}, fields
    )
    return record or {}


async def _get_locked() -> bool:
    settings = await _get_settings(["locked"])
    return bool(settings.get("locked", False))


async def _get_requested_template_name() -> Optional[str]:
    settings = await _get_settings(["template_name"])
    template_name = settings.get("template_name")
    return template_name if isinstance(template_name, str) else None


async def _get_template_by_name(
    template_name: str,
) -> Optional[ScheduleTemplate]:
    records = await mongodb_handler.retrieve_one(
        Collection.SETTINGS,
        {"_id": "templates"},
        ["templates"],
    )

    if not records:
        return None

    try:
        templates = TypeAdapter(list[ScheduleTemplate]).validate_python(
            records["templates"]
        )
    except ValidationError:
        raise RuntimeError("Could not parse template.")

    for template in templates:
        if template.template_name == template_name:
            return template
    return None


async def _get_requested_template() -> AvailabilityTemplateResponse:
    template_name = await _get_requested_template_name()
    if not template_name:
        return AvailabilityTemplateResponse()

    template = await _get_template_by_name(template_name)
    if not template:
        return AvailabilityTemplateResponse(template_name=template_name)

    return AvailabilityTemplateResponse(
        template_name=template.template_name,
        event_dates=template.template_info.event_dates,
        shifts=template.template_info.shifts,
    )


@router.get("")
async def get_availability(
    user: Annotated[User, Depends(require_organizer)],
) -> OrganizerAvailabilityResponse:
    """Get the current organizer's availability submission."""
    record = await mongodb_handler.retrieve_one(
        Collection.AVAILABILITY,
        {"_id": user.uid},
        ["availability", "submitted_at", "updated_at"],
    )

    if not record:
        return OrganizerAvailabilityResponse()

    try:
        availability = OrganizerAvailability.model_validate(record)
    except ValidationError:
        log.error("Could not parse availability for %s", user.uid)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    return OrganizerAvailabilityResponse(
        availability=availability.availability,
        template_name=availability.template_name,
        submitted_at=availability.submitted_at,
        updated_at=availability.updated_at,
    )


@router.put("")
async def put_availability(
    user: Annotated[User, Depends(require_organizer)],
    payload: AvailabilityPayload,
) -> OrganizerAvailabilityResponse:
    """Create or replace the current organizer's availability submission."""
    if await _get_locked():
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "Availability submissions are locked."
        )

    template_name = await _get_requested_template_name()
    if not template_name:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "Availability has not been requested."
        )

    now = datetime.now(timezone.utc)
    existing_record = await mongodb_handler.retrieve_one(
        Collection.AVAILABILITY,
        {"_id": user.uid},
        ["submitted_at"],
    )

    if existing_record:
        submitted_at = existing_record.get("submitted_at", now)
    else:
        submitted_at = now
    availability = OrganizerAvailability(
        uid=user.uid,
        availability=payload.availability,
        template_name=template_name,
        submitted_at=submitted_at,
        updated_at=now,
    )

    try:
        await mongodb_handler.update_one(
            Collection.AVAILABILITY,
            {"_id": user.uid},
            availability.model_dump(),
            upsert=True,
        )
    except RuntimeError:
        log.error("Could not save availability for %s", user.uid)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    return OrganizerAvailabilityResponse(
        availability=availability.availability,
        template_name=availability.template_name,
        submitted_at=availability.submitted_at,
        updated_at=availability.updated_at,
    )


@router.post("")
async def post_availability(
    user: Annotated[User, Depends(require_organizer)],
    payload: AvailabilityPayload,
) -> OrganizerAvailabilityResponse:
    """Create or replace the current organizer's availability submission."""
    return await put_availability(user, payload)


@router.get("/template", dependencies=[Depends(require_availability_viewer)])
async def get_availability_template() -> AvailabilityTemplateResponse:
    """Get the template currently requested for organizer availability."""
    return await _get_requested_template()


@router.post("/template")
async def set_availability_template(
    user: Annotated[User, Depends(require_director)],
    template_name: str = Body(embed=True),
) -> AvailabilityTemplateResponse:
    """Request organizer availability for a schedule template."""
    template = await _get_template_by_name(template_name)
    if not template:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Template not found.")

    now = datetime.now(timezone.utc)
    try:
        await mongodb_handler.raw_update_one(
            Collection.SETTINGS,
            {"_id": AVAILABILITY_SETTINGS_ID},
            {
                "$set": {
                    "template_name": template.template_name,
                    "requested_at": now,
                    "requested_by": user.uid,
                    "locked": False,
                }
            },
            upsert=True,
        )
        await mongodb_handler.delete(Collection.AVAILABILITY, {})
    except RuntimeError:
        log.error(
            "Could not request availability for template %s",
            template_name,
        )
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    return AvailabilityTemplateResponse(
        template_name=template.template_name,
        event_dates=template.template_info.event_dates,
        shifts=template.template_info.shifts,
    )


@router.delete("/template", dependencies=[Depends(require_director)])
async def reset_availability_template() -> None:
    """Clear the template currently requested for organizer availability."""
    try:
        await mongodb_handler.raw_update_one(
            Collection.SETTINGS,
            {"_id": AVAILABILITY_SETTINGS_ID},
            {
                "$unset": {
                    "template_name": "",
                    "requested_at": "",
                    "requested_by": "",
                },
                "$set": {"locked": False},
            },
            upsert=True,
        )
        await mongodb_handler.delete(Collection.AVAILABILITY, {})
    except RuntimeError:
        log.error("Could not reset availability template")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/lock", dependencies=[Depends(require_availability_viewer)])
async def get_availability_lock() -> AvailabilityLockResponse:
    """Get the current availability lock state."""
    return AvailabilityLockResponse(locked=await _get_locked())


@router.post("/lock", dependencies=[Depends(require_director)])
async def set_availability_lock(
    locked: Optional[bool] = Body(default=None, embed=True),
) -> AvailabilityLockResponse:
    """Set or toggle the availability lock state."""
    next_locked = not await _get_locked() if locked is None else locked

    try:
        await mongodb_handler.raw_update_one(
            Collection.SETTINGS,
            {"_id": AVAILABILITY_SETTINGS_ID},
            {"$set": {"locked": next_locked}},
            upsert=True,
        )
    except RuntimeError:
        log.error("Could not update availability lock")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    return AvailabilityLockResponse(locked=next_locked)


@router.get("/submissions", dependencies=[Depends(require_director)])
async def get_availability_submissions() -> list[str]:
    """Get organizer IDs with submitted availability."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.AVAILABILITY,
        {"submitted_at": {"$exists": True}},
        ["_id"],
    )

    try:
        return TypeAdapter(list[str]).validate_python(
            [record["_id"] for record in records]
        )
    except (KeyError, ValidationError):
        raise RuntimeError("Could not parse availability submissions.")


@router.delete("", dependencies=[Depends(require_director)])
async def clear_availability() -> None:
    """Clear all organizer availability submissions."""
    try:
        await mongodb_handler.delete(Collection.AVAILABILITY, {})
    except RuntimeError:
        log.error("Could not clear availability submissions")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)
