from unittest.mock import AsyncMock, Mock, patch

from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from auth.user_identity import GuestUser, UserTestClient
from middleware.hackathon_context_middleware import HackathonContextMiddleware
from routers import user
from services.mongodb_handler import Collection
from utils.hackathon_context import HackathonName

USER_EMAIL = "tree@stanford.edu"
USER_UID = "edu.stanford.tree"

app = FastAPI()
app.include_router(user.router)
app.add_middleware(HackathonContextMiddleware)

client = TestClient(app, follow_redirects=False)


def _zothacks_client() -> TestClient:
    auth_client = UserTestClient(GuestUser(email=USER_EMAIL), app)
    auth_client.headers.update({"X-Hackathon-Name": HackathonName.ZOTHACKS})
    return auth_client


def test_wallet_pass_requires_login() -> None:
    """Test that an unauthenticated request is rejected."""
    res = client.get(
        "/wallet/pass", headers={"X-Hackathon-Name": HackathonName.ZOTHACKS}
    )
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_wallet_pass_requires_zothacks_context() -> None:
    """Test that the pass is unavailable outside of the ZotHacks context."""
    auth_client = UserTestClient(GuestUser(email=USER_EMAIL), app)
    auth_client.headers.update({"X-Hackathon-Name": HackathonName.IRVINEHACKS})

    res = auth_client.get("/wallet/pass")
    assert res.status_code == status.HTTP_400_BAD_REQUEST


@patch("services.google_wallet_handler.build_checkin_pass_save_url", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_wallet_pass_encodes_uid_as_barcode(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_build_checkin_pass_save_url: Mock,
) -> None:
    """Test the endpoint asks the handler to encode the user's uid, using
    their name for personalization when available."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "first_name": "Tree",
        "last_name": "Stanford",
    }
    mock_build_checkin_pass_save_url.return_value = (
        "https://pay.google.com/gp/v/save/signed-jwt"
    )

    res = _zothacks_client().get("/wallet/pass")

    mock_mongodb_handler_retrieve_one.assert_awaited_once_with(
        Collection.USERS, {"_id": USER_UID}, ["first_name", "last_name"]
    )
    mock_build_checkin_pass_save_url.assert_called_once_with(USER_UID, "Tree Stanford")
    assert res.status_code == status.HTTP_200_OK
    assert res.json() == {"save_url": "https://pay.google.com/gp/v/save/signed-jwt"}


@patch("services.google_wallet_handler.build_checkin_pass_save_url", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_wallet_pass_without_user_record_omits_name(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_build_checkin_pass_save_url: Mock,
) -> None:
    """Test the endpoint still succeeds and passes no name when there is no
    associated user record yet."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_build_checkin_pass_save_url.return_value = (
        "https://pay.google.com/gp/v/save/signed-jwt"
    )

    res = _zothacks_client().get("/wallet/pass")

    mock_build_checkin_pass_save_url.assert_called_once_with(USER_UID, None)
    assert res.status_code == status.HTTP_200_OK


@patch("services.google_wallet_handler.build_checkin_pass_save_url", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_wallet_pass_returns_500_when_credentials_missing(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_build_checkin_pass_save_url: Mock,
) -> None:
    """Test that a misconfigured service account surfaces as a 500."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_build_checkin_pass_save_url.side_effect = RuntimeError(
        "Google Wallet service account credentials not found"
    )

    res = _zothacks_client().get("/wallet/pass")
    assert res.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


@patch("services.google_wallet_handler.build_checkin_pass_save_url", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_wallet_pass_returns_500_on_unexpected_handler_error(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_build_checkin_pass_save_url: Mock,
) -> None:
    """Test that non-RuntimeError failures from the handler (e.g. malformed
    credentials or signing errors) are also surfaced as a 500, not a raw
    unhandled exception."""
    mock_mongodb_handler_retrieve_one.return_value = None
    mock_build_checkin_pass_save_url.side_effect = KeyError("private_key")

    res = _zothacks_client().get("/wallet/pass")
    assert res.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
