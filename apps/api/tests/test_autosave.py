from unittest.mock import AsyncMock, patch

from fastapi import FastAPI

from routers import user
from auth.user_identity import NativeUser, UserTestClient

# Create test app
app = FastAPI()
app.include_router(user.router)

TEST_USER = NativeUser(
    ucinetid="test",
    display_name="Test User",
    email="test@uci.edu",
    affiliations=["student"],
)

client = UserTestClient(TEST_USER, app)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_autosave_draft(
    mock_raw_update_one: AsyncMock,
    mock_retrieve_one: AsyncMock,
) -> None:
    """Test that autosave draft works when user has no existing role."""
    # No existing role → allow draft
    mock_retrieve_one.return_value = None
    mock_raw_update_one.return_value = True

    res = client.post(
        "/application/draft",
        json={
            "application_type": "Hacker",
            "fields": {"frq_change": "test"},
        },
    )

    assert res.status_code == 204