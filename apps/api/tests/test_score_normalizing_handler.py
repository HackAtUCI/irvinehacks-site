from unittest.mock import AsyncMock, patch

from pymongo import UpdateOne

from admin import score_normalizing_handler
from services.mongodb_handler import Collection


def test_get_reviewer_stats() -> None:
    applications = [
        {
            "application_data": {
                "review_breakdown": {
                    "bob": {"frq_change": 10, "frq_ambition": 10, "resume": 100}
                }
            }
        },
        {
            "application_data": {
                "review_breakdown": {
                    "bob": {
                        "frq_change": 10,
                        "frq_ambition": 10,
                        "hackathon_experience": 100,
                    }
                }
            }
        },
    ]

    stats = score_normalizing_handler.get_reviewer_stats(applications)

    # Score for each app: (10/20)*0.20 + (10/20)*0.25 = 0.1 + 0.125 = 0.225
    # Total scaled score: 0.225 * 100 = 22.5
    assert stats["bob"]["mean"] == 22.5
    assert stats["bob"]["std"] == 1.0  # Only one distinct score value


def test_get_normalized_scores_for_hacker_applicants() -> None:
    all_apps = [
        {
            "_id": "app1",
            "application_data": {
                "review_breakdown": {
                    "bob": {"frq_change": 20, "resume": 99},  # exclude resume
                }
            },
        }
    ]

    stats = {"bob": {"mean": 5.0, "std": 5.0}}
    normalized = score_normalizing_handler.get_normalized_scores_for_hacker_applicants(
        all_apps, stats
    )

    # Weighted score for app1: (20/20)*0.20 = 0.2 => 20.0
    # z = (20.0 - 5.0) / 5.0 = 15.0 / 5.0 = 3.0
    assert normalized["app1"]["bob"] == 3.0


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_get_all_hacker_apps(mock_retrieve: AsyncMock) -> None:
    mock_retrieve.return_value = []

    await score_normalizing_handler.get_all_hacker_apps([])

    mock_retrieve.assert_awaited_once()  # hit DB


@patch("services.mongodb_handler.bulk_update", autospec=True)
async def test_update_hacker_applicants_in_collection(
    mock_bulk_update: AsyncMock,
) -> None:
    normalized_scores = {"app1": {"bob": 1.2}}

    expected_operations = [
        UpdateOne(
            {"_id": app_id}, {"$set": {"application_data.normalized_scores": scores}}
        )
        for app_id, scores in normalized_scores.items()
    ]

    await score_normalizing_handler.update_hacker_applicants_in_collection(
        normalized_scores
    )

    mock_bulk_update.assert_awaited_once_with(Collection.USERS, expected_operations)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
@patch.object(
    score_normalizing_handler,
    "update_hacker_applicants_in_collection",
    new_callable=AsyncMock,
)
@patch.object(score_normalizing_handler, "get_all_hacker_apps", new_callable=AsyncMock)
async def test_add_normalized_scores_to_all_hacker_applicants(
    mock_get_all: AsyncMock,
    mock_update: AsyncMock,
    mock_retrieve_one: AsyncMock,
) -> None:
    mock_retrieve_one.return_value = None  # No excluded UIDs settings doc
    mock_get_all.return_value = [
        {
            "_id": "app1",
            "application_data": {"review_breakdown": {"bob": {"frq_change": 20}}},
        }
    ]

    await score_normalizing_handler.add_normalized_scores_to_all_hacker_applicants()

    mock_get_all.assert_awaited_once_with([])

    expected_normalized_scores = {"app1": {"bob": 0.0}}
    mock_update.assert_awaited_once_with(expected_normalized_scores)
