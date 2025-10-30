from collections import defaultdict
from statistics import mean, pstdev
from typing import Any

from models.user_record import Role
from services import mongodb_handler
from services.mongodb_handler import Collection

GLOBAL_FIELDS = {"resume", "hackathon_experience"}


async def add_normalized_scores_to_all_hacker_applicants() -> None:
    """
    This should be bound to a button.

    1. Loop through all apps to get reviewer stats
    2. Loop through all apps again to apply reviewer z score
    """
    all_apps = await get_all_hacker_apps()
    reviewer_stats = get_reviewer_stats(all_apps)

    update_normalized_scores_for_hacker_applicants(all_apps, reviewer_stats)
    await update_hacker_applicants_in_collection(all_apps)


async def get_all_hacker_apps() -> list[dict[str, object]]:
    return await mongodb_handler.retrieve(
        Collection.USERS,
        {
            "roles": Role.HACKER,
            "application_data.global_field_scores.resume": {"$gte": 0},
            "application_data.global_field_scores.hackathon_experience": {"$gte": 0},
        },
        [
            "_id",
            "status",
            "application_data.review_breakdown",
            "application_data.global_field_scores",
        ],
    )


def get_reviewer_stats(all_apps: list[dict[str, Any]]) -> dict[str, dict[str, float]]:
    """Compute mean and std for each reviewer across all applications."""
    reviewer_totals: dict[str, list[float]] = defaultdict(list)

    for app in all_apps:
        breakdown = app.get("application_data", {}).get("review_breakdown", {})
        for reviewer, scores_dict in breakdown.items():
            total_score = sum(
                [
                    score
                    for field, score in scores_dict.items()
                    if field not in GLOBAL_FIELDS
                ]
            )
            reviewer_totals[reviewer].append(total_score)

    reviewer_stats = {
        reviewer: {
            "mean": mean(scores),
            "std": pstdev(scores) or 1.0,  # avoid divide-by-zero if all same
        }
        for reviewer, scores in reviewer_totals.items()
    }

    return reviewer_stats


def update_normalized_scores_for_hacker_applicants(
    all_apps: list[dict[str, Any]], reviewer_stats: dict[str, dict[str, float]]
) -> None:
    """
    Update each application in all_apps in-place to include
    normalized scores per reviewer under application_data.normalized_scores.

    all_apps is a list of dicts like:
    {
        "_id": "...",
        "application_data": {
            "review_breakdown": {
                "reviewer1": { "field1": 5, "field2": 20, ... },
                ...
            },
            ...
        }
    }

    reviewer_stats is a dict like:
    {
        "reviewer1": {"mean": 50.0, "std": 10.0},
        ...
    }
    """
    for app in all_apps:
        breakdown = app.get("application_data", {}).get("review_breakdown", {})
        normalized_scores = {}

        for reviewer, scores_dict in breakdown.items():
            total_score = sum(
                [
                    score
                    for field, score in scores_dict.items()
                    if field not in GLOBAL_FIELDS
                ]
            )
            stats = reviewer_stats.get(reviewer, {"mean": 0, "std": 1})
            normalized = (total_score - stats["mean"]) / stats["std"]
            normalized_scores[reviewer] = normalized

        app["application_data"]["normalized_scores"] = normalized_scores


async def update_hacker_applicants_in_collection(
    all_apps: list[dict[str, object]]
) -> None:
    pass
