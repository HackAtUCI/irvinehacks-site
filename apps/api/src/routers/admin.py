import asyncio
from datetime import datetime
from logging import getLogger
from typing import Annotated, Any, Mapping, Optional, Sequence

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, TypeAdapter, ValidationError

from admin import participant_manager, summary_handler
from admin.participant_manager import Participant
from auth.authorization import require_role
from auth.user_identity import User, utc_now
from models.ApplicationData import Decision, HackerReview, OtherReview
from models.user_record import Applicant, ApplicantStatus, Role, Status
from services import mongodb_handler, sendgrid_handler
from services.mongodb_handler import BaseRecord, Collection
from services.sendgrid_handler import ApplicationUpdatePersonalization, Template
from utils import email_handler
from utils.batched import batched
from utils.email_handler import IH_SENDER

log = getLogger(__name__)

router = APIRouter()

require_manager = require_role({Role.DIRECTOR, Role.REVIEWER, Role.CHECKIN_LEAD})
require_checkin_lead = require_role({Role.DIRECTOR, Role.CHECKIN_LEAD})
require_director = require_role({Role.DIRECTOR})
require_organizer = require_role({Role.ORGANIZER})


class ApplicationDataSummary(BaseModel):
    school: str
    submission_time: datetime


class ApplicantSummary(BaseRecord):
    uid: str = Field(alias="_id")
    first_name: str
    last_name: str
    status: str
    decision: Optional[Decision] = None
    application_data: ApplicationDataSummary


class HackerApplicantSummary(BaseRecord):
    uid: str = Field(alias="_id")
    first_name: str
    last_name: str
    status: str
    num_reviewers: int
    avg_score: float
    application_data: ApplicationDataSummary


@router.get("/applicants")
async def applicants(
    user: Annotated[User, Depends(require_manager)]
) -> list[ApplicantSummary]:
    """Get records of all applicants."""
    log.info("%s requested applicants", user)

    records: list[dict[str, object]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {"roles": Role.APPLICANT},
        [
            "_id",
            "status",
            "first_name",
            "last_name",
            "application_data.school",
            "application_data.submission_time",
            "application_data.reviews",
        ],
    )

    # for record in records:
    #     _include_review_decision(record)

    try:
        return TypeAdapter(list[ApplicantSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.get("/hackerApplicants")
async def hacker_applicants(
    user: Annotated[User, Depends(require_manager)]
) -> list[HackerApplicantSummary]:
    """Get records of all applicants."""
    log.info("%s requested applicants", user)

    records: list[dict[str, object]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {"roles": Role.HACKER},
        [
            "_id",
            "status",
            "first_name",
            "last_name",
            "application_data.school",
            "application_data.submission_time",
            "application_data.hacker_reviews",
            "avg_score",
        ],
    )

    for record in records:
        _include_num_reviewers_remove_reviews(record)

    try:
        return TypeAdapter(list[HackerApplicantSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


# left off on this and getting applicants to show on frontend,
# showing 2 reviewers, showing avg score


@router.get("/applicant/{uid}", dependencies=[Depends(require_manager)])
async def applicant(
    uid: str,
) -> Applicant:
    """Get record of an applicant by uid."""
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid, "roles": Role.APPLICANT}
    )

    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    try:
        return Applicant.model_validate(record)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.get("/summary/applicants", dependencies=[Depends(require_manager)])
async def applicant_summary() -> dict[ApplicantStatus, int]:
    """Provide summary of statuses of applicants."""
    return await summary_handler.applicant_summary()


@router.post("/hackerReview")
async def submit_hacker_review(
    applicant: str = Body(),
    score: float = Body(),
    reviewer: User = Depends(require_role({Role.REVIEWER})),
) -> None:
    """Submit a review decision from the reviewer for the given applicant."""
    log.info("%s reviewed applicant %s", reviewer, applicant)

    reviewer_key = reviewer.uid.split(".")[-1]

    review: HackerReview = (utc_now(), score)

    try:
        await mongodb_handler.raw_update_one(
            Collection.USERS,
            {"_id": applicant},
            {
                "$push": {f"application_data.hacker_reviews.{reviewer_key}": review},
                "$set": {"status": "REVIEWED"},
            },
        )
    except RuntimeError:
        log.error("Could not submit review for %s", applicant)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    project_var = "avgScore"
    pipeline: list[Mapping[str, object]] = [
        {"$match": {"_id": applicant}},
        {
            "$project": {
                "lastScores": {
                    "$map": {
                        "input": {"$objectToArray": "$application_data.hacker_reviews"},
                        "as": "review",
                        "in": {
                            "$arrayElemAt": [
                                {"$arrayElemAt": ["$$review.v", -1]},
                                1,
                            ]
                        },
                    }
                }
            }
        },
        {"$project": {project_var: {"$avg": "$lastScores"}}},
    ]
    res = await mongodb_handler.aggregate(Collection.USERS, pipeline)
    if not res:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        avg_score = res[0][project_var]
        await mongodb_handler.raw_update_one(
            Collection.USERS,
            {"_id": applicant},
            {
                "$set": {"avg_score": avg_score},
            },
            upsert=True,
        )
    except RuntimeError:
        log.error("Could not submit review for %s", applicant)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/review")
async def submit_review(
    applicant: str = Body(),
    decision: Decision = Body(),
    reviewer: User = Depends(require_role({Role.REVIEWER})),
) -> None:
    """Submit a review decision from the reviewer for the given applicant."""
    log.info("%s reviewed applicant %s", reviewer, applicant)

    review: OtherReview = (utc_now(), reviewer.uid, decision)

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


@router.post("/release", dependencies=[Depends(require_director)])
async def release_decisions() -> None:
    """Update applicant status based on decision and send decision emails."""
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"status": Status.REVIEWED},
        ["_id", "application_data.reviews", "first_name"],
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


@router.post("/rsvp-reminder", dependencies=[Depends(require_director)])
async def rsvp_reminder() -> None:
    """Send email to applicants who have a status of ACCEPTED or WAIVER_SIGNED
    reminding them to RSVP."""
    # TODO: Consider using Pydantic model validation instead of type annotations
    not_yet_rsvpd: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "roles": Role.APPLICANT,
            "status": {"$in": [Decision.ACCEPTED, Status.WAIVER_SIGNED]},
        },
        ["_id", "first_name"],
    )

    personalizations = []
    for record in not_yet_rsvpd:
        personalizations.append(
            ApplicationUpdatePersonalization(
                email=_recover_email_from_uid(record["_id"]),
                first_name=record["first_name"],
            )
        )

    log.info(f"Sending RSVP reminder emails to {len(not_yet_rsvpd)} applicants")

    await sendgrid_handler.send_email(
        Template.RSVP_REMINDER,
        IH_SENDER,
        personalizations,
        True,
    )


@router.post("/confirm-attendance", dependencies=[Depends(require_director)])
async def confirm_attendance() -> None:
    """Update applicant status to void or attending based on their current status."""
    # TODO: consider using Pydantic model, maybe BareApplicant
    records = await mongodb_handler.retrieve(
        Collection.USERS, {"roles": Role.APPLICANT}, ["_id", "status"]
    )

    statuses = {
        Status.CONFIRMED: Status.ATTENDING,
        Decision.ACCEPTED: Status.VOID,
        Status.WAIVER_SIGNED: Status.VOID,
    }

    for status_from, status_to in statuses.items():
        curr_records = [record for record in records if record["status"] == status_from]

        for record in curr_records:
            record["status"] = status_to

        log.info(
            f"Changing status of {len(curr_records)} from {status_from} to {status_to}"
        )

        await asyncio.gather(
            *(
                _process_status(batch, status_to)
                for batch in batched(
                    [str(record["_id"]) for record in curr_records], 100
                )
            )
        )


@router.post("/waitlist-release/{uid}")
async def waitlist_release(
    uid: str,
    associate: Annotated[User, Depends(require_checkin_lead)],
) -> None:
    """Release an applicant from the waitlist and send email."""
    record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": uid, "roles": Role.APPLICANT, "status": Decision.WAITLISTED},
        ["status", "first_name"],
    )
    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    ok = await mongodb_handler.update_one(
        Collection.USERS, {"_id": uid}, {"status": Decision.ACCEPTED}
    )
    if not ok:
        raise RuntimeError("gg wp")

    log.info("%s accepted %s off the waitlist. Sending email.", associate, uid)
    await email_handler.send_waitlist_release_email(
        record["first_name"], _recover_email_from_uid(uid)
    )


@router.get("/participants", dependencies=[Depends(require_organizer)])
async def participants() -> list[Participant]:
    """Get list of participants."""
    # TODO: consider combining the two functions into one
    hackers = await participant_manager.get_hackers()
    non_hackers = await participant_manager.get_non_hackers()
    return hackers + non_hackers


@router.post("/checkin/{uid}")
async def check_in_participant(
    uid: str,
    badge_number: Annotated[str, Body()],
    associate: Annotated[User, Depends(require_organizer)],
) -> None:
    """Check in participant at IrvineHacks."""
    try:
        await participant_manager.check_in_participant(uid, badge_number, associate)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    except RuntimeError as err:
        log.exception("During participant check-in: %s", err)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post(
    "/update-attendance/{uid}",
)
async def update_attendance(
    uid: str,
    director: Annotated[
        User, Depends(require_role({Role.DIRECTOR, Role.CHECKIN_LEAD}))
    ],
) -> None:
    """Update status to Role.ATTENDING for non-hackers."""
    try:
        await participant_manager.confirm_attendance_non_hacker(uid, director)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    except RuntimeError as err:
        log.exception("While updating participant attendance: %s", err)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/events", dependencies=[Depends(require_organizer)])
async def events() -> list[dict[str, object]]:
    """Get list of events"""
    return await mongodb_handler.retrieve(Collection.EVENTS, {})


@router.post("/event-checkin/{event}")
async def subevent_checkin(
    event: str,
    uid: Annotated[str, Body()],
    organizer: Annotated[User, Depends(require_organizer)],
) -> None:
    await participant_manager.subevent_checkin(event, uid, organizer)


async def _process_status(uids: Sequence[str], status: Status) -> None:
    ok = await mongodb_handler.update(
        Collection.USERS, {"_id": {"$in": uids}}, {"status": status}
    )
    if not ok:
        raise RuntimeError("gg wp")


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
    name = decision_data["first_name"]
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


def _include_num_reviewers_remove_reviews(applicant_record: dict[str, Any]) -> None:
    reviews = applicant_record["application_data"]["hacker_reviews"]
    applicant_record["num_reviewers"] = len(reviews)
    del applicant_record["application_data"]["hacker_reviews"]
