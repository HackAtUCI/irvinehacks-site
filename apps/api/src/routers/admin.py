import hashlib
import hmac
from datetime import date, datetime
from logging import getLogger
from typing import Annotated, Any, Literal, Mapping, Optional, Union

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, TypeAdapter, ValidationError
from typing_extensions import assert_never
from pymongo import DESCENDING

from admin import applicant_review_processor, participant_manager, summary_handler
from admin.participant_manager import AlreadyCheckedInError, Participant
from admin.score_normalizing_handler import (
    IH_WEIGHTING_CONFIG,
    add_normalized_scores_to_all_hacker_applicants,
    add_uids_to_exclude_from_hacker_normalization,
)
from auth import user_identity
from auth.authorization import require_role
from auth.user_identity import User, utc_now
from models.ApplicationData import Decision, Review
from models.user_record import Applicant, ApplicantStatus, Role, Status as UserStatus
from services import mongodb_handler
from services.mongodb_handler import BaseRecord, Collection
from utils import email_handler

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
    {
        Role.DIRECTOR,
        Role.LEAD,
        Role.HACKER_REVIEWER,
        Role.MENTOR_REVIEWER,
        Role.VOLUNTEER_REVIEWER,
    }
)
require_lead = require_role({Role.LEAD})
require_hacker_reviewer = require_role({Role.DIRECTOR, Role.HACKER_REVIEWER})
require_mentor_reviewer = require_role({Role.DIRECTOR, Role.MENTOR_REVIEWER})
require_volunteer_reviewer = require_role({Role.DIRECTOR, Role.VOLUNTEER_REVIEWER})
require_checkin_lead = require_role({Role.DIRECTOR, Role.CHECKIN_LEAD})
require_organizer = require_role({Role.ORGANIZER})
require_director = require_role({Role.DIRECTOR})


class ApplicationDataSummary(BaseModel):
    school: str
    submission_time: datetime
    normalized_scores: Optional[dict[str, float]] = None
    extra_points: Optional[float] = None
    email: str
    resume_url: str
    major: Optional[str] = None
    linkedin: Optional[str] = None
    reviews: list[Review] = []


class ZotHacksApplicationDataSummary(BaseModel):
    school_year: str
    submission_time: Any
    normalized_scores: Optional[dict[str, float]] = None
    extra_points: Optional[float] = None
    email: str
    resume_url: str
    major: Optional[str] = None
    linkedin: Optional[str] = None
    reviews: list[Review] = []


class SimplifiedApplicationDataSummary(BaseModel):
    school: str
    submission_time: datetime
    reviews: list[Review] = []


class SimplifiedApplicantSummary(BaseRecord):
    first_name: str
    last_name: str
    status: str
    application_data: SimplifiedApplicationDataSummary


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
    resume_reviewed: bool = False
    director_previous_experience_reviewed: bool = False
    duplicate_name_approved: bool = False
    avg_score: float
    application_data: Union[ApplicationDataSummary, ZotHacksApplicationDataSummary]


class RedactedApplicationDataSummary(BaseModel):
    submission_time: datetime
    reviews: list[Review] = []


class RedactedHackerApplicantSummary(BaseRecord):
    first_name: str = ""
    last_name: str = ""
    status: str
    decision: Optional[Decision] = None
    reviewers: list[str] = []
    resume_reviewed: bool = False
    director_previous_experience_reviewed: bool = False
    avg_score: float
    application_data: RedactedApplicationDataSummary


class RedactedHackerApplicationData(BaseModel):
    frq_change: str
    frq_ambition: str
    frq_character: str
    submission_time: datetime
    reviews: list[Review] = []
    review_breakdown: dict[str, dict[str, float]] = {}


class DirectorPreviousExperienceReview(BaseModel):
    reviewer: str
    reviewed_at: datetime
    previous_experience: Optional[float] = None
    has_socials: Optional[float] = None


class RedactedHackerApplicant(BaseRecord):
    first_name: str = ""
    last_name: str = ""
    roles: tuple[Role, ...]
    status: ApplicantStatus
    decision: Optional[Decision] = None
    application_data: RedactedHackerApplicationData


class ReviewRequest(BaseModel):
    applicant: str
    score: float
    notes: Optional[str] = None  # notes from reviewer


def _hacker_applicant_token(uid: str) -> str:
    secret = user_identity.JWT_SECRET.encode()
    return hmac.new(secret, uid.encode(), hashlib.sha256).hexdigest()[:24]


def _redact_reviewers(reviewers: list[str], reviewer_uid: str) -> list[str]:
    return [uid if uid == reviewer_uid else "reviewer" for uid in reviewers]


def _redact_reviews(reviews: list[Review], reviewer_uid: str) -> list[Review]:
    redacted_reviews: list[Review] = []
    for review in reviews:
        date = review[0]
        uid = review[1]
        score = review[2]
        notes = review[3] if len(review) > 3 else None
        redacted_reviews.append(
            (date, uid if uid == reviewer_uid else "reviewer", score, notes)
        )
    return redacted_reviews


class ZotHacksHackerDetailedScores(BaseModel):
    resume: Optional[int] = None
    elevator_pitch_saq: int
    tech_experience_saq: int
    learn_about_self_saq: int
    pixel_art_saq: int
    hackathon_experience: Optional[int] = None


class IrvineHacksHackerDetailedScores(BaseModel):
    frq_change: Optional[float] = None
    frq_ambition: Optional[float] = None
    frq_character: Optional[float] = None
    previous_experience: Optional[float] = None
    has_socials: Optional[float] = None


NON_SCORING_IH_FIELDS = {"previous_experience", "has_socials"}


class GlobalScores(BaseModel):
    resume: int
    hackathon_experience: int


class DetailedReviewRequest(BaseModel):
    applicant: str
    scores: Union[
        GlobalScores, ZotHacksHackerDetailedScores, IrvineHacksHackerDetailedScores
    ]
    notes: Optional[str] = None  # Notes from reviewer


class DeleteNotesRequest(BaseModel):
    applicant: str
    # Index of the review in the applicant's
    # application_data.reviews array for quick lookup
    review_index: int


class WaiverStatusRequest(BaseModel):
    is_signed: bool


async def mentor_volunteer_applicants(
    application_type: Literal["Mentor", "Volunteer"],
) -> list[SimplifiedApplicantSummary]:
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
        return TypeAdapter(list[SimplifiedApplicantSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.get("/applicants/mentors")
async def mentor_applicants(
    user: Annotated[User, Depends(require_mentor_reviewer)],
) -> list[SimplifiedApplicantSummary]:
    """Get records of all mentor applicants."""
    log.info("%s requested mentor applicants", user)

    return await mentor_volunteer_applicants("Mentor")


@router.get("/applicants/volunteers")
async def volunteer_applicants(
    user: Annotated[User, Depends(require_volunteer_reviewer)],
) -> list[SimplifiedApplicantSummary]:
    """Get records of all volunteer applicants."""
    log.info("%s requested volunteer applicants", user)

    return await mentor_volunteer_applicants("Volunteer")


@router.get("/applicants/hackers")
async def hacker_applicants(
    user: Annotated[User, Depends(require_hacker_reviewer)],
) -> Union[list[HackerApplicantSummary], list[RedactedHackerApplicantSummary]]:
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
            "application_data",
            "duplicate_name_approved",
        ],
        sort=[("application_data.submission_time", DESCENDING)],
    )
    thresholds: Optional[dict[str, float]] = await retrieve_thresholds()

    if not thresholds:
        log.error("Could not retrieve thresholds")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    for record in records:
        # TODO: Use different route for different avg score types.

        # Difference between them:
        # include_hacker_app_fields_with_global_and_breakdown uses review_breakdown and
        # global_field_scores as the source of truth for "most recent scores"

        # include_hacker_app_fields uses reviews array as source of truth
        # for "most recent scores"

        applicant_review_processor.include_hacker_app_fields_with_global_and_breakdown(
            record, thresholds["accept"], thresholds["waitlist"]
        )
        application_data = record.get("application_data", {})
        record["director_previous_experience_reviewed"] = bool(
            isinstance(application_data, dict)
            and application_data.get("director_previous_experience_review")
        )
        # applicant_review_processor.include_hacker_app_fields(
        #     record, thresholds["accept"], thresholds["waitlist"]
        # )

    try:
        if not await _user_has_role(user.uid, Role.DIRECTOR):
            return TypeAdapter(list[RedactedHackerApplicantSummary]).validate_python(
                [
                    _redact_hacker_applicant_summary(record, user.uid)
                    for record in records
                ]
            )
        return TypeAdapter(list[HackerApplicantSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


async def _user_has_role(uid: str, role: Role) -> bool:
    record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid}, ["roles"]
    )
    return bool(record and role in record.get("roles", []))


def _redact_hacker_applicant_summary(
    record: dict[str, object], reviewer_uid: str
) -> dict[str, object]:
    application_data = record.get("application_data", {})
    if not isinstance(application_data, dict):
        application_data = {}

    director_reviewed = bool(record.get("director_previous_experience_reviewed", False))
    reviewers = record.get("reviewers", [])
    if not isinstance(reviewers, list):
        reviewers = []
    reviewers = [uid for uid in reviewers if isinstance(uid, str)]

    return {
        "_id": _hacker_applicant_token(str(record["_id"])),
        "first_name": "",
        "last_name": "",
        "status": record["status"],
        "decision": record.get("decision") if director_reviewed else None,
        "reviewers": _redact_reviewers(reviewers, reviewer_uid),
        "resume_reviewed": record.get("resume_reviewed", False),
        "director_previous_experience_reviewed": director_reviewed,
        "avg_score": record.get("avg_score", -1) if director_reviewed else -1,
        "application_data": {
            "submission_time": application_data.get("submission_time"),
            "reviews": _redact_reviews(
                application_data.get("reviews", []), reviewer_uid
            ),
        },
    }


def _redact_hacker_applicant(
    record: dict[str, object], reviewer_uid: str
) -> RedactedHackerApplicant:
    application_data = record.get("application_data", {})
    if not isinstance(application_data, dict):
        raise RuntimeError("Could not parse applicant data.")

    return RedactedHackerApplicant.model_validate(
        {
            "_id": _hacker_applicant_token(str(record["_id"])),
            "first_name": "",
            "last_name": "",
            "roles": record["roles"],
            "status": record["status"],
            "decision": record.get("decision"),
            "application_data": {
                "frq_change": application_data.get("frq_change", ""),
                "frq_ambition": application_data.get("frq_ambition", ""),
                "frq_character": application_data.get("frq_character", ""),
                "submission_time": application_data.get("submission_time"),
                "reviews": _redact_reviews(
                    application_data.get("reviews", []), reviewer_uid
                ),
                "review_breakdown": application_data.get("review_breakdown", {}),
            },
        }
    )


async def applicant(
    uid: str, application_type: Literal["Hacker", "Mentor", "Volunteer"]
) -> Applicant:
    """Get record of an applicant by uid."""
    record = await _applicant_record(uid, application_type)

    try:
        return Applicant.model_validate(record)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


async def _applicant_record(
    uid: str, application_type: Literal["Hacker", "Mentor", "Volunteer"]
) -> dict[str, object]:
    record: Optional[dict[str, object]] = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": uid, "roles": [Role.APPLICANT, Role(application_type)]},
    )

    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return record


async def _hacker_applicant_record_for_user(
    uid_or_token: str, user: User, *, is_director: Optional[bool] = None
) -> dict[str, object]:
    if is_director is None:
        is_director = await _user_has_role(user.uid, Role.DIRECTOR)

    if uid_or_token.startswith("edu."):
        if not is_director:
            raise HTTPException(status.HTTP_404_NOT_FOUND)
        return await _applicant_record(uid_or_token, "Hacker")

    if is_director:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    records = await mongodb_handler.retrieve(Collection.USERS, {"roles": Role.HACKER})
    for record in records:
        uid = record.get("_id")
        if isinstance(uid, str) and _hacker_applicant_token(uid) == uid_or_token:
            return record

    raise HTTPException(status.HTTP_404_NOT_FOUND)


async def _resolve_hacker_applicant_uid_for_user(uid_or_token: str, user: User) -> str:
    if uid_or_token.startswith("edu."):
        if await _user_has_role(user.uid, Role.DIRECTOR):
            return uid_or_token
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    record = await _hacker_applicant_record_for_user(uid_or_token, user)
    uid = record.get("_id")
    if not isinstance(uid, str):
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return uid


@router.get("/applicant/hacker/{uid}")
async def hacker_applicant(
    uid: str,
    user: Annotated[User, Depends(require_hacker_reviewer)],
) -> Union[Applicant, RedactedHackerApplicant]:
    """Get record of a hacker applicant by uid."""
    is_user_director = await _user_has_role(user.uid, Role.DIRECTOR)
    record = await _hacker_applicant_record_for_user(
        uid, user, is_director=is_user_director
    )
    if is_user_director:
        try:
            return Applicant.model_validate(record)
        except ValidationError:
            raise RuntimeError("Could not parse applicant data.")
    return _redact_hacker_applicant(record, user.uid)


class ApproveDuplicateRequest(BaseModel):
    approved: bool


@router.post("/applicant/hacker/{uid}/approve-duplicate")
async def approve_duplicate_name(
    uid: str,
    body: ApproveDuplicateRequest,
    director: Annotated[User, Depends(require_director)],
) -> None:
    """
    Director-only: mark a hacker applicant's duplicate name
    as approved or revoke approval.
    """
    await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": uid, "roles": Role.HACKER},
        {"duplicate_name_approved": body.approved},
    )


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
async def applicant_summary(
    role: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> dict[ApplicantStatus, int]:
    """Provide summary of statuses of applicants"""
    # Convert string params to enums if provided
    role_enum: Optional[Role] = None
    status_enum: Optional[ApplicantStatus] = None

    if role:
        try:
            role_enum = Role(role)
        except ValueError:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, detail=f"Invalid role: {role}"
            )

    if status_filter:
        # Try to parse as Decision first, then Status
        try:
            status_enum = Decision(status_filter)
        except ValueError:
            try:
                status_enum = UserStatus(status_filter)
            except ValueError:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status_filter}",
                )

    return await summary_handler.applicant_summary(role=role_enum, status=status_enum)


@router.get(
    "/summary/applicants/table",
    response_model=dict[str, int],
    dependencies=[Depends(require_manager)],
)
async def applicant_table(
    group_by: Literal["school", "major", "year"],
    role: Optional[str] = None,
    status_filter: Optional[str] = None,
    pronouns: Optional[str] = None,
    ethnicity: Optional[str] = None,
) -> dict[str, int]:
    role_enum: Optional[Role] = None
    status_enum: Optional[ApplicantStatus] = None

    if role:
        try:
            role_enum = Role(role)
        except ValueError:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, detail=f"Invalid role: {role}"
            )

    if status_filter:
        try:
            status_enum = Decision(status_filter)
        except ValueError:
            try:
                status_enum = UserStatus(status_filter)
            except ValueError:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status_filter}",
                )

    return await summary_handler.applicant_table(
        role=role_enum,
        status=status_enum,
        group_by=group_by,
        pronouns=pronouns,
        ethnicity=ethnicity,
    )


@router.get(
    "/summary/applications",
    response_model=dict[str, object],
    dependencies=[Depends(require_manager)],
)
async def applications(
    group_by: Literal["school", "role"],
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

    review: Review = (
        utc_now(),
        reviewer.uid,
        applicant_review.score,
        applicant_review.notes,
    )

    app = (
        await _resolve_hacker_applicant_uid_for_user(
            applicant_review.applicant, reviewer
        )
        if not applicant_review.applicant.startswith("edu.")
        else applicant_review.applicant
    )

    applicant_record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": app},
        ["_id", "application_data.reviews", "roles", "status"],
    )
    if not applicant_record:
        log.error("Could not retrieve applicant after submitting review")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    if applicant_record.get("status") == Decision.VOIDED:
        log.error("%s tried to review voided applicant %s", reviewer, app)
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Cannot review a voided applicant."
        )

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
            app,
            update_query=update_query,
            err_msg=f"{reviewer} could not submit review for {app}",
        )

    else:
        await _try_update_applicant_with_query(
            app,
            update_query={
                "$push": {"application_data.reviews": review},
                "$set": {"status": "REVIEWED"},
            },
            err_msg=f"{reviewer} could not submit review for {app}",
        )

    log.info("%s reviewed hacker %s", reviewer, app)


@router.post("/detailed-review")
async def submit_detailed_review(
    applicant_review: DetailedReviewRequest,
    reviewer: User = Depends(require_reviewer),
) -> None:
    """Submit a review decision from the reviewer for the given hacker applicant."""
    applicant = await _resolve_hacker_applicant_uid_for_user(
        applicant_review.applicant, reviewer
    )
    if isinstance(applicant_review.scores, GlobalScores):
        await _handle_global_only_review(applicant, applicant_review.scores, reviewer)
    elif isinstance(applicant_review.scores, ZotHacksHackerDetailedScores):
        await _handle_detailed_scores_review(
            applicant,
            applicant_review.scores,
            reviewer,
            applicant_review.notes,
        )
    elif isinstance(applicant_review.scores, IrvineHacksHackerDetailedScores):
        await _handle_irvinehacks_detailed_scores_review(
            applicant,
            applicant_review.scores,
            reviewer,
            applicant_review.notes,
        )
    else:
        assert_never(applicant_review.scores)


@router.delete("/delete-notes")
async def delete_notes(
    delete_notes_request: DeleteNotesRequest,
    reviewer: User = Depends(require_reviewer),
) -> None:
    """Delete notes from a review."""
    applicant = (
        await _resolve_hacker_applicant_uid_for_user(
            delete_notes_request.applicant, reviewer
        )
        if not delete_notes_request.applicant.startswith("edu.")
        else delete_notes_request.applicant
    )

    # Get applicant record
    applicant_record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": applicant},
        ["_id", "application_data.reviews", "roles", "status"],
    )

    # Check if applicant record exists
    if not applicant_record:
        log.error(
            "Could not retrieve applicant while attempting to delete reviewer notes"
        )
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    if applicant_record.get("status") == Decision.VOIDED:
        log.error(
            "%s tried to delete notes on voided applicant %s",
            reviewer,
            applicant,
        )
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Cannot modify reviews on a voided applicant.",
        )

    reviews = applicant_record.get("application_data", {}).get("reviews", [])
    if (
        not (0 <= delete_notes_request.review_index < len(reviews))
        or reviews[delete_notes_request.review_index][1] != reviewer.uid
    ):
        log.error("Invalid review index or reviewer submitted.")
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    # Update query to set the note to be deleted to null
    # The note index is 3 because the review is a tuple
    # with the date, reviewer, score, and note fields
    update_query = {
        "$set": {
            f"application_data.reviews.{delete_notes_request.review_index}.3": None
        }
    }

    # Update review in applicant record to set note to null
    await _try_update_applicant_with_query(
        applicant,
        update_query=update_query,
        err_msg=f"""
            {reviewer} could not delete notes from review
            {delete_notes_request.review_index} for
            {applicant}
        """,
    )

    log.info(
        "%s deleted notes from review %d for %s",
        reviewer,
        delete_notes_request.review_index,
        applicant,
    )


@router.get("/get-thresholds")
async def get_hacker_score_thresholds(
    user: Annotated[User, Depends(require_manager)],
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
        record["first_name"], email_handler.recover_email_from_uid(uid)
    )


@router.get("/participants", dependencies=[Depends(require_organizer)])
async def participants() -> list[Participant]:
    """Get list of participants."""
    return await participant_manager.get_participants()


@router.post("/checkin/{uid}")
async def check_in_participant(
    uid: str,
    associate: Annotated[User, Depends(require_organizer)],
) -> None:
    """Check in participant at IrvineHacks."""
    try:
        await participant_manager.check_in_participant(uid, associate)
    except ValueError as err:
        log.error(err)
        if "record found" in str(err):
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(err))
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(err))
    except RuntimeError as err:
        log.exception("During participant check-in: %s", err)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/queue/{uid}")
async def add_participant_to_queue(
    uid: str,
    associate: Annotated[User, Depends(require_organizer)],
) -> None:
    """Add waitlisted participant to queue at IrvineHacks."""
    try:
        await participant_manager.add_participant_to_queue(uid, associate)
    except ValueError as err:
        log.error(err)
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(err))
    except RuntimeError as err:
        log.exception("During participant queue: %s", err)
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
    """Update status to Role.ATTENDING for outside participants."""
    try:
        await participant_manager.confirm_attendance_outside_participants(uid, director)
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
    try:
        await participant_manager.subevent_checkin(event, uid, organizer)
    except AlreadyCheckedInError as e:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/add-uids-to-exclude-from-normalization",
    dependencies=[Depends(require_role({Role.DIRECTOR, Role.LEAD}))],
)
async def add_uids_to_exclude(uids: list[str]) -> None:
    try:
        await add_uids_to_exclude_from_hacker_normalization(uids)
    except RuntimeError:
        log.error("Could not update/add normalized scores to hacker applicants")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get(
    "/normalize-detailed-scores",
    dependencies=[Depends(require_role({Role.DIRECTOR, Role.LEAD}))],
)
async def normalize_detailed_scores_for_all_hacker_apps() -> None:
    try:
        await add_normalized_scores_to_all_hacker_applicants()
    except RuntimeError:
        log.error("Could not update/add normalized scores to hacker applicants")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


async def retrieve_thresholds() -> Optional[dict[str, Any]]:
    return await mongodb_handler.retrieve_one(
        Collection.SETTINGS, {"_id": "hacker_score_thresholds"}, ["accept", "waitlist"]
    )


@router.get(
    "/avg-score-setting",
    dependencies=[Depends(require_hacker_reviewer)],
)
async def get_avg_score_setting() -> dict[str, bool]:
    """Get setting for whether to show avg score with only 1 reviewer."""
    record = await mongodb_handler.retrieve_one(
        Collection.SETTINGS,
        {"_id": "avg_score_setting"},
        ["show_with_one_reviewer"],
    )
    return {
        "show_with_one_reviewer": bool(
            record and record.get("show_with_one_reviewer", False)
        )
    }


async def _handle_global_only_review(
    applicant: str, scores: GlobalScores, reviewer: User
) -> None:
    """Handle resume-only review submission."""
    # Check if user has LEAD role for resume-only reviews
    await require_lead(reviewer)

    # Check if applicant is voided before submitted review
    applicant_record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": applicant},
        ["status"],
    )
    if applicant_record and applicant_record.get("status") == Decision.VOIDED:
        log.error(
            "%s tried to submit global-only review on voided applicant %s",
            reviewer,
            applicant,
        )
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Cannot review a voided applicant."
        )

    # Update the user record with global field scores
    await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": applicant},
        {"application_data.global_field_scores": scores.model_dump()},
        upsert=True,
    )


async def _handle_irvinehacks_detailed_scores_review(
    applicant: str,
    scores: IrvineHacksHackerDetailedScores,
    reviewer: User,
    notes: Optional[str] = None,
) -> None:
    """Handle detailed scores review submission for IrvineHacks."""
    score_breakdown = scores.model_dump(exclude_none=True)

    # Check for overqualified auto-reject
    if score_breakdown.get("resume") == -1000:
        total_score = -1000.0
        director_previous_experience_scores = {}
        scoring_breakdown = score_breakdown
    else:
        director_previous_experience_scores = {
            field: score_breakdown[field]
            for field in NON_SCORING_IH_FIELDS
            if field in score_breakdown
        }
        if "previous_experience" not in director_previous_experience_scores:
            director_previous_experience_scores = {}
        scoring_breakdown = {
            field: score
            for field, score in score_breakdown.items()
            if field not in NON_SCORING_IH_FIELDS
        }

        if not scoring_breakdown and not director_previous_experience_scores:
            log.error("No review scores submitted.")
            raise HTTPException(status.HTTP_400_BAD_REQUEST)

        weighted_sum = 0.0
        submitted_weight = 0.0
        for field, score_val in scoring_breakdown.items():
            total_points, weight = IH_WEIGHTING_CONFIG[field]
            weighted_sum += (score_val / total_points) * weight
            submitted_weight += weight

        total_score = (
            max((weighted_sum / submitted_weight) * 100.0, -3.0)
            if submitted_weight
            else 0.0
        )

    if total_score < -1000.0 or total_score > 100.0:
        log.error("Invalid calculated review score: %f", total_score)
        raise HTTPException(status.HTTP_400_BAD_REQUEST)

    review: Review = (utc_now(), reviewer.uid, total_score, notes)

    applicant_record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": applicant},
        ["_id", "application_data.reviews", "roles", "status"],
    )
    if not applicant_record:
        log.error("Could not retrieve applicant after submitting review")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    if applicant_record.get("status") == Decision.VOIDED:
        log.error(
            "%s tried to submit IH detailed review on voided applicant %s",
            reviewer,
            applicant,
        )
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Cannot review a voided applicant."
        )

    unique_reviewers = applicant_review_processor.get_unique_reviewers(applicant_record)

    uid_no_domain = reviewer.uid.split(".")[-1]
    review_breakdown_key = f"application_data.review_breakdown.{uid_no_domain}"
    is_director = await _user_has_role(reviewer.uid, Role.DIRECTOR)

    if scoring_breakdown:
        # Only add a scoring review if there are either less than 2 reviewers
        # or reviewer is one of the reviewers. Director previous-experience
        # review is tracked separately and does not count toward this limit.
        if len(unique_reviewers) >= 2 and reviewer.uid not in unique_reviewers:
            log.error(
                "%s tried to submit a review, but %s already has two reviewers",
                reviewer,
                applicant,
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
            applicant,
            update_query=update_query,
            err_msg=f"{reviewer} could not submit review for {applicant}",
        )

        await _try_update_applicant_with_query(
            applicant,
            update_query={"$set": {review_breakdown_key: scoring_breakdown}},
            err_msg=f"{reviewer} could not submit review for {applicant}",
        )

    if is_director and director_previous_experience_scores:
        director_review = DirectorPreviousExperienceReview(
            reviewer=reviewer.uid,
            reviewed_at=utc_now(),
            **director_previous_experience_scores,
        )
        await _try_update_applicant_with_query(
            applicant,
            update_query={
                "$set": {
                    "application_data.director_previous_experience_review": (
                        director_review.model_dump()
                    )
                }
            },
            err_msg=(
                f"{reviewer} could not submit director previous experience "
                f"review for {applicant}"
            ),
        )

    # No update to GlobalScores. For IH, leads decided not to score resume/experience
    # beforehand. GlobalScores was meant for leads to mark applicants as overqualified.
    # This is not the case for IH.

    log.info("%s reviewed hacker %s", reviewer, applicant)


async def _handle_detailed_scores_review(
    applicant: str,
    scores: ZotHacksHackerDetailedScores,
    reviewer: User,
    notes: Optional[str] = None,
) -> None:
    """Handle detailed scores review submission."""
    score_breakdown = scores.model_dump(exclude_none=True)
    total_score = max(sum(score_breakdown.get(k, 0) for k in scores.model_fields), -3)

    if total_score < -3 or total_score > 100:
        log.error("Invalid review score submitted.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST)

    review: Review = (utc_now(), reviewer.uid, total_score, notes)

    applicant_record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": applicant},
        [
            "_id",
            "application_data.reviews",
            "roles",
            "status",
        ],
    )
    if not applicant_record:
        log.error("Could not retrieve applicant after submitting review")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    if applicant_record.get("status") == Decision.VOIDED:
        log.error(
            "%s tried to submit detailed review on voided applicant %s",
            reviewer,
            applicant,
        )
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Cannot review a voided applicant."
        )

    if Role.HACKER in applicant_record["roles"]:
        unique_reviewers = applicant_review_processor.get_unique_reviewers(
            applicant_record
        )

        # Only add a review if there are either less than 2 reviewers
        # or reviewer is one of the reviewers
        if len(unique_reviewers) >= 2 and reviewer.uid not in unique_reviewers:
            log.error(
                "%s tried to submit a review, but %s already has two reviewers",
                reviewer,
                applicant,
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
            applicant,
            update_query=update_query,
            err_msg=f"{reviewer} could not submit review for {applicant}",
        )
    else:
        await _try_update_applicant_with_query(
            applicant,
            update_query={
                "$push": {"application_data.reviews": review},
                "$set": {"status": "REVIEWED"},
            },
            err_msg=f"{reviewer} could not submit review for {applicant}",
        )

    uid_no_domain = reviewer.uid.split(".")[-1]
    await _try_update_applicant_with_query(
        applicant,
        update_query={
            "$set": {
                f"application_data.review_breakdown.{uid_no_domain}": (score_breakdown)
            }
        },
        err_msg=f"{reviewer} could not submit review for {applicant}",
    )

    # If user has Lead role, also update global field scores
    try:
        await require_lead(reviewer)
        global_scores = GlobalScores(
            resume=scores.resume or 0,
            hackathon_experience=scores.hackathon_experience or 0,
        )
        await _handle_global_only_review(applicant, global_scores, reviewer)
    except HTTPException:
        # User doesn't have Lead role, skip global field scores update
        pass

    log.info("%s reviewed hacker %s", reviewer, applicant)


async def _try_update_applicant_with_query(
    applicant: str,
    *,
    update_query: Mapping[str, object],
    err_msg: str = "",
) -> None:
    try:
        modified = await mongodb_handler.raw_update_one(
            Collection.USERS,
            {"_id": applicant},
            update_query,
        )
        if not modified:
            log.warning(
                f"""
                Update query did not modify any documents
                for {applicant}: {update_query}
                """
            )
    except RuntimeError:
        log.error(err_msg)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post(
    "/participant/waiver/{uid}",
    dependencies=[Depends(require_organizer)],
)
async def update_participant_waiver_status(
    uid: str,
    request: WaiverStatusRequest,
) -> dict[str, bool]:
    """Update is_waiver_signed field for a participant."""
    success = await participant_manager.update_waiver_status(uid, request.is_signed)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not update waiver status for {uid}",
        )
    return {"success": True}
