from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from routers import user

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
    assert res.headers["Set-Cookie"].startswith('hackuci_auth=""; Max-Age=0;')
