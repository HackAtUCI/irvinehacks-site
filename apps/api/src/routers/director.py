import asyncio

from datetime import datetime
from logging import getLogger
from typing import Annotated, Any, Literal, Mapping, Optional, Sequence

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import (
    AliasChoices,
    BaseModel,
    EmailStr,
    Field,
    TypeAdapter,
    ValidationError,
)

from admin import applicant_review_processor
from admin.applicant_review_processor import (
    include_hacker_app_fields_with_global_and_breakdown,
)
from auth.authorization import require_role
from auth.user_identity import User, uci_email, utc_now
from models.ApplicationData import Decision
from models.user_record import Role, Status
from services import mongodb_handler, ses_handler
from services.mongodb_handler import BaseRecord, Collection
from routers.admin import (
    REVIEW_ASSIGNMENT_SETTINGS_ID,
    ReviewAssignmentSettings,
    retrieve_thresholds,
)
from utils import email_handler
from utils.email_handler import recover_email_from_uid
from utils.batched import batched
from utils.hackathon_context import HackathonName, hackathon_name_ctx

log = getLogger(__name__)

router = APIRouter()

require_director = require_role({Role.DIRECTOR})


SES_ROLE_NAMES: dict[Role, ses_handler.RoleName] = {
    Role.HACKER: "Hacker",
    Role.MENTOR: "Mentor",
    Role.VOLUNTEER: "Volunteer",
}
APPLY_REMINDER_BATCH_SIZE = 25


class ApplyReminderSenders(BaseModel):
    _id: str
    senders: list[tuple[datetime, str, int]]


class ApplyReminderRecipients(BaseModel):
    _id: str
    recipients: list[str]


class OrganizerSummary(BaseRecord):
    first_name: str
    last_name: str
    roles: list[Role]
    committees: list[str] = Field(
        validation_alias=AliasChoices("committees", "committee")
    )


class RawOrganizerData(BaseModel):
    email: str
    first_name: str
    last_name: str
    roles: list[Role]


class ReviewAssignmentSettingsRequest(BaseModel):
    minimum_reviews_per_organizer: Optional[int] = Field(default=None, ge=0)
    maximum_reviews_per_organizer: Optional[int] = Field(default=None, ge=0)


def uci_scoped_uid(email: EmailStr) -> str:
    """Provide a scoped unique identifier based on the UCI email"""
    local, domain = email.split("@")
    reversed_domains = ".".join(reversed(domain.split(".")))
    cleaned_local = local.replace(".", "..")
    return f"{reversed_domains}.{cleaned_local}"


def roles_includes_organizer(roles: list[Role]) -> bool:
    return Role.ORGANIZER in roles


def roles_includes_applicant(roles: list[Role]) -> bool:
    return Role.APPLICANT in roles


async def _update_user_in_all_hackathon_databases(
    query: Mapping[str, object],
    data: Mapping[str, object],
    *,
    upsert: bool = False,
) -> None:
    for hackathon_name in (HackathonName.IRVINEHACKS, HackathonName.ZOTHACKS):
        token = hackathon_name_ctx.set(hackathon_name)
        try:
            await mongodb_handler.update_one(
                Collection.USERS,
                query,
                data,
                upsert=upsert,
            )
        finally:
            hackathon_name_ctx.reset(token)


async def _get_apply_reminder_email_recipients() -> Optional[dict[str, Any]]:
    try:
        apply_reminder_recipients = await mongodb_handler.retrieve_one(
            Collection.EMAILS, {"_id": "apply_reminder"}, ["recipients"]
        )
    except RuntimeError:
        log.error("Could not get apply reminder email recipients")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    return apply_reminder_recipients


@router.get("/organizers")
async def organizers(
    user: Annotated[User, Depends(require_director)],
) -> list[OrganizerSummary]:
    """Get records of all organizers"""
    log.info("%s requested organizer", user)

    records: list[dict[str, object]] = await mongodb_handler.retrieve(
        Collection.USERS, {"roles": Role.ORGANIZER}
    )

    try:
        return TypeAdapter(list[OrganizerSummary]).validate_python(records)
    except ValidationError:
        raise RuntimeError("Could not parse applicant data.")


@router.post("/organizers", status_code=status.HTTP_201_CREATED)
async def add_organizer(
    user: Annotated[User, Depends(require_director)],
    email: EmailStr = Body(),
    first_name: str = Body(),
    last_name: str = Body(),
    roles: list[Role] = Body(),
    committees: list[str] = Body(),
) -> None:
    """Adds an organizer record"""
    log.info("%s adding organizer", user)

    if not uci_email(email):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "User doesn't have a UCI email."
        )

    if not roles_includes_organizer(roles):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "User doesn't have organizer role."
        )

    if roles_includes_applicant(roles):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "User has submitted an application."
        )

    uid = uci_scoped_uid(email)
    await _update_user_in_all_hackathon_databases(
        {"_id": uid},
        {
            "_id": uid,
            "first_name": first_name,
            "last_name": last_name,
            "roles": roles,
            "committees": committees,
        },
        upsert=True,
    )


@router.post("/update-organizers")
async def update_organizer(
    user: Annotated[User, Depends(require_director)],
    uid: str = Body(..., embed=True),
    first_name: str = Body(),
    last_name: str = Body(),
    roles: list[Role] = Body(),
    committees: list[str] = Body(),
) -> None:
    """Updates organizer information for the current hackathon."""
    log.info("%s updating %s's organizer info", user, uid)

    await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": uid},
        {
            "_id": uid,
            "first_name": first_name,
            "last_name": last_name,
            "roles": roles,
            "committees": committees,
        },
        upsert=True,
    )


@router.post("/delete-organizers")
async def delete_organizer(
    user: Annotated[User, Depends(require_director)], uid: str = Body(..., embed=True)
) -> None:
    """Delete organizer from the current hackathon."""
    log.info("%s clearing %s's roles", user, uid)

    await mongodb_handler.delete_one(
        Collection.USERS,
        {"_id": uid},
    )


@router.get("/apply-reminder", dependencies=[Depends(require_director)])
async def get_apply_reminder_senders() -> list[tuple[datetime, str, int]]:
    """Get data about every sender that sent out apply reminder emails"""
    records = await mongodb_handler.retrieve_one(
        Collection.EMAILS, {"_id": "apply_reminder"}, ["senders"]
    )

    if not records:
        log.error("Could not retrieve apply reminder email senders")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    senders = ApplyReminderSenders.model_validate(records)

    try:
        return TypeAdapter(list[tuple[datetime, str, int]]).validate_python(
            senders.senders
        )
    except ValidationError:
        raise RuntimeError("Could not parse apply reminder email sender data")


@router.post("/apply-reminder")
async def apply_reminder(user: Annotated[User, Depends(require_director)]) -> None:
    """Send email to users who haven't submitted an app"""
    not_yet_applied: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {"last_login": {"$exists": True}, "roles": {"$exists": False}},
        ["_id"],
    )

    apply_reminder_recipients: Optional[dict[str, Any]] = (
        await _get_apply_reminder_email_recipients()
    )

    if not apply_reminder_recipients:
        log.error("Could not retrieve apply reminder email recipients")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    validated_recipients = ApplyReminderRecipients.model_validate(
        apply_reminder_recipients
    )

    recipients = set(validated_recipients.recipients)

    new_recipients = []
    for record in not_yet_applied:
        if record["_id"] not in recipients:
            new_recipients.append(record["_id"])

    batch_recipients = new_recipients[:APPLY_REMINDER_BATCH_SIZE]
    reminder_emails = [
        recover_email_from_uid(recipient) for recipient in batch_recipients
    ]

    log.info(
        f"{user} sending apply reminder emails to {len(batch_recipients)} "
        f"of {len(new_recipients)} users"
    )

    if len(batch_recipients) == 0:
        return

    await ses_handler.send_apply_reminder_emails(reminder_emails)

    try:
        await mongodb_handler.raw_update_one(
            Collection.EMAILS,
            {"_id": "apply_reminder"},
            {
                "$push": {
                    "senders": (utc_now(), user.uid, len(batch_recipients)),
                    "recipients": {"$each": batch_recipients},
                },
            },
            upsert=True,
        )
    except RuntimeError:
        log.error("Error when attempting to update list of senders and recipients")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)


async def _rsvp_reminder(
    application_type: Literal[Role.HACKER, Role.MENTOR, Role.VOLUNTEER],
) -> None:
    """Send email to applicants based on application_type who have a status of ACCEPTED
    or WAIVER_SIGNED reminding them to RSVP."""
    # TODO: Consider using Pydantic model validation instead of type annotations
    not_yet_rsvpd: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "roles": Role(application_type),
            "status": {"$in": [Status.ACCEPTED, Status.WAIVER_SIGNED]},
        },
        ["_id", "first_name"],
    )

    recipients = []
    for record in not_yet_rsvpd:
        recipients.append((record["first_name"], recover_email_from_uid(record["_id"])))

    log.info(
        (
            f"Sending RSVP reminder emails to {len(not_yet_rsvpd)} "
            f"{application_type} applicants"
        )
    )

    if len(not_yet_rsvpd) > 0:
        await ses_handler.send_rsvp_reminder_emails(
            recipients,
            SES_ROLE_NAMES[application_type],
        )


@router.post("/rsvp-reminder", dependencies=[Depends(require_director)])
async def rsvp_reminder() -> None:
    """Send email to applicants who have a status of ACCEPTED or WAIVER_SIGNED
    reminding them to RSVP."""
    await _rsvp_reminder(Role.HACKER)
    await _rsvp_reminder(Role.MENTOR)
    await _rsvp_reminder(Role.VOLUNTEER)


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

    thresholds: Optional[dict[str, float]] = await retrieve_thresholds()

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


@router.post("/avg-score-setting", dependencies=[Depends(require_director)])
async def toggle_avg_score_setting() -> dict[str, bool]:
    """Toggle whether to show avg score with only 1 reviewer."""
    record = await mongodb_handler.retrieve_one(
        Collection.SETTINGS,
        {"_id": "avg_score_setting"},
        ["show_with_one_reviewer"],
    )
    current = bool(record and record.get("show_with_one_reviewer", False))
    new_value = not current

    await mongodb_handler.raw_update_one(
        Collection.SETTINGS,
        {"_id": "avg_score_setting"},
        {"$set": {"show_with_one_reviewer": new_value}},
        upsert=True,
    )
    return {"show_with_one_reviewer": new_value}


@router.post(
    "/review-assignment-settings",
    dependencies=[Depends(require_director)],
)
async def set_review_assignment_settings(
    settings: ReviewAssignmentSettingsRequest,
) -> ReviewAssignmentSettings:
    """Set reviewer queue goals and caps."""
    minimum = settings.minimum_reviews_per_organizer
    maximum = settings.maximum_reviews_per_organizer
    if minimum is not None and maximum is not None and maximum < minimum:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Maximum reviews per organizer cannot be lower than the minimum.",
        )

    update_query = settings.model_dump()
    await mongodb_handler.raw_update_one(
        Collection.SETTINGS,
        {"_id": REVIEW_ASSIGNMENT_SETTINGS_ID},
        {"$set": update_query},
        upsert=True,
    )
    return ReviewAssignmentSettings(**update_query)


@router.post("/release/mentor-volunteer", dependencies=[Depends(require_director)])
async def release_mentor_volunteer_decisions() -> None:
    """Update applicant status based on decision and send decision emails."""
    await _release_non_hacker_decisions(Role.MENTOR)
    await _release_non_hacker_decisions(Role.VOLUNTEER)


@router.post("/release/mentors", dependencies=[Depends(require_director)])
async def release_mentor_decisions() -> None:
    """Update mentor applicant status based on decision and send decision emails."""
    await _release_non_hacker_decisions(Role.MENTOR)


@router.post("/release/volunteers", dependencies=[Depends(require_director)])
async def release_volunteer_decisions() -> None:
    """Update volunteer applicant status based on decision and send decision emails."""
    await _release_non_hacker_decisions(Role.VOLUNTEER)


async def _release_non_hacker_decisions(
    application_type: Literal[Role.MENTOR, Role.VOLUNTEER],
) -> None:
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"status": Status.REVIEWED, "roles": {"$in": [application_type]}},
        ["_id", "application_data.reviews", "first_name", "auto_decision_reason"],
    )

    for record in records:
        applicant_review_processor.include_review_decision(record)

    await _process_records_in_batches(records, application_type)


@router.post("/release/hackers", dependencies=[Depends(require_director)])
async def release_hacker_decisions() -> None:
    """Update hacker applicant status based on decision and send decision emails."""
    records = await mongodb_handler.retrieve(
        Collection.USERS,
        {"status": Status.REVIEWED, "roles": {"$in": [Role.HACKER]}},
        ["_id", "application_data", "first_name", "auto_decision_reason"],
    )

    thresholds: Optional[dict[str, float]] = await retrieve_thresholds()

    if not thresholds:
        log.error("Could not retrieve thresholds")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    for record in records:
        application_data = record.get("application_data", {})
        if (
            isinstance(application_data, Mapping)
            and "tech_inspiration_saq" in application_data
        ):
            include_hacker_app_fields_with_global_and_breakdown(
                record,
                thresholds["accept"],
                thresholds["waitlist"],
            )
        else:
            applicant_review_processor.include_hacker_app_fields(
                record, thresholds["accept"], thresholds["waitlist"]
            )

    await _process_records_in_batches(records, Role.HACKER)


@router.post("/logistics/hackers", dependencies=[Depends(require_director)])
async def hacker_logistics_emails() -> None:
    """Send logistics emails to hackers."""
    await email_handler.send_logistics_email(Role.HACKER)


@router.post("/logistics/mentors", dependencies=[Depends(require_director)])
async def mentor_logistics_emails() -> None:
    """Send logistics email to mentors."""
    await email_handler.send_logistics_email(Role.MENTOR)


@router.post("/logistics/volunteers", dependencies=[Depends(require_director)])
async def volunteer_logistics_emails() -> None:
    """Send logistics email to volunteers."""
    await email_handler.send_logistics_email(Role.VOLUNTEER)


@router.post("/logistics/waitlists", dependencies=[Depends(require_director)])
async def waitlist_logistics_emails() -> None:
    """Send logistics emails to waitlisted hackers."""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        mongodb_handler.Collection.USERS,
        {"roles": Role.HACKER, "status": Status.WAITLISTED},
        ["_id", "first_name"],
    )

    recipients = []
    for record in records:
        recipients.append((record["first_name"], recover_email_from_uid(record["_id"])))

    if len(records) > 0:
        await ses_handler.send_logistics_emails(
            recipients,
            "Hacker",
            waitlisted=True,
        )


@router.post("/waitlist-transfer", dependencies=[Depends(require_director)])
async def waitlist_transfer() -> None:
    """Transfer all accepted hackers that didn't RSVP in time to the waitlist"""
    records: list[dict[str, Any]] = await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "roles": Role.HACKER,
            "status": {"$in": [Status.ACCEPTED, Status.WAIVER_SIGNED]},
        },
        ["_id", "first_name"],
    )

    log.info(f"Changing status of {len(records)} to {Status.WAITLISTED}")

    await asyncio.gather(
        *(
            _process_status(batch, Status.WAITLISTED)
            for batch in batched([str(record["_id"]) for record in records], 100)
        )
    )

    recipients = []
    for record in records:
        recipients.append((record["first_name"], recover_email_from_uid(record["_id"])))

    log.info(f"Sending waitlist transfer emails to {len(records)} hackers")

    if len(records) > 0:
        await ses_handler.send_waitlist_transfer_emails(recipients)


@router.post("/void-applicant/{uid}")
async def void_applicant(
    uid: str,
    user: Annotated[User, Depends(require_director)],
) -> None:
    """Void an applicant and remove them from the active pipeline."""
    record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": uid, "roles": Role.APPLICANT},
        ["status"],
    )
    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    if record["status"] == Status.VOIDED:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Applicant is already voided.")

    ok = await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": uid},
        {"status": Status.VOIDED},
    )
    if not ok:
        raise RuntimeError(f"Error voiding applicant {uid}")

    log.info("%s voided applicant %s", user, uid)


async def _process_status(
    uids: Sequence[str], status: Status, *, no_modifications_ok: bool = False
) -> None:
    any_modified = await mongodb_handler.update(
        Collection.USERS, {"_id": {"$in": uids}}, {"status": status}
    )
    if not any_modified and not no_modifications_ok:
        raise RuntimeError(
            "Expected to modify at least one document, but none were modified."
        )


async def _process_records_in_batches(
    records: list[dict[str, object]],
    application_type: Literal[Role.HACKER, Role.MENTOR, Role.VOLUNTEER],
) -> None:
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


async def _process_batch(
    batch: tuple[dict[str, Any], ...],
    decision: Decision,
    application_type: Literal[Role.HACKER, Role.MENTOR, Role.VOLUNTEER],
) -> None:
    uids: list[str] = [record["_id"] for record in batch]
    log.info(f"Setting {application_type}s {','.join(uids)} as {decision}")
    release_update = {"decision": decision, "status": Status(decision.value)}
    ok = await mongodb_handler.update(
        Collection.USERS, {"_id": {"$in": uids}}, release_update
    )
    if not ok:
        raise RuntimeError("gg wp")

    # Send emails
    log.info(
        f"Sending {application_type} {decision} emails for {len(batch)} applicants"
    )
    await email_handler.send_decision_email(
        map(_extract_personalizations, batch), decision, application_type
    )


def _extract_personalizations(decision_data: dict[str, Any]) -> tuple[str, EmailStr]:
    name = decision_data["first_name"]
    email = recover_email_from_uid(decision_data["_id"])
    return name, email
