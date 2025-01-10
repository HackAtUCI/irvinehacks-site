from unittest.mock import ANY, AsyncMock, patch

from fastapi import FastAPI

from auth.user_identity import NativeUser, UserTestClient
from models.user_record import Role
from routers import director
from services.mongodb_handler import Collection
from services.sendgrid_handler import Template
from utils.email_handler import IH_SENDER

USER_DIRECTOR = NativeUser(
    ucinetid="dir",
    display_name="Dir",
    email="dir@uci.edu",
    affiliations=["student"],
)

DIRECTOR_IDENTITY = {"_id": "edu.uci.dir", "roles": [Role.ORGANIZER, Role.DIRECTOR]}

app = FastAPI()
app.include_router(director.router)

director_client = UserTestClient(USER_DIRECTOR, app)

SAMPLE_ORGANIZER = {
    "email": "albert@uci.edu",
    "first_name": "Albert",
    "last_name": "Wang",
    "roles": [Role.ORGANIZER],
}

EXPECTED_ORGANIZER = director.OrganizerSummary(
    uid="edu.uci.albert", first_name="Albert", last_name="Wang", roles=[Role.ORGANIZER]
)


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_retrieve_organizers(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    """Test that the organizers can be processed."""

    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "roles": ["Organizer"],
        },
    ]

    res = director_client.get("/organizers")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once()
    data = res.json()
    assert data == [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "roles": ["Organizer"],
        },
    ]


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
def test_can_add_organizer(
    mock_mongodb_handler_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that organizers can be added"""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post("/organizers", json=SAMPLE_ORGANIZER)

    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": EXPECTED_ORGANIZER.uid},
        EXPECTED_ORGANIZER.model_dump(),
        upsert=True,
    )

    assert res.status_code == 201


@patch("services.sendgrid_handler.send_email", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_apply_reminder_emails(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_sendgrid_handler_send_email: AsyncMock,
) -> None:
    """Test that users that haven't submitted an application will be sent an email"""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {"_id": "edu.uci.petr", "first_name": "Peter"},
        {"_id": "edu.uci.albert", "first_name": "Albert"},
    ]

    res = director_client.post("/apply-reminder")
    assert res.status_code == 200

    mock_sendgrid_handler_send_email.assert_awaited_once_with(
        Template.APPLY_REMINDER,
        IH_SENDER,
        [
            {"email": "petr@uci.edu", "first_name": "Peter"},
            {"email": "albert@uci.edu", "first_name": "Albert"},
        ],
        True,
    )
