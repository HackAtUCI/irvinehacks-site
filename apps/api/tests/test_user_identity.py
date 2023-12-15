from datetime import datetime
from unittest.mock import Mock, patch

import pytest
from jose import JWTError

from auth import user_identity
from auth.user_identity import GuestUser, NativeUser


def test_can_encode_and_decode_native_user() -> None:
    """Test that a `NativeUser` can be encoded and decoded via JWT."""
    ucinetid = "hack"
    display_name = "Hack at UCI"
    email = "hack@uci.edu"
    affiliations = ["group"]

    user = NativeUser(
        ucinetid=ucinetid,
        display_name=display_name,
        email=email,
        affiliations=affiliations,
    )

    jwt_token = user_identity._generate_jwt_token(user)
    decoded_user = user_identity._decode_user_identity(jwt_token)

    assert decoded_user == user


def test_can_encode_and_decode_guest_user() -> None:
    """Test that a `GuestUser` can be encoded and decoded via JWT."""
    user = GuestUser(
        email="hackuci@gmail.com",
    )

    jwt_token = user_identity._generate_jwt_token(user)
    decoded_user = user_identity._decode_user_identity(jwt_token)

    assert decoded_user == user


def test_empty_identity_with_empty_token() -> None:
    """Test that no identity is decoded from an empty token."""
    user = user_identity._decode_user_identity(None)
    assert user is None


def test_error_on_invalid_token() -> None:
    """Test that decoding an invalid token raises an exception."""
    with pytest.raises(ValueError):
        user_identity._decode_jwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret")


@patch("auth.user_identity.datetime", autospec=True)
def test_error_on_expired_token(mock_datetime: Mock) -> None:
    """Test that decoding an expired token will cause a ValueError."""
    # mock token creation time
    mock_datetime.now.return_value = datetime(2014, 5, 23)

    user = GuestUser(email="hackuci@gmail.com")
    jwt_token = user_identity._generate_jwt_token(user)

    mock_datetime.now.assert_called_once()
    with pytest.raises(ValueError):
        user_identity._decode_jwt(jwt_token)


@patch("jose.jwt.decode", autospec=True)
def test_jwt_error_causes_empty_identity(mock_jwt_decode: Mock) -> None:
    """Test that decoding an expired token will cause a ValueError."""
    user = GuestUser(email="hackuci@gmail.com")
    mock_jwt_decode.side_effect = JWTError

    jwt_token = user_identity._generate_jwt_token(user)
    decoded_user = user_identity._decode_user_identity(jwt_token)
    assert decoded_user is None
