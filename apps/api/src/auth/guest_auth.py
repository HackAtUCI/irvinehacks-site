import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from pydantic import BaseModel, EmailStr

from auth import user_identity
from auth.user_identity import GuestUser, utc_now
from services import mongodb_handler
from services.mongodb_handler import BaseRecord, Collection
from utils import email_handler

AUTH_KEY_SALT = os.getenv("AUTH_KEY_SALT", "not-a-good-idea")[:16].encode()
PASSPHRASE_LENGTH = 4
WORD_LIST: list[str] = []


class GuestAuth(BaseModel):
    iat: datetime
    exp: datetime
    key: str


class GuestRecord(BaseRecord):
    guest_auth: GuestAuth


async def initiate_guest_login(email: EmailStr) -> Optional[str]:
    """Generate a login passphrase to be emailed, save the authentication key,
    and a confirmation token to be saved as a cookie."""
    if await _get_existing_key(email):
        # To prevent spammed requests, user must wait until previous key expires
        return None

    confirmation = _generate_confirmation_token()
    passphrase = await _generate_passphrase(PASSPHRASE_LENGTH)
    auth_key = _generate_key(confirmation, passphrase)

    uid = user_identity.scoped_uid(email)
    now = utc_now()
    exp = now + timedelta(minutes=10)

    guest = GuestRecord(
        uid=uid,
        guest_auth=GuestAuth(iat=now, exp=exp, key=auth_key),
    )

    await _save_guest_key(guest)
    await email_handler.send_guest_login_email(email, passphrase)

    return confirmation


async def verify_guest_credentials(
    email: EmailStr, passphrase: str, confirmation: str
) -> bool:
    """Check that passphrase and confirmation are valid for the given user."""
    key = await _get_existing_key(email)
    if not key:
        return False

    # TODO: delete used key
    return _validate(key, passphrase, confirmation)


def acquire_guest_identity(email: EmailStr) -> GuestUser:
    """Provide a user identity for the given guest."""
    return GuestUser(email=email)


async def _get_existing_key(email: EmailStr) -> Optional[str]:
    """Retrieve guest authentication key, `None` if expired."""
    uid = user_identity.scoped_uid(email)
    record = await mongodb_handler.retrieve_one(
        Collection.USERS, {"_id": uid}, ["guest_auth"]
    )

    if not record or not record["guest_auth"]:
        return None

    auth = GuestAuth.parse_obj(record["guest_auth"])

    # Reject expired key
    now = utc_now()
    if now > auth.exp:
        await _remove_guest_key(uid)
        return None

    return auth.key


async def _save_guest_key(guest: GuestRecord) -> None:
    """Save guest authentication key to user record."""
    await mongodb_handler.update_one(
        Collection.USERS, {"_id": guest.uid}, guest.dict(), upsert=True
    )


async def _remove_guest_key(uid: str) -> None:
    await mongodb_handler.update_one(
        Collection.USERS,
        {"_id": uid},
        {"guest_auth": None, "last_login": utc_now()},
    )


def _generate_confirmation_token() -> str:
    """Generate a confirmation token to use for guest authentication."""
    return secrets.token_urlsafe()


async def _generate_passphrase(length: int) -> str:
    """Generate a secret passphrase to use for guest authentication."""
    words = await _get_word_list()
    return "-".join(secrets.choice(words) for _ in range(length))


def _generate_key(confirmation: str, passphrase: str) -> str:
    """Generate a key from a passphrase and confirmation token."""
    content = confirmation + passphrase
    return hashlib.blake2b(content.encode(), salt=AUTH_KEY_SALT).hexdigest()


def _validate(key: str, passphrase: str, confirmation: str) -> bool:
    """Validate a passphrase, confirmation token, and authentication key."""
    digest = _generate_key(confirmation, passphrase)
    return hmac.compare_digest(key, digest)


async def _get_word_list() -> list[str]:
    """Fetch list of words to use for passphrase generation from MongoDB."""
    global WORD_LIST
    if not WORD_LIST:
        record: Optional[dict[str, list[str]]] = await mongodb_handler.retrieve_one(
            Collection.SETTINGS, {"_id": "word_list"}
        )
        if not record:
            raise RuntimeError("Guest authentication word list is not available")
        WORD_LIST = record["words"]
    return WORD_LIST
