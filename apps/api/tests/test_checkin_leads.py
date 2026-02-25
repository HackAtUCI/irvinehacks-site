import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from routers.checkin_leads import (
    queue_removal,
    queue_participants,
    close_walkins,
    _process_status,
)
from routers.user import DEFAULT_CHECKIN_TIME
from models.user_record import Role, Status
from models.ApplicationData import Decision
from services.mongodb_handler import Collection


@pytest.mark.asyncio
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("routers.checkin_leads._process_decision", autospec=True)
@patch("routers.checkin_leads._process_status", autospec=True)
async def test_queue_removal_success(
    mock_process_status: AsyncMock,
    mock_process_decision: AsyncMock,
    mock_retrieve: AsyncMock,
) -> None:
    mock_retrieve.return_value = [
        {"_id": "user1"},
        {"_id": "user2"},
    ]

    await queue_removal()

    mock_retrieve.assert_awaited_once_with(
        Collection.USERS,
        {
            "roles": Role.HACKER,
            "status": Status.CONFIRMED,
            "arrival_time": DEFAULT_CHECKIN_TIME,
        },
    )
    mock_process_decision.assert_awaited_once_with(
        ("user1", "user2"), Decision.WAITLISTED, no_modifications_ok=True
    )
    mock_process_status.assert_awaited_once_with(
        ("user1", "user2"), Status.WAIVER_SIGNED
    )


@pytest.mark.asyncio
@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_queue_removal_no_records(mock_retrieve: AsyncMock) -> None:
    mock_retrieve.return_value = []

    await queue_removal()

    mock_retrieve.assert_awaited_once()


@pytest.mark.asyncio
@patch("routers.checkin_leads.queue_removal", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("admin.participant_manager.get_attending_and_late_hackers", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("routers.checkin_leads._process_status", autospec=True)
@patch("services.sendgrid_handler.send_email", autospec=True)
@patch("routers.checkin_leads.recover_email_from_uid", autospec=True)
async def test_queue_participants_success(
    mock_recover_email: MagicMock,
    mock_send_email: AsyncMock,
    mock_process_status: AsyncMock,
    mock_retrieve_users: AsyncMock,
    mock_update_settings: AsyncMock,
    mock_get_attending_and_late_hackers: AsyncMock,
    mock_retrieve_settings: AsyncMock,
    mock_queue_removal: AsyncMock,
) -> None:
    mock_retrieve_settings.return_value = {"users_queue": ["user1", "user2", "user3"]}
    mock_get_attending_and_late_hackers.return_value = [object()] * 390  # 390 attending
    # HACKER_WAITLIST_MAX is 400, so 10 spots

    mock_retrieve_users.return_value = [
        {"_id": "user1", "first_name": "F1"},
        {"_id": "user2", "first_name": "F2"},
    ]
    mock_recover_email.return_value = "test@uci.edu"

    await queue_participants()

    mock_queue_removal.assert_awaited_once()
    mock_update_settings.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "queue"},
        {"$pull": {"users_queue": {"$in": ["user1", "user2", "user3"]}}},
    )
    mock_process_status.assert_awaited_once_with(("user1", "user2"), Status.CONFIRMED)
    mock_send_email.assert_awaited_once()


@pytest.mark.asyncio
@patch("routers.checkin_leads.queue_removal", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("admin.participant_manager.get_attending_and_late_hackers", autospec=True)
@patch("routers.checkin_leads.HACKER_WAITLIST_MAX", 5)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("routers.checkin_leads._process_status", autospec=True)
@patch("services.sendgrid_handler.send_email", autospec=True)
async def test_queue_participants_with_small_max(
    mock_send_email: AsyncMock,
    mock_process_status: AsyncMock,
    mock_retrieve_users: AsyncMock,
    mock_update_settings: AsyncMock,
    mock_get_attending_and_late_hackers: AsyncMock,
    mock_retrieve_settings: AsyncMock,
    mock_queue_removal: AsyncMock,
) -> None:
    # Test with HACKER_WAITLIST_MAX = 5
    mock_retrieve_settings.return_value = {"users_queue": ["user1", "user2", "user3"]}
    mock_get_attending_and_late_hackers.return_value = [
        object()
    ] * 3  # 3 attending, so 2 spots

    mock_retrieve_users.return_value = [
        {"_id": "user1", "first_name": "F1"},
        {"_id": "user2", "first_name": "F2"},
    ]

    await queue_participants()

    # Should only promote 2 users
    mock_update_settings.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "queue"},
        {"$pull": {"users_queue": {"$in": ["user1", "user2"]}}},
    )
    mock_process_status.assert_awaited_once_with(("user1", "user2"), Status.CONFIRMED)


@pytest.mark.asyncio
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.sendgrid_handler.send_email", autospec=True)
@patch("routers.checkin_leads.recover_email_from_uid", autospec=True)
async def test_close_walkins_success(
    mock_recover_email: MagicMock,
    mock_send_email: AsyncMock,
    mock_retrieve: AsyncMock,
) -> None:
    mock_retrieve.return_value = [
        {"_id": "user1", "first_name": "F1"},
    ]
    mock_recover_email.return_value = "test@uci.edu"

    await close_walkins()

    mock_retrieve.assert_awaited_once()
    mock_send_email.assert_awaited_once()


@pytest.mark.asyncio
@patch("services.mongodb_handler.update", autospec=True)
async def test_process_status_success(mock_update: AsyncMock) -> None:
    mock_update.return_value = True
    await _process_status(["user1"], Status.CONFIRMED)
    mock_update.assert_awaited_once()


@pytest.mark.asyncio
@patch("services.mongodb_handler.update", autospec=True)
async def test_process_status_failure(mock_update: AsyncMock) -> None:
    mock_update.return_value = False
    with pytest.raises(RuntimeError, match="Expected to modify at least one document"):
        await _process_status(["user1"], Status.CONFIRMED)
