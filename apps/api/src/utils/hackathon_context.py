from typing import Literal
from contextvars import ContextVar


IRVINEHACKS = "irvinehacks"
ZOTHACKS = "zothacks"

hackathon_name_ctx: ContextVar[Literal["irvinehacks", "zothacks"]] = ContextVar(
    "hackathon_name", default="irvinehacks"
)
