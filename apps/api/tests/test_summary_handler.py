from unittest.mock import AsyncMock, patch

from admin.summary_handler import applicant_summary


@patch("services.mongodb_handler.retrieve", autospec=True)
async def test_applicant_summary(mock_mongodb_handler_retrieve: AsyncMock) -> None:
    """Test applicant summary counts by status."""
    mock_mongodb_handler_retrieve.return_value = (
        [{"status": "ACCEPTED"}, {"status": "REJECTED"}] * 20
        + [{"status": "CONFIRMED"}] * 24
        + [{"status": "WAITLISTED"}, {"status": "WAIVER_SIGNED"}] * 3
    )

    summary = await applicant_summary()
    mock_mongodb_handler_retrieve.assert_awaited_once()
    assert dict(summary) == {
        "REJECTED": 20,
        "WAITLISTED": 3,
        "ACCEPTED": 20,
        "WAIVER_SIGNED": 3,
        "CONFIRMED": 24,
    }
