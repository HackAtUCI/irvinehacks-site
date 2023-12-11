from typing import Annotated, Union, Optional, Any

from fastapi import APIRouter, Cookie, Form

from services.mongodb_handler import insert, retrieve, Collection

router = APIRouter()


@router.get("/me")
async def me(username: Annotated[Union[str, None], Cookie()] = None) -> str:
    """Who are you?"""
    return f"You are {username or 'nobody'}"


@router.post("/square")
async def square(value: Annotated[int, Form()]) -> int:
    """Calculate the square of the value."""
    return value * value


@router.post("/user")
async def get_user(name: Annotated[str, Form()]) -> list[dict[str, Any]]:
    results = await retrieve(Collection.USERS, {"name": name}, ["name", "ucinetid"])
    for i in range(len(results)):
        results[i]["_id"] = str(results[i]["_id"])
    return results


@router.post("/add-user")
async def add_user(
    name: Annotated[str, Form()], ucinetid: Annotated[str, Form()]
) -> Union[str, bool]:
    return str(await insert(Collection.USERS, {"name": name, "ucinetid": ucinetid}))
