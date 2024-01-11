from datetime import datetime, timezone
from logging import getLogger
from typing import Annotated, Optional, Union

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr

from auth import user_identity
from auth.user_identity import User, require_user_identity, use_user_identity
from models.ApplicationData import ProcessedApplicationData, RawApplicationData
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils import email_handler, resume_handler
from utils.user_record import Applicant, Role, Status

log = getLogger(__name__)

router = APIRouter()

deadline = datetime(2024, 1, 15, 7, 59, tzinfo=timezone.utc)

class IdentityResponse(BaseModel):
    uid: Union[str, None] = None
    status: Union[str, None] = None
    role: Union[Role, None] = None


def _is_past_deadline(now: datetime) -> bool:
    return now > deadline


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
        Collection.USERS, {"_id": user.uid}
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
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Applications have closed."
        )

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
