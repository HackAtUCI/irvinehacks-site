import os
import time
import hashlib
import hmac
import json
from typing import Any
from logging import getLogger

from fastapi import HTTPException, Request, status

SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET")


log = getLogger(__name__)


async def require_slack(request: Request) -> dict[Any, Any]:
    """Verifies request signature and returns request body"""
    if not SIGNING_SECRET:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)

    raw_body_bytes = await request.body()

    timestamp = request.headers.get("X-Slack-Request-Timestamp")
    slack_signature = request.headers.get("x-slack-signature")

    if not slack_signature or not timestamp or not _is_int(timestamp):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    if abs(time.time() - int(timestamp)) > 60 * 5:
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    raw_body_string = raw_body_bytes.decode("utf-8")
    sig_basestring = f"v0:{timestamp}:{raw_body_string}".encode("utf-8")

    my_signature = (
        "v0="
        + hmac.new(
            SIGNING_SECRET.encode("utf-8"), sig_basestring, hashlib.sha256
        ).hexdigest()
    )
    if not hmac.compare_digest(my_signature, slack_signature):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return json.loads(raw_body_string) or {}


def _is_int(timestamp: str) -> bool:
    try:
        int(timestamp)
    except (ValueError, TypeError):
        return False
    return True


async def handle_event(body: dict[Any, Any]) -> None:
    inner_event = body.get("event")
    if not inner_event:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY)

    if inner_event.get("type") == "team_join":
        await _handle_team_join(body)


async def _handle_team_join(body: dict[Any, Any]) -> None:
    log.info(body)
