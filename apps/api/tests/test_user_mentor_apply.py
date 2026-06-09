import copy
from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

import bson
from aiogoogle import HTTPError
from fastapi import FastAPI
from pydantic import HttpUrl

from auth.user_identity import NativeUser, UserTestClient
from models.ApplicationData import ProcessedMentorApplicationData
from models.user_record import Applicant, Status, Role
from routers import user
from utils import resume_handler


TEST_DEADLINE = datetime(2026, 10, 1, 8, 0, 0, tzinfo=timezone.utc)
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
    "mentor_type": ["is_tech_mentor"],
    "pronouns": [],
    "ethnicity": "eth",
    "school": "UC Irvine",
    "major": "Computer Science",
    "education_level": "Fifth+ Year Undergraduate",
    "t_shirt_size": "XL",
    "dietary_restrictions": ["none"],
    "allergies": "",
    "ih_reference": ["friend"],
    "tech_experienced_technologies": [],
    "hardware_experienced_technologies": [],
    "design_experienced_tools": [],
    "git_experience": "2",
    "arduino_experience": "4",
    "figma_experience": "2",
    "github": "https://github.com",
    "portfolio": "",
    "linkedin": "",
    "mentor_prev_experience_saq1": "",
    "mentor_interest_saq2": "",
    "mentor_tech_saq3": "",
    "mentor_design_saq4": "",
    "mentor_interest_saq5": "",
    "character_head_index": "0",
    "character_body_index": "0",
    "character_feet_index": "0",
    "character_companion_index": "0",
    "friday_availability": ["12", "13"],
    "saturday_availability": ["14", "18"],
    "sunday_availability": ["9", "10"],
    "resume_share_to_sponsors": "true",
    "application_type": "Mentor",
    "email": "pkfire@uci.edu",
    "is_18_older": "true",
}

SAMPLE_ZOTHACKS_MENTOR_APPLICATION = {
    "first_name": "pk",
    "last_name": "fire",
    "application_type": "Mentor",
    "is_18_older": "true",
    "pronouns": ["he/him"],
    "dietary_restrictions": ["none"],
    "allergies": "",
    "phone_number": "9495551234",
    "discord_username": "pkfire",
    "major": "Computer Science",
    "academic_status": "Undergraduate",
    "linkedin": "",
    "github": "https://github.com",
    "portfolio": "",
    "tech_stack_frq": "Python, TypeScript, and React.",
    "frontend_backend_frq": "I can help with both frontend and backend.",
    "teaching_experience_frq": "I have mentored classmates in project courses.",
    "team_leadership_frq": "I led a small project team.",
    "comments": "Excited for ZotHacks.",
    "skill_python": "5",
    "skill_java": "4",
    "skill_c__": "3",
    "skill_javascript": "5",
    "skill_c_": "2",
    "skill_html_css": "5",
    "skill_react": "5",
    "skill_next_js": "4",
    "skill_github_pages": "3",
    "skill_other": "1",
    "skill_git": "5",
    "skill_sql__any_variation_": "3",
    "skill_aws_services": "2",
    "skill_vercel": "4",
    "skill_netlify": "3",
}


SAMPLE_RESUME = ("my-resume.pdf", b"resume", "application/pdf")
SAMPLE_FILES = {"resume": SAMPLE_RESUME}
BAD_RESUME = ("bad-resume.doc", b"resume", "application/msword")
LARGE_RESUME = ("large-resume.pdf", b"resume" * 2_000_000, "application/pdf")

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


EXPECTED_USER = Applicant(
    uid="edu.uci.pkfire",
    first_name="pk",
    last_name="fire",
    roles=(Role.APPLICANT, Role.MENTOR),
    application_data=EXPECTED_APPLICATION_DATA,
    status=Status.PENDING_REVIEW,
)

resume_handler.IRVINEHACKS_MENTOR_RESUMES_FOLDER_ID = "MENTOR_RESUMES_FOLDER_ID"

app = FastAPI()
app.include_router(user.router)

client = UserTestClient(USER_PKFIRE, app)


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
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
    mock_raw_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_gdrive_handler_upload_file.return_value = SAMPLE_RESUME_URL
    mock_datetime.now.return_value = SAMPLE_SUBMISSION_TIME
    mock_is_past_deadline.return_value = False
    res = client.post("/mentor", data=SAMPLE_APPLICATION, files=SAMPLE_FILES)

    mock_gdrive_handler_upload_file.assert_awaited_once_with(
        resume_handler.IRVINEHACKS_MENTOR_RESUMES_FOLDER_ID, *EXPECTED_RESUME_UPLOAD
    )
    mock_raw_update_one.assert_awaited_once()
    mock_send_application_confirmation_email.assert_awaited_once_with(
        USER_EMAIL, EXPECTED_USER, Role.MENTOR
    )
    assert res.status_code == 201


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("routers.user._is_past_deadline", autospec=True)
@patch("routers.user.datetime", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_zothacks_mentor_apply_successfully(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_datetime: Mock,
    mock_is_past_deadline: Mock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_raw_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_datetime.now.return_value = SAMPLE_SUBMISSION_TIME
    mock_is_past_deadline.return_value = False

    res = client.post("/mentor", data=SAMPLE_ZOTHACKS_MENTOR_APPLICATION)

    assert res.status_code == 201
    mock_raw_update_one.assert_awaited_once()
    applicant = mock_raw_update_one.await_args.args[2]["$set"]
    application_data = applicant["application_data"]
    assert application_data["tech_stack_frq"] == "Python, TypeScript, and React."
    assert application_data["frontend_backend_frq"] == (
        "I can help with both frontend and backend."
    )
    assert application_data["teaching_experience_frq"] == (
        "I have mentored classmates in project courses."
    )
    assert application_data["team_leadership_frq"] == "I led a small project team."
    assert application_data["skill_python"] == 5
    assert application_data["skill_sql__any_variation_"] == 3
    assert application_data["github"] == "https://github.com/"
    assert application_data["linkedin"] is None
    assert application_data["resume_url"] is None
    mock_send_application_confirmation_email.assert_awaited_once()


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_with_invalid_data_causes_422(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    bad_application = SAMPLE_APPLICATION.copy()
    bad_application["github"] = "ht."
    res = client.post("/mentor", data=bad_application, files=SAMPLE_FILES)

    mock_mongodb_handler_retrieve_one.assert_not_called()
    assert res.status_code == 422


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_with_invalid_application_type_causes_422(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    bad_application = SAMPLE_APPLICATION.copy()
    bad_application["application_type"] = "NotValid"
    res = client.post("/mentor", data=bad_application, files=SAMPLE_FILES)

    mock_mongodb_handler_retrieve_one.assert_not_called()
    assert res.status_code == 422


@patch("services.gdrive_handler.upload_file", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_when_user_exists_causes_400(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_gdrive_handler_upload_file: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.pkfire",
        "roles": ["applicant"],
    }
    res = client.post("/mentor", data=SAMPLE_APPLICATION, files=SAMPLE_FILES)

    mock_gdrive_handler_upload_file.assert_not_called()
    assert res.status_code == 400


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_with_invalid_resume_type_causes_415(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    res = client.post("/mentor", data=SAMPLE_APPLICATION, files={"resume": BAD_RESUME})

    assert res.status_code == 415


@patch("services.gdrive_handler.upload_file", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_with_large_resume_causes_413(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_gdrive_handler_upload_file: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    res = client.post(
        "/mentor", data=SAMPLE_APPLICATION, files={"resume": LARGE_RESUME}
    )

    mock_gdrive_handler_upload_file.assert_not_called()
    assert res.status_code == 413


@patch("services.gdrive_handler.upload_file", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_with_resume_upload_issue_causes_500(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_gdrive_handler_upload_file: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_gdrive_handler_upload_file.side_effect = HTTPError("Google Drive error")

    res = client.post("/mentor", data=SAMPLE_APPLICATION, files=SAMPLE_FILES)

    assert res.status_code == 500


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.gdrive_handler.upload_file", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_with_user_insert_issue_causes_500(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_gdrive_handler_upload_file: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_raw_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_gdrive_handler_upload_file.return_value = SAMPLE_RESUME_URL
    mock_raw_update_one.side_effect = RuntimeError
    res = client.post("/mentor", data=SAMPLE_APPLICATION, files=SAMPLE_FILES)

    assert res.status_code == 500
    mock_raw_update_one.assert_awaited_once()
    mock_send_application_confirmation_email.assert_not_called()


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.gdrive_handler.upload_file", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_apply_with_confirmation_email_issue_causes_500(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_gdrive_handler_upload_file: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_raw_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_gdrive_handler_upload_file.return_value = SAMPLE_RESUME_URL
    mock_send_application_confirmation_email.side_effect = RuntimeError

    res = client.post("/mentor", data=SAMPLE_APPLICATION, files=SAMPLE_FILES)

    assert res.status_code == 500
    mock_raw_update_one.assert_awaited_once()
    mock_send_application_confirmation_email.assert_awaited_once()


def test_mentor_application_data_is_bson_encodable() -> None:
    data = EXPECTED_APPLICATION_DATA.model_copy()
    data.linkedin = HttpUrl("https://linkedin.com")
    encoded = bson.encode(EXPECTED_APPLICATION_DATA.model_dump())
    assert len(encoded) == 1023


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_mentor_application_data_with_other_throws_422(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = None
    contains_other = copy.deepcopy(SAMPLE_APPLICATION)
    contains_other["pronouns"].append("other")  # type: ignore[attr-defined]
    res = client.post("/mentor", data=contains_other, files=SAMPLE_FILES)
    assert res.status_code == 422


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("routers.user._is_past_deadline", autospec=True)
def test_mentor_past_deadline_causes_403(
    mock_is_past_deadline: Mock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_is_past_deadline.return_value = True
    res = client.post("/mentor", data=SAMPLE_APPLICATION, files=SAMPLE_FILES)

    mock_mongodb_handler_retrieve_one.assert_not_called()
    assert res.status_code == 403
