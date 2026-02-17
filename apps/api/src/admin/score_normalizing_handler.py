from collections import defaultdict
from statistics import mean, stdev
from typing import Any

from pymongo import UpdateOne

from models.user_record import Role
from services import mongodb_handler
from services.mongodb_handler import Collection

GLOBAL_FIELDS = {"resume", "hackathon_experience"}

# Dictionary mapping field names to (total_points, weight_percentage)
# The sum of weight_percentages should be 1.0 (100%)
IH_WEIGHTING_CONFIG = {
    "frq_change": (20, 0.20),
    "frq_ambition": (20, 0.25),
    "frq_character": (20, 0.20),
    "previous_experience": (1, 0.30),
    "has_socials": (1, 0.05),
}


async def add_uids_to_exclude_from_hacker_normalization(uids: list[str]) -> None:
    """Adds UIDS to exclude from hacker normalization to SETTINGS collection"""
    if not uids:
        return

    await mongodb_handler.update_one(
        Collection.SETTINGS,
        {"_id": "excluded_uids_from_normalization"},
        {"excluded_uids": uids},
        upsert=True,
    )


async def add_normalized_scores_to_all_hacker_applicants() -> None:
    """Calculates normalized scores and adds them to all hacker apps"""
    excluded_doc = await mongodb_handler.retrieve_one(
        Collection.SETTINGS, {"_id": "excluded_uids_from_normalization"}
    )
    excluded_uids = excluded_doc.get("excluded_uids", []) if excluded_doc else []
    all_apps_excluding_uids = await get_all_hacker_apps(excluded_uids)
    reviewer_stats = get_reviewer_stats(all_apps_excluding_uids)

    normalized_scores = get_normalized_scores_for_hacker_applicants(
        all_apps_excluding_uids, reviewer_stats
    )

    await update_hacker_applicants_in_collection(normalized_scores)


async def get_all_hacker_apps(excluded_uids: list[str]) -> list[dict[str, object]]:
    # Exclude hackers who have 0's for all frqs
    rb = "$application_data.review_breakdown"
    query: dict[str, Any] = {
        "roles": Role.HACKER,
        "application_data.review_breakdown": {
            "$exists": True,
            "$ne": {},
            "$type": "object",
        },
        "$expr": {
            "$gt": [
                {
                    "$size": {
                        "$filter": {
                            "input": {"$ifNull": [{"$objectToArray": rb}, []]},
                            "as": "review",
                            "cond": {
                                "$and": [
                                    {"$gt": ["$$review.v.frq_change", 0]},
                                    {"$gt": ["$$review.v.frq_ambition", 0]},
                                    {"$gt": ["$$review.v.frq_character", 0]},
                                ]
                            },
                        }
                    }
                },
                0,
            ]
        },
    }

    if excluded_uids:
        query["_id"] = {"$nin": excluded_uids}

    return await mongodb_handler.retrieve(
        Collection.USERS,
        query,
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
            total_score = _get_weighted_score(scores_dict)
            reviewer_totals[reviewer].append(total_score)

    reviewer_stats = {
        reviewer: {
            "mean": mean(scores),
            "std": stdev(scores) if len(scores) > 1 else 1.0,
        }
        for reviewer, scores in reviewer_totals.items()
    }

    # If std is 0 (all scores are the same), fallback to 1.0 to avoid division by zero
    for stat in reviewer_stats.values():
        if stat["std"] == 0:
            stat["std"] = 1.0

    return reviewer_stats


def get_normalized_scores_for_hacker_applicants(
    all_apps: list[dict[str, Any]], reviewer_stats: dict[str, dict[str, float]]
) -> dict[str, dict[str, float]]:
    """
    Compute normalized scores for each applicant and return a dict in the format:
    {
        "app1": {"ian": 0.5, "bob": -0.3},
        "app2": {"ian": 1.2}
    }

    - all_apps: list of applicant dicts
    - reviewer_stats: dict of reviewer mean/std
    """
    result: dict[str, dict[str, float]] = {}

    for app in all_apps:
        app_id = app["_id"]
        breakdown = app.get("application_data", {}).get("review_breakdown", {})
        normalized_scores: dict[str, float] = {}

        for reviewer, scores_dict in breakdown.items():
            total_score = _get_weighted_score(scores_dict)
            stats = reviewer_stats.get(reviewer, {"mean": 0, "std": 1})
            normalized = (total_score - stats["mean"]) / stats["std"]
            normalized_scores[reviewer] = normalized

        result[app_id] = normalized_scores

    return result


async def update_hacker_applicants_in_collection(
    normalized_scores: dict[str, dict[str, float]]
) -> None:
    operations = [
        UpdateOne(
            {"_id": app_id}, {"$set": {"application_data.normalized_scores": scores}}
        )
        for app_id, scores in normalized_scores.items()
    ]

    await mongodb_handler.bulk_update(Collection.USERS, operations)


def _get_weighted_score(scores_dict: dict[str, float]) -> float:
    total_score = sum(
        [
            (score / IH_WEIGHTING_CONFIG[field][0]) * IH_WEIGHTING_CONFIG[field][1]
            for field, score in scores_dict.items()
            if field not in GLOBAL_FIELDS
        ]
    )
    return total_score * 100.0
