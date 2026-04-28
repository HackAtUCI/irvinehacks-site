from unittest.mock import AsyncMock, MagicMock, patch

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


@patch("services.mongodb_handler.get_database")
def test_autosave_draft(mock_db: MagicMock) -> None:
    """Test that autosave draft works when user has no existing role."""
    mock_collection = AsyncMock()
    mock_collection.find_one.return_value = None
    mock_collection.update_one.return_value = MagicMock(acknowledged=True)

    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection
    mock_db.return_value = mock_db_instance

    res = client.post(
        "/application/draft",
        json={
            "application_type": "Hacker",
            "fields": {"frq_change": "test"},
        },
    )

    assert res.status_code == 204