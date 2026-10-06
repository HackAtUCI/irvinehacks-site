from datetime import datetime
from typing import Any
from unittest.mock import ANY, AsyncMock, MagicMock, call, patch

from fastapi import FastAPI

from auth.user_identity import NativeUser, UserTestClient
from models.ApplicationData import Decision
from models.user_record import Role, Status
from routers import director
from services.mongodb_handler import Collection


USER_REVIEWER = NativeUser(
    ucinetid="alicia",
    display_name="Alicia",
    email="alicia@uci.edu",
    affiliations=["student"],
)

USER_DIRECTOR = NativeUser(
    ucinetid="dir",
    display_name="Dir",
    email="dir@uci.edu",
    affiliations=["student"],
)

HACKER_REVIEWER_IDENTITY = {
    "_id": "edu.uci.alicia",
    "roles": ["Organizer", "Hacker Reviewer"],
}

DIRECTOR_IDENTITY = {"_id": "edu.uci.dir", "roles": [Role.ORGANIZER, Role.DIRECTOR]}

app = FastAPI()
app.include_router(director.router)

reviewer_client = UserTestClient(USER_REVIEWER, app)

director_client = UserTestClient(USER_DIRECTOR, app)

SAMPLE_ORGANIZER = {
    "email": "albert@uci.edu",
    "first_name": "Albert",
    "last_name": "Wang",
    "roles": [Role.ORGANIZER],
    "committees": ["Tech"],
}

EXPECTED_ORGANIZER = director.OrganizerSummary(
    uid="edu.uci.albert",
    first_name="Albert",
    last_name="Wang",
    roles=[Role.ORGANIZER],
    committees=["Tech"],
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
            "committees": ["Tech"],
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
            "committees": ["Tech"],
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

    mock_mongodb_handler_update_one.assert_has_awaits(
        [
            call(
                Collection.USERS,
                {"_id": EXPECTED_ORGANIZER.uid},
                EXPECTED_ORGANIZER.model_dump(),
                upsert=True,
            ),
            call(
                Collection.USERS,
                {"_id": EXPECTED_ORGANIZER.uid},
                EXPECTED_ORGANIZER.model_dump(),
                upsert=True,
            ),
        ]
    )
    assert mock_mongodb_handler_update_one.await_count == 2
    assert res.status_code == 201


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
def test_can_update_organizer_in_current_hackathon_database(
    mock_mongodb_handler_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that organizer info is updated in the current hackathon database."""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    roles = [Role.ORGANIZER, Role.DIRECTOR]
    committees = ["Tech", "Marketing"]

    res = director_client.post(
        "/update-organizers",
        json={
            "uid": EXPECTED_ORGANIZER.uid,
            "first_name": "Al",
            "last_name": "Wong",
            "roles": roles,
            "committees": committees,
        },
    )

    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": EXPECTED_ORGANIZER.uid},
        {
            "_id": EXPECTED_ORGANIZER.uid,
            "first_name": "Al",
            "last_name": "Wong",
            "roles": roles,
            "committees": committees,
        },
        upsert=True,
    )
    assert res.status_code == 200


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.delete_one", autospec=True)
def test_can_delete_organizer_in_current_hackathon_database(
    mock_mongodb_handler_delete_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that organizers are deleted in the current hackathon database."""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post(
        "/delete-organizers",
        json={"uid": EXPECTED_ORGANIZER.uid},
    )

    mock_mongodb_handler_delete_one.assert_awaited_once_with(
        Collection.USERS, {"_id": EXPECTED_ORGANIZER.uid}
    )
    assert res.status_code == 200


@patch("services.ses_handler.send_apply_reminder_emails", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_apply_reminder_emails(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_send_apply_reminder_emails: AsyncMock,
) -> None:
    """Test that users that haven't submitted an application will be sent an email"""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"recipients": ["edu.uci.emailsent"]},
    ]
    mock_mongodb_handler_retrieve.return_value = [
        {"_id": "edu.uci.emailsent"},
        {"_id": "edu.uci.petr"},
        {"_id": "edu.uci.albert"},
    ]

    res = director_client.post("/apply-reminder")
    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.return_value = True
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.EMAILS,
        {"_id": "apply_reminder"},
        {
            "$push": {
                "senders": (ANY, "edu.uci.dir", 2),
                "recipients": {"$each": ["edu.uci.petr", "edu.uci.albert"]},
            },
        },
        upsert=True,
    )

    mock_send_apply_reminder_emails.assert_awaited_once_with(
        ["petr@uci.edu", "albert@uci.edu"]
    )


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_get_apply_reminder_senders(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test getting all senders of apply reminder emails"""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {
            "_id": "apply_reminder",
            "senders": [(datetime(2025, 1, 10), "edu.uci.dir", 2)],
        },
    ]

    res = director_client.get("/apply-reminder")
    assert res.status_code == 200
    mock_mongodb_handler_retrieve_one.assert_awaited_with(
        Collection.EMAILS,
        {"_id": "apply_reminder"},
        ["senders"],
    )


@patch("routers.director._sync_hacker_decisions_with_thresholds", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_set_thresholds_correctly(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_sync_hacker_decisions: AsyncMock,
) -> None:
    """Test that the /set-thresholds route returns correctly"""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"accept": 7.5, "waitlist": 6.3},
    ]

    res = director_client.post(
        "/set-thresholds", json={"accept": "10", "waitlist": "5"}
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "hacker_score_thresholds"},
        {"$set": {"accept": 10, "waitlist": 5}},
        upsert=True,
    )
    mock_sync_hacker_decisions.assert_awaited_once_with({"accept": 10, "waitlist": 5})


@patch("routers.director._sync_hacker_decisions_with_thresholds", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_set_normalized_thresholds_correctly(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_sync_hacker_decisions: AsyncMock,
) -> None:
    """Test that the /set-thresholds route accepts normalized threshold values."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"accept": 7.5, "waitlist": 6.3},
    ]

    res = director_client.post(
        "/set-thresholds", json={"accept": "0.49", "waitlist": "-0.25"}
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "hacker_score_thresholds"},
        {"$set": {"accept": 0.49, "waitlist": -0.25}},
        upsert=True,
    )
    mock_sync_hacker_decisions.assert_awaited_once_with(
        {"accept": 0.49, "waitlist": -0.25}
    )


@patch("services.mongodb_handler.bulk_update", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_sync_hacker_decisions_with_thresholds_uses_normalized_scores(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_bulk_update: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.accepted",
            "roles": [Role.APPLICANT, Role.HACKER],
            "status": Status.REVIEWED,
            "application_data": {
                "tech_inspiration_saq": "AI response",
                "reviews": [[datetime(2026, 10, 6), "edu.uci.reviewer", 0]],
                "review_breakdown": {
                    "reviewer": {
                        "collaboration_saq": 8,
                        "tech_inspiration_saq": 8,
                        "uci_gift_saq": 8,
                        "peter_thought_process_saq": 8,
                    }
                },
                "normalized_scores": {"reviewer": 0.5},
            },
        },
        {
            "_id": "edu.uci.waitlisted",
            "roles": [Role.APPLICANT, Role.HACKER],
            "status": Status.REVIEWED,
            "application_data": {
                "tech_inspiration_saq": "AI response",
                "reviews": [[datetime(2026, 10, 6), "edu.uci.reviewer", 100]],
                "review_breakdown": {
                    "reviewer": {
                        "collaboration_saq": 6,
                        "tech_inspiration_saq": 6,
                        "uci_gift_saq": 6,
                        "peter_thought_process_saq": 6,
                    }
                },
                "normalized_scores": {"reviewer": 0.0},
            },
        },
        {
            "_id": "edu.uci.rejected",
            "roles": [Role.APPLICANT, Role.HACKER],
            "status": Status.REVIEWED,
            "application_data": {
                "tech_inspiration_saq": "AI response",
                "reviews": [[datetime(2026, 10, 6), "edu.uci.reviewer", 100]],
                "review_breakdown": {
                    "reviewer": {
                        "collaboration_saq": 4,
                        "tech_inspiration_saq": 4,
                        "uci_gift_saq": 4,
                        "peter_thought_process_saq": 4,
                    }
                },
                "normalized_scores": {"reviewer": -0.5},
            },
        },
    ]

    synced_count = await director._sync_hacker_decisions_with_thresholds(
        {"accept": 0.49, "waitlist": -0.25}
    )

    assert synced_count == 3
    mock_mongodb_handler_bulk_update.assert_awaited_once()
    assert mock_mongodb_handler_bulk_update.await_args is not None
    operations = mock_mongodb_handler_bulk_update.await_args.args[1]
    assert [operation._filter["_id"] for operation in operations] == [
        "edu.uci.accepted",
        "edu.uci.waitlisted",
        "edu.uci.rejected",
    ]
    assert [operation._doc["$set"]["decision"] for operation in operations] == [
        Decision.ACCEPTED,
        Decision.WAITLISTED,
        Decision.REJECTED,
    ]


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_organizer_set_thresholds_forbidden(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test whether anyone below a director can change threshold."""
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY

    res = reviewer_client.post(
        "/set-thresholds", json={"accept": "12", "waitlist": "5"}
    )

    assert res.status_code == 403


@patch("routers.director._process_hacker_release_batch", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_release_hacker_decisions_works(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_process_hacker_release_batch: AsyncMock,
) -> None:
    """Test that the /release/hackers route works"""
    returned_records: list[dict[str, Any]] = [
        {
            "_id": "edu.uci.sydnee",
            "first_name": "sydnee",
            "application_data": {
                "reviews": [
                    [datetime(2023, 1, 19), "edu.uci.alicia", 100],
                    [datetime(2023, 1, 19), "edu.uci.alicia2", 300],
                ]
            },
        }
    ]

    threshold_record: dict[str, Any] = {"accept": 10, "waitlist": 5}

    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        threshold_record,
    ]
    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_process_hacker_release_batch.return_value = {
        "processed": 1,
        "remaining": 0,
        "complete": True,
    }

    res = director_client.post("/release/hackers")

    assert res.status_code == 200
    assert res.json() == {"processed": 1, "remaining": 0, "complete": True}
    assert returned_records[0]["decision"] == Decision.ACCEPTED


@patch("routers.director.DECISION_EMAIL_BATCH_SIZE", 2)
@patch("routers.director._process_batch", autospec=True)
async def test_process_hacker_release_batch_limits_batch_size(
    mock_process_batch: AsyncMock,
) -> None:
    records: list[dict[str, Any]] = [
        {"_id": "edu.uci.test1", "decision": Decision.ACCEPTED},
        {"_id": "edu.uci.test2", "decision": Decision.WAITLISTED},
        {"_id": "edu.uci.test3", "decision": Decision.REJECTED},
    ]

    res = await director._process_hacker_release_batch(records)

    assert res.processed == 2
    assert res.remaining == 1
    assert not res.complete
    mock_process_batch.assert_has_awaits(
        [
            call((records[0],), Decision.ACCEPTED, Role.HACKER),
            call((records[1],), Decision.WAITLISTED, Role.HACKER),
        ]
    )


@patch("routers.director._process_batch", autospec=True)
async def test_process_hacker_release_batch_groups_decision_emails(
    mock_process_batch: AsyncMock,
) -> None:
    records: list[dict[str, Any]] = [
        {"_id": "edu.uci.accepted1", "decision": Decision.ACCEPTED},
        {"_id": "edu.uci.waitlisted1", "decision": Decision.WAITLISTED},
        {"_id": "edu.uci.rejected1", "decision": Decision.REJECTED},
    ]

    res = await director._process_hacker_release_batch(records)

    assert res.processed == 3
    assert res.remaining == 0
    assert res.complete
    mock_process_batch.assert_has_awaits(
        [
            call((records[0],), Decision.ACCEPTED, Role.HACKER),
            call((records[1],), Decision.WAITLISTED, Role.HACKER),
            call((records[2],), Decision.REJECTED, Role.HACKER),
        ]
    )


@patch("routers.director.utc_now", autospec=True)
@patch("utils.email_handler.send_decision_email", autospec=True)
@patch("services.mongodb_handler.update", autospec=True)
async def test_process_batch_updates_status_sends_emails_and_marks_sent(
    mock_mongodb_handler_update: AsyncMock,
    mock_send_decision_email: AsyncMock,
    mock_utc_now: MagicMock,
) -> None:
    mock_mongodb_handler_update.return_value = True
    started_at = datetime(2026, 10, 5, 1, 2, 3)
    sent_at = datetime(2026, 10, 5, 1, 2, 4)
    mock_utc_now.side_effect = [started_at, sent_at]
    batch: tuple[dict[str, Any], ...] = (
        {"_id": "edu.uci.accepted1", "first_name": "Accepted"},
        {"_id": "edu.uci.accepted2", "first_name": "AlsoAccepted"},
    )

    await director._process_batch(batch, Decision.ACCEPTED, Role.HACKER)

    mock_mongodb_handler_update.assert_has_awaits(
        [
            call(
                Collection.USERS,
                {"_id": {"$in": ["edu.uci.accepted1", "edu.uci.accepted2"]}},
                {
                    "decision": Decision.ACCEPTED,
                    "status": Status.ACCEPTED,
                    "decision_email_release_started_at": started_at,
                },
            ),
            call(
                Collection.USERS,
                {"_id": {"$in": ["edu.uci.accepted1", "edu.uci.accepted2"]}},
                {
                    "decision_email_sent_at": sent_at,
                    "decision_email_type": Role.HACKER.value,
                },
            ),
        ]
    )
    mock_send_decision_email.assert_awaited_once()
    assert mock_send_decision_email.await_args is not None
    recipients = list(mock_send_decision_email.await_args.args[0])
    assert recipients == [
        ("Accepted", "accepted1@uci.edu"),
        ("AlsoAccepted", "accepted2@uci.edu"),
    ]
    assert mock_send_decision_email.await_args.args[1:] == (
        Decision.ACCEPTED,
        Role.HACKER,
    )


@patch("services.ses_handler.send_waitlist_transfer_emails", autospec=True)
@patch("services.mongodb_handler.update", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_waitlist_transfer_uses_status_as_source_of_truth(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_update: AsyncMock,
    mock_send_waitlist_transfer_emails: AsyncMock,
) -> None:
    """Only currently accepted statuses should be transferred to waitlist."""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    mock_mongodb_handler_retrieve.return_value = []
    mock_mongodb_handler_update.return_value = True

    res = director_client.post("/waitlist-transfer")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once_with(
        Collection.USERS,
        {
            "roles": Role.HACKER,
            "status": {"$in": [Status.ACCEPTED, Status.WAIVER_SIGNED]},
        },
        ["_id", "first_name"],
    )
    mock_send_waitlist_transfer_emails.assert_not_awaited()


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_void_applicant_succeeds(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """Test that a director can void an applicant."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"status": "REVIEWED"},
    ]
    mock_mongodb_handler_update_one.return_value = True

    res = director_client.post("/void-applicant/edu.uci.someone")

    assert res.status_code == 200
    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.someone"},
        {"status": Status.VOIDED},
    )


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_void_applicant_404_when_missing(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """Test that voiding a non-existent applicant returns 404."""
    mock_mongodb_handler_retrieve_one.side_effect = [DIRECTOR_IDENTITY, None]

    res = director_client.post("/void-applicant/edu.uci.ghost")

    assert res.status_code == 404
    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_void_applicant_400_when_already_voided(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """Test that voiding an already-voided applicant returns 400."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"status": Status.VOIDED},
    ]

    res = director_client.post("/void-applicant/edu.uci.someone")

    assert res.status_code == 400
    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_void_applicant_forbidden_for_non_director(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that non-directors cannot void applicants."""
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY

    res = reviewer_client.post("/void-applicant/edu.uci.someone")

    assert res.status_code == 403
