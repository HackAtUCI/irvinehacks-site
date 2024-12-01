from datetime import datetime, timezone
from logging import getLogger
from typing import Annotated, Optional, Union

from fastapi import (
    APIRouter,
    Depends,
    Form,
    Header,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr

from auth import user_identity
from auth.authorization import require_accepted_applicant
from auth.user_identity import User, require_user_identity, use_user_identity
from models.ApplicationData import ProcessedApplicationData, RawApplicationData
from services import docusign_handler, mongodb_handler
from services.docusign_handler import WebhookPayload
from services.mongodb_handler import Collection
from utils import email_handler, resume_handler
from utils.user_record import Applicant, Role, Status

log = getLogger(__name__)

router = APIRouter()

DEADLINE = datetime(2025, 1, 11, 8, 1, tzinfo=timezone.utc)


class IdentityResponse(BaseModel):
    uid: Union[str, None] = None
    status: Union[str, None] = None
    role: Union[Role, None] = None


def _is_past_deadline(now: datetime) -> bool:
    return now > DEADLINE


@router.post("/login")
async def login(email: EmailStr = Form()) -> RedirectResponse:
    log.info("%s requested to log in", email)
    if user_identity.uci_email(email):
        # redirect user to UCI SSO login endpoint, changing to GET method
        return RedirectResponse("/api/saml/login", status.HTTP_303_SEE_OTHER)
    return RedirectResponse("/api/guest/login", status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/logout")
async def logout() -> RedirectResponse:
    """Clear user identity cookie."""
    response = RedirectResponse("/", status.HTTP_303_SEE_OTHER)
    user_identity.remove_user_identity(response)
    return response


@router.get("/me", response_model=IdentityResponse)
async def me(
    user: Annotated[Union[User, None], Depends(use_user_identity)]
) -> dict[str, object]:
    log.info(user)
    if not user:
        return dict()
    user_record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": user.uid}, ["role", "status"]
    )
    if not user_record:
        return {"uid": user.uid}
    return {**user_record, "uid": user.uid}


@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def apply(
    user: Annotated[User, Depends(require_user_identity)],
    raw_application_data: Annotated[RawApplicationData, Depends(RawApplicationData)],
    resume: Optional[UploadFile] = None,
) -> str:
    # Check if current datetime is past application deadline
    now = datetime.now(timezone.utc)

    if _is_past_deadline(now):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Applications have closed.")

    # check if email is already in database
    EXISTING_RECORD = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": user.uid}
    )

    if EXISTING_RECORD and "status" in EXISTING_RECORD:
        log.error("User %s has already applied.", user)
        raise HTTPException(status.HTTP_400_BAD_REQUEST)

    raw_app_data_dump = raw_application_data.model_dump()

    for field in ["pronouns", "ethnicity", "school", "major"]:
        if raw_app_data_dump[field] == "other":
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "Please enable JavaScript on your browser.",
            )

    if resume is not None and resume.size and resume.size > 0:
        try:
            resume_url = await resume_handler.upload_resume(
                raw_application_data, resume
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

    processed_application_data = ProcessedApplicationData(
        **raw_app_data_dump,
        resume_url=resume_url,
        submission_time=now,
    )
    applicant = Applicant(
        uid=user.uid,
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
            user.email, applicant.application_data
        )
    except RuntimeError:
        log.error("Could not send confirmation email with SendGrid to %s.", user.uid)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    # TODO: handle inconsistent results if one service fails

    log.info("%s submitted an application", user.uid)
    return (
        "Thank you for submitting an application to IrvineHacks 2024! Please "
        + "visit https://irvinehacks.com/portal to see your application status."
    )


@router.get("/waiver")
async def request_waiver(
    user: Annotated[tuple[User, Applicant], Depends(require_accepted_applicant)]
) -> RedirectResponse:
    """Request to sign the participant waiver through DocuSign."""
    # TODO: non-applicants might also want to request a waiver
    user_data, applicant = user
    application_data = applicant.application_data

    if applicant.status in (Status.WAIVER_SIGNED, Status.CONFIRMED):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Already submitted a waiver.")

    user_name = f"{application_data.first_name} {application_data.last_name}"

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
