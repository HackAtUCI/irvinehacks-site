from datetime import datetime, timezone
from logging import getLogger
from typing import Annotated, Union
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Form, Header, HTTPException, Request, status
from fastapi.datastructures import URL
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, TypeAdapter

from auth import user_identity
from auth.authorization import require_accepted_applicant
from auth.user_identity import User, require_user_identity, use_user_identity
from models.ApplicationData import (
    FIELDS_SUPPORTING_OTHER,
    ProcessedApplicationDataUnion,
    RawHackerApplicationData,
    RawMentorApplicationData,
    RawVolunteerApplicationData,
    RawZotHacksMentorApplicationData,
)
from models.user_record import Applicant, BareApplicant, Role, Status
from services import docusign_handler, mongodb_handler
from services.docusign_handler import WebhookPayload
from services.mongodb_handler import Collection
from utils import email_handler, resume_handler

log = getLogger(__name__)

router = APIRouter()

DEADLINE = datetime(2025, 8, 13, 8, 1, tzinfo=timezone.utc)


class IdentityResponse(BaseModel):
    uid: Union[str, None] = None
    status: Union[str, None] = None
    roles: list[Role] = []


def _is_past_deadline(now: datetime) -> bool:
    return now > DEADLINE


@router.post("/login")
async def login(
    email: EmailStr = Form(), return_to: str = "/portal"
) -> RedirectResponse:
    log.info("%s requested to log in", email)
    query = urlencode({"return_to": return_to})

    if user_identity.uci_email(email):
        # redirect user for UCI SSO, changing to GET method
        return RedirectResponse(
            URL(path="/api/saml/login", query=query), status.HTTP_303_SEE_OTHER
        )

    # Forward POST request to guest login
    return RedirectResponse(
        URL(path="/api/guest/login", query=query), status.HTTP_307_TEMPORARY_REDIRECT
    )


@router.get("/logout")
async def logout() -> RedirectResponse:
    """Clear user identity cookie."""
    response = RedirectResponse("/", status.HTTP_303_SEE_OTHER)
    user_identity.remove_user_identity(response)
    return response


@router.get("/me")
async def me(
    user: Annotated[Union[User, None], Depends(use_user_identity)]
) -> IdentityResponse:
    log.info(user)
    if not user:
        return IdentityResponse()
    user_record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": user.uid}, ["roles", "status"]
    )

    if not user_record:
        return IdentityResponse(uid=user.uid)

    return IdentityResponse(uid=user.uid, **user_record)


@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def apply(
    user: Annotated[User, Depends(require_user_identity)],
    # media type should be automatically detected but seems like a bug as of now
    raw_application_data: Annotated[
        RawHackerApplicationData, Form(media_type="multipart/form-data")
    ],
) -> str:
    return await _apply_flow(user, raw_application_data)


@router.post("/mentor", status_code=status.HTTP_201_CREATED)
async def mentor(
    user: Annotated[User, Depends(require_user_identity)],
    # media type should be automatically detected but seems like a bug as of now
    raw_application_data: Annotated[
        RawMentorApplicationData, Form(media_type="multipart/form-data")
    ],
) -> str:
    return await _apply_flow(user, raw_application_data)


@router.post("/volunteer", status_code=status.HTTP_201_CREATED)
async def volunteer(
    user: Annotated[User, Depends(require_user_identity)],
    raw_application_data: Annotated[RawVolunteerApplicationData, Form()],
) -> str:
    return await _apply_flow(user, raw_application_data)


async def _apply_flow(
    user: User,
    raw_application_data: Union[
        RawHackerApplicationData,
        RawMentorApplicationData,
        RawVolunteerApplicationData,
        RawZotHacksMentorApplicationData,
    ],
) -> str:
    """Common flow for all three types of applications."""
    # Check if current datetime is past application deadline
    now = datetime.now(timezone.utc)

    if _is_past_deadline(now):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Applications have closed.")

    # check if user already has a role
    existing_record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": user.uid, "roles": {"$exists": True}}, ["roles"]
    )

    if existing_record and existing_record.get("roles"):
        log.error(
            "User %s already has role %s but tried to apply.",
            user,
            existing_record["roles"],
        )
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "User already has a role.")

    raw_app_data_dump = raw_application_data.model_dump()

    # Reject unprocessed other values
    for field in FIELDS_SUPPORTING_OTHER:
        value = raw_app_data_dump.get(field)
        if value == "other" or (isinstance(value, list) and "other" in value):
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "Please enable JavaScript on your browser.",
            )

    resume = raw_application_data.resume
    if resume is not None and resume.size and resume.size > 0:
        try:
            resume_url = await resume_handler.upload_resume(
                # TODO: reexamine why adapter is needed
                TypeAdapter(
                    Union[
                        RawHackerApplicationData,
                        RawMentorApplicationData,
                        RawZotHacksMentorApplicationData,
                    ]
                ).validate_python(raw_application_data),
                resume,
            )
        except TypeError:
            log.info("%s provided invalid resume type.", user)
            raise HTTPException(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Invalid resume file type"
            )
        except ValueError:
            log.info("%s provided too large resume.", user)
            raise HTTPException(
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Resume upload is too large"
            )
        except RuntimeError as err:
            log.error("During user %s apply, resume upload: %s", user.uid, err)
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        resume_url = None

    application_type = raw_application_data.application_type

    # Note: spreading is assumed to be safe since form data was already validated once
    processed_application_data = TypeAdapter[ProcessedApplicationDataUnion](
        ProcessedApplicationDataUnion
    ).validate_python(
        {
            **raw_app_data_dump,
            "resume_url": resume_url,
            "email": user.email,
            "submission_time": now,
        }
    )

    applicant = Applicant(
        uid=user.uid,
        first_name=raw_application_data.first_name,
        last_name=raw_application_data.last_name,
        roles=(Role.APPLICANT, Role(application_type)),
        application_data=processed_application_data,
        status=Status.PENDING_REVIEW,
    )

    # add applicant to database
    try:
        await mongodb_handler.update_one(
            Collection.USERS,
            {"_id": user.uid},
            applicant.model_dump(),
            upsert=True,
        )
    except RuntimeError:
        log.error("Could not insert applicant %s to MongoDB.", user.uid)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        await email_handler.send_application_confirmation_email(
            user.email, applicant, application_type
        )
    except RuntimeError:
        log.error("Could not send confirmation email with SendGrid to %s.", user.uid)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    # TODO: handle inconsistent results if one service fails

    log.info("%s submitted an application", user.uid)
    return (
        "Thank you for submitting an application to IrvineHacks 2025! Please "
        + "visit https://irvinehacks.com/portal to see your application status."
    )


@router.get("/waiver")
async def request_waiver(
    user: Annotated[tuple[User, BareApplicant], Depends(require_accepted_applicant)]
) -> RedirectResponse:
    """Request to sign the participant waiver through DocuSign."""
    # TODO: non-applicants might also want to request a waiver
    user_data, applicant = user

    if applicant.status in (Status.WAIVER_SIGNED, Status.CONFIRMED, Status.ATTENDING):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Already submitted a waiver.")

    user_name = f"{applicant.first_name} {applicant.last_name}"

    # TODO: email may not match UCInetID format from `docusign_handler._acquire_uid`
    form_url = docusign_handler.waiver_form_url(user_data.email, user_name)
    return RedirectResponse(form_url, status.HTTP_303_SEE_OTHER)


@router.post("/waiver")
async def waiver_webhook(
    request: Request,
    x_docusign_signature_1: Annotated[str, Header()],
    payload: WebhookPayload,
) -> None:
    """Process webhook from DocuSign Connect."""
    # Note: in practice there can be multiple keys to generate multiple signatures
    # We assume there is only one key and thus pick the first signature
    is_valid_signature = docusign_handler.verify_webhook_signature(
        await request.body(), x_docusign_signature_1
    )

    if payload.event != "envelope-completed":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unable to process event type.")

    if not is_valid_signature:
        log.error("Waiver Webhook received invalid signature.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid signature")

    try:
        await docusign_handler.process_webhook_event(payload)
    except ValueError as err:
        log.exception("During waiver webhook processing: %s", err)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid payload content.")


@router.post("/rsvp")
async def rsvp(
    user: Annotated[User, Depends(require_user_identity)]
) -> RedirectResponse:
    """Change user status for RSVP"""
    user_record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": user.uid}, ["status"]
    )

    if not user_record or "status" not in user_record:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "User must have a status.")

    new_status: Status
    if user_record["status"] == Status.WAIVER_SIGNED:
        new_status = Status.CONFIRMED
    elif user_record["status"] == Status.CONFIRMED:
        new_status = Status.WAIVER_SIGNED
    elif user_record["status"] == Status.ATTENDING:
        new_status = Status.VOID
    else:
        log.warning(f"User {user.uid} has not signed waiver. Status has not changed.")
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Waiver must be signed before being able to RSVP.",
        )

    await mongodb_handler.update_one(
        Collection.USERS, {"_id": user.uid}, {"status": new_status}
    )

    old_status = user_record["status"]
    log.info(f"User {user.uid} changed status from {old_status} to {new_status}.")

    return RedirectResponse("/portal", status.HTTP_303_SEE_OTHER)
