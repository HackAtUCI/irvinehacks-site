import asyncio
from datetime import date, datetime
from logging import getLogger
from typing import Annotated, Any, Literal, Mapping, Optional, Sequence

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, TypeAdapter, ValidationError
from typing_extensions import assert_never

from admin import applicant_review_processor, participant_manager, summary_handler
from admin.participant_manager import Participant
from auth.authorization import require_role
from auth.user_identity import User, utc_now
from models.ApplicationData import Decision, Review
from models.user_record import Applicant, ApplicantStatus, Role, Status
from services import mongodb_handler, sendgrid_handler
from services.mongodb_handler import BaseRecord, Collection
from services.sendgrid_handler import ApplicationUpdatePersonalization, Template
from utils import email_handler
from utils.batched import batched
from utils.email_handler import IH_SENDER

log = getLogger(__name__)

router = APIRouter()

require_manager = require_role(
    {
        Role.DIRECTOR,
        Role.HACKER_REVIEWER,
        Role.MENTOR_REVIEWER,
        Role.VOLUNTEER_REVIEWER,
        Role.CHECKIN_LEAD,
    }
)
require_reviewer = require_role(
    {Role.DIRECTOR, Role.HACKER_REVIEWER, Role.MENTOR_REVIEWER, Role.VOLUNTEER_REVIEWER}
)
require_hacker_reviewer = require_role({Role.DIRECTOR, Role.HACKER_REVIEWER})
require_mentor_reviewer = require_role({Role.DIRECTOR, Role.MENTOR_REVIEWER})
require_volunteer_reviewer = require_role({Role.DIRECTOR, Role.VOLUNTEER_REVIEWER})
require_checkin_lead = require_role({Role.DIRECTOR, Role.CHECKIN_LEAD})
require_director = require_role({Role.DIRECTOR})
require_organizer = require_role({Role.ORGANIZER})


class ApplicationDataSummary(BaseModel):
    school: str
    submission_time: datetime


class ApplicantSummary(BaseRecord):
    first_name: str
    last_name: str
    status: str
    decision: Optional[Decision] = None
    application_data: ApplicationDataSummary


class HackerApplicantSummary(BaseRecord):
    first_name: str
    last_name: str
    status: str
    decision: Optional[Decision] = None
    reviewers: list[str] = []
    avg_score: float
    application_data: ApplicationDataSummary


class ReviewRequest(BaseModel):
    applicant: str
    score: float


async def mentor_volunteer_applicants(
    application_type: Literal["Mentor", "Volunteer"]
) -> list[ApplicantSummary]:
    """Get records of all mentor and volunteer applicants."""
    records: list[dict[str, object]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {"roles": [Role.APPLICANT, Role(application_type)]},
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

    for record in records:
        applicant_review_processor.include_review_decision(record)

    try:
        return TypeAdapter(list[ApplicantSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.get("/applicants/mentors")
async def mentor_applicants(
    user: Annotated[User, Depends(require_mentor_reviewer)]
) -> list[ApplicantSummary]:
    """Get records of all mentor applicants."""
    log.info("%s requested mentor applicants", user)

    return await mentor_volunteer_applicants("Mentor")


@router.get("/applicants/volunteers")
async def volunteer_applicants(
    user: Annotated[User, Depends(require_volunteer_reviewer)]
) -> list[ApplicantSummary]:
    """Get records of all volunteer applicants."""
    log.info("%s requested volunteer applicants", user)

    return await mentor_volunteer_applicants("Volunteer")


@router.get("/applicants/hackers")
async def hacker_applicants(
    user: Annotated[User, Depends(require_hacker_reviewer)]
) -> list[HackerApplicantSummary]:
    """Get records of all hacker applicants."""
    log.info("%s requested hacker applicants", user)

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
            "application_data.reviews",
        ],
    )

    thresholds: Optional[dict[str, float]] = await _retrieve_thresholds()

    if not thresholds:
        log.error("Could not retrieve thresholds")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    for record in records:
        applicant_review_processor.include_hacker_app_fields(
            record, thresholds["accept"], thresholds["waitlist"]
        )

    try:
        return TypeAdapter(list[HackerApplicantSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


async def applicant(
    uid: str, application_type: Literal["Hacker", "Mentor", "Volunteer"]
) -> Applicant:
    """Get record of an applicant by uid."""
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": uid, "roles": [Role.APPLICANT, Role(application_type)]},
    )

    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    try:
        return Applicant.model_validate(record)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.get("/applicant/hacker/{uid}", dependencies=[Depends(require_hacker_reviewer)])
async def hacker_applicant(
    uid: str,
) -> Applicant:
    """Get record of a hacker applicant by uid."""
    return await applicant(uid, "Hacker")


@router.get("/applicant/mentor/{uid}", dependencies=[Depends(require_mentor_reviewer)])
async def mentor_applicant(
    uid: str,
) -> Applicant:
    """Get record of a mentor applicant by uid."""
    return await applicant(uid, "Mentor")


@router.get(
    "/applicant/volunteer/{uid}", dependencies=[Depends(require_volunteer_reviewer)]
)
async def volunteer_applicant(
    uid: str,
) -> Applicant:
    """Get record of a volunteer applicant by uid."""
    return await applicant(uid, "Volunteer")


@router.get("/summary/applicants", dependencies=[Depends(require_manager)])
async def applicant_summary() -> dict[ApplicantStatus, int]:
    """Provide summary of statuses of applicants."""
    return await summary_handler.applicant_summary()


@router.get(
    "/summary/applications",
    response_model=dict[str, object],
    dependencies=[Depends(require_manager)],
)
async def applications(
    group_by: Literal["school", "role"]
) -> dict[str, dict[date, int]]:
    if group_by == "school":
        return await summary_handler.applications_by_school()
    elif group_by == "role":
        return await summary_handler.applications_by_role()
    assert_never(group_by)


@router.post("/review")
async def submit_review(
    applicant_review: ReviewRequest,
    reviewer: User = Depends(require_reviewer),
) -> None:
    """Submit a review decision from the reviewer for the given hacker applicant."""

    if applicant_review.score < -2 or applicant_review.score > 100:
        log.error("Invalid review score submitted.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST)

    log.info("%s reviewed hacker %s", reviewer, applicant_review.applicant)

    review: Review = (utc_now(), reviewer.uid, applicant_review.score)
    app = applicant_review.applicant

    applicant_record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": applicant_review.applicant},
        ["_id", "application_data.reviews", "roles"],
    )
    if not applicant_record:
        log.error("Could not retrieve applicant after submitting review")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    if Role.HACKER in applicant_record["roles"]:

        if applicant_review.score < 0 or applicant_review.score > 10:
            log.error("Invalid review score submitted.")
            raise HTTPException(status.HTTP_400_BAD_REQUEST)

        unique_reviewers = applicant_review_processor.get_unique_reviewers(
            applicant_record
        )

        # Only add a review if there are either less than 2 reviewers
        # or reviewer is one of the reviewers
        if len(unique_reviewers) >= 2 and reviewer.uid not in unique_reviewers:
            log.error(
                "%s tried to submit a review, but %s already has two reviewers",
                reviewer,
                app,
            )
            raise HTTPException(status.HTTP_403_FORBIDDEN)

        update_query: dict[str, object] = {
            "$push": {"application_data.reviews": review}
        }
        # Because reviewing a hacker requires 2 reviewers, only set the
        # applicant's status to REVIEWED if there are at least 2 reviewers
        if len(unique_reviewers | {reviewer.uid}) >= 2:
            update_query.update({"$set": {"status": "REVIEWED"}})

        await _try_update_applicant_with_query(
            applicant_review,
            update_query=update_query,
            err_msg=f"{reviewer} could not submit review for {app}",
        )

    else:
        await _try_update_applicant_with_query(
            applicant_review,
            update_query={
                "$push": {"application_data.reviews": review},
                "$set": {"status": "REVIEWED"},
            },
            err_msg=f"{reviewer} could not submit review for {app}",
        )


@router.post("/set-thresholds")
async def set_hacker_score_thresholds(
    user: Annotated[User, Depends(require_director)],
    accept: float = Body(),
    waitlist: float = Body(),
) -> None:
    """
    Sets accepted and waitlisted score thresholds.
    Any score under waitlisted is considered rejected.
    """

    thresholds: Optional[dict[str, float]] = await _retrieve_thresholds()

    if accept != -1 and thresholds is not None:
        thresholds["accept"] = accept
    if waitlist != -1 and thresholds is not None:
        thresholds["waitlist"] = waitlist

    if (
        accept < -1
        or accept > 10
        or waitlist < -1
        or waitlist > 10
        or (accept != -1 and waitlist != -1 and waitlist > accept)
        or (thresholds and thresholds["waitlist"] > thresholds["accept"])
    ):
        log.error("Invalid threshold score submitted.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST)

    log.info("%s changed thresholds: Accept-%f | Waitlist-%f", user, accept, waitlist)

    # negative numbers should not be received, but -1 in this case
    # means there is no update to the respective threshold
    update_query = {}
    if accept != -1:
        update_query["accept"] = accept
    if waitlist != -1:
        update_query["waitlist"] = waitlist

    try:
        await mongodb_handler.raw_update_one(
            Collection.SETTINGS,
            {"_id": "hacker_score_thresholds"},
            {"$set": update_query},
            upsert=True,
        )
    except RuntimeError:
        log.error(
            "%s could not change thresholds: Accept-%f | Waitlist-%f",
            user,
            accept,
            waitlist,
        )
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/get-thresholds")
async def get_hacker_score_thresholds(
    user: Annotated[User, Depends(require_manager)]
) -> Optional[dict[str, Any]]:
    """
    Gets accepted and waitlisted thresholds
    """
    log.info("%s requested thresholds", user)

    try:
        record = await mongodb_handler.retrieve_one(
            Collection.SETTINGS,
            {"_id": "hacker_score_thresholds"},
        )
    except RuntimeError:
        log.error("%s could not retrieve thresholds", user)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)
    return record


@router.post("/release/mentor-volunteer", dependencies=[Depends(require_director)])
async def release_mentor_volunteer_decisions() -> None:
    """Update applicant status based on decision and send decision emails."""
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"status": Status.REVIEWED, "roles": {"$in": [Role.MENTOR, Role.VOLUNTEER]}},
        ["_id", "application_data.reviews", "first_name"],
    )

    for record in records:
        applicant_review_processor.include_review_decision(record)

    await _process_records_in_batches(records, [Role.MENTOR, Role.VOLUNTEER])


@router.post("/release/hackers", dependencies=[Depends(require_director)])
async def release_hacker_decisions() -> None:
    """Update hacker applicant status based on decision and send decision emails."""
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"status": Status.REVIEWED, "roles": {"$in": [Role.HACKER]}},
        ["_id", "application_data.reviews", "first_name"],
    )

    thresholds: Optional[dict[str, float]] = await _retrieve_thresholds()

    if not thresholds:
        log.error("Could not retrieve thresholds")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    for record in records:
        applicant_review_processor.include_hacker_app_fields(
            record, thresholds["accept"], thresholds["waitlist"]
        )

    await _process_records_in_batches(records, [Role.HACKER])


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
                email=recover_email_from_uid(record["_id"]),
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
        record["first_name"], recover_email_from_uid(uid)
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


async def _process_records_in_batches(
    records: list[dict[str, object]], application_types: list[Role]
) -> None:
    for application_type in application_types:
        for decision in (Decision.ACCEPTED, Decision.WAITLISTED, Decision.REJECTED):
            group = [record for record in records if record["decision"] == decision]
            if not group:
                continue
            await asyncio.gather(
                *(
                    _process_batch(batch, decision, application_type)
                    for batch in batched(group, 100)
                )
            )


async def _process_status(uids: Sequence[str], status: Status) -> None:
    ok = await mongodb_handler.update(
        Collection.USERS, {"_id": {"$in": uids}}, {"status": status}
    )
    if not ok:
        raise RuntimeError("gg wp")


async def _process_batch(
    batch: tuple[dict[str, Any], ...], decision: Decision, application_type: Role
) -> None:
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
        map(_extract_personalizations, batch), decision, application_type
    )


def _extract_personalizations(decision_data: dict[str, Any]) -> tuple[str, EmailStr]:
    name = decision_data["first_name"]
    email = recover_email_from_uid(decision_data["_id"])
    return name, email


def recover_email_from_uid(uid: str) -> str:
    """For NativeUsers, the email should still delivery properly."""
    uid = uid.replace("..", "\n")
    *reversed_domain, local = uid.split(".")
    local = local.replace("\n", ".")
    domain = ".".join(reversed(reversed_domain))
    return f"{local}@{domain}"


async def _retrieve_thresholds() -> Optional[dict[str, Any]]:
    return await mongodb_handler.retrieve_one(
        Collection.SETTINGS, {"_id": "hacker_score_thresholds"}, ["accept", "waitlist"]
    )


async def _try_update_applicant_with_query(
    applicant_review: ReviewRequest,
    *,
    update_query: Mapping[str, object],
    err_msg: str = "",
) -> None:
    try:
        await mongodb_handler.raw_update_one(
            Collection.USERS,
            {"_id": applicant_review.applicant},
            update_query,
        )
    except RuntimeError:
        log.error(err_msg)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)
