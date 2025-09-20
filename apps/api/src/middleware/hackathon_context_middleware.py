from typing import Callable, Awaitable
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
from utils.hackathon_context import hackathon_name_ctx, HackathonName


class HackathonContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        hackathon_name = request.headers.get("X-Hackathon-Name")

        if not hackathon_name:
            raise ValueError("X-Hackathon-Name header is required for admin routes")
        try:
            hackathon_enum = HackathonName(hackathon_name)
        except ValueError:
            raise ValueError(f"Invalid hackathon name: {hackathon_name}")

        hackathon_name_ctx.set(hackathon_enum)
        return await call_next(request)
