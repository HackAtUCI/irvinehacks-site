from typing import Annotated, Union

from fastapi import APIRouter, Cookie, Form

router = APIRouter()


@router.get("/me")
async def me(username: Annotated[Union[str, None], Cookie()] = None) -> str:
    """Who are you?"""
    return f"You are {username or 'nobody'}"


@router.post("/square")
async def square(value: Annotated[int, Form()]) -> int:
    """Calculate the square of the value."""
    return value * value
