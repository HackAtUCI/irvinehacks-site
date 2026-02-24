import hmac
import hashlib
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, status

from services.slack_handler import require_slack

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


@patch("services.slack_handler.SIGNING_SECRET", None)
async def test_require_slack_missing_secret() -> None:
    """Test that missing SIGNING_SECRET raises 500"""
    request = MagicMock()

    with pytest.raises(HTTPException) as excinfo:
        await require_slack(request)
    assert excinfo.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
