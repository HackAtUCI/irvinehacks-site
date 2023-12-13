from fastapi import FastAPI

from routers import saml, demo

app = FastAPI()

app.include_router(saml.router, prefix="/saml", tags=["saml"])
app.include_router(demo.router, prefix="/demo", tags=["demo"])


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "hello"}
