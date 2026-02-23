from unittest.mock import ANY, AsyncMock, patch

import pytest

from admin.participant_manager import (
    add_participant_to_queue,
    check_in_participant,
    confirm_attendance_outside_participants,
    get_attending_hackers,
    get_participants,
    PARTICIPANT_FIELDS,
    subevent_checkin,
)
from auth.user_identity import NativeUser
from models.ApplicationData import Decision
from models.user_record import Role, Status
from services.mongodb_handler import Collection

USER_ASSOCIATE = NativeUser(
    ucinetid="associate",
    display_name="Associate",
    email="associate@uci.edu",
    affiliations=["student"],
)

USER_DIRECTOR = NativeUser(
    ucinetid="director",
    display_name="Director",
    email="director@uci.edu",
    affiliations=["student"],
)


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_get_participants(mock_retrieve: AsyncMock) -> None:
    mock_retrieve.return_value = [
        {
            "_id": "user1",
            "first_name": "First1",
            "last_name": "Last1",
            "roles": [Role.HACKER],
            "status": Status.CONFIRMED,
            "decision": Decision.ACCEPTED,
            "checkins": [],
            "badge_number": "123",
        },
        {
            "_id": "user2",
            "first_name": "First2",
            "last_name": "Last2",
            "roles": [Role.SPONSOR],
            "status": Status.REVIEWED,
            "decision": None,
            "checkins": [],
            "badge_number": None,
        },
    ]

    participants = await get_participants()

    assert len(participants) == 2
    assert participants[0].uid == "user1"
    assert participants[0].status == Status.CONFIRMED
    assert participants[1].uid == "user2"
    assert participants[1].roles == (Role.SPONSOR,)

    mock_retrieve.assert_awaited_once_with(
        Collection.USERS,
        ANY,
        PARTICIPANT_FIELDS,
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_check_in_participant_success(
    mock_retrieve_one: AsyncMock,
    mock_raw_update_one: AsyncMock,
) -> None:
    uid = "user123"
    mock_retrieve_one.return_value = {"status": Status.CONFIRMED}
    mock_raw_update_one.return_value = True

    await check_in_participant(uid, USER_ASSOCIATE)

    mock_retrieve_one.assert_awaited_once_with(
        Collection.USERS, {"_id": uid, "roles": {"$exists": True}}, ["status"]
    )
    mock_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": uid},
        {
            "$push": {"checkins": (ANY, USER_ASSOCIATE.uid)},
            "$set": {"status": Status.ATTENDING},
        },
    )


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_check_in_participant_no_record(mock_retrieve_one: AsyncMock) -> None:
    mock_retrieve_one.return_value = None
    with pytest.raises(ValueError, match="No application record found."):
        await check_in_participant("invalid_uid", USER_ASSOCIATE)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_check_in_participant_invalid_status(
    mock_retrieve_one: AsyncMock,
) -> None:
    mock_retrieve_one.return_value = {"status": Status.PENDING_REVIEW}
    with pytest.raises(
        ValueError, match="User is PENDING_REVIEW and can not be checked in."
    ):
        await check_in_participant("user123", USER_ASSOCIATE)


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_add_participant_to_queue_success(
    mock_retrieve_one: AsyncMock,
    mock_raw_update_one: AsyncMock,
) -> None:
    uid = "hacker1"
    mock_retrieve_one.return_value = {
        "status": Status.WAIVER_SIGNED,
        "roles": [Role.HACKER],
    }
    mock_raw_update_one.return_value = True

    await add_participant_to_queue(uid, USER_ASSOCIATE)

    assert mock_raw_update_one.await_count == 2
    # First update: set status to QUEUED
    mock_raw_update_one.assert_any_await(
        Collection.USERS, {"_id": uid}, {"$set": {"status": Status.QUEUED}}
    )
    # Second update: push to queue settings
    mock_raw_update_one.assert_any_await(
        Collection.SETTINGS,
        {"_id": "queue"},
        {"$push": {"users_queue": uid}},
        upsert=True,
    )


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_add_participant_to_queue_not_hacker(
    mock_retrieve_one: AsyncMock,
) -> None:
    uid = "sponsor1"
    mock_retrieve_one.return_value = {
        "status": Status.WAIVER_SIGNED,
        "roles": [Role.SPONSOR],
    }
    with pytest.raises(
        ValueError, match=r"Applicant is a \[<Role.SPONSOR: 'Sponsor'>\], not a hacker."
    ):
        await add_participant_to_queue(uid, USER_ASSOCIATE)


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_confirm_attendance_outside_participants_success(
    mock_retrieve_one: AsyncMock,
    mock_update_one: AsyncMock,
) -> None:
    uid = "sponsor1"
    mock_retrieve_one.return_value = {"status": Status.WAIVER_SIGNED}
    mock_update_one.return_value = True

    await confirm_attendance_outside_participants(uid, USER_DIRECTOR)

    mock_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": uid},
        {"status": Status.ATTENDING},
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
async def test_subevent_checkin_success(mock_raw_update_one: AsyncMock) -> None:
    event_id = "event1"
    uid = "user1"
    mock_raw_update_one.return_value = True

    await subevent_checkin(event_id, uid, USER_ASSOCIATE)

    mock_raw_update_one.assert_awaited_once_with(
        Collection.EVENTS, {"_id": event_id}, {"$push": {"checkins": (uid, ANY)}}
    )


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_get_attending_hackers(mock_retrieve: AsyncMock) -> None:
    mock_retrieve.return_value = [
        {
            "_id": "hacker1",
            "first_name": "Hacker",
            "last_name": "One",
            "roles": [Role.HACKER],
            "status": Status.ATTENDING,
            "decision": Decision.ACCEPTED,
        }
    ]

    hackers = await get_attending_hackers()

    assert len(hackers) == 1
    assert hackers[0].uid == "hacker1"
    mock_retrieve.assert_awaited_once_with(
        Collection.USERS,
        {"roles": Role.HACKER, "status": Status.ATTENDING},
        PARTICIPANT_FIELDS,
    )
