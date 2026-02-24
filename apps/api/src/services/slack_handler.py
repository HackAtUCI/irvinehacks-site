import os
import time
import hashlib
import hmac
import json
from typing import Any

from fastapi import HTTPException, Request, status

SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET")


async def require_slack(request: Request) -> dict[Any, Any]:
    if not SIGNING_SECRET:
        print("bruz")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR)
        # left off here I think where there's no signing secret

    raw_body_bytes = await request.body()

    timestamp = request.headers["X-Slack-Request-Timestamp"]
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
    slack_signature = request.headers["x-slack-signature"]
    if not hmac.compare_digest(my_signature, slack_signature):
        raise HTTPException(status.HTTP_403_FORBIDDEN)

    return json.loads(raw_body_string) or {}
