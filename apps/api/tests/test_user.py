from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from auth.user_identity import GuestUser, UserTestClient
from routers import user
from services.mongodb_handler import Collection

app = FastAPI()
app.include_router(user.router)

client = TestClient(app)


def test_login_as_uci_redirects_to_saml() -> None:
    """Tests that logging in with UCI email redirects to SAML for UCI SSO"""
    res = client.post("/login", data={"email": "hack@uci.edu"}, follow_redirects=False)
    assert res.status_code == status.HTTP_303_SEE_OTHER
    assert res.headers["location"] == "/api/saml/login"


def test_login_as_non_uci_redirects_to_guest_login() -> None:
    """Test that logging in with a non-UCI email redirects to guest login endpoint."""
    res = client.post(
        "/login", data={"email": "jeff@amazon.com"}, follow_redirects=False
    )
    assert res.status_code == status.HTTP_307_TEMPORARY_REDIRECT
    assert res.headers["location"] == "/api/guest/login"


def test_logout() -> None:
    """Test that logging out removes the authentication cookie."""
    res = client.get("/logout", follow_redirects=False)
    assert res.status_code == status.HTTP_303_SEE_OTHER
    assert res.headers["location"] == "/"
    assert res.headers["Set-Cookie"].startswith('irvinehacks_auth=""; Max-Age=0;')


def test_no_identity_when_unauthenticated() -> None:
    """Test that identity is empty when not authenticated."""
    res = client.get("/me")
    data = res.json()
    assert data == {"uid": None, "status": None, "role": None}


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_plain_identity_when_no_user_record(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that identity contains just uid when there is no associated user record."""
    mock_mongodb_handler_retrieve_one.return_value = None
    client = UserTestClient(GuestUser(email="tree@stanford.edu"), app)
    res = client.get("/me")

    mock_mongodb_handler_retrieve_one.assert_awaited_once_with(
        Collection.USERS, {"_id": "edu.stanford.tree"}
    )
    data = res.json()
    assert data == {"uid": "edu.stanford.tree", "status": None, "role": None}
