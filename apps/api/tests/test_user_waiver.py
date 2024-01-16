from datetime import datetime

from fastapi import FastAPI
from fastapi.testclient import TestClient
from test_user_apply import SAMPLE_APPLICATION

from auth.authorization import require_accepted_applicant
from auth.user_identity import User
from models.ApplicationData import Decision
from routers import user
from utils.user_record import Applicant, Role, Status

app = FastAPI()
app.include_router(user.router)

client = TestClient(app)


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
    assert "docusign.net" in location
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
