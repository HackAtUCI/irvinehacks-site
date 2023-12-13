from typing import Tuple

from .dynamic_template_data import DynamicTemplateData

class Email:
    def __init__(
        self,
        email: Tuple[str, str] | None = ...,
        dynamic_template_data: DynamicTemplateData | dict[object, object] | None = ...,
    ) -> None: ...
