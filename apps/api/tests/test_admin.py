from datetime import datetime
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

REVIEWER_IDENTITY = {
    "_id": "edu.uci.alicia",
    "roles": ["Organizer", "Reviewer"],
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
    res = unauthorized_client.get("/applicants")

    mock_mongodb_handler_retrieve_one.assert_awaited_once()
    assert res.status_code == 403


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_retrieve_applicants(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    """Test that the applicants summary can be processed."""

    mock_mongodb_handler_retrieve_one.return_value = REVIEWER_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "status": "REVIEWED",
            "application_data": {
                "school": "UC Irvine",
                "submission_time": datetime(2023, 1, 12, 9, 0, 0),
                "reviews": [[datetime(2023, 1, 18), "edu.uci.alicia", "ACCEPTED"]],
            },
        },
    ]

    res = reviewer_client.get("/applicants")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once()
    data = res.json()
    assert data == [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "status": "REVIEWED",
            "decision": "ACCEPTED",
            "application_data": {
                "school": "UC Irvine",
                "submission_time": "2023-01-12T09:00:00",
            },
        },
    ]


def test_can_include_decision_from_reviews() -> None:
    """Test that a decision can be provided for an applicant with reviews."""
    record = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [[datetime(2023, 1, 19), "edu.uci.alicia", "ACCEPTED"]],
        },
    }

    admin._include_review_decision(record)
    assert record["decision"] == "ACCEPTED"


def test_no_decision_from_no_reviews() -> None:
    """Test that a decision is None for an applicant with no reviews."""
    record = {
        "_id": "edu.uci.pham",
        "status": "PENDING_REVIEW",
        "application_data": {
            "reviews": [],
        },
    }

    admin._include_review_decision(record)
    assert record["decision"] is None


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_submit_review(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a user can properly submit an applicant review."""

    mock_mongodb_handler_retrieve_one.return_value = REVIEWER_IDENTITY

    res = reviewer_client.post(
        "/review",
        json={"applicant": "edu.uci.applicant", "decision": Decision.ACCEPTED},
    )

    mock_mongodb_handler_retrieve_one.assert_awaited_once()
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.applicant"},
        {
            "$push": {
                "application_data.reviews": (ANY, "edu.uci.alicia", Decision.ACCEPTED)
            },
            "$set": {"status": "REVIEWED"},
        },
    )
    assert res.status_code == 200


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

    assert res.status_code == 200


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
