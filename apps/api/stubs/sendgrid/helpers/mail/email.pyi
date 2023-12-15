from typing import Mapping

class Email:
    def __init__(
        self,
        email: str | None = ...,
        dynamic_template_data: Mapping[str, object] | None = ...,
    ) -> None: ...
