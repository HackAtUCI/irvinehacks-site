from fastapi import FastAPI

from routers import demo

app = FastAPI()

app.include_router(demo.router, prefix="/demo", tags=["demo"])


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "hello"}
