import pytest
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture(autouse=True)
def mock_mongodb():
    """
    Globally mock MongoDB by intercepting get_database().
    This matches existing test patterns in test_mongodb_handler.py.
    """

    mock_collection = AsyncMock()
    mock_collection.find_one.return_value = None
    mock_collection.update_one.return_value = MagicMock(acknowledged=True)
    mock_collection.update_many.return_value = MagicMock(acknowledged=True)
    mock_collection.insert_one.return_value = MagicMock(
        acknowledged=True, inserted_id="test-id"
    )
    mock_collection.bulk_write.return_value = MagicMock(
        acknowledged=True, modified_count=1
    )

    mock_db = MagicMock()
    mock_db.__getitem__.return_value = mock_collection

    with patch("services.mongodb_handler.get_database", return_value=mock_db):
        yield