from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

import bson
from fastapi import FastAPI

from auth.user_identity import NativeUser, UserTestClient
from models.ApplicationData import ProcessedVolunteerData
from models.user_record import Applicant, Status, Role
from routers import user
from services.mongodb_handler import Collection

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

BASE_APPLICATION = {
    "first_name": "pk",
    "last_name": "fire",
    "ethnicity": "E#",
    "pronouns": ["adjectives"],
    "is_18_older": "true",
    "school": "UC Irvine",
    "education_level": "Fifth+ Year Undergraduate",
    "major": "Computer Science",
    "applied_before": "false",
    "frq_volunteer": "",
    "frq_utensil": "",
    "other_questions": "",
    "application_type": "Volunteer",
}

SAMPLE_APPLICATION = {
    **BASE_APPLICATION,
    "friday_availability": "{}",
    "saturday_availability": "{}",
    "sunday_availability": "{}",
}

SAMPLE_SUBMISSION_TIME = datetime(2024, 1, 12, 8, 1, 21, tzinfo=timezone.utc)
SAMPLE_VERDICT_TIME = None

EXPECTED_APPLICATION_DATA = ProcessedVolunteerData(
    **BASE_APPLICATION,  # type: ignore[arg-type]
    friday_availability={},
    saturday_availability={},
    sunday_availability={},
    submission_time=SAMPLE_SUBMISSION_TIME,
    verdict_time=SAMPLE_VERDICT_TIME,
)


EXPECTED_USER = Applicant(
    uid="edu.uci.pkfire",
    first_name="pk",
    last_name="fire",
    roles=(Role.APPLICANT, Role.VOLUNTEER),
    application_data=EXPECTED_APPLICATION_DATA,
    status=Status.PENDING_REVIEW,
)

app = FastAPI()
app.include_router(user.router)

client = UserTestClient(USER_PKFIRE, app)


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("routers.user._is_past_deadline", autospec=True)
@patch("routers.user.datetime", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_apply_successfully(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_datetime: Mock,
    mock_is_past_deadline: Mock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    """Test that a valid application is submitted properly."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_datetime.now.return_value = SAMPLE_SUBMISSION_TIME
    mock_is_past_deadline.return_value = False
    res = client.post("/volunteer", data=SAMPLE_APPLICATION)

    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": EXPECTED_USER.uid},
        EXPECTED_USER.model_dump(),
        upsert=True,
    )
    mock_send_application_confirmation_email.assert_awaited_once_with(
        USER_EMAIL, EXPECTED_USER, Role.VOLUNTEER
    )
    assert res.status_code == 201


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("routers.user._is_past_deadline", autospec=True)
@patch("routers.user.datetime", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_apply_with_non_empty_availability(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_datetime: Mock,
    mock_is_past_deadline: Mock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    """Testing the correctness of volunteer availabilities."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_datetime.now.return_value = SAMPLE_SUBMISSION_TIME
    mock_is_past_deadline.return_value = False
    new_app = SAMPLE_APPLICATION.copy()
    new_app["friday_availability"] = '{"5PM": true, "6PM": false}'
    res = client.post("/volunteer", data=new_app)

    new_expected = EXPECTED_USER.model_dump()

    new_expected["application_data"]["friday_availability"] = {
        "5PM": True,
        "6PM": False,
    }

    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": EXPECTED_USER.uid},
        new_expected,
        upsert=True,
    )

    mock_send_application_confirmation_email.assert_awaited_once_with(
        USER_EMAIL, Applicant(**new_expected), Role.VOLUNTEER
    )
    assert res.status_code == 201


@patch("routers.user._is_past_deadline", autospec=True)
@patch("routers.user.datetime", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_apply_with_invalid_availability_causes_422(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_datetime: Mock,
    mock_is_past_deadline: Mock,
) -> None:
    """Test that applying with invalid availability causes 422."""
    mock_datetime.now.return_value = SAMPLE_SUBMISSION_TIME
    mock_is_past_deadline.return_value = False
    mock_mongodb_handler_retrieve_one.return_value = None

    bad_application = SAMPLE_APPLICATION.copy()
    bad_application["friday_availability"] = "<3"
    res = client.post("/volunteer", data=bad_application)

    assert res.status_code == 422


@patch("routers.user._is_past_deadline", autospec=True)
@patch("routers.user.datetime", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_apply_with_invalid_application_type_causes_422(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_datetime: Mock,
    mock_is_past_deadline: Mock,
) -> None:
    """Test that applying with invalid data is unprocessable."""
    mock_datetime.now.return_value = SAMPLE_SUBMISSION_TIME
    mock_is_past_deadline.return_value = False
    mock_mongodb_handler_retrieve_one.return_value = None

    bad_application = SAMPLE_APPLICATION.copy()
    bad_application["application_type"] = "<3"
    res = client.post("/volunteer", data=bad_application)

    mock_mongodb_handler_retrieve_one.assert_not_called()
    assert res.status_code == 422


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_when_user_exists_causes_400(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that applying when a user already exists causes status 400."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.pkfire",
        "roles": ["applicant"],
    }
    res = client.post("/volunteer", data=SAMPLE_APPLICATION)
    assert res.status_code == 400


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_with_missing_data_causes_422(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that submitting volunteer form with missing data causes 422."""
    wrong_app = SAMPLE_APPLICATION.copy()
    wrong_app.pop("friday_availability", None)
    res = client.post("/volunteer", data=wrong_app)

    mock_mongodb_handler_retrieve_one.assert_not_called()
    assert res.status_code == 422


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_apply_with_user_insert_issue_causes_500(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    """Test that an issue with inserting a user into MongoDB causes status 500."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_mongodb_handler_update_one.side_effect = RuntimeError
    res = client.post("/volunteer", data=SAMPLE_APPLICATION)

    assert res.status_code == 500
    mock_mongodb_handler_update_one.assert_awaited_once()
    mock_send_application_confirmation_email.assert_not_called()


@patch("utils.email_handler.send_application_confirmation_email", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_volunteer_apply_with_confirmation_email_issue_causes_500(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_send_application_confirmation_email: AsyncMock,
) -> None:
    """Test that an issue with sending the confirmation email causes status 500."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_send_application_confirmation_email.side_effect = RuntimeError

    res = client.post("/volunteer", data=SAMPLE_APPLICATION)

    assert res.status_code == 500
    mock_mongodb_handler_update_one.assert_awaited_once()
    mock_send_application_confirmation_email.assert_awaited_once()


def test_volunteer_application_data_is_bson_encodable() -> None:
    """Test that application data model can be encoded into BSON to store in MongoDB."""
    encoded = bson.encode(EXPECTED_APPLICATION_DATA.model_dump())
    assert len(encoded) == 369


def test_volunteer_past_deadline_causes_403() -> None:
    """Test that users are forbidden from submitting applications past the deadline."""
    user.DEADLINE = datetime(2023, 12, 18, 20, 0, 0, tzinfo=timezone.utc)

    res = client.post("/volunteer", data=SAMPLE_APPLICATION)
    assert res.status_code == 403

    user.DEADLINE = TEST_DEADLINE
