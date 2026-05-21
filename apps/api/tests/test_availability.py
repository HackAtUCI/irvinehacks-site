from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI

from auth.user_identity import NativeUser, UserTestClient
from models.user_record import Role
from routers import availability
from services.mongodb_handler import Collection

ORGANIZER_USER = NativeUser(
    ucinetid="alicia",
    display_name="Alicia",
    email="alicia@uci.edu",
    affiliations=["student"],
)

DIRECTOR_USER = NativeUser(
    ucinetid="dir",
    display_name="Dir",
    email="dir@uci.edu",
    affiliations=["student"],
)

ORGANIZER_IDENTITY = {
    "_id": "edu.uci.alicia",
    "roles": [Role.ORGANIZER],
}

DIRECTOR_IDENTITY = {
    "_id": "edu.uci.dir",
    "roles": [Role.ORGANIZER, Role.DIRECTOR],
}

SUBMITTED_AT = datetime(2026, 1, 1, tzinfo=timezone.utc)
UPDATED_AT = datetime(2026, 1, 2, tzinfo=timezone.utc)

SAMPLE_AVAILABILITY = {
    "availability": [
        {"date": "2027-10-09", "start_time": "09:00"},
        {"date": "2027-10-09", "start_time": "09:30"},
        {"date": "2027-10-10", "start_time": "14:00"},
    ]
}

app = FastAPI()
app.include_router(availability.router, prefix="/availability")

organizer_client = UserTestClient(ORGANIZER_USER, app)
director_client = UserTestClient(DIRECTOR_USER, app)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_availability_empty(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [ORGANIZER_IDENTITY, None]

    res = organizer_client.get("/availability")

    assert res.status_code == 200
    assert res.json() == {
        "availability": [],
        "submitted_at": None,
        "updated_at": None,
    }


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_availability_existing(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        ORGANIZER_IDENTITY,
        {
            "_id": "edu.uci.alicia",
            **SAMPLE_AVAILABILITY,
            "submitted_at": SUBMITTED_AT,
            "updated_at": UPDATED_AT,
        },
    ]

    res = organizer_client.get("/availability")

    assert res.status_code == 200
    assert res.json()["availability"] == SAMPLE_AVAILABILITY["availability"]


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_put_availability(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        ORGANIZER_IDENTITY,
        {"locked": False},
        None,
    ]

    res = organizer_client.put("/availability", json=SAMPLE_AVAILABILITY)

    assert res.status_code == 200
    mock_mongodb_handler_update_one.assert_awaited_once()
    collection, query, data = mock_mongodb_handler_update_one.await_args.args[:3]
    assert collection == Collection.AVAILABILITY
    assert query == {"_id": "edu.uci.alicia"}
    assert data["_id"] == "edu.uci.alicia"
    assert data["availability"] == SAMPLE_AVAILABILITY["availability"]


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_put_availability_rejects_when_locked(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        ORGANIZER_IDENTITY,
        {"locked": True},
    ]

    res = organizer_client.put("/availability", json=SAMPLE_AVAILABILITY)

    assert res.status_code == 403
    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_availability_lock(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        ORGANIZER_IDENTITY,
        {"locked": True},
    ]

    res = organizer_client.get("/availability/lock")

    assert res.status_code == 200
    assert res.json() == {"locked": True}


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_director_can_set_availability_lock(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post("/availability/lock", json={"locked": True})

    assert res.status_code == 200
    assert res.json() == {"locked": True}
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "availability"},
        {"$set": {"locked": True}},
        upsert=True,
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_organizer_cannot_set_availability_lock(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = ORGANIZER_IDENTITY

    res = organizer_client.post("/availability/lock", json={"locked": True})

    assert res.status_code == 403
    mock_mongodb_handler_raw_update_one.assert_not_awaited()


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_availability_submissions(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {"_id": "edu.uci.alicia"},
        {"_id": "edu.uci.petr"},
    ]

    res = director_client.get("/availability/submissions")

    assert res.status_code == 200
    assert res.json() == ["edu.uci.alicia", "edu.uci.petr"]


@patch("services.mongodb_handler.delete", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_director_can_clear_availability(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_delete: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.delete("/availability")

    assert res.status_code == 200
    mock_mongodb_handler_delete.assert_awaited_once_with(Collection.AVAILABILITY, {})


@patch("services.mongodb_handler.delete", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_organizer_cannot_clear_availability(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_delete: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = ORGANIZER_IDENTITY

    res = organizer_client.delete("/availability")

    assert res.status_code == 403
    mock_mongodb_handler_delete.assert_not_awaited()
