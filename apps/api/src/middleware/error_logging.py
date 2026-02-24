import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

log = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    async def _validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """
        Catches Pydantic validation errors and logs sanitized error to avoid
        leaking sensitive data like email addresses.
        """
        sanitized_errors = [
            {"loc": err.get("loc"), "type": err.get("type"), "msg": err.get("msg")}
            for err in exc.errors()
        ]
        log.warning(
            "Request validation failed: method=%s path=%s errors=%s",
            request.method,
            request.url.path,
            sanitized_errors,
        )
        return JSONResponse(status_code=422, content={"detail": exc.errors()})

    async def _http_exception_handler(
        request: Request, exc: HTTPException
    ) -> JSONResponse:
        """
        Raised explicitly by route code or for unmatched routes and logs
        error
        """
        log.warning(
            "HTTP error: method=%s path=%s status=%d detail=%s",
            request.method,
            request.url.path,
            exc.status_code,
            exc.detail,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )

    async def _unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """
        Catch all for unexpected exceptions not matched by the handlers above.
        Returns a generic 500 to avoid leaking internal details to the client.
        """
        log.exception(
            "Unhandled exception: method=%s path=%s type=%s",
            request.method,
            request.url.path,
            type(exc).__name__,
        )
        return JSONResponse(
            status_code=500, content={"detail": "Internal server error"}
        )

    app.add_exception_handler(RequestValidationError, _validation_exception_handler)
    app.add_exception_handler(HTTPException, _http_exception_handler)
    app.add_exception_handler(Exception, _unhandled_exception_handler)
