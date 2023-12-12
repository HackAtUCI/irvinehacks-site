from typing import Annotated, Union

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


@router.get("/user")
async def get_user(search_name: str) -> list[dict[str, object]]:
    results = await retrieve(
        Collection.USERS, {"name": search_name}, ["name", "ucinetid"]
    )
    for result in results:
        result["_id"] = str(result["_id"])
    return results


@router.post("/add-user")
async def add_user(
    name: Annotated[str, Form()], ucinetid: Annotated[str, Form()]
) -> Union[str, bool]:
    return str(await insert(Collection.USERS, {"name": name, "ucinetid": ucinetid}))
