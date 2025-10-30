from typing import Any


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


async def get_all_hacker_apps() -> dict[str, Any]:
    return {}


def get_reviewer_stats(all_apps: dict[str, Any]) -> dict[str, dict[str, int]]:
    return {"ian": {"mean": 10, "sd": 3}}


def update_normalized_scores_for_hacker_applicants(
    all_apps: dict[str, Any], reviewer_stats: dict[str, dict[str, int]]
) -> None:
    pass


async def update_hacker_applicants_in_collection(all_apps: dict[str, Any]) -> None:
    pass
