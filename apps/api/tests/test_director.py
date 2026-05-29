from datetime import datetime
from typing import Any
from unittest.mock import ANY, AsyncMock, patch

from fastapi import FastAPI

from auth.user_identity import NativeUser, UserTestClient
from models.ApplicationData import Decision
from models.user_record import Role
from routers import director
from services.mongodb_handler import Collection
from services.sendgrid_handler import Template
from utils.email_handler import IH_SENDER


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
    "committee": ["Tech"],
}

EXPECTED_ORGANIZER = director.OrganizerSummary(
    uid="edu.uci.albert",
    first_name="Albert",
    last_name="Wang",
    roles=[Role.ORGANIZER],
    committees=["Tech"],
)

SCHEDULE_TEMPLATE = {
    '_id': 'templates',
    'templates': [
        {'template_name': 'test2',
         'template_info': {
            'event_dates': [
                    '2026-05-27T22:00:00+00:00', '2026-06-08T22:00:00+00:00'
                ],
            'shifts': [
                {'shift_name': 'f',
                 'location': 'fs',
                    'min_num_organizers': 2,
                    'shift_pts': 2,
                    'organizers': [],
                    'hour': {
                        'start_time': '2026-05-29T19:00:00Z',
                        'end_time': '2026-05-29T20:00:00Z',
                        'director_on_shift': []
                    },
                    'committee_prereq': 'Logistics',
                    'subcommittee_prereq': 'Emcee',
                    'preassigned_orgs': []}
            ],
            'org_availabilities': {}
            }, 'drafts': []}]
    }

EMPTY_TEMPLATE = {
    '_id': 'templates',
    'templates': [],
    }


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
            "committee": ["Tech"],
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
            "committee": ["Tech"],
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
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_apply_reminder_emails(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_sendgrid_handler_send_email: AsyncMock,
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

    mock_sendgrid_handler_send_email.assert_awaited_once_with(
        Template.APPLY_REMINDER,
        IH_SENDER,
        [
            {"email": "petr@uci.edu"},
            {"email": "albert@uci.edu"},
        ],
        True,
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


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_set_thresholds_correctly(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that the /set-thresholds route returns correctly"""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

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


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch("services.mongodb_handler.raw_update_one", autospec=True)
def test_set_thresholds_with_empty_string_correctly(
    mock_mongodb_handler_raw_update_one: AsyncMock,
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that the /set-thresholds route returns correctly with -1"""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post(
        "/set-thresholds", json={"accept": "10", "waitlist": "-1"}
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "hacker_score_thresholds"},
        {"$set": {"accept": 10}},
        upsert=True,
    )


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


@patch("routers.director._process_records_in_batches", autospec=True)
@patch("services.mongodb_handler.retrieve", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_release_hacker_decisions_works(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_retrieve: AsyncMock,
    mock_admin_process_records_in_batches: AsyncMock,
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
    mock_admin_process_records_in_batches.return_value = None

    res = director_client.post("/release/hackers")

    assert res.status_code == 200
    assert returned_records[0]["decision"] == Decision.ACCEPTED


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_retrieve_templates(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that the /templates route works!"""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        SCHEDULE_TEMPLATE,
    ]
    res = director_client.get("/templates")
    assert res.status_code == 200
    data = res.json()
    assert data == [
        {
            "template_name": "test2",
            "template_info": {
                "event_dates": [
                    "2026-05-27T22:00:00Z",
                    "2026-06-08T22:00:00Z",
                ],
                "shifts": [
                    {
                        "shift_name": "f",
                        "location": "fs",
                        "min_num_organizers": 2,
                        "shift_pts": 2,
                        "organizers": [],
                        "hour": {
                            "start_time": "2026-05-29T19:00:00Z",
                            "end_time": "2026-05-29T20:00:00Z",
                            "director_on_shift": [],
                        },
                        "committee_prereq": "Logistics",
                        "subcommittee_prereq": "Emcee",
                        "preassigned_orgs": [],
                    }
                ],
                "org_availabilities": {},
            },
            "drafts": [],
        }
    ]


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_no_templates_to_retrieve(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test for no templates available!"""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        EMPTY_TEMPLATE,
    ]
    res = director_client.get("/templates")
    assert res.status_code == 200
    data = res.json()
    print(data)
    assert data == []


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_retrieve_single_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that a single template can be retrieved by name."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        SCHEDULE_TEMPLATE,
    ]
    res = director_client.get("/templates/test2")
    assert res.status_code == 200
    data = res.json()
    assert data["template_name"] == "test2"
    assert data["event_start"] == "2026-05-27T22:00:00+00:00"
    assert data["event_end"] == "2026-06-08T22:00:00+00:00"
    assert len(data["shifts"]) == 1
    assert data["shifts"][0]["shift_name"] == "f"


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_retrieve_nonexistent_template_returns_404(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that a 404 is returned when template name doesn't exist."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        SCHEDULE_TEMPLATE,
    ]
    res = director_client.get("/templates/nonexistent")
    assert res.status_code == 404


@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_retrieve_template_no_records_returns_404(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """Test that a 404 is returned when there are no templates at all."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        None,
    ]
    res = director_client.get("/templates/test2")
    assert res.status_code == 404


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_rename_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a template can be renamed."""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post(
        "/rename-template",
        json={
            "old_template_name": "test2",
            "new_template_name": "test3",
        },
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {
            "_id": "templates",
            "templates.template_name": "test2",
        },
        {"$set": {"templates.$.template_name": "test3"}},
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_delete_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a template can be deleted."""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post(
        "/delete-template",
        json={"template_name": "test2"},
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once_with(
        Collection.SETTINGS,
        {"_id": "templates"},
        {"$pull": {"templates": {"template_name": "test2"}}},
    )


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_duplicate_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a template can be duplicated."""
    mock_mongodb_handler_retrieve_one.side_effect = [
        DIRECTOR_IDENTITY,
        SCHEDULE_TEMPLATE,
    ]

    res = director_client.post(
        "/duplicate-template",
        json={"old_template_name": "test2"},
    )

    assert res.status_code == 200
    call_args = mock_mongodb_handler_raw_update_one.call_args
    pushed_template = call_args[0][2]["$push"]["templates"]
    assert pushed_template["template_name"] == "Copy of test2"
    assert pushed_template["drafts"] == []


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_create_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a template can be created."""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post(
        "/create-template",
        json={"template_name": "new_template"},
    )

    assert res.status_code == 200
    second_call = mock_mongodb_handler_raw_update_one.call_args_list[1]
    pushed_template = second_call[0][2]["$push"]["templates"]
    assert pushed_template["template_name"] == "new_template"
    assert pushed_template["drafts"] == []


@patch("services.mongodb_handler.raw_update_one", autospec=True)
@patch("services.mongodb_handler.retrieve_one", autospec=True)
def test_can_update_template(
    mock_mongodb_handler_retrieve_one: AsyncMock,
    mock_mongodb_handler_raw_update_one: AsyncMock,
) -> None:
    """Test that a template can be updated."""
    mock_mongodb_handler_retrieve_one.return_value = DIRECTOR_IDENTITY

    res = director_client.post(
        "/update-template",
        json={
            "template_name": "test2",
            "event_dates": [
                "2026-05-27T22:00:00Z",
                "2026-06-08T22:00:00Z",
            ],
            "shifts": [
                {
                    "shift_name": "f",
                    "location": "fs",
                    "min_num_organizers": 2,
                    "shift_pts": 2,
                    "organizers": [],
                    "hour": {
                        "start_time": "2026-05-29T19:00:00Z",
                        "end_time": "2026-05-29T20:00:00Z",
                        "director_on_shift": [],
                    },
                    "committee_prereq": "Logistics",
                    "subcommittee_prereq": "Emcee",
                    "preassigned_orgs": [],
                }
            ],
        },
    )

    assert res.status_code == 200
    mock_mongodb_handler_raw_update_one.assert_awaited_once()
    call_args = mock_mongodb_handler_raw_update_one.call_args
    assert call_args[1]["array_filters"] == [{"t.template_name": "test2"}]