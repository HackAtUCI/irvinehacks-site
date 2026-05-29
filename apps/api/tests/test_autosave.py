from unittest.mock import AsyncMock, Mock, patch

from fastapi import FastAPI

from routers import user
from auth.user_identity import NativeUser, UserTestClient
from services.mongodb_handler import Collection

app = FastAPI()
app.include_router(user.router)

TEST_USER = NativeUser(
    ucinetid="test",
    display_name="Test User",
    email="test@uci.edu",
    affiliations=["student"],
)

client = UserTestClient(TEST_USER, app)


@patch("routers.user._is_past_deadline", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_autosave_draft(
    mock_raw_update_one: AsyncMock,
    mock_retrieve_one: AsyncMock,
    mock_is_past_deadline: Mock,
) -> None:
    mock_retrieve_one.return_value = None
    mock_raw_update_one.return_value = None
    mock_is_past_deadline.return_value = False

    res = client.post(
        "/application/draft",
        json={
            "application_type": "Hacker",
            "fields": {"frq_change": "test"},
        },
    )

    assert res.status_code == 204


@patch("routers.user._is_past_deadline", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_autosave_draft_writes_under_per_type_key(
    mock_raw_update_one: AsyncMock,
    mock_retrieve_one: AsyncMock,
    mock_is_past_deadline: Mock,
) -> None:
    """Saving a draft must scope it by application type so other in-progress
    drafts (e.g. Hacker) are not overwritten when a different form (e.g.
    Volunteer) autosaves."""
    mock_retrieve_one.return_value = None
    mock_raw_update_one.return_value = None
    mock_is_past_deadline.return_value = False

    res = client.post(
        "/application/draft",
        json={
            "application_type": "Volunteer",
            "fields": {"frq_volunteer": "test"},
        },
    )

    assert res.status_code == 204
    mock_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.test"},
        {
            "$set": {
                "draft_application_data.Volunteer": {
                    "fields": {"frq_volunteer": "test"},
                },
            },
        },
        upsert=True,
    )


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_draft_returns_requested_type_only(
    mock_retrieve_one: AsyncMock,
) -> None:
    """GET should return the draft matching the requested application type
    and ignore drafts saved under a different type."""
    mock_retrieve_one.return_value = {
        "draft_application_data": {
            "Hacker": {"fields": {"frq_change": "hacker-value"}},
            "Volunteer": {"fields": {"frq_volunteer": "volunteer-value"}},
        }
    }

    res = client.get("/application/draft", params={"application_type": "Hacker"})

    assert res.status_code == 200
    assert res.json() == {
        "draft_application_data": {
            "application_type": "Hacker",
            "fields": {"frq_change": "hacker-value"},
        }
    }


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_draft_returns_none_when_type_missing(
    mock_retrieve_one: AsyncMock,
) -> None:
    mock_retrieve_one.return_value = {
        "draft_application_data": {
            "Hacker": {"fields": {"frq_change": "hacker-value"}},
        }
    }

    res = client.get("/application/draft", params={"application_type": "Mentor"})

    assert res.status_code == 200
    assert res.json() == {"draft_application_data": None}
