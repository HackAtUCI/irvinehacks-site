from unittest.mock import AsyncMock, patch

from pymongo import UpdateOne

from admin import score_normalizing_handler
from services.mongodb_handler import Collection


def test_get_reviewer_stats() -> None:
    applications = [
        {
            "application_data": {
                "review_breakdown": {
                    "bob": {"technical": 2, "impact": 3, "resume": 100}
                }
            }
        },
        {
            "application_data": {
                "review_breakdown": {
                    "bob": {"technical": 2, "impact": 3, "hackathon_experience": 100}
                }
            }
        },
    ]

    stats = score_normalizing_handler.get_reviewer_stats(applications)

    # total = 2 + 3 = 5 for both apps
    # std is 0 because there's no variance
    assert stats["bob"]["mean"] == 5
    assert stats["bob"]["std"] == 1.0


def test_get_normalized_scores_for_hacker_applicants() -> None:
    all_apps = [
        {
            "_id": "app1",
            "application_data": {
                "review_breakdown": {
                    "bob": {"a": 10, "resume": 99},  # exclude resume
                }
            },
        }
    ]

    stats = {"bob": {"mean": 5.0, "std": 5.0}}
    normalized = score_normalizing_handler.get_normalized_scores_for_hacker_applicants(
        all_apps, stats
    )

    assert normalized["app1"]["bob"] == 1.0  # z = (10-5)/5 = 1


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_get_all_hacker_apps(mock_retrieve: AsyncMock) -> None:
    mock_retrieve.return_value = []

    await score_normalizing_handler.get_all_hacker_apps()

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


@patch.object(
    score_normalizing_handler,
    "update_hacker_applicants_in_collection",
    new_callable=AsyncMock,
)
@patch.object(score_normalizing_handler, "get_all_hacker_apps", new_callable=AsyncMock)
async def test_add_normalized_scores_to_all_hacker_applicants(
    mock_get_all: AsyncMock,
    mock_update: AsyncMock,
) -> None:

    mock_get_all.return_value = [
        {"_id": "app1", "application_data": {"review_breakdown": {"bob": {"x": 1}}}}
    ]

    await score_normalizing_handler.add_normalized_scores_to_all_hacker_applicants()

    mock_get_all.assert_awaited_once()

    expected_normalized_scores = {"app1": {"bob": 0.0}}
    mock_update.assert_awaited_once_with(expected_normalized_scores)
