from typing import Any
from logging import getLogger

from fastapi import APIRouter, Depends

from services.slack_handler import require_slack, handle_event

log = getLogger(__name__)

router = APIRouter()


@router.post("/events")
async def handle_events(body: dict[Any, Any] = Depends(require_slack)) -> str:
    event_type = body.get("type")
    if event_type == "url_verification":
        return str(body["challenge"])
    elif event_type == "event_callback":
        await handle_event(body)
    return "invalid event"
