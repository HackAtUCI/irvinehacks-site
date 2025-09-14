import logging
import os
from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response

from routers import admin, director, guest, saml, user
from utils.hackathon_context import hackathon_name_ctx

logging.basicConfig(level=logging.INFO)


# TODO: check FastAPI CLI usage instead
if os.getenv("DEPLOYMENT") == "LOCAL":
    from routers import dev
    from utils import dev_mock

    # Set `root_path` for docs to be accessible at localhost:3000/api/docs
    app = FastAPI(root_path="/api/", lifespan=dev_mock.lifespan)
    app.include_router(dev.router, prefix="/dev", tags=["dev"])
else:
    app = FastAPI()

app.include_router(saml.router, prefix="/saml", tags=["saml"])
app.include_router(guest.router, prefix="/guest", tags=["guest"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(director.router, prefix="/director", tags=["director"])


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "hello"}


@app.middleware("http")
async def set_hackathon_name_context_from_header(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    hackathon_name = request.headers.get("X-Hackathon-Name")
    if not hackathon_name:
        raise ValueError("X-Hackathon-Name was empty or not set")

    hackathon_name_ctx.set(hackathon_name)
    return await call_next(request)
