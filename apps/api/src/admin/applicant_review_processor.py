from typing import Any

from pydantic import EmailStr

from models.ApplicationData import Decision


def _extract_personalizations(decision_data: dict[str, Any]) -> tuple[str, EmailStr]:
    name = decision_data["first_name"]
    email = _recover_email_from_uid(decision_data["_id"])
    return name, email


def _recover_email_from_uid(uid: str) -> str:
    """For NativeUsers, the email should still delivery properly."""
    uid = uid.replace("..", "\n")
    *reversed_domain, local = uid.split(".")
    local = local.replace("\n", ".")
    domain = ".".join(reversed(reversed_domain))
    return f"{local}@{domain}"


def _include_review_decision(applicant_record: dict[str, Any]) -> None:
    """Sets the applicant's decision as the last submitted review decision or None."""
    reviews = applicant_record["application_data"]["reviews"]
    applicant_record["decision"] = reviews[-1][2] if reviews else None


def _include_num_reviewers(applicant_record: dict[str, Any]) -> None:
    applicant_record["num_reviewers"] = _get_num_unique_reviewers(applicant_record)


def _include_avg_score(applicant_record: dict[str, Any]) -> None:
    applicant_record["avg_score"] = _get_avg_score(
        applicant_record["application_data"]["reviews"]
    )


def _delete_reviews(applicant_record: dict[str, Any]) -> None:
    del applicant_record["application_data"]["reviews"]


def _get_last_score(reviewer: str, reviews: list[tuple[str, str, float]]) -> float:
    for i in range(len(reviews) - 1, -1, -1):
        if reviews[i][1] == reviewer:
            return reviews[i][2]
    return -1


def _get_avg_score(reviews: list[tuple[str, str, float]]) -> float:
    unique_reviewers = {t[1] for t in reviews}
    if len(unique_reviewers) < 2:
        return -1

    last_score = _get_last_score(unique_reviewers.pop(), reviews)
    last_score2 = _get_last_score(unique_reviewers.pop(), reviews)
    return (last_score + last_score2) / 2


def _set_decision_based_on_threshold(
    applicant_record: dict[str, Any], accept: float, waitlist: float
) -> None:
    avg_score = _get_avg_score(applicant_record["application_data"]["reviews"])
    if avg_score >= accept:
        applicant_record["decision"] = Decision.ACCEPTED
    elif avg_score >= waitlist:
        applicant_record["decision"] = Decision.WAITLISTED
    else:
        applicant_record["decision"] = Decision.REJECTED


def _get_num_unique_reviewers(applicant_record: dict[str, Any]) -> int:
    reviews = applicant_record["application_data"]["reviews"]
    unique_reviewers = {t[1] for t in reviews}
    return len(unique_reviewers)
