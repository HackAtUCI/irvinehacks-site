from datetime import datetime

from typing import Any

from admin import applicant_review_processor
from models.user_record import Role


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
            "reviews": [[datetime(2023, 1, 19), "edu.uci.alicia", 100]],
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


def test_avg_score_with_global_field_scores_overqualified() -> None:
    """Test OVERQUALIFIED returned when global_field_scores has negative values."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 10],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 0],
            ],
            "global_field_scores": {
                "resume": -1000,  # Overqualified (auto-reject)
                "hackathon_experience": 5,
            },
        },
    }

    applicant_review_processor._include_avg_score(record)
    assert record["avg_score"] == applicant_review_processor.OVERQUALIFIED


def test_avg_score_with_global_field_scores_positive() -> None:
    """Test normal logic used when global_field_scores has no negative values."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 10],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 0],
            ],
            "global_field_scores": {
                "resume": 15,  # Positive score
                "hackathon_experience": 5,
            },
        },
    }

    applicant_review_processor._include_avg_score(record)
    assert record["avg_score"] == 5  # Normal average of 10 and 0


def test_avg_score_without_global_field_scores() -> None:
    """Test that avg_score works normally when global_field_scores is missing."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 10],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 0],
            ],
        },
    }

    applicant_review_processor._include_avg_score(record)
    assert record["avg_score"] == 5  # Normal average of 10 and 0


def test_avg_score_with_empty_global_field_scores() -> None:
    """Test that avg_score works normally when global_field_scores is empty."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 10],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 0],
            ],
            "global_field_scores": {},
        },
    }

    applicant_review_processor._include_avg_score(record)
    assert record["avg_score"] == 5  # Normal average of 10 and 0


def test_decision_based_on_threshold_with_overqualified() -> None:
    """Test that decision is REJECTED when avg_score is OVERQUALIFIED."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 10],
                [datetime(2023, 1, 19), "edu.uci.alicia2", 0],
            ],
            "global_field_scores": {
                "resume": -1000,  # Overqualified (auto-reject)
                "hackathon_experience": 5,
            },
        },
    }

    applicant_review_processor._include_decision_based_on_threshold(
        record, accept=8.0, waitlist=5.0
    )
    assert record["decision"] == "REJECTED"  # OVERQUALIFIED (-3) < waitlist (5.0)


def test_avg_score_no_reviewer() -> None:
    """Test that avg_score returns when there's only one reviewer."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [],
        },
    }

    applicant_review_processor._include_avg_score(record)
    assert record["avg_score"] == applicant_review_processor.NOT_FULLY_REVIEWED


def test_avg_score_only_one_reviewer() -> None:
    """Test that avg_score returns when there's only one reviewer."""
    record: dict[str, Any] = {
        "_id": "edu.uci.sydnee",
        "status": "REVIEWED",
        "application_data": {
            "reviews": [
                [datetime(2023, 1, 19), "edu.uci.alicia", 10],
            ],
        },
    }

    applicant_review_processor._include_avg_score(record)
    assert record["avg_score"] == 10


def test_avg_score_with_globals_and_breakdown_one_reviewer() -> None:
    """Test that avg_score_with_globals_and_breakdown calculates correctly
    with 1 reviewer.
    """
    record: dict[str, Any] = {
        "_id": "edu.uci.eric",
        "status": "REVIEWED",
        "application_data": {
            "review_breakdown": {
                "vishok": {
                    "frq_change": 15,
                    "frq_ambition": 16,
                    "frq_character": 15,
                    "previous_experience": 1,
                    "has_socials": 1,
                },
            },
        },
    }

    applicant_review_processor._include_avg_score_with_global_and_breakdown(record)
    assert record["avg_score"] == 85.0


def test_avg_score_with_globals_and_breakdown_no_reviewers() -> None:
    """Test that avg_score_with_globals_and_breakdown returns NOT_FULLY_REVIEWED
    with 0 reviewers.
    """
    record: dict[str, Any] = {
        "_id": "edu.uci.eric",
        "status": "REVIEWED",
        "application_data": {
            "review_breakdown": {},
            "global_field_scores": {
                "hackathon_experience": 5,
            },
        },
    }

    applicant_review_processor._include_avg_score_with_global_and_breakdown(record)
    assert record["avg_score"] == applicant_review_processor.NOT_FULLY_REVIEWED


def test_auto_reject_under_18_hacker() -> None:
    """Applicants who marked is_18_older=False are auto-rejected regardless of score."""
    record: dict[str, Any] = {
        "_id": "edu.uci.minor",
        "status": "REVIEWED",
        "roles": [Role.APPLICANT, Role.HACKER],
        "application_data": {
            "is_18_older": False,
            "reviews": [],
            "review_breakdown": {
                "edu.uci.alicia": {
                    "frq_change": 20,
                    "frq_ambition": 20,
                    "frq_character": 20,
                    "previous_experience": 1,
                    "has_socials": 1,
                },
            },
        },
    }

    applicant_review_processor._include_decision_based_on_threshold_and_score_breakdown(
        record, accept=80.0, waitlist=50.0
    )
    assert record["decision"] == "REJECTED"
    assert (
        record["auto_decision_reason"] == applicant_review_processor.AUTO_REASON_UNDER_18
    )


def test_auto_reject_graduated_hacker() -> None:
    """Hackers with education_level == 'graduate' are auto-rejected."""
    record: dict[str, Any] = {
        "_id": "edu.uci.grad",
        "status": "REVIEWED",
        "roles": [Role.APPLICANT, Role.HACKER],
        "application_data": {
            "is_18_older": True,
            "education_level": "graduate",
            "reviews": [],
            "review_breakdown": {},
        },
    }

    applicant_review_processor._include_decision_based_on_threshold_and_score_breakdown(
        record, accept=80.0, waitlist=50.0
    )
    assert record["decision"] == "REJECTED"
    assert (
        record["auto_decision_reason"]
        == applicant_review_processor.AUTO_REASON_GRADUATED
    )


def test_auto_accept_graduated_mentor() -> None:
    """Mentors with education_level == 'graduate' are auto-accepted."""
    record: dict[str, Any] = {
        "_id": "edu.uci.mentor",
        "status": "PENDING_REVIEW",
        "roles": [Role.APPLICANT, Role.MENTOR],
        "application_data": {
            "is_18_older": True,
            "education_level": "graduate",
            "reviews": [],
        },
    }

    applicant_review_processor.include_review_decision(record)
    assert record["decision"] == "ACCEPTED"
    assert (
        record["auto_decision_reason"]
        == applicant_review_processor.AUTO_REASON_GRADUATED
    )


def test_auto_accept_graduated_zothacks_mentor_via_grad_year() -> None:
    """ZotHacks mentors are auto-accepted when graduation_year is in the past."""
    record: dict[str, Any] = {
        "_id": "edu.uci.zhmentor",
        "status": "PENDING_REVIEW",
        "roles": [Role.APPLICANT, Role.MENTOR],
        "application_data": {
            "is_18_older": True,
            "graduation_year": datetime.now().year - 1,
            "reviews": [],
        },
    }

    applicant_review_processor.include_review_decision(record)
    assert record["decision"] == "ACCEPTED"
    assert (
        record["auto_decision_reason"]
        == applicant_review_processor.AUTO_REASON_GRADUATED
    )


def test_auto_decision_skipped_when_no_rule_matches() -> None:
    """Score-based logic still runs when no auto-rule matches; reason is None."""
    record: dict[str, Any] = {
        "_id": "edu.uci.regular",
        "status": "REVIEWED",
        "roles": [Role.APPLICANT, Role.HACKER],
        "application_data": {
            "is_18_older": True,
            "education_level": "third-year-undergrad",
            "reviews": [],
            "review_breakdown": {
                "edu.uci.alicia": {
                    "frq_change": 20,
                    "frq_ambition": 20,
                    "frq_character": 20,
                    "previous_experience": 1,
                    "has_socials": 1,
                },
            },
        },
    }

    applicant_review_processor._include_decision_based_on_threshold_and_score_breakdown(
        record, accept=80.0, waitlist=50.0
    )
    assert record["decision"] == "ACCEPTED"
    assert record["auto_decision_reason"] is None


def test_volunteer_graduated_does_not_auto_decide() -> None:
    """Graduated rule only fires for hackers and mentors, not volunteers."""
    record: dict[str, Any] = {
        "_id": "edu.uci.vol",
        "status": "PENDING_REVIEW",
        "roles": [Role.APPLICANT, Role.VOLUNTEER],
        "application_data": {
            "is_18_older": True,
            "education_level": "graduate",
            "reviews": [],
        },
    }

    applicant_review_processor.include_review_decision(record)
    assert record["decision"] is None
    assert record["auto_decision_reason"] is None
