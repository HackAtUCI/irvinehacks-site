from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

from fastapi import FastAPI
from pydantic import HttpUrl

from auth.user_identity import NativeUser, UserTestClient
from models.ApplicationData import (
    ProcessedMentorApplicationData,
)
from models.user_record import Applicant, Status, Role
from routers import user
from services.mongodb_handler import Collection
from utils import resume_handler

# Tests will break again next year, tech should notice and fix :P
TEST_DEADLINE = datetime(2025, 10, 1, 8, 0, 0, tzinfo=timezone.utc)
user.DEADLINE = TEST_DEADLINE

USER_EMAIL = "pkfire@uci.edu"
USER_PKFIRE = NativeUser(
    ucinetid="pkfire",
    display_name="pkfire",
    email=USER_EMAIL,
    affiliations=["pkfire"],
)

SAMPLE_APPLICATION = {
    "first_name": "pk",
    "last_name": "fire",
    "experienced_technologies": "",
    "pronouns": "",
    "is_18_older": "true",
    "school": "UC Irvine",
    "education_level": "Fifth+ Year Undergraduate",
    "major": "Computer Science",
    "git_experience": "2",
    "github": "https://github.com",
    "portfolio": "",
    "linkedin": "",
    "mentor_prev_experience_saq1": "",
    "mentor_interest_saq2": "",
    "mentor_team_help_saq3": "",
    "mentor_team_help_saq4": "",
    "other_questions": "",
    "application_type": "MENTOR",
}


SAMPLE_RESUME = ("my-resume.pdf", b"resume", "application/pdf")
SAMPLE_FILES = {"resume": SAMPLE_RESUME}
BAD_RESUME = ("bad-resume.doc", b"resume", "application/msword")
LARGE_RESUME = ("large-resume.pdf", b"resume" * 100_000, "application/pdf")
# The browser will send an empty file if not selected
EMPTY_RESUME = (
    "",
    b"",
    "application/octet-stream",
    {"content-disposition": 'form-data; name="resume"; filename=""'},
)

EXPECTED_RESUME_UPLOAD = ("pk-fire-69f2afc2.pdf", b"resume", "application/pdf")
SAMPLE_RESUME_URL = HttpUrl("https://drive.google.com/file/d/...")
SAMPLE_SUBMISSION_TIME = datetime(2024, 1, 12, 8, 1, 21, tzinfo=timezone.utc)
SAMPLE_VERDICT_TIME = None

EXPECTED_APPLICATION_DATA = ProcessedMentorApplicationData(
    **SAMPLE_APPLICATION,  # type: ignore[arg-type]
    resume_url=SAMPLE_RESUME_URL,
    submission_time=SAMPLE_SUBMISSION_TIME,
    verdict_time=SAMPLE_VERDICT_TIME,
)
assert EXPECTED_APPLICATION_DATA.linkedin is None

EXPECTED_APPLICATION_DATA_WITHOUT_RESUME = ProcessedMentorApplicationData(
    **SAMPLE_APPLICATION,  # type: ignore[arg-type]
    resume_url=None,
    submission_time=SAMPLE_SUBMISSION_TIME,
    verdict_time=SAMPLE_VERDICT_TIME,
)

EXPECTED_USER = Applicant(
    uid="edu.uci.pkfire",
    first_name="pk",
    last_name="fire",
    roles=(Role.APPLICANT, Role.MENTOR),
    application_data=EXPECTED_APPLICATION_DATA,
    status=Status.PENDING_REVIEW,
)

EXPECTED_USER_WITHOUT_RESUME = Applicant(
    uid="edu.uci.pkfire",
    first_name="pk",
    last_name="fire",
    roles=(Role.APPLICANT, Role.HACKER),
    status=Status.PENDING_REVIEW,
    application_data=EXPECTED_APPLICATION_DATA_WITHOUT_RESUME,
)

resume_handler.RESUMES_FOLDER_ID = "RESUMES_FOLDER_ID"

app = FastAPI()
app.include_router(user.router)

client = UserTestClient(USER_PKFIRE, app)


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("routers.user._is_past_deadline", autospec=True)
@patch("routers.user.datetime", autospec=True)
@patch("services.gdrive_handler.upload_file", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_successfully(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_gdrive_handler_upload_file: AsyncMock,
    mock_datetime: Mock,
    mock_is_past_deadline: Mock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    """Test that a valid application is submitted properly."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_gdrive_handler_upload_file.return_value = SAMPLE_RESUME_URL
    mock_datetime.now.return_value = SAMPLE_SUBMISSION_TIME
    mock_is_past_deadline.return_value = False
    res = client.post("/mentor", data=SAMPLE_APPLICATION, files=SAMPLE_FILES)

    mock_gdrive_handler_upload_file.assert_awaited_once_with(
        resume_handler.RESUMES_FOLDER_ID, *EXPECTED_RESUME_UPLOAD
    )
    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": EXPECTED_USER.uid},
        EXPECTED_USER.model_dump(),
        upsert=True,
    )
    mock_send_application_confirmation_email.assert_awaited_once_with(
        USER_EMAIL, EXPECTED_USER, Role.MENTOR
    )
    assert res.status_code == 201
