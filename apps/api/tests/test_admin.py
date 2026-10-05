from datetime import datetime
from typing import Any
from unittest.mock import ANY, AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI, HTTPException

from auth import user_identity
from auth.user_identity import NativeUser, UserTestClient
from models.user_record import Role, Status
from routers import admin
from routers.admin import (
    _handle_detailed_scores_review,
    _handle_global_only_review,
    _has_overqualified_score,
    _hacker_applicant_token,
    _is_review_assignable,
    delete_notes,
    GlobalScores,
    DeleteNotesRequest,
    IrvineHacksHackerDetailedScores,
    ZotHacksHackerDetailedScores,
    _handle_irvinehacks_detailed_scores_review,
)
from services.mongodb_handler import Collection

user_identity.JWT_SECRET = "not a good idea"

USER_ICSSC = NativeUser(
    ucinetid="icssc",
    display_name="ICSSC",
    email="icssc@uci.edu",
    affiliations=["group"],
)

USER_REVIEWER = NativeUser(
    ucinetid="alicia",
    display_name="Alicia",
    email="alicia@uci.edu",
    affiliations=["student"],
)

HACKER_REVIEWER_IDENTITY = {
    "_id": "edu.uci.alicia",
    "roles": ["Organizer", "Hacker Reviewer"],
}

USER_DIRECTOR = NativeUser(
    ucinetid="dir",
    display_name="Dir",
    email="dir@uci.edu",
    affiliations=["student"],
)

DIRECTOR_IDENTITY = {"_id": "edu.uci.dir", "roles": ["Organizer", "Director"]}

app = FastAPI()
app.include_router(admin.router)

reviewer_client = UserTestClient(USER_REVIEWER, app)

director_client = UserTestClient(USER_DIRECTOR, app)

SAMPLE_NON_HACKER_PARTICIPANT = {
    "email": "judge@example.com",
    "first_name": "Judge",
    "last_name": "Person",
    "role": Role.JUDGE,
}


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_restricted_admin_route_is_forbidden(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that an admin route is forbidden to an unauthorized user."""
    unauthorized_client = UserTestClient(USER_ICSSC, app)

    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.icssc",
        "roles": ["Mentor"],
    }
    res = unauthorized_client.get("/applicants/hackers")

    mock_mongodb_handler_retrieve_one.assert_awaited_once()
    assert res.status_code == 403


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_reviewer_can_retrieve_organizers_for_summary(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "roles": ["Organizer"],
            "committees": ["Tech"],
        },
    ]

    res = reviewer_client.get("/organizers")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once_with(
        Collection.USERS, {"roles": Role.ORGANIZER}
    )
    assert res.json() == [
        {
            "_id": "edu.uci.petr",
            "first_name": "Peter",
            "last_name": "Anteater",
            "roles": ["Organizer"],
            "committees": ["Tech"],
        },
    ]


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_add_non_hacker_participant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [DIRECTOR_IDENTITY, None]

    res = director_client.post(
        "/non-hacker-participants",
        json=SAMPLE_NON_HACKER_PARTICIPANT,
    )

    assert res.status_code == 201
    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "com.example.judge"},
        {
            "_id": "com.example.judge",
            "first_name": "Judge",
            "last_name": "Person",
            "roles": [Role.JUDGE],
            "status": Status.CONFIRMED,
            "decision": None,
            "is_added_to_slack": False,
            "is_waiver_signed": False,
            "checkins": [],
            "badge_number": None,
        },
        upsert=True,
    )


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_add_workshop_lead_participant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [DIRECTOR_IDENTITY, None]

    res = director_client.post(
        "/non-hacker-participants",
        json={
            **SAMPLE_NON_HACKER_PARTICIPANT,
            "email": "lead@example.com",
            "role": Role.WORKSHOP_LEAD,
        },
    )

    assert res.status_code == 201
    assert mock_mongodb_handler_update_one.await_args is not None
    update = mock_mongodb_handler_update_one.await_args.args[2]
    assert update["roles"] == [Role.WORKSHOP_LEAD]
    assert update["is_waiver_signed"] is False


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_add_guest_participant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [DIRECTOR_IDENTITY, None]

    res = director_client.post(
        "/non-hacker-participants",
        json={
            **SAMPLE_NON_HACKER_PARTICIPANT,
            "email": "guest@example.com",
            "role": Role.GUEST,
        },
    )

    assert res.status_code == 201
    assert mock_mongodb_handler_update_one.await_args is not None
    update = mock_mongodb_handler_update_one.await_args.args[2]
    assert update["roles"] == [Role.GUEST]
    assert update["status"] == Status.CONFIRMED


@patch("services.mongodb_handler.bulk_update", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_import_non_hacker_participants(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_bulk_update: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    mock_mongodb_handler_retrieve.return_value = []

    res = director_client.post(
        "/non-hacker-participants/import",
        json={
            "participants": [
                SAMPLE_NON_HACKER_PARTICIPANT,
                {
                    "email": "guest@example.com",
                    "first_name": "Guest",
                    "last_name": "Person",
                    "role": Role.GUEST,
                },
            ]
        },
    )

    assert res.status_code == 201
    assert res.json() == {"created": 2}
    mock_mongodb_handler_bulk_update.assert_awaited_once()


@patch("services.mongodb_handler.bulk_update", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_cannot_import_duplicate_non_hacker_participants(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_bulk_update: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post(
        "/non-hacker-participants/import",
        json={
            "participants": [
                SAMPLE_NON_HACKER_PARTICIPANT,
                SAMPLE_NON_HACKER_PARTICIPANT,
            ]
        },
    )

    assert res.status_code == 400
    mock_mongodb_handler_retrieve.assert_not_awaited()
    mock_mongodb_handler_bulk_update.assert_not_awaited()


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_cannot_add_duplicate_non_hacker_participant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"_id": "com.example.judge", "roles": [Role.JUDGE]},
    ]

    res = director_client.post(
        "/non-hacker-participants",
        json=SAMPLE_NON_HACKER_PARTICIPANT,
    )

    assert res.status_code == 409
    mock_mongodb_handler_update_one.assert_not_awaited()


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_cannot_retrieve_applicants_without_role(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    """Test that the applicants cannot be processed without correct reviewer role."""

    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY

    res = reviewer_client.get("/applicants/mentors")

    assert res.status_code == 403
    mock_mongodb_handler_retrieve.assert_not_awaited()


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_retrieve_zothacks_mentor_applicants_without_school(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.mentor",
            "first_name": "Zot",
            "last_name": "Mentor",
            "status": "PENDING_REVIEW",
            "roles": ["Applicant", "Mentor"],
            "application_data": {
                "submission_time": datetime(2026, 9, 21, 18, 49, 19),
                "reviews": [],
                "is_18_older": True,
            },
        }
    ]

    res = director_client.get("/applicants/mentors")

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["_id"] == "edu.uci.mentor"
    assert data[0]["application_data"]["school"] is None


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_retrieve_zothacks_mentor_applicant_with_legacy_field_shapes(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {
            "_id": "edu.uci.mentor",
            "first_name": "Zot",
            "last_name": "Mentor",
            "status": "PENDING_REVIEW",
            "roles": ["Applicant", "Mentor"],
            "application_data": {
                "email": "mentor@uci.edu",
                "resume_url": "",
                "submission_time": datetime(2026, 9, 21, 18, 49, 19),
                "reviews": [],
                "is_18_older": True,
                "pronouns": "he/him/his",
                "dietary_restrictions": "No Pork",
                "allergies": "",
                "phone_number": "9495551234",
                "discord_username": "mentor",
                "major": "Computer Science",
                "academic_status": "Undergraduate",
                "linkedin": "",
                "github": "",
                "portfolio": "",
                "tech_stack_frq": "Python and React.",
                "frontend_backend_frq": "I connect APIs to UI with typed contracts.",
                "teaching_experience_frq": "I mentor project teams.",
                "team_leadership_frq": "I keep teams scoped and moving.",
                "comments": "",
            },
        },
    ]

    res = director_client.get("/applicant/mentor/edu.uci.mentor")

    assert res.status_code == 200
    data = res.json()
    assert data["application_data"]["pronouns"] == ["he/him/his"]
    assert data["application_data"]["dietary_restrictions"] == ["No Pork"]
    assert data["application_data"]["resume_url"] is None
    assert data["application_data"]["skill_python"] is None


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("routers.admin.random.shuffle", autospec=True)
def test_hacker_review_assignments_are_created(
    mock_shuffle: MagicMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_shuffle.side_effect = lambda records: records.reverse()
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.applicant1",
            "status": "PENDING",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 1),
            },
            "assigned_reviewers": [],
        },
        {
            "_id": "edu.uci.applicant2",
            "status": "PENDING",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 2),
            },
            "assigned_reviewers": [],
        },
    ]

    res = reviewer_client.get("/review-assignments/hackers")

    assert res.status_code == 200
    assert res.json()["applicant_ids"] == [
        _hacker_applicant_token("edu.uci.applicant2"),
        _hacker_applicant_token("edu.uci.applicant1"),
    ]
    assert res.json()["target_count"] == 10
    mock_shuffle.assert_called_once()
    assert mock_mongodb_handler_raw_update_one.await_count == 2
    first_update = mock_mongodb_handler_raw_update_one.await_args_list[0]
    assert first_update.args == (
        Collection.USERS,
        {"_id": "edu.uci.applicant2"},
        {"$addToSet": {"assigned_reviewers": "edu.uci.alicia"}},
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_review_assignments_keep_active_assignments(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.assigned",
            "status": "PENDING",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 1),
            },
            "assigned_reviewers": ["edu.uci.alicia"],
        },
        {
            "_id": "edu.uci.reviewed",
            "status": "REVIEWED",
            "application_data": {
                "reviews": [[datetime(2026, 1, 2), "edu.uci.alicia", 10, None]],
                "submission_time": datetime(2026, 1, 2),
            },
            "assigned_reviewers": ["edu.uci.alicia"],
        },
    ]

    res = reviewer_client.get("/review-assignments/hackers")

    assert res.status_code == 200
    assert res.json()["applicant_ids"] == [_hacker_applicant_token("edu.uci.assigned")]
    mock_mongodb_handler_raw_update_one.assert_not_awaited()


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_review_assignments_respects_maximum_reviews(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        HACKER_REVIEWER_IDENTITY,
        {"maximum_reviews_per_organizer": 1},
    ]
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.reviewed",
            "status": "REVIEWED",
            "application_data": {
                "reviews": [[datetime(2026, 1, 2), "edu.uci.alicia", 10, None]],
                "submission_time": datetime(2026, 1, 2),
            },
            "assigned_reviewers": ["edu.uci.alicia"],
        },
        {
            "_id": "edu.uci.assigned",
            "status": "PENDING",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 1),
            },
            "assigned_reviewers": ["edu.uci.alicia"],
        },
        {
            "_id": "edu.uci.unassigned",
            "status": "PENDING",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 3),
            },
            "assigned_reviewers": [],
        },
    ]

    res = reviewer_client.get("/review-assignments/hackers")

    assert res.status_code == 200
    assert res.json() == {
        "applicant_ids": [],
        "target_count": 0,
        "completed_count": 1,
    }
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.assigned"},
        {"$pull": {"assigned_reviewers": "edu.uci.alicia"}},
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_review_assignments_caps_active_assignments(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": f"edu.uci.assigned{i}",
            "status": "PENDING",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, i + 1),
            },
            "assigned_reviewers": ["edu.uci.alicia"],
        }
        for i in range(12)
    ]

    res = reviewer_client.get("/review-assignments/hackers")

    assert res.status_code == 200
    assert len(res.json()["applicant_ids"]) == 10
    assert mock_mongodb_handler_raw_update_one.await_count == 2
    first_update = mock_mongodb_handler_raw_update_one.await_args_list[0]
    assert first_update.args == (
        Collection.USERS,
        {"_id": "edu.uci.assigned10"},
        {"$pull": {"assigned_reviewers": "edu.uci.alicia"}},
    )


def test_is_review_assignable_excludes_auto_decided_applicant() -> None:
    record = {
        "_id": "edu.uci.auto",
        "status": "REVIEWED",
        "auto_decision_reason": "UNDER_18",
        "application_data": {"reviews": []},
        "assigned_reviewers": [],
    }

    assert not _is_review_assignable(record, "edu.uci.alicia")


def test_is_review_assignable_excludes_overqualified_applicant() -> None:
    record = {
        "_id": "edu.uci.overqualified",
        "status": "PENDING_REVIEW",
        "application_data": {
            "reviews": [],
            "global_field_scores": {"resume": -1000, "hackathon_experience": 0},
        },
        "assigned_reviewers": [],
    }

    assert not _is_review_assignable(record, "edu.uci.alicia")


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_review_assignments_excludes_auto_decided_applicants(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.auto-decided",
            "status": "REVIEWED",
            "auto_decision_reason": "GRADUATED",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 1),
            },
            "assigned_reviewers": ["edu.uci.alicia"],
        },
        {
            "_id": "edu.uci.assignable",
            "status": "PENDING",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 2),
            },
            "assigned_reviewers": [],
        },
    ]

    res = reviewer_client.get("/review-assignments/hackers")

    assert res.status_code == 200
    assert res.json()["applicant_ids"] == [
        _hacker_applicant_token("edu.uci.assignable")
    ]
    assert mock_mongodb_handler_raw_update_one.await_count == 2
    pull_update = mock_mongodb_handler_raw_update_one.await_args_list[0]
    assert pull_update.args == (
        Collection.USERS,
        {"_id": "edu.uci.auto-decided"},
        {"$pull": {"assigned_reviewers": "edu.uci.alicia"}},
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_review_assignments_excludes_overqualified_applicants(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    mock_mongodb_handler_retrieve_one.return_value = HACKER_REVIEWER_IDENTITY
    mock_mongodb_handler_retrieve.return_value = [
        {
            "_id": "edu.uci.overqualified",
            "status": "PENDING_REVIEW",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 1),
                "global_field_scores": {
                    "resume": -1000,
                    "hackathon_experience": 0,
                },
            },
            "assigned_reviewers": ["edu.uci.alicia"],
        },
        {
            "_id": "edu.uci.assignable",
            "status": "PENDING_REVIEW",
            "application_data": {
                "reviews": [],
                "submission_time": datetime(2026, 1, 2),
                "global_field_scores": {},
            },
            "assigned_reviewers": [],
        },
    ]

    res = reviewer_client.get("/review-assignments/hackers")

    assert res.status_code == 200
    assert res.json()["applicant_ids"] == [
        _hacker_applicant_token("edu.uci.assignable")
    ]
    assert mock_mongodb_handler_raw_update_one.await_count == 2
    pull_update = mock_mongodb_handler_raw_update_one.await_args_list[0]
    assert pull_update.args == (
        Collection.USERS,
        {"_id": "edu.uci.overqualified"},
        {"$pull": {"assigned_reviewers": "edu.uci.alicia"}},
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_submit_nonhacker_review(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a user can properly submit a nonhacker applicant review."""
    post_data = {"applicant": "edu.uci.sydnee", "score": 0}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Mentor"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.sydnee"},
        {
            "$push": {"application_data.reviews": (ANY, "edu.uci.alicia", 0, None)},
            "$set": {"status": "REVIEWED"},
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_submit_hacker_review_with_one_reviewer_works(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a user can properly submit a hacker applicant review."""
    post_data = {"applicant": "edu.uci.sydnee", "score": 0}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.sydnee"},
        {
            "$push": {"application_data.reviews": (ANY, "edu.uci.alicia", 0, None)},
            "$set": {"status": "REVIEWED"},
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_submit_hacker_review_with_two_reviewers_works(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a user can submit a hacker applicant review with 2 reviewers."""
    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post(
        "/review", json={"applicant": "edu.uci.sydnee", "score": 0}
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": "edu.uci.sydnee"},
        {
            "$push": {"application_data.reviews": (ANY, "edu.uci.alicia", 0, None)},
            "$set": {"status": "REVIEWED"},
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_submit_hacker_review_with_three_reviewers_fails(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a hacker applicant review with 3 reviewers fails."""
    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia3", 100],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post(
        "/review", json={"applicant": "edu.uci.sydnee", "score": 0}
    )

    assert res.status_code == 403


@patch("services.ses_handler.send_waitlist_release_email", autospec=True)
@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_waitlisted_applicant_can_be_released(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
    mock_send_waitlist_release_email: AsyncMock,
) -> None:
    """Test waitlisted applicant can be promoted to accepted."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {
            "status": Status.WAITLISTED,
            "first_name": "Peter",
        },
    ]
    mock_mongodb_handler_update_one.return_value = True

    res = director_client.post("/waitlist-release/edu.uci.petr")
    assert res.status_code == 200

    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS, {"_id": "edu.uci.petr"}, {"status": Status.ACCEPTED}
    )
    mock_send_waitlist_release_email.assert_awaited_once_with(
        "Peter",
        "petr@uci.edu",
    )


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_non_waitlisted_applicant_cannot_be_released(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    """Test non-waitlisted applicant cannot be promoted to accepted."""
    mock_mongodb_handler_retrieve_one.side_effect = [DIRECTOR_IDENTITY, None]

    res = director_client.post("/waitlist-release/who.am.i")
    assert res.status_code == 404

    mock_mongodb_handler_update_one.assert_not_awaited()


# TODO: Should uncomment once new applicant summary is created at different route
# @patch("services.mongodb_handler.retrieve_one", autospec=True)
# @patch("services.mongodb_handler.retrieve", autospec=True)
# def test_hacker_applicants_returns_correct_applicants(
#     mock_mongodb_handler_retrieve: AsyncMock,
#     mock_mongodb_handler_retrieve_one: AsyncMock,
# ) -> None:
#     """Test that the /applicants/hackers route returns correctly"""
#     returned_records: list[dict[str, object]] = [
#         {
#             "_id": "edu.uci.sydnee",
#             "first_name": "sydnee",
#             "last_name": "unknown",
#             "status": "REVIEWED",
#             "application_data": {
#                 "school": "Hamburger University",
#                 "submission_time": datetime(2023, 1, 12, 9, 0, 0),
#                 "reviews": [
#                     [datetime(2023, 1, 19), "edu.uci.alicia", 100],
#                     [datetime(2023, 1, 19), "edu.uci.alicia2", 200],
#                 ],
#             },
#         }
#     ]

#     expected_records = [
#         {
#             "_id": "edu.uci.sydnee",
#             "first_name": "sydnee",
#             "last_name": "unknown",
#             "resume_reviewed": False,
#             "status": "REVIEWED",
#             "decision": "ACCEPTED",
#             "avg_score": 150.0,
#             "reviewers": ["edu.uci.alicia", "edu.uci.alicia2"],
#             "application_data": {
#                 "school": "Hamburger University",
#                 "submission_time": "2023-01-12T09:00:00",
#             },
#         },
#     ]

#     returned_thresholds: dict[str, object] = {"accept": 12, "waitlist": 5}

#     mock_mongodb_handler_retrieve.return_value = returned_records
#     mock_mongodb_handler_retrieve_one.side_effect = [
#         HACKER_REVIEWER_IDENTITY,
#         returned_thresholds,
#     ]

#     res = reviewer_client.get("/applicants/hackers")

#     assert res.status_code == 200
#     mock_mongodb_handler_retrieve.assert_awaited_once()
#     data = res.json()
#     assert data == expected_records

# TODO: Use this once new route created for ZH applicants
# @patch("services.mongodb_handler.retrieve_one", autospec=True)
# @patch("services.mongodb_handler.retrieve", autospec=True)
# def test_hacker_applicants_returns_correct_applicants(
#     mock_mongodb_handler_retrieve: AsyncMock,
#     mock_mongodb_handler_retrieve_one: AsyncMock,
# ) -> None:
#     """Test that the /applicants/hackers route returns correctly"""
#     returned_records: list[dict[str, object]] = [
#         {
#             "_id": "edu.uci.sydnee",
#             "first_name": "sydnee",
#             "last_name": "unknown",
#             "status": "REVIEWED",
#             "application_data": {
#                 "school": "Hamburger University",
#                 "submission_time": datetime(2023, 1, 12, 9, 0, 0),
#                 "reviews": [
#                     [datetime(2023, 1, 19), "edu.uci.alicia", 56],
#                     [datetime(2023, 1, 19), "edu.uci.alicia2", 60],
#                 ],
#                 "review_breakdown": {
#                     "alicia": {
#                         "resume": 15,
#                         "elevator_pitch_saq": 6,
#                         "tech_experience_saq": 6,
#                         "learn_about_self_saq": 8,
#                         "pixel_art_saq": 16,
#                         "hackathon_experience": -1000,
#                     },
#                     "alicia2": {
#                         "resume": 15,
#                         "elevator_pitch_saq": 10,
#                         "tech_experience_saq": 10,
#                         "learn_about_self_saq": 10,
#                         "pixel_art_saq": 10,
#                         "hackathon_experience": 5,
#                     },
#                 },
#                 "global_field_scores": {"resume": 15, "hackathon_experience": 5},
#             },
#         }
#     ]

#     expected_records = [
#         {
#             "_id": "edu.uci.sydnee",
#             "first_name": "sydnee",
#             "last_name": "unknown",
#             "resume_reviewed": True,
#             "status": "REVIEWED",
#             "decision": "ACCEPTED",
#             "avg_score": 58.0,
#             "reviewers": ["edu.uci.alicia", "edu.uci.alicia2"],
#             "application_data": {
#                 "school": "Hamburger University",
#                 "submission_time": "2023-01-12T09:00:00",
#             },
#         },
#     ]

#     returned_thresholds: dict[str, object] = {"accept": 12, "waitlist": 5}

#     mock_mongodb_handler_retrieve.return_value = returned_records
#     mock_mongodb_handler_retrieve_one.side_effect = [
#         HACKER_REVIEWER_IDENTITY,
#         returned_thresholds,
#     ]

#     res = reviewer_client.get("/applicants/hackers")

#     assert res.status_code == 200
#     mock_mongodb_handler_retrieve.assert_awaited_once()
#     data = res.json()
#     assert data == expected_records


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_hacker_applicants_returns_correct_applicants(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that the /applicants/hackers route returns correctly"""
    returned_records: list[dict[str, object]] = [
        {
            "_id": "edu.uci.sydnee",
            "first_name": "sydnee",
            "last_name": "unknown",
            "status": "REVIEWED",
            "application_data": {
                "school": "Hamburger University",
                "submission_time": datetime(2023, 1, 12, 9, 0, 0),
                "email": "sydnee@uci.edu",
                "resume_url": "https://example.com/sydnee.pdf",
                "major": "Computer Science",
                "linkedin": None,
                "reviews": [
                    [datetime(2023, 1, 19), "edu.uci.alicia", 56, "comment"],
                    [datetime(2023, 1, 19), "edu.uci.alicia2", 60, "comment2"],
                ],
                "review_breakdown": {
                    "alicia": {
                        "frq_change": 16,
                        "frq_ambition": 14,
                        "frq_character": 12,
                        "previous_experience": 1,
                        "has_socials": 1,
                    },
                    "alicia2": {
                        "frq_change": 15,
                        "frq_ambition": 16,
                        "frq_character": 15,
                        "previous_experience": 1,
                        "has_socials": 1,
                    },
                },
            },
        }
    ]

    expected_records = [
        {
            "_id": "edu.uci.sydnee",
            "first_name": "sydnee",
            "last_name": "unknown",
            "resume_reviewed": False,
            "director_previous_experience_reviewed": False,
            "duplicate_name_approved": False,
            "status": "REVIEWED",
            "decision": "ACCEPTED",
            "auto_decision_reason": None,
            "avg_score": 73.462,
            "is_overqualified": False,
            "reviewers": ["edu.uci.alicia", "edu.uci.alicia2"],
            "application_data": {
                "school": "Hamburger University",
                "submission_time": "2023-01-12T09:00:00",
                "email": "sydnee@uci.edu",
                "resume_url": "https://example.com/sydnee.pdf",
                "extra_points": None,
                "normalized_scores": None,
                "major": "Computer Science",
                "linkedin": None,
                "reviews": [
                    [
                        datetime(2023, 1, 19).isoformat(),
                        "edu.uci.alicia",
                        56.0,
                        "comment",
                    ],
                    [
                        datetime(2023, 1, 19).isoformat(),
                        "edu.uci.alicia2",
                        60.0,
                        "comment2",
                    ],
                ],
            },
        },
    ]

    returned_thresholds: dict[str, object] = {"accept": 12, "waitlist": 5}

    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        returned_thresholds,
        DIRECTOR_IDENTITY,
    ]

    res = director_client.get("/applicants/hackers")

    assert res.status_code == 200
    mock_mongodb_handler_retrieve.assert_awaited_once()
    data = res.json()
    assert data == expected_records


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_hacker_applicants_allows_zothacks_hacker_without_resume(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """ZotHacks hacker resumes are optional, so summaries must allow no resume URL."""
    returned_records: list[dict[str, object]] = [
        {
            "_id": "edu.uci.peter",
            "first_name": "Peter",
            "last_name": "Anteater",
            "status": "PENDING_REVIEW",
            "roles": ["Applicant", "Hacker"],
            "application_data": {
                "school_year": "2nd Year",
                "submission_time": datetime(2026, 9, 21, 9, 0, 0),
                "email": "peter@uci.edu",
                "major": "Computer Science",
                "reviews": [],
                "review_breakdown": {},
                "global_field_scores": {},
            },
        }
    ]
    returned_thresholds: dict[str, object] = {"accept": 12, "waitlist": 5}

    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        returned_thresholds,
        DIRECTOR_IDENTITY,
    ]

    res = director_client.get("/applicants/hackers")

    assert res.status_code == 200
    data = res.json()
    assert data[0]["application_data"]["resume_url"] is None
    assert data[0]["application_data"]["school_year"] == "2nd Year"


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_hacker_applicants_allows_zothacks_hacker_review_breakdown(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """ZotHacks summaries use stored review scores, not IrvineHacks weights."""
    returned_records: list[dict[str, object]] = [
        {
            "_id": "edu.uci.peter",
            "first_name": "Peter",
            "last_name": "Anteater",
            "status": "PENDING_REVIEW",
            "roles": ["Applicant", "Hacker"],
            "application_data": {
                "school_year": "2nd Year",
                "submission_time": datetime(2026, 9, 21, 9, 0, 0),
                "email": "peter@uci.edu",
                "major": "Computer Science",
                "tech_inspiration_saq": "Robots doing surgery are neat.",
                "reviews": [
                    [datetime(2026, 9, 21), "edu.uci.alicia", 70, "good app"],
                ],
                "review_breakdown": {
                    "alicia": {
                        "collaboration_saq": 15,
                        "tech_inspiration_saq": 18,
                        "uci_gift_saq": 14,
                        "drawing_response": 8,
                        "peter_thought_process_saq": 9,
                    }
                },
                "global_field_scores": {},
            },
        }
    ]
    returned_thresholds: dict[str, object] = {"accept": 60, "waitlist": 40}

    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        returned_thresholds,
        DIRECTOR_IDENTITY,
    ]

    res = director_client.get("/applicants/hackers")

    assert res.status_code == 200
    data = res.json()
    assert data[0]["avg_score"] == 70
    assert data[0]["decision"] == "ACCEPTED"


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_hacker_applicants_marks_global_resume_overqualified_rejected(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """A global resume OQ score should show as rejected in summaries."""
    returned_records: list[dict[str, object]] = [
        {
            "_id": "edu.uci.bruh3",
            "first_name": "no",
            "last_name": "no",
            "status": "REVIEWED",
            "roles": ["Applicant", "Hacker"],
            "application_data": {
                "school_year": "1st Year",
                "submission_time": datetime(2026, 9, 6, 9, 0, 0),
                "email": "bruh3@uci.edu",
                "major": "Computer Science",
                "tech_inspiration_saq": "Something.",
                "reviews": [
                    [datetime(2026, 9, 21), "edu.uci.nathan", 70, "reviewed"],
                ],
                "review_breakdown": {},
                "global_field_scores": {
                    "resume": -1000,
                    "hackathon_experience": 0,
                },
            },
        }
    ]
    returned_thresholds: dict[str, object] = {"accept": 60, "waitlist": 40}

    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        returned_thresholds,
        DIRECTOR_IDENTITY,
    ]

    res = director_client.get("/applicants/hackers")

    assert res.status_code == 200
    data = res.json()
    assert data[0]["avg_score"] == -3
    assert data[0]["decision"] == "REJECTED"


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
def test_hacker_applicants_redacts_identity_for_reviewers(
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that hacker reviewers only receive non-identifying applicant data."""
    returned_records: list[dict[str, object]] = [
        {
            "_id": "edu.uci.sydnee",
            "first_name": "sydnee",
            "last_name": "unknown",
            "status": "REVIEWED",
            "application_data": {
                "school": "Hamburger University",
                "submission_time": datetime(2023, 1, 12, 9, 0, 0),
                "email": "sydnee@uci.edu",
                "resume_url": "https://example.com/sydnee.pdf",
                "major": "Computer Science",
                "linkedin": "https://linkedin.com/in/sydnee",
                "reviews": [
                    [datetime(2023, 1, 19), "edu.uci.alicia", 56, "comment"],
                    [datetime(2023, 1, 19), "edu.uci.alicia2", 60, "comment2"],
                ],
                "review_breakdown": {
                    "alicia": {
                        "frq_change": 16,
                        "frq_ambition": 14,
                        "frq_character": 12,
                    },
                    "alicia2": {
                        "frq_change": 15,
                        "frq_ambition": 16,
                        "frq_character": 15,
                    },
                },
            },
        }
    ]
    returned_thresholds: dict[str, object] = {"accept": 12, "waitlist": 5}

    mock_mongodb_handler_retrieve.return_value = returned_records
    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_thresholds,
        HACKER_REVIEWER_IDENTITY,
    ]

    res = reviewer_client.get("/applicants/hackers")

    assert res.status_code == 200
    data = res.json()
    assert data[0]["first_name"] == ""
    assert data[0]["last_name"] == ""
    assert data[0]["director_previous_experience_reviewed"] is False
    assert data[0]["avg_score"] == -1
    assert "school" not in data[0]["application_data"]
    assert "email" not in data[0]["application_data"]
    assert "resume_url" not in data[0]["application_data"]
    assert "linkedin" not in data[0]["application_data"]
    assert data[0]["application_data"]["submission_time"] == "2023-01-12T09:00:00"


@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_applicant_redacts_identity_for_reviewers(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    """Test that hacker reviewer detail pages only receive FRQs."""
    applicant_record: dict[str, object] = {
        "_id": "edu.uci.sydnee",
        "first_name": "sydnee",
        "last_name": "unknown",
        "roles": ["Applicant", "Hacker"],
        "status": "PENDING_REVIEW",
        "application_data": {
            "school": "Hamburger University",
            "submission_time": datetime(2023, 1, 12, 9, 0, 0),
            "email": "sydnee@uci.edu",
            "resume_url": "https://example.com/sydnee.pdf",
            "linkedin": "https://linkedin.com/in/sydnee",
            "frq_change": "project answer",
            "frq_ambition": "ambition answer",
            "frq_character": "character answer",
            "reviews": [],
            "review_breakdown": {},
        },
        "assigned_reviewers": ["edu.uci.alicia"],
    }
    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        HACKER_REVIEWER_IDENTITY,
    ]
    mock_mongodb_handler_retrieve.return_value = [applicant_record]

    res = reviewer_client.get(
        f"/applicant/hacker/{_hacker_applicant_token('edu.uci.sydnee')}"
    )

    assert res.status_code == 200
    data = res.json()
    assert data["first_name"] == ""
    assert data["last_name"] == ""
    assert data["application_data"]["frq_change"] == "project answer"
    assert data["application_data"]["frq_ambition"] == "ambition answer"
    assert data["application_data"]["frq_character"] == "character answer"
    assert data["application_data"]["submission_time"] == "2023-01-12T09:00:00"
    assert data["application_data"]["reviews"] == []
    assert data["application_data"]["review_breakdown"] == {}
    assert "email" not in data["application_data"]
    assert "resume_url" not in data["application_data"]
    assert "linkedin" not in data["application_data"]


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_applicant_hides_direct_uid_urls_for_reviewers(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that reviewers cannot confirm guessed hacker applicant UIDs."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        HACKER_REVIEWER_IDENTITY,
    ]

    res = reviewer_client.get("/applicant/hacker/edu.uci.friend")

    assert res.status_code == 404


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_hacker_applicant_returns_full_application_for_directors(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that directors still receive full hacker applications."""
    applicant_record: dict[str, object] = {
        "_id": "edu.uci.sydnee",
        "first_name": "sydnee",
        "last_name": "unknown",
        "roles": ["Applicant", "Hacker"],
        "status": "PENDING_REVIEW",
        "application_data": {
            "pronouns": ["she"],
            "ethnicity": "Asian",
            "is_first_hackathon": False,
            "school": "Hamburger University",
            "major": "Computer Science",
            "education_level": "fourth-year-undergrad",
            "t_shirt_size": "M",
            "dietary_restrictions": ["none"],
            "allergies": None,
            "ih_reference": ["word_of_mouth"],
            "portfolio": None,
            "linkedin": "https://linkedin.com/in/sydnee",
            "areas_interested": ["software"],
            "frq_change": "project answer",
            "frq_ambition": "ambition answer",
            "frq_character": "character answer",
            "character_head_index": 0,
            "character_body_index": 0,
            "character_feet_index": 0,
            "character_companion_index": 0,
            "is_18_older": True,
            "email": "sydnee@uci.edu",
            "resume_url": "https://example.com/sydnee.pdf",
            "submission_time": datetime(2023, 1, 12, 9, 0, 0),
            "reviews": [],
            "review_breakdown": {},
        },
    }
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        DIRECTOR_IDENTITY,
        applicant_record,
    ]

    res = director_client.get("/applicant/hacker/edu.uci.sydnee")

    assert res.status_code == 200
    data = res.json()
    assert data["first_name"] == "sydnee"
    assert data["last_name"] == "unknown"
    assert data["application_data"]["school"] == "Hamburger University"
    assert data["application_data"]["resume_url"] == "https://example.com/sydnee.pdf"


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_review_on_invalid_value(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a reviewer cannot submit an invalid value."""
    post_data = {"applicant": "edu.uci.sydnee", "score": -100}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Mentor"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 400


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_error_on_hacker_invalid_value(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test for error on hacker with invalid value."""
    post_data = {"applicant": "edu.uci.sydnee", "score": 100}

    returned_record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 0],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        HACKER_REVIEWER_IDENTITY,
        returned_record,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = reviewer_client.post("/review", json=post_data)

    assert res.status_code == 400


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_success(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Test successful resume-only review submission."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=8, hackathon_experience=10)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
    }
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_global_only_review(applicant, scores, reviewer)

    mock_require_lead.assert_awaited_once_with(reviewer)
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": applicant},
        {
            "$set": {
                "application_data.global_field_scores": {
                    "resume": 8,
                    "hackathon_experience": 10,
                }
            }
        },
        upsert=True,
    )


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_overqualified_rejects_applicant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Overqualified global scoring should persist the rejection immediately."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=-1000, hackathon_experience=0)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
    }
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_global_only_review(applicant, scores, reviewer)

    mock_require_lead.assert_awaited_once_with(reviewer)
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": applicant},
        {
            "$set": {
                "application_data.global_field_scores": {
                    "resume": -1000,
                    "hackathon_experience": 0,
                },
                "status": "REVIEWED",
                "decision": "REJECTED",
            },
        },
        upsert=True,
    )


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_can_clear_overqualified_resume_score(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Leads should be able to change an overqualified resume back to unscored."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=-1, hackathon_experience=0)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "status": "REVIEWED",
        "decision": "REJECTED",
        "application_data": {
            "global_field_scores": {
                "resume": -1000,
                "hackathon_experience": 0,
            }
        },
    }
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_global_only_review(applicant, scores, reviewer)

    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": applicant},
        {
            "$set": {
                "application_data.global_field_scores": {"hackathon_experience": 0},
                "status": "PENDING_REVIEW",
            },
            "$unset": {"decision": ""},
        },
        upsert=True,
    )


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_clear_overqualified_keeps_reviewed_status(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Clearing overqualified should preserve reviewed status after two reviews."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=15, hackathon_experience=0)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "status": "REVIEWED",
        "decision": "REJECTED",
        "application_data": {
            "reviews": [
                [datetime(2026, 1, 1), "edu.uci.alicia", 10],
                [datetime(2026, 1, 2), "edu.uci.bob", 12],
            ],
            "global_field_scores": {
                "resume": -1000,
                "hackathon_experience": 0,
            },
        },
    }
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_global_only_review(applicant, scores, reviewer)

    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": applicant},
        {
            "$set": {
                "application_data.global_field_scores": {
                    "resume": 15,
                    "hackathon_experience": 0,
                },
                "status": "REVIEWED",
            },
            "$unset": {"decision": ""},
        },
        upsert=True,
    )


def test_has_overqualified_score_ignores_unselected_resume_score() -> None:
    """The -1 dropdown sentinel is not an overqualified score."""
    record = {
        "application_data": {
            "global_field_scores": {"resume": -1, "hackathon_experience": 0}
        }
    }

    assert not _has_overqualified_score(record)


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_clears_resume_score(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Clearing the resume dropdown removes the stored resume score."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=-1, hackathon_experience=10)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
    }
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_global_only_review(applicant, scores, reviewer)

    # No resume key means resume_reviewed becomes False, so the applicant shows
    # up under "Resume Not Reviewed" again. The applicant was never marked
    # overqualified, so status and decision are left alone.
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": applicant},
        {
            "$set": {
                "application_data.global_field_scores": {"hackathon_experience": 10}
            }
        },
        upsert=True,
    )


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_keeps_zero_resume_score(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """A resume score of 0 is a real score and must not be treated as cleared."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=0, hackathon_experience=10)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
    }
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_global_only_review(applicant, scores, reviewer)

    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": applicant},
        {
            "$set": {
                "application_data.global_field_scores": {
                    "resume": 0,
                    "hackathon_experience": 10,
                }
            }
        },
        upsert=True,
    )


@patch("routers.admin.require_lead", autospec=True)
async def test_handle_global_only_review_forbidden(
    mock_require_lead: AsyncMock,
) -> None:
    """Test resume-only review submission fails without LEAD role."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=8, hackathon_experience=10)
    reviewer = USER_REVIEWER

    mock_require_lead.side_effect = HTTPException(status_code=403, detail="Forbidden")

    with pytest.raises(HTTPException) as exc_info:
        await _handle_global_only_review(applicant, scores, reviewer)

    assert exc_info.value.status_code == 403
    mock_require_lead.assert_awaited_once_with(reviewer)


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_voided_applicant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Test resume-only review submission fails for a voided applicant."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=8, hackathon_experience=10)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "status": Status.VOIDED,
    }

    with pytest.raises(HTTPException) as exc_info:
        await _handle_global_only_review(applicant, scores, reviewer)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Cannot review a voided applicant."
    mock_mongodb_handler_retrieve_one.assert_awaited_once()


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_global_only_review_auto_decided_applicant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Test resume-only review submission fails for an auto-decided applicant."""
    applicant = "edu.uci.test"
    scores = GlobalScores(resume=8, hackathon_experience=10)
    reviewer = USER_REVIEWER

    mock_require_lead.return_value = None
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "status": "REVIEWED",
        "auto_decision_reason": "UNDER_18",
    }

    with pytest.raises(HTTPException) as exc_info:
        await _handle_global_only_review(applicant, scores, reviewer)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Cannot review an auto-decided applicant."
    mock_mongodb_handler_retrieve_one.assert_awaited_once()


@patch("routers.admin._handle_global_only_review", autospec=True)
@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_detailed_scores_review_success(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
    mock_handle_global_only_review: AsyncMock,
) -> None:
    """Test successful detailed scores review submission."""
    applicant = "edu.uci.test"
    scores = ZotHacksHackerDetailedScores(
        resume=8,
        collaboration_saq=7,
        tech_inspiration_saq=9,
        uci_gift_saq=6,
        drawing_response=8,
        peter_thought_process_saq=7,
        hackathon_experience=10,
    )
    reviewer = USER_REVIEWER

    # Mock the applicant record retrieval
    applicant_record = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.return_value = applicant_record
    mock_mongodb_handler_raw_update_one.return_value = True
    # Mock require_lead to succeed (user has Lead role)
    mock_require_lead.return_value = None
    mock_handle_global_only_review.return_value = None

    await _handle_detailed_scores_review(applicant, scores, reviewer)

    mock_require_lead.assert_awaited_once_with(reviewer)
    mock_mongodb_handler_retrieve_one.assert_awaited_once()
    # Should be called twice - once for the review and once for the breakdown
    assert mock_mongodb_handler_raw_update_one.await_count == 2
    # Should call _handle_global_only_review with the correct GlobalScores
    mock_handle_global_only_review.assert_awaited_once_with(
        applicant,
        GlobalScores(resume=8, hackathon_experience=10),
        reviewer,
    )


@patch("routers.admin._handle_global_only_review", autospec=True)
@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_detailed_scores_review_keeps_resume_cleared(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
    mock_handle_global_only_review: AsyncMock,
) -> None:
    """An omitted resume score stays cleared instead of becoming a 0 score."""
    applicant = "edu.uci.test"
    scores = ZotHacksHackerDetailedScores(
        collaboration_saq=7,
        tech_inspiration_saq=9,
        uci_gift_saq=6,
        drawing_response=8,
        peter_thought_process_saq=7,
        hackathon_experience=10,
    )
    reviewer = USER_REVIEWER

    applicant_record = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.return_value = applicant_record
    mock_mongodb_handler_raw_update_one.return_value = True
    mock_require_lead.return_value = None
    mock_handle_global_only_review.return_value = None

    await _handle_detailed_scores_review(applicant, scores, reviewer)

    # A resume of 0 here would mean "Strong" and would re-mark the resume as
    # reviewed, so an untouched dropdown must stay cleared.
    mock_handle_global_only_review.assert_awaited_once_with(
        applicant,
        GlobalScores(resume=-1, hackathon_experience=10),
        reviewer,
    )


@patch("routers.admin._handle_global_only_review", autospec=True)
@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_detailed_scores_review_non_lead_user(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_require_lead: AsyncMock,
    mock_handle_global_only_review: AsyncMock,
) -> None:
    """Test detailed scores review submission with non-Lead user (no global scores)."""
    applicant = "edu.uci.test"
    scores = ZotHacksHackerDetailedScores(
        resume=8,
        collaboration_saq=7,
        tech_inspiration_saq=9,
        uci_gift_saq=6,
        drawing_response=8,
        peter_thought_process_saq=7,
        hackathon_experience=10,
    )
    reviewer = USER_REVIEWER

    # Mock the applicant record retrieval
    applicant_record = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.return_value = applicant_record
    mock_mongodb_handler_raw_update_one.return_value = True
    # Mock require_lead to fail (user doesn't have Lead role)
    mock_require_lead.side_effect = HTTPException(status_code=403, detail="Forbidden")

    await _handle_detailed_scores_review(applicant, scores, reviewer)

    mock_require_lead.assert_awaited_once_with(reviewer)
    mock_mongodb_handler_retrieve_one.assert_awaited_once()
    # Should be called twice - once for the review and once for the breakdown
    # (no global scores)
    assert mock_mongodb_handler_raw_update_one.await_count == 2
    # Should not call _handle_global_only_review
    mock_handle_global_only_review.assert_not_awaited()


@patch("routers.admin.require_lead", autospec=True)
async def test_handle_detailed_scores_review_invalid_score(
    mock_require_lead: AsyncMock,
) -> None:
    """Test detailed scores review submission fails with invalid score."""
    applicant = "edu.uci.test"
    scores = ZotHacksHackerDetailedScores(
        resume=100,  # This will make total score > 100
        collaboration_saq=100,
        tech_inspiration_saq=100,
        uci_gift_saq=100,
        drawing_response=100,
        peter_thought_process_saq=100,
        hackathon_experience=10,
    )
    reviewer = USER_REVIEWER

    with pytest.raises(HTTPException) as exc_info:
        await _handle_detailed_scores_review(applicant, scores, reviewer)

    assert exc_info.value.status_code == 400


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_irvinehacks_detailed_scores_review_accepts_frq_only_scores(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that anonymized reviewers can submit only FRQ scores."""
    applicant = "edu.uci.test"
    scores = IrvineHacksHackerDetailedScores(
        frq_change=20,
        frq_ambition=20,
        frq_character=20,
    )
    reviewer = USER_REVIEWER
    applicant_record = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia2", 100, None],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.return_value = applicant_record
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_irvinehacks_detailed_scores_review(applicant, scores, reviewer)

    first_update = mock_mongodb_handler_raw_update_one.await_args_list[0].args[2]
    pushed_review = first_update["$push"]["application_data.reviews"]
    assert pushed_review[2] == 100
    second_update = mock_mongodb_handler_raw_update_one.await_args_list[1].args[2]
    assert second_update["$set"]["application_data.review_breakdown.alicia"] == {
        "frq_change": 20,
        "frq_ambition": 20,
        "frq_character": 20,
    }


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_irvinehacks_director_previous_experience_does_not_score(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test director previous-experience fields are stored separately from scores."""
    applicant = "edu.uci.test"
    scores = IrvineHacksHackerDetailedScores(
        frq_change=20,
        frq_ambition=20,
        frq_character=20,
        previous_experience=0,
        has_socials=0,
    )
    reviewer = USER_DIRECTOR
    applicant_record = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 80, None],
            ]
        },
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        applicant_record,
        DIRECTOR_IDENTITY,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_irvinehacks_detailed_scores_review(applicant, scores, reviewer)

    review_update = mock_mongodb_handler_raw_update_one.await_args_list[0].args[2]
    pushed_review = review_update["$push"]["application_data.reviews"]
    assert pushed_review[2] == 100

    breakdown_update = mock_mongodb_handler_raw_update_one.await_args_list[1].args[2]
    assert breakdown_update["$set"]["application_data.review_breakdown.dir"] == {
        "frq_change": 20,
        "frq_ambition": 20,
        "frq_character": 20,
    }

    director_update = mock_mongodb_handler_raw_update_one.await_args_list[2].args[2]
    director_review = director_update["$set"][
        "application_data.director_previous_experience_review"
    ]
    assert director_review["reviewer"] == "edu.uci.dir"
    assert director_review["previous_experience"] == 0
    assert director_review["has_socials"] == 0


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_irvinehacks_director_can_submit_previous_experience_only(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test directors can submit previous-experience review without FRQs."""
    applicant = "edu.uci.test"
    scores = IrvineHacksHackerDetailedScores(
        previous_experience=1,
        has_socials=0,
    )
    reviewer = USER_DIRECTOR
    applicant_record = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "application_data": {"reviews": []},
    }

    mock_mongodb_handler_retrieve_one.side_effect = [
        applicant_record,
        DIRECTOR_IDENTITY,
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    await _handle_irvinehacks_detailed_scores_review(applicant, scores, reviewer)

    mock_mongodb_handler_raw_update_one.assert_awaited_once()
    assert mock_mongodb_handler_raw_update_one.await_args is not None
    update = mock_mongodb_handler_raw_update_one.await_args.args[2]
    director_review = update["$set"][
        "application_data.director_previous_experience_review"
    ]
    assert director_review["reviewer"] == "edu.uci.dir"
    assert director_review["previous_experience"] == 1
    assert director_review["has_socials"] == 0


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_detailed_scores_review_applicant_not_found(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Test detailed scores review submission fails when applicant not found."""
    applicant = "edu.uci.test"
    scores = ZotHacksHackerDetailedScores(
        resume=8,
        collaboration_saq=7,
        tech_inspiration_saq=9,
        uci_gift_saq=6,
        drawing_response=8,
        peter_thought_process_saq=7,
        hackathon_experience=10,
    )
    reviewer = USER_REVIEWER

    mock_mongodb_handler_retrieve_one.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        await _handle_detailed_scores_review(applicant, scores, reviewer)

    assert exc_info.value.status_code == 500
    mock_mongodb_handler_retrieve_one.assert_awaited_once()


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_detailed_scores_review_voided_applicant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Test detailed scores review submission fails for a voided applicant."""
    applicant = "edu.uci.test"
    scores = ZotHacksHackerDetailedScores(
        resume=8,
        collaboration_saq=7,
        tech_inspiration_saq=9,
        uci_gift_saq=6,
        drawing_response=8,
        peter_thought_process_saq=7,
        hackathon_experience=10,
    )
    reviewer = USER_REVIEWER

    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "status": Status.VOIDED,
        "application_data": {"reviews": []},
    }

    with pytest.raises(HTTPException) as exc_info:
        await _handle_detailed_scores_review(applicant, scores, reviewer)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Cannot review a voided applicant."
    mock_mongodb_handler_retrieve_one.assert_awaited_once()


@patch("routers.admin.require_lead", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_handle_detailed_scores_review_auto_decided_applicant(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_require_lead: AsyncMock,
) -> None:
    """Test detailed scores review submission fails for an auto-decided applicant."""
    applicant = "edu.uci.test"
    scores = ZotHacksHackerDetailedScores(
        resume=8,
        collaboration_saq=7,
        tech_inspiration_saq=9,
        uci_gift_saq=6,
        drawing_response=8,
        peter_thought_process_saq=7,
        hackathon_experience=10,
    )
    reviewer = USER_REVIEWER

    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "status": "REVIEWED",
        "auto_decision_reason": "DIRECTOR_AUTO_ACCEPT",
        "application_data": {"reviews": []},
    }

    with pytest.raises(HTTPException) as exc_info:
        await _handle_detailed_scores_review(applicant, scores, reviewer)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Cannot review an auto-decided applicant."
    mock_mongodb_handler_retrieve_one.assert_awaited_once()


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_delete_reviewer_notes_success(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test deleting reviewer notes successfully."""

    # Mock the applicant record retrieval with a review and notes
    applicant = "edu.uci.test"
    reviewer = USER_REVIEWER
    review_index = 0
    notes_field_index = 3  # Position of notes in review tuple

    notes = "This is a test note"
    applicant_record = {
        "_id": applicant,
        "roles": ["Applicant", "Hacker"],
        "application_data": {
            "reviews": [[datetime(2026, 1, 11), reviewer.uid, 100, notes]],
        },
    }
    delete_notes_request = DeleteNotesRequest(
        applicant=applicant, review_index=review_index
    )

    # Mock the applicant record retrieval
    mock_mongodb_handler_retrieve_one.return_value = applicant_record
    # Mock the raw update one
    mock_mongodb_handler_raw_update_one.return_value = True

    # Make the request
    await delete_notes(delete_notes_request, reviewer)

    # Assert the applicant record retrieval was called once
    mock_mongodb_handler_retrieve_one.assert_awaited_once()
    # Assert the raw update one was called once with the correct arguments
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": applicant},
        {
            "$set": {f"application_data.reviews.0.{notes_field_index}": None},
        },
    )


@patch("services.mongodb_handler.update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_director_auto_accept_hacker(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_update_one: AsyncMock,
) -> None:
    uid = "edu.uci.zh-mentor"
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"_id": uid, "auto_decision_reason": None},
    ]
    mock_mongodb_handler_update_one.return_value = True

    res = director_client.post(f"/applicant/hacker/{uid}/director-auto-accept")

    assert res.status_code == 200
    mock_mongodb_handler_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": uid},
        {
            "status": "REVIEWED",
            "auto_decision_reason": "DIRECTOR_AUTO_ACCEPT",
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_director_undo_auto_accept_hacker(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    uid = "edu.uci.zh-mentor"
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"_id": uid, "auto_decision_reason": "DIRECTOR_AUTO_ACCEPT"},
    ]
    mock_mongodb_handler_raw_update_one.return_value = True

    res = director_client.post(f"/applicant/hacker/{uid}/director-undo-auto-accept")

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.USERS,
        {"_id": uid},
        {
            "$set": {"status": "PENDING_REVIEW"},
            "$unset": {"auto_decision_reason": "", "decision": ""},
        },
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_director_undo_auto_accept_is_noop_when_not_auto_accepted(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    uid = "edu.uci.zh-mentor"
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        {"_id": uid, "auto_decision_reason": None},
    ]

    res = director_client.post(f"/applicant/hacker/{uid}/director-undo-auto-accept")

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_not_awaited()
