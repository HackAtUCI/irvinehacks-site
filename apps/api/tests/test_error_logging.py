import logging

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.exceptions import HTTPException
from pydantic import BaseModel

from middleware.error_logging import register_exception_handlers

app = FastAPI()
register_exception_handlers(app)


# Mock pydantic model
class Item(BaseModel):
    name: str


# Mock routes to trigger each of the 3 errors
@app.get("/trigger-http-error")
async def trigger_http_error():
    raise HTTPException(status_code=403, detail="Forbidden")


@app.post("/trigger-validation-error")
async def trigger_validation_error(item: Item):
    return item


@app.get("/trigger-unhandled-error")
async def trigger_unhandled_error():
    raise RuntimeError("Something broke")


client = TestClient(app, raise_server_exceptions=False)


def test_http_exception_is_logged(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.WARNING, logger="middleware.error_logging"):
        client.get("/trigger-http-error")
    assert "HTTP error" in caplog.text
    assert "403" in caplog.text


def test_validation_error_is_logged(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.WARNING, logger="middleware.error_logging"):
        client.post("/trigger-validation-error", json={})
    assert "Request validation failed" in caplog.text


def test_unhandled_exception_is_logged(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.ERROR, logger="middleware.error_logging"):
        client.get("/trigger-unhandled-error")

    assert "Unhandled exception" in caplog.text
    assert "RuntimeError" in caplog.text
