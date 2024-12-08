from typing import Literal, Mapping, TypedDict

from onelogin.saml2.settings import OneLogin_Saml2_Settings

class RequestData(TypedDict):
    http_host: str  # the hostname
    script_name: str  # the request path
    https: Literal["on", "off"]
    post_data: Mapping[str, str]

class OneLogin_Saml2_Auth:
    def __init__(
        self,
        request_data: RequestData,
        old_settings: OneLogin_Saml2_Settings | Mapping[str, object] | None = ...,
        custom_base_path: str | None = ...,
    ) -> None: ...
    def process_response(self, request_id: str | None = None) -> None: ...
    def is_authenticated(self) -> bool: ...
    def get_friendlyname_attributes(self) -> dict[str, list[str]]: ...
    def get_errors(self) -> list[str]: ...
    def get_last_error_reason(self) -> str | None: ...
    def get_friendlyname_attribute(self, friendlyname: str) -> list[str]: ...
    def login(
        self,
        return_to: str | None = ...,
        force_authn: bool = ...,
        is_passive: bool = ...,
        set_nameid_policy: bool = ...,
        name_id_value_req: str | None = ...,
    ) -> str: ...
