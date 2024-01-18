import asyncio
from datetime import datetime
from logging import getLogger
from typing import Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, TypeAdapter, ValidationError

from auth.authorization import require_role
from auth.user_identity import User, utc_now
from models.ApplicationData import Decision, Review
from services import mongodb_handler
from services.mongodb_handler import BaseRecord, Collection
from utils import email_handler
from utils.batched import batched
from utils.user_record import Applicant, Role, Status

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


@router.post("/release", dependencies=[Depends(require_role([Role.DIRECTOR]))])
async def release_decisions() -> None:
    """Update applicant status based on decision and send decision emails."""
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"status": Status.REVIEWED},
        ["_id", "application_data.reviews", "application_data.first_name"],
    )

    for record in records:
        _include_review_decision(record)

    for decision in (Decision.ACCEPTED, Decision.WAITLISTED, Decision.REJECTED):
        group = [record for record in records if record["decision"] == decision]
        if not group:
            continue

        await asyncio.gather(
            *(_process_batch(batch, decision) for batch in batched(group, 100))
        )


async def _process_batch(batch: tuple[dict[str, Any], ...], decision: Decision) -> None:
    uids: list[str] = [record["_id"] for record in batch]
    log.info(f"Setting {','.join(uids)} as {decision}")
    ok = await mongodb_handler.update(
        Collection.USERS, {"_id": {"$in": uids}}, {"status": decision}
    )
    if not ok:
        raise RuntimeError("gg wp")

    # Send emails
    log.info(f"Sending {decision} emails for {len(batch)} applicants")
    await email_handler.send_decision_email(
        map(_extract_personalizations, batch), decision
    )


def _extract_personalizations(decision_data: dict[str, Any]) -> tuple[str, EmailStr]:
    name = decision_data["application_data"]["first_name"]
    email = _recover_email_from_uid(decision_data["_id"])
    return name, email


def _recover_email_from_uid(uid: str) -> str:
    """For NativeUsers, the email should still delivery properly."""
    uid = uid.replace("..", "\n")
    *reversed_domain, local = uid.split(".")
    local = local.replace("\n", ".")
    domain = ".".join(reversed(reversed_domain))
    return f"{local}@{domain}"


def _include_review_decision(applicant_record: dict[str, Any]) -> None:
    """Sets the applicant's decision as the last submitted review decision or None."""
    reviews = applicant_record["application_data"]["reviews"]
    applicant_record["decision"] = reviews[-1][2] if reviews else None
