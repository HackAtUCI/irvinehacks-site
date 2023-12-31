from datetime import datetime
from unittest.mock import ANY, AsyncMock, patch

from fastapi import FastAPI

from auth import user_identity
from auth.user_identity import NativeUser, UserTestClient
from models.ApplicationData import Decision
from routers import admin
from services.mongodb_handler import Collection

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
    "role": "reviewer",
}

app = FastAPI()
app.include_router(admin.router)

reviewer_client = UserTestClient(USER_REVIEWER, app)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_restricted_admin_route_is_forbidden(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that an admin route is forbidden to an unauthorized user."""
    unauthorized_client = UserTestClient(USER_ICSSC, app)

    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.icssc",
        "role": "mentor",
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
            "status": "REVIEWED",
            "application_data": {
                "first_name": "Peter",
                "last_name": "Anteater",
                "university": "UC Irvine",
                "submission_time": datetime(2023, 1, 12, 9, 0, 0),
                "reviews": [[datetime(2023, 1, 18), "edu.uci.alicia", "ACCEPTED"]],
            },
        },
    ]

    res = reviewer_client.get("/applicants")

    mock_mongodb_handler_retrieve.assert_awaited_once()
    assert res.status_code == 200
    data = res.json()
    assert data == [
        {
            "_id": "edu.uci.petr",
            "status": "REVIEWED",
            "decision": "ACCEPTED",
            "application_data": {
                "first_name": "Peter",
                "last_name": "Anteater",
                "university": "UC Irvine",
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
            "first_name": "Sydnee",
            "last_name": "Tan",
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
            "first_name": "Nicole",
            "last_name": "Pham",
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
