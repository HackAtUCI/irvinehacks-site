from datetime import datetime

from typing import Any

from admin import applicant_review_processor


def test_can_include_num_reviewers_from_reviews() -> None:
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

    applicant_review_processor._include_num_reviewers(record)
    assert record["num_reviewers"] == 2


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
