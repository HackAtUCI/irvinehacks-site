"""Tests for admin.participant_manager (event/subevent check-in, etc.)."""

from unittest.mock import AsyncMock, patch

from auth.user_identity import NativeUser
from services.mongodb_handler import Collection

from admin import participant_manager

USER_ASSOCIATE = NativeUser(
    ucinetid="assoc",
    display_name="Associate",
    email="assoc@uci.edu",
    affiliations=["student"],
)


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_subevent_checkin_success(
    mock_retrieve_one: AsyncMock,
    mock_raw_update_one: AsyncMock,
) -> None:
    """Subevent check-in succeeds when event exists and UID not already checked in."""
    event_id = "event1"
    uid = "user1"

    mock_retrieve_one.return_value = {"_id": event_id, "checkins": {}}
    mock_raw_update_one.return_value = True

    await participant_manager.subevent_checkin(event_id, uid, USER_ASSOCIATE)

    mock_retrieve_one.assert_awaited_once_with(
        Collection.EVENTS, {"_id": event_id}, ["checkins"]
    )
    mock_raw_update_one.assert_awaited_once()
    call_args = mock_raw_update_one.call_args
    assert call_args[0][0] == Collection.EVENTS
    assert call_args[0][1] == {"_id": event_id}
    assert "$set" in call_args[0][2]
    assert "checkins" in call_args[0][2]["$set"]
    assert call_args[0][2]["$set"]["checkins"].get(uid) is not None
