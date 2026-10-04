from datetime import date, datetime, timezone
from unittest.mock import AsyncMock, patch

from admin import summary_handler
from models.user_record import Role
from services.mongodb_handler import Collection


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_applicant_summary(mock_mongodb_handler_retrieve: AsyncMock) -> None:
    """Test applicant summary counts by status."""
    mock_mongodb_handler_retrieve.return_value = (
        [{"status": "ACCEPTED"}, {"status": "REJECTED"}] * 20
        + [{"status": "CONFIRMED"}] * 24
        + [{"status": "WAITLISTED"}, {"status": "WAIVER_SIGNED"}] * 3
    )

    summary = await summary_handler.applicant_summary()

    mock_mongodb_handler_retrieve.assert_awaited_once()
    assert dict(summary) == {
        "REJECTED": 20,
        "WAITLISTED": 3,
        "ACCEPTED": 20,
        "WAIVER_SIGNED": 3,
        "CONFIRMED": 24,
    }


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_applicant_table_projects_summary_fields_only(
    mock_mongodb_handler_retrieve: AsyncMock,
) -> None:
    """Applicant table avoids loading full application payloads."""
    mock_mongodb_handler_retrieve.return_value = [
        {"application_data": {"school": "UC Irvine"}},
        {"application_data": {"school": "UC Irvine"}},
        {"application_data": {"school": "Cal State Long Beach"}},
    ]

    table = await summary_handler.applicant_table(group_by="school")

    mock_mongodb_handler_retrieve.assert_awaited_once_with(
        Collection.USERS,
        {"roles": Role.APPLICANT},
        [
            "application_data.school",
            "application_data.major",
            "application_data.education_level",
            "application_data.school_year",
            "application_data.graduation_year",
            "application_data.pronouns",
            "application_data.ethnicity",
        ],
    )
    assert table == {"UC Irvine": 2, "Cal State Long Beach": 1}


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_applications_by_school(mock_mongodb_handler_retrieve: AsyncMock) -> None:
    """Daily number of applications are grouped by school."""
    mock_mongodb_handler_retrieve.return_value = [
        {
            "application_data": {
                "school": "UC Irvine",
                "submission_time": datetime(1965, 10, 4, 20, 2, 4, tzinfo=timezone.utc),
            },
        },
        {
            "application_data": {
                "school": "UC Irvine",
                "submission_time": datetime(
                    1965, 10, 4, 20, 15, 26, tzinfo=timezone.utc
                ),
            },
        },
        {
            "application_data": {
                "school": "Cal State Long Beach",
                "submission_time": datetime(
                    2024, 12, 17, 18, 4, 11, tzinfo=timezone.utc
                ),
            },
        },
    ]

    applications = await summary_handler.applications_by_school()

    mock_mongodb_handler_retrieve.assert_awaited_once()
    assert applications == {
        "UC Irvine": {date(1965, 10, 4): 2},
        "Cal State Long Beach": {date(2024, 12, 17): 1},
    }


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_applications_by_role(mock_mongodb_handler_retrieve: AsyncMock) -> None:
    """Daily number of applications are grouped by role."""
    mock_mongodb_handler_retrieve.return_value = [
        {
            "roles": ["Applicant", "Hacker"],
            "application_data": {
                "submission_time": datetime(
                    2024, 12, 12, 17, 0, 0, tzinfo=timezone.utc
                ),
            },
        },
        {
            "roles": ["Applicant", "Hacker"],
            "application_data": {
                "submission_time": datetime(
                    2024, 12, 12, 19, 0, 0, tzinfo=timezone.utc
                ),
            },
        },
        {
            "roles": ["Applicant", "Mentor"],
            "application_data": {
                "submission_time": datetime(
                    2024, 12, 14, 18, 0, 0, tzinfo=timezone.utc
                ),
            },
        },
    ]

    applications = await summary_handler.applications_by_role()

    mock_mongodb_handler_retrieve.assert_awaited_once()
    assert applications == {
        "Hacker": {date(2024, 12, 12): 2},
        "Mentor": {date(2024, 12, 14): 1},
        "Volunteer": {},
    }
