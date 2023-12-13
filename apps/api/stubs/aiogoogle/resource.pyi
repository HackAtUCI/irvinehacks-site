from .models import Request
from typing import Mapping, TypeVar

T = TypeVar("T")

class CreateMethod:
    def __call__(
        self,
        validate: bool | None = ...,
        data: object | None = ...,
        json: Mapping[str, object] | None = ...,
        upload_file: bytes | None = ...,
        download_file: str | None = ...,
        timeout: int | None = ...,
        path_params_safe_chars: Mapping[str, object] = ...,
        fields: str = ...,
        supportsAllDrives: bool = ...,
        **uri_params: Mapping[str, object]
    ) -> Request: ...

class FileResource:
    create: CreateMethod

class GoogleDriveAPI:
    files: FileResource
