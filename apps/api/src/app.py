from fastapi import FastAPI

from routers import demo, saml, user

app = FastAPI()

app.include_router(saml.router, prefix="/saml", tags=["saml"])
app.include_router(demo.router, prefix="/demo", tags=["demo"])
app.include_router(user.router, prefix="/user", tags=["user"])


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "hello"}
