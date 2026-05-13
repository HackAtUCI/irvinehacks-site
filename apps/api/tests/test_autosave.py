from unittest.mock import AsyncMock, Mock, patch

from fastapi import FastAPI

from routers import user
from auth.user_identity import NativeUser, UserTestClient

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
