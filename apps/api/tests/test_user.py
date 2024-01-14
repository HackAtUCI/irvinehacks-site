from datetime import datetime
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from test_user_apply import SAMPLE_APPLICATION

from auth.authorization import require_accepted_applicant
from auth.user_identity import GuestUser, User, UserTestClient
from models.ApplicationData import Decision
from routers import user
from services.mongodb_handler import Collection
from utils.user_record import Applicant, Role, Status

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


def test_accepted_user_can_request_waiver() -> None:
    """Test accepted applicant can request signing waiver."""
    uid = "edu.uci.hack"
    app.dependency_overrides[require_accepted_applicant] = lambda: (
        User(uid=uid, email="hack@uci.edu"),
        Applicant(
            uid=uid,
            role=Role.APPLICANT,
            status=Decision.ACCEPTED,
            application_data={
                **SAMPLE_APPLICATION,  # type: ignore[arg-type]
                "submission_time": datetime.now(),
                "first_name": "Riley",
                "last_name": "Wong",
            },
        ),
    )

    res = client.get("/waiver", follow_redirects=False)

    assert res.status_code == 303
    location = res.headers["location"]
    assert "docusign" in location
    assert "Participant_Email=hack%40uci.edu" in location
    assert "Participant_UserName=Riley+Wong" in location

    app.dependency_overrides = {}


def test_cannot_request_waiver_if_already_signed() -> None:
    """Test applicant who already signed waiver cannot re-request signing."""
    uid = "edu.uci.hack"
    app.dependency_overrides[require_accepted_applicant] = lambda: (
        User(uid=uid, email="hack@uci.edu"),
        Applicant(
            uid="edu.uci.hack",
            role=Role.APPLICANT,
            status=Status.WAIVER_SIGNED,
            application_data={
                **SAMPLE_APPLICATION,  # type: ignore[arg-type]
                "submission_time": datetime.now(),
            },
        ),
    )

    res = client.get("/waiver")
    assert res.status_code == 403

    app.dependency_overrides = {}
