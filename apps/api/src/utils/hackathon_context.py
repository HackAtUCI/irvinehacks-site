from typing import Literal
from contextvars import ContextVar


IRVINEHACKS = "irvinehacks"
ZOTHACKS = "zothacks"

HackathonName = Literal["irvinehacks", "zothacks"]

hackathon_name_ctx: ContextVar[HackathonName] = ContextVar(
    "hackathon_name", default="irvinehacks"
)
