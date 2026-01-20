from enum import Enum
from contextvars import ContextVar


class HackathonName(str, Enum):
    IRVINEHACKS = "irvinehacks"
    ZOTHACKS = "zothacks"


ALLOWED_HACKATHONS = {HackathonName.IRVINEHACKS, HackathonName.ZOTHACKS}

hackathon_name_ctx: ContextVar[HackathonName] = ContextVar(
    "hackathon_name", default=HackathonName.ZOTHACKS
)
