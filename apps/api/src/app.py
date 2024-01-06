import logging
import os

from fastapi import FastAPI

from routers import admin, demo, guest, saml, user

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.include_router(saml.router, prefix="/saml", tags=["saml"])
app.include_router(demo.router, prefix="/demo", tags=["demo"])
app.include_router(guest.router, prefix="/guest", tags=["guest"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

if os.getenv("DEPLOYMENT") == "LOCAL":
    from routers import dev

    app.include_router(dev.router, prefix="/dev")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "hello"}
