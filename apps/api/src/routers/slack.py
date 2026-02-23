from typing import Any
from logging import getLogger

from fastapi import APIRouter, Depends

from services.slack_handler import require_slack

log = getLogger(__name__)

router = APIRouter()


@router.post("/challenge")
def respond_to_challenge(body: dict[Any, Any] = Depends(require_slack)) -> str:
    if body.get("type") == "url_verification":
        return str(body["challenge"])
    return "invalid challenge"
