from datetime import datetime
from logging import getLogger
from typing import Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, Field, TypeAdapter, ValidationError

from auth.authorization import require_role
from auth.user_identity import User, utc_now
from models.ApplicationData import Decision, Review
from services import mongodb_handler
from services.mongodb_handler import BaseRecord, Collection
from utils.user_record import Applicant, Role

log = getLogger(__name__)

router = APIRouter()

ADMIN_ROLES = (Role.DIRECTOR, Role.REVIEWER)


class ApplicationDataSummary(BaseModel):
    first_name: str
    last_name: str
    school: str
    submission_time: datetime


class ApplicantSummary(BaseRecord):
    uid: str = Field(alias="_id")
    status: str
    decision: Optional[Decision] = None
    application_data: ApplicationDataSummary


@router.get("/applicants")
async def applicants(
    user: User = Depends(require_role(ADMIN_ROLES)),
) -> list[ApplicantSummary]:
    """Get records of all applicants."""
    log.info("%s requested applicants", user)

    records: list[dict[str, object]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {"role": Role.APPLICANT},
        [
            "_id",
            "status",
            "application_data.first_name",
            "application_data.last_name",
            "application_data.school",
            "application_data.submission_time",
            "application_data.reviews",
        ],
    )

    for record in records:
        _include_review_decision(record)

    try:
        return TypeAdapter(list[ApplicantSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.get("/applicant/{uid}", dependencies=[Depends(require_role(ADMIN_ROLES))])
async def applicant(
    uid: str,
) -> Applicant:
    """Get record of an applicant by uid."""
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid, "role": Role.APPLICANT}
    )

    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    try:
        return Applicant.model_validate(record)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.post("/review")
async def submit_review(
    applicant: str = Body(),
    decision: Decision = Body(),
    reviewer: User = Depends(require_role([Role.REVIEWER])),
) -> None:
    """Submit a review decision from the reviewer for the given applicant."""
    log.info("%s reviewed applicant %s", reviewer, applicant)

    review: Review = (utc_now(), reviewer.uid, decision)

    try:
        await mongodb_handler.raw_update_one(
            Collection.USERS,
            {"_id": applicant},
            {
                "$push": {"application_data.reviews": review},
                "$set": {"status": "REVIEWED"},
            },
        )
    except RuntimeError:
        log.error("Could not submit review for %s", applicant)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


def _include_review_decision(applicant_record: dict[str, Any]) -> None:
    """Sets the applicant's decision as the last submitted review decision or None."""
    reviews = applicant_record["application_data"]["reviews"]
    applicant_record["decision"] = reviews[-1][2] if reviews else None
