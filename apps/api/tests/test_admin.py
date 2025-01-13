from datetime import datetime
from typing import Any
from unittest.mock import ANY, AsyncMock, call, patch

from fastapi import FastAPI

from auth import user_identity
from auth.user_identity import NativeUser, UserTestClient
from models.ApplicationData import Decision
from models.user_record import Status
from routers import admin
from services.mongodb_handler import Collection
from services.sendgrid_handler import Template

user_identity.JWT_SECRET = "not a good idea"

USER_ICSSC = NativeUser(
    ucinetid="icssc",
    display_name="ICSSC",
    email="icssc@uci.edu",
    affiliations=["group"],
)

USER_REVIEWER = NativeUser(
    ucinetid="alicia",
    display_name="Alicia",
    email="alicia@uci.edu",
    affiliations=["student"],
)

HACKER_REVIEWER_IDENTITY = {
    "_id": "edu.uci.alicia",
    "roles": ["Organizer", "Hacker Reviewer"],
}

USER_DIRECTOR = NativeUser(
    ucinetid="dir",
    display_name="Dir",
    email="dir@uci.edu",
    affiliations=["student"],
)

DIRECTOR_IDENTITY = {"_id": "edu.uci.dir", "roles": ["Organizer", "Director"]}

app = FastAPI()
app.include_router(admin.router)

reviewer_client = UserTestClient(USER_REVIEWER, app)

director_client = UserTestClient(USER_DIRECTOR, app)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_restricted_admin_route_is_forbidden(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that an admin route is forbidden to an unauthorized user."""
    unauthorized_client = UserTestClient(USER_ICSSC, app)

    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.icssc",
        "roles": ["Mentor"],
    }
    res = unauthorized_client.get("/applicants/hackers")

    mock_mongodb_handler_retrieve_one.assert_awaited_once()
    assert res.status_code == 403


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_retrieve_applicants(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    """Test that the applicants summary can be processed."""

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        {"accept": 8, "waitlist": 5},
    ]
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "status": "REVIEWED",
            "application_data": {
                "school": "UC Irvine",
                "submission_time": datetime(2023, 1, 12, 9, 0, 0),
                "reviews": [
                    [datetime(2023, 1, 18), "edu.uci.alicia", 8],
                    [datetime(2023, 1, 18), "edu.uci.albert", 9],
                ],
            },
        },
    ]

    res = reviewer_client.get("/applicants/hackers")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once()
    data = res.json()
    assert data == [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "avg_score": 8.5,
            "reviewers": ["edu.uci.albert", "edu.uci.alicia"],
            "status": "REVIEWED",
            "decision": "ACCEPTED",
            "application_data": {
                "school": "UC Irvine",
                "submission_time": "2023-01-12T09:00:00",
            },
        },
    ]


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_cannot_retrieve_applicants_without_role(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    """Test that the applicants cannot be processed without correct reviewer role."""

    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY

    res = reviewer_client.get("/applicants/mentors")

    assert res.status_code == 403
    mock_mongodb_handler_retrieve.assert_not_awaited()


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_submit_nonhacker_review(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a user can properly submit a nonhacker applicant review."""
    post_data = {"applicant": "edu.uci.sydnee", "score": 0}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Mentor"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.sydnee"},
        {
            "$push": {"application_data.reviews": (ANY, "edu.uci.alicia", 0)},
            "$set": {"status": "REVIEWED"},
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_submit_hacker_review_with_one_reviewer_works(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a user can properly submit a hacker applicant review."""
    post_data = {"applicant": "edu.uci.sydnee", "score": 0}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.sydnee"},
        {
            "$push": {"application_data.reviews": (ANY, "edu.uci.alicia", 0)},
            "$set": {"status": "REVIEWED"},
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_submit_hacker_review_with_two_reviewers_works(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a user can submit a hacker applicant review with 2 reviewers."""
    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post(
        "/review", json={"applicant": "edu.uci.sydnee", "score": 0}
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.sydnee"},
        {
            "$push": {"application_data.reviews": (ANY, "edu.uci.alicia", 0)},
            "$set": {"status": "REVIEWED"},
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_submit_hacker_review_with_three_reviewers_fails(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a hacker applicant review with 3 reviewers fails."""
    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia3", 100],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post(
        "/review", json={"applicant": "edu.uci.sydnee", "score": 0}
    )

    assert res.status_code == 403


@patch("services.mongodb_handler.update", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_confirm_attendance_route(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mognodb_handler_update: AsyncMock,
) -> None:
    """Test that confirmed status changes to void with accepted."""

    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uc.tester",
            "status": Decision.ACCEPTED,
        },
        {
            "_id": "edu.uc.tester2",
            "status": Status.WAIVER_SIGNED,
        },
        {
            "_id": "edu.uc.tester3",
            "status": Status.CONFIRMED,
        },
        {
            "_id": "edu.uc.tester4",
            "status": Decision.WAITLISTED,
        },
    ]

    # Not doing this will result in the return value acting as a mock, which would be
    # tracked in the assert_has_calls below.
    mock_mognodb_handler_update.side_effect = [True, True, True]

    res = director_client.post("/confirm-attendance")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once()
    mock_mognodb_handler_update.assert_has_calls(
        [
            call(
                Collection.USERS,
                {"_id": {"$in": ("edu.uc.tester3",)}},
                {"status": Status.ATTENDING},
            ),
            call(
                Collection.USERS,
                {"_id": {"$in": ("edu.uc.tester",)}},
                {"status": Status.VOID},
            ),
            call(
                Collection.USERS,
                {"_id": {"$in": ("edu.uc.tester2",)}},
                {"status": Status.VOID},
            ),
        ]
    )


@patch("services.sendgrid_handler.send_email", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_waitlisted_applicant_can_be_released(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_sendgrid_handler_send_email: AsyncMock,
) -> None:
    """Test waitlisted applicant can be promoted to accepted."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {
            "status": Decision.WAITLISTED,
            "first_name": "Peter",
        },
    ]
    mock_mongodb_handler_update_one.return_value = True

    res = director_client.post("/waitlist-release/edu.uci.petr")
    assert res.status_code == 200

    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS, {"_id": "edu.uci.petr"}, {"status": Decision.ACCEPTED}
    )
    mock_sendgrid_handler_send_email.assert_awaited_once_with(
        Template.WAITLIST_RELEASE_EMAIL,
        ANY,
        {"email": "petr@uci.edu", "first_name": "Peter"},
        False,
    )


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_non_waitlisted_applicant_cannot_be_released(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """Test non-waitlisted applicant cannot be promoted to accepted."""
    mock_mongodb_handler_retrieve_one.side_effect = [DIRECTOR_IDENTITY, None]

    res = director_client.post("/waitlist-release/who.am.i")
    assert res.status_code == 404

    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_hacker_applicants_returns_correct_applicants(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that the /applicants/hackers route returns correctly"""
    returned_records: list[dict[str, object]] = [
        {
            "_id": "edu.uci.sydnee",
            "first_name": "sydnee",
            "last_name": "unknown",
            "status": "REVIEWED",
            "application_data": {
                "school": "Hamburger University",
                "submission_time": datetime(2023, 1, 12, 9, 0, 0),
                "reviews": [
                    [datetime(2023, 1, 19), "edu.uci.alicia", 100],
                    [datetime(2023, 1, 19), "edu.uci.alicia2", 200],
                ],
            },
        }
    ]

    expected_records = [
        {
            "_id": "edu.uci.sydnee",
            "first_name": "sydnee",
            "last_name": "unknown",
            "status": "REVIEWED",
            "decision": "ACCEPTED",
            "avg_score": 150,
            "reviewers": ["edu.uci.alicia", "edu.uci.alicia2"],
            "application_data": {
                "school": "Hamburger University",
                "submission_time": "2023-01-12T09:00:00",
            },
        },
    ]

    returned_thresholds: dict[str, object] = {"accept": 12, "waitlist": 5}

    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_thresholds,
    ]

    res = reviewer_client.get("/applicants/hackers")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once()
    data = res.json()
    assert data == expected_records


@patch("routers.admin._process_records_in_batches", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_release_hacker_decisions_works(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_admin_process_records_in_batches: AsyncMock,
) -> None:
    """Test that the /release/hackers route works"""
    returned_records: list[dict[str, Any]] = [
        {
            "_id": "edu.uci.sydnee",
            "first_name": "sydnee",
            "application_data": {
                "reviews": [
                    [datetime(2023, 1, 19), "edu.uci.alicia", 100],
                    [datetime(2023, 1, 19), "edu.uci.alicia2", 300],
                ]
            },
        }
    ]

    threshold_record: dict[str, Any] = {"accept": 10, "waitlist": 5}

    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        threshold_record,
    ]
    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_admin_process_records_in_batches.return_value = None

    res = reviewer_client.post("/release/hackers")

    assert res.status_code == 200
    assert returned_records[0]["decision"] == Decision.ACCEPTED


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_set_thresholds_correctly(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that the /set-thresholds route returns correctly"""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = reviewer_client.post(
        "/set-thresholds", json={"accept": "12", "waitlist": "5"}
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "hacker_score_thresholds"},
        {"$set": {"accept": 10, "waitlist": 5}},
        upsert=True,
    )


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_set_thresholds_with_empty_string_correctly(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that the /set-thresholds route returns correctly with -1"""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = reviewer_client.post(
        "/set-thresholds", json={"accept": "10", "waitlist": "-1"}
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "hacker_score_thresholds"},
        {"$set": {"accept": 10}},
        upsert=True,
    )


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_organizer_set_thresholds_forbidden(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test whether anyone below a director can change threshold."""
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY

    res = reviewer_client.post(
        "/set-thresholds", json={"accept": "12", "waitlist": "5"}
    )

    assert res.status_code == 403


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_review_on_invalid_value(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a reviewer cannot submit an invalid value."""
    post_data = {"applicant": "edu.uci.sydnee", "score": -100}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Mentor"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 400


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_error_on_hacker_invalid_value(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test for error on hacker with invalid value."""
    post_data = {"applicant": "edu.uci.sydnee", "score": 100}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 0],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 400
