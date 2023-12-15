from typing import Any, Literal, Optional

from .auth.creds import ServiceAccountCreds
from .resource import GoogleDriveAPI
from .models import Request

class Aiogoogle:
    def __init__(
        self,
        service_account_creds: ServiceAccountCreds | None = ...,
    ) -> None: ...
    async def discover(
        self,
        api_name: Literal["drive"],
        api_version: str | None = ...,
        validate: bool = ...,
        *,
        disco_doc_ver: Optional[int] = ...
    ) -> GoogleDriveAPI: ...
    async def as_service_account(
        self,
        *requests: Request,
        timeout: int | None = ...,
        service_account_creds: ServiceAccountCreds | None = ...,
        raise_for_status: bool = ...
    ) -> Any: ...
    async def __aenter__(self) -> Aiogoogle: ...
    async def __aexit__(self, *args: Any) -> None: ...
