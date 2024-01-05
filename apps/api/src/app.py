from fastapi import FastAPI

from routers import demo, guest, saml, user, admin

app = FastAPI()

app.include_router(saml.router, prefix="/saml", tags=["saml"])
app.include_router(demo.router, prefix="/demo", tags=["demo"])
app.include_router(guest.router, prefix="/guest", tags=["guest"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "hello"}
