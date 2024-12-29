from datetime import datetime

from typing import Any

from admin import applicant_review_processor


def test_no_decision_from_no_reviews() -> None:
    """Test that a decision is None for an applicant with no reviews."""
    record = {
        "_id": "edu.uci.pham",
        "status": "PENDING_REVIEW",
        "application_data": {
            "reviews": [],
        },
    }

    applicant_review_processor.include_review_decision(record)
    assert record["decision"] is None


def test_can_include_decision_from_reviews() -> None:
    """Test that a decision can be provided for an applicant with reviews."""
    record = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [[datetime(2023, 1, 19), "edu.uci.alicia", "ACCEPTED"]],
        },
    }

    applicant_review_processor.include_review_decision(record)
    assert record["decision"] == "ACCEPTED"


def test_can_include_reviewers_from_reviews() -> None:
    """Test that the number of reviewers are added to an applicant with reviews."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 200],
            ]
        },
    }

    expected_reviewers = ["edu.uci.alicia", "edu.uci.alicia2"]

    applicant_review_processor._include_reviewers(record)
    assert record["reviewers"] == expected_reviewers


def test_can_include_avg_score_from_reviews() -> None:
    """Test that an applicant's average score are added to an applicant with reviews."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 10],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 0],
                [datetime(2023, 1, 19), "edu.uci.alicia", 100],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 200],
            ]
        },
    }

    applicant_review_processor._include_avg_score(record)
    assert record["avg_score"] == 150
