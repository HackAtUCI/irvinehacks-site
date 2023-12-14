from typing import TypedDict
from typing_extensions import NotRequired


class PersonalizationData(TypedDict):
    email: str
    first_name: NotRequired[str]
    last_name: NotRequired[str]
    passphrase: NotRequired[str]
