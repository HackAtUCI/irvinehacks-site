from typing import Any, Optional

from models.ApplicationData import Decision

OVERQUALIFIED = -3
NOT_FULLY_REVIEWED = -1

scores_to_decisions: dict[Optional[int], Decision] = {
    100: Decision.ACCEPTED,
    -2: Decision.WAITLISTED,
    0: Decision.REJECTED,
}


def include_hacker_app_fields(
    applicant_record: dict[str, Any], accept_threshold: float, waitlist_threshold: float
) -> None:
    _include_decision_based_on_threshold(
        applicant_record, accept_threshold, waitlist_threshold
    )
    _include_reviewers(applicant_record)
    _include_avg_score(applicant_record)


def include_review_decision(applicant_record: dict[str, Any]) -> None:
    """Sets the applicant's decision as the last submitted review decision or None."""
    reviews = applicant_record["application_data"]["reviews"]
    score: Optional[int] = reviews[-1][2] if reviews else None
    applicant_record["decision"] = scores_to_decisions.get(score)


def get_unique_reviewers(applicant_record: dict[str, Any]) -> set[str]:
    reviews = applicant_record["application_data"]["reviews"]
    unique_reviewers = {t[1] for t in reviews}
    return unique_reviewers


def _get_last_score(reviewer: str, reviews: list[tuple[str, str, float]]) -> float:
    for review in reversed(reviews):
        if review[1] == reviewer:
            return review[2]
    return NOT_FULLY_REVIEWED


def _get_avg_score(
    reviews: list[tuple[str, str, float]], global_field_scores: dict[str, Any]
) -> float:
    # Check global_field_scores first - if any value is less than 0,
    # return OVERQUALIFIED
    if global_field_scores and any(score < 0 for score in global_field_scores.values()):
        return OVERQUALIFIED

    unique_reviewers = {t[1] for t in reviews}
    if len(unique_reviewers) < 2:
        return NOT_FULLY_REVIEWED

    last_score = _get_last_score(unique_reviewers.pop(), reviews)
    last_score2 = _get_last_score(unique_reviewers.pop(), reviews)
    if any([last_score == OVERQUALIFIED, last_score2 == OVERQUALIFIED]):
        return OVERQUALIFIED
    return (last_score + last_score2) / 2


def _include_decision_based_on_threshold(
    applicant_record: dict[str, Any], accept: float, waitlist: float
) -> None:
    avg_score = _get_avg_score(
        applicant_record["application_data"]["reviews"],
        applicant_record["application_data"].get("global_field_scores", {}),
    )
    if avg_score >= accept:
        applicant_record["decision"] = Decision.ACCEPTED
    elif avg_score >= waitlist:
        applicant_record["decision"] = Decision.WAITLISTED
    else:
        applicant_record["decision"] = Decision.REJECTED


def _include_reviewers(applicant_record: dict[str, Any]) -> None:
    unique_reviewers = get_unique_reviewers(applicant_record)
    applicant_record["reviewers"] = sorted(list(unique_reviewers))


def _include_avg_score(applicant_record: dict[str, Any]) -> None:
    applicant_record["avg_score"] = _get_avg_score(
        applicant_record["application_data"]["reviews"],
        applicant_record["application_data"].get("global_field_scores", {}),
    )
