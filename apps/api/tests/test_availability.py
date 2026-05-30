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

SAMPLE_TEMPLATE_RECORD = {
    "_id": "templates",
    "templates": [
        {
            "template_name": "IrvineHacks 2027",
            "template_info": {
                "event_dates": [
                    "2027-10-09T09:00:00+00:00",
                    "2027-10-11T23:30:00+00:00",
                ],
                "shifts": [
                    {
                        "shift_name": "Check-in",
                        "location": "Student Center",
                        "min_num_organizers": 2,
                        "shift_pts": 1,
                        "organizers": [],
                        "hour": {
                            "start_time": "2027-10-09T09:00:00+00:00",
                            "end_time": "2027-10-09T11:00:00+00:00",
                            "director_on_shift": [],
                        },
                        "preassigned_orgs": [],
                    }
                ],
                "org_availabilities": {},
            },
            "drafts": [],
        }
    ],
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
        "template_name": None,
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
            "template_name": "IrvineHacks 2027",
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
        {"template_name": "IrvineHacks 2027"},
        None,
    ]

    res = organizer_client.put("/availability", json=SAMPLE_AVAILABILITY)

    assert res.status_code == 200
    mock_mongodb_handler_update_one.assert_awaited_once()
    assert mock_mongodb_handler_update_one.await_args is not None
    awaited_update = mock_mongodb_handler_update_one.await_args
    collection, query, data = awaited_update.args[:3]
    assert collection == Collection.AVAILABILITY
    assert query == {"_id": "edu.uci.alicia"}
    assert data["_id"] == "edu.uci.alicia"
    assert data["availability"] == SAMPLE_AVAILABILITY["availability"]
    assert data["template_name"] == "IrvineHacks 2027"


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


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_put_availability_rejects_when_not_requested(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        ORGANIZER_IDENTITY,
        {"locked": False},
        None,
    ]

    res = organizer_client.put("/availability", json=SAMPLE_AVAILABILITY)

    assert res.status_code == 403
    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_availability_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        ORGANIZER_IDENTITY,
        {"template_name": "IrvineHacks 2027"},
        SAMPLE_TEMPLATE_RECORD,
    ]

    res = organizer_client.get("/availability/template")

    assert res.status_code == 200
    assert res.json()["template_name"] == "IrvineHacks 2027"
    assert len(res.json()["shifts"]) == 1


@patch("services.mongodb_handler.delete", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_director_can_request_availability_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_delete: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        SAMPLE_TEMPLATE_RECORD,
    ]

    res = director_client.post(
        "/availability/template",
        json={"template_name": "IrvineHacks 2027"},
    )

    assert res.status_code == 200
    assert res.json()["template_name"] == "IrvineHacks 2027"
    mock_mongodb_handler_raw_update_one.assert_awaited_once()
    assert mock_mongodb_handler_raw_update_one.await_args is not None
    awaited_raw_update = mock_mongodb_handler_raw_update_one.await_args
    collection, query, update = awaited_raw_update.args[:3]
    assert collection == Collection.SETTINGS
    assert query == {"_id": "availability"}
    assert update["$set"]["template_name"] == "IrvineHacks 2027"
    assert update["$set"]["locked"] is False
    mock_mongodb_handler_delete.assert_awaited_once_with(
        Collection.AVAILABILITY,
        {},
    )


@patch("services.mongodb_handler.delete", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_director_can_reset_availability_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_delete: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.delete("/availability/template")

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "availability"},
        {
            "$unset": {
                "template_name": "",
                "requested_at": "",
                "requested_by": "",
            },
            "$set": {"locked": False},
        },
        upsert=True,
    )
    mock_mongodb_handler_delete.assert_awaited_once_with(
        Collection.AVAILABILITY,
        {},
    )


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
    mock_mongodb_handler_delete.assert_awaited_once_with(
        Collection.AVAILABILITY,
        {},
    )


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
