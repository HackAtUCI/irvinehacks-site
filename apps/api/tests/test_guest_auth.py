import re
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from pydantic import EmailStr

from auth import guest_auth

SAMPLE_EMAIL = EmailStr("jeff@amazon.com")


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_can_generate_passphrase(
    mock_mongodb_retrieve_one: AsyncMock,
) -> None:
    """Test that a passphrase can be generated from a stored word list."""
    WORDS = ["zach", "champion", "lasse", "tang", "ryan", "ellise"]
    mock_mongodb_retrieve_one.return_value = {"words": WORDS}

    passphrase = await guest_auth._generate_passphrase(4)

    match = re.match(r"(\w+)-(\w+)-(\w+)-(\w+)", passphrase)
    assert match is not None
    assert all(w in WORDS for w in match.groups())

    # check word list cache is functioning
    second_passphrase = await guest_auth._generate_passphrase(4)
    assert "-" in second_passphrase
    mock_mongodb_retrieve_one.assert_awaited_once()


def test_can_validate_key() -> None:
    """Test that a generated key can be revalidated from its token and passphrase."""
    key = guest_auth._generate_key("some-confirmation", "a-b-c-d")

    assert re.match("[0-9a-f]{128}", key)
    assert guest_auth._validate(key, "a-b-c-d", "some-confirmation") is True


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_get_existing_unexpired_key(mock_mongodb_retrieve_one: AsyncMock) -> None:
    """Test that existing, unexpired guest authorization key can be retrieved."""
    iat = datetime(2023, 1, 11)
    exp = datetime(2023, 12, 31, tzinfo=timezone.utc)
    # this test will fail next year :P
    mock_mongodb_retrieve_one.return_value = {
        "guest_auth": {"iat": iat, "exp": exp, "key": "some-key"}
    }

    key = await guest_auth._get_existing_key(SAMPLE_EMAIL)
    assert key == "some-key"


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_get_nonexisting_key(mock_mongodb_retrieve_one: AsyncMock) -> None:
    """Test that nonexistent guest authorization key is returned as None."""
    mock_mongodb_retrieve_one.return_value = None

    key = await guest_auth._get_existing_key(SAMPLE_EMAIL)
    assert key is None


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_expired_key_is_removed(
    mock_mongodb_retrieve_one: AsyncMock, mock_mongodb_update_one: AsyncMock
) -> None:
    """Test that existing, unexpired guest authorization key can be retrieved."""
    iat = datetime(2023, 1, 2)
    exp = datetime(2023, 1, 3, tzinfo=timezone.utc)
    mock_mongodb_retrieve_one.return_value = {
        "guest_auth": {"iat": iat, "exp": exp, "key": "some-key"}
    }

    key = await guest_auth._get_existing_key(SAMPLE_EMAIL)
    assert key is None
    mock_mongodb_update_one.assert_awaited_once()


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_guest_credentials_invalid_when_no_key(
    mock_mongodb_retrieve_one: AsyncMock,
) -> None:
    """Test that guest credentials are invalid when there is no saved auth key."""
    mock_mongodb_retrieve_one.return_value = None

    verification = await guest_auth.verify_guest_credentials(
        SAMPLE_EMAIL, "some-passphrase", "some-confirmation"
    )
    assert verification is False
