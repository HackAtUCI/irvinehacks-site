import hmac
import hashlib
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, status

from services.slack_handler import require_slack, handle_event, _handle_team_join
from services.mongodb_handler import Collection

TEST_SECRET = "test_secret"


@patch("services.slack_handler.SIGNING_SECRET", TEST_SECRET)
@patch("services.slack_handler.time.time")
async def test_require_slack_success(mock_time: MagicMock) -> None:
    """Test slack request is valid"""
    now = 1234567890
    mock_time.return_value = now

    timestamp = str(now)
    body = {"real_slack_message": "yes", "token": "some-token"}
    raw_body = json.dumps(body)

    # Calculate correct signature
    sig_basestring = f"v0:{timestamp}:{raw_body}".encode("utf-8")
    signature = (
        "v0="
        + hmac.new(
            TEST_SECRET.encode("utf-8"), sig_basestring, hashlib.sha256
        ).hexdigest()
    )

    # Mock request
    request = MagicMock()
    request.body = AsyncMock(return_value=raw_body.encode("utf-8"))
    request.headers = {
        "X-Slack-Request-Timestamp": timestamp,
        "x-slack-signature": signature,
    }

    result = await require_slack(request)
    assert result == body


@patch("services.slack_handler.SIGNING_SECRET", TEST_SECRET)
@patch("services.slack_handler.time.time")
async def test_require_slack_invalid_signature(mock_time: MagicMock) -> None:
    """Test slack request with invalid signature raises 403"""
    now = 1234567890
    mock_time.return_value = now

    timestamp = str(now)
    body = {"message": "invalid"}
    raw_body = json.dumps(body)

    request = MagicMock()
    request.body = AsyncMock(return_value=raw_body.encode("utf-8"))
    request.headers = {
        "X-Slack-Request-Timestamp": timestamp,
        "x-slack-signature": "v0=invalid-signature",
    }

    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_403_FORBIDDEN


@patch("services.slack_handler.SIGNING_SECRET", TEST_SECRET)
@patch("services.slack_handler.time.time")
async def test_require_slack_expired_timestamp(mock_time: MagicMock) -> None:
    """Test slack request with expired timestamp raises 403"""
    now = 1234567890
    mock_time.return_value = now

    # Timestamp is older than 5 minutes (300 seconds)
    timestamp = str(now - 301)

    request = AsyncMock()
    request.headers = {
        "X-Slack-Request-Timestamp": timestamp,
    }

    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_403_FORBIDDEN


@patch("services.slack_handler.SIGNING_SECRET", TEST_SECRET)
async def test_require_slack_missing_headers() -> None:
    """Test slack request with missing headers raises 403"""
    request = AsyncMock()
    request.headers = {}

    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_403_FORBIDDEN

    # Missing signature
    request.headers = {"X-Slack-Request-Timestamp": "12345"}
    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_403_FORBIDDEN

    # Missing timestamp
    request.headers = {"x-slack-signature": "v0=abc"}
    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_403_FORBIDDEN


@patch("services.slack_handler.SIGNING_SECRET", TEST_SECRET)
async def test_require_slack_malformed_timestamp() -> None:
    """Test slack request with malformed timestamp raises 403"""
    request = AsyncMock()
    request.body = AsyncMock(return_value=b"{}")
    request.headers = {
        "X-Slack-Request-Timestamp": "not-a-number",
        "x-slack-signature": "v0=abc",
    }

    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_403_FORBIDDEN


@patch("services.slack_handler.SIGNING_SECRET", None)
async def test_require_slack_missing_secret() -> None:
    """Test that missing SIGNING_SECRET raises 500"""
    request = AsyncMock()

    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


@patch("services.slack_handler._handle_team_join", new_callable=AsyncMock)
async def test_handle_event_team_join(mock_handle: AsyncMock) -> None:
    """Test handle_event calls _handle_team_join for team_join type"""
    body = {
        "event": {
            "type": "team_join",
            "user": {"profile": {"email": "test@example.com"}},
        }
    }
    await handle_event(body)
    mock_handle.assert_awaited_once_with(body["event"])


async def test_handle_event_missing_event() -> None:
    """Test handle_event raises 422 if event is missing"""
    with pytest.raises(HTTPException) as excinfo:
        await handle_event({})
    assert excinfo.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@patch("services.slack_handler.mongodb_handler.retrieve_one")
@patch("services.slack_handler.mongodb_handler.update_one")
async def test_handle_team_join_success(
    mock_update: AsyncMock, mock_retrieve: AsyncMock
) -> None:
    """Test _handle_team_join updates mongo correctly"""
    email = "sholmes@example.com"
    event_data = {"type": "team_join", "user": {"profile": {"email": email}}}

    mock_retrieve.return_value = {"_id": "user123"}
    mock_update.return_value = True

    await _handle_team_join(event_data)

    mock_retrieve.assert_awaited_once_with(
        Collection.USERS, {"application_data.email": email}, ["_id"]
    )
    mock_update.assert_awaited_once_with(
        Collection.USERS, {"_id": "user123"}, {"is_added_to_slack": True}
    )


@patch("services.slack_handler.mongodb_handler.retrieve_one")
@patch("services.slack_handler.mongodb_handler.update_one")
async def test_handle_team_join_user_not_found(
    mock_update: AsyncMock, mock_retrieve: AsyncMock
) -> None:
    """Test _handle_team_join handles user not found in mongo"""
    email = "unknown@example.com"
    event_data = {"type": "team_join", "user": {"profile": {"email": email}}}

    mock_retrieve.return_value = None

    await _handle_team_join(event_data)

    mock_retrieve.assert_awaited_once()
    mock_update.assert_not_called()
