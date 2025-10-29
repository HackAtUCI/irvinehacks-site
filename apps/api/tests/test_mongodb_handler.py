from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from pymongo.results import InsertOneResult, UpdateResult

from services import mongodb_handler
from services.mongodb_handler import Collection

SAMPLE_DOCUMENT = {"_id": "my-id", "email": "hack@uci.edu"}


@patch("services.mongodb_handler.get_database")
async def test_insert_document_success(mock_DB: MagicMock) -> None:
    """Test that inserting a document successfully returns the document id"""
    mock_collection = AsyncMock()
    mock_collection.insert_one.return_value = InsertOneResult(
        "my-id", acknowledged=True
    )
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    data = {"_id": "my-id", "email": "hack@uci.edu"}
    result = await mongodb_handler.insert(Collection.TESTING, data)

    mock_collection.insert_one.assert_awaited_once_with(data)
    assert result == "my-id"


@patch("services.mongodb_handler.get_database")
async def test_insert_document_failure(mock_DB: MagicMock) -> None:
    """Test that a lack of write acknowledgement of insertion causes a RuntimeError"""
    mock_collection = AsyncMock()
    mock_collection.insert_one.return_value = InsertOneResult("", acknowledged=False)
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    data = {"_id": "my-id", "email": "hack@uci.edu"}
    with pytest.raises(RuntimeError):
        await mongodb_handler.insert(Collection.TESTING, data)
        mock_collection.insert_one.assert_awaited_once_with(data)


@patch("services.mongodb_handler.get_database")
async def test_retrieve_one_existing_document(mock_DB: MagicMock) -> None:
    """Test that single existing document can be retrieved"""
    mock_collection = AsyncMock()
    mock_collection.find_one.return_value = SAMPLE_DOCUMENT
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    query = {"_id": "my-id"}
    result = await mongodb_handler.retrieve_one(Collection.TESTING, query)
    mock_collection.find_one.assert_awaited_once_with(query, [])
    assert result == SAMPLE_DOCUMENT


@patch("services.mongodb_handler.get_database")
async def test_retrieve_existing_documents(mock_DB: MagicMock) -> None:
    """Test that multiple existing documents can be retrieved"""
    SAMPLE_DOCUMENTS = [
        {"_id": 0, "roles": ["Hacker"]},
        {"_id": 1, "roles": ["Hacker"]},
    ]

    mock_collection = Mock()
    mock_cursor = AsyncMock()
    mock_cursor.to_list.return_value = SAMPLE_DOCUMENTS
    mock_collection.find.return_value = mock_cursor
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    query = {"roles": "Hacker"}
    result = await mongodb_handler.retrieve(Collection.TESTING, query)
    mock_collection.find.assert_called_once_with(query, [])
    assert result == SAMPLE_DOCUMENTS


@patch("services.mongodb_handler.get_database")
async def test_update_existing_document(mock_DB: MagicMock) -> None:
    """Test that single existing document can be updated"""
    mock_collection = AsyncMock()
    mock_collection.update_one.return_value = UpdateResult(
        {
            "n": 1,
            "nModified": 1,
        },
        True,
    )
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    query = {"_id": "my-id"}
    update = {"name": "hack"}
    result = await mongodb_handler.update_one(Collection.TESTING, query, update)
    mock_collection.update_one.assert_awaited_once_with(
        query, {"$set": update}, upsert=False
    )
    assert result is True


@patch("services.mongodb_handler.get_database")
async def test_upsert_existing_document(mock_DB: MagicMock) -> None:
    """Test that single existing document can be upserted"""
    mock_collection = AsyncMock()
    mock_collection.update_one.return_value = UpdateResult(
        {
            "n": 1,
            "nModified": 1,
        },
        True,
    )
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    query = {"_id": "my-id"}
    update = {"status": "accepted"}
    result = await mongodb_handler.update_one(
        Collection.TESTING, query, update, upsert=True
    )
    mock_collection.update_one.assert_awaited_once_with(
        query, {"$set": update}, upsert=True
    )
    assert result is True


@patch("services.mongodb_handler.get_database")
async def test_update_existing_document_failure(mock_DB: MagicMock) -> None:
    """Test that lack of acknowledgement during update causes RuntimeError"""
    mock_collection = AsyncMock()
    mock_collection.update_one.return_value = UpdateResult(dict(), False)
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    with pytest.raises(RuntimeError):
        query = {"_id": "my-id"}
        await mongodb_handler.update_one(Collection.TESTING, query, {"name": "hack"})
        mock_collection.update_one.assert_awaited_once_with(
            query, {"$set": {"name": "hack"}}
        )


@patch("services.mongodb_handler.get_database")
async def test_update_existing_documents(mock_DB: MagicMock) -> None:
    """Test that multiple existing documents can be updated"""
    mock_collection = AsyncMock()
    mock_collection.update_many.return_value = UpdateResult(
        {
            "n": 20,
            "nModified": 20,
        },
        True,
    )
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    query = {"_id": "my-id"}
    update = {"status": "ACCEPTED"}
    result = await mongodb_handler.update(Collection.TESTING, query, update)
    mock_collection.update_many.assert_awaited_once_with(query, {"$set": update})
    assert result is True


@patch("services.mongodb_handler.get_database")
async def test_update_existing_documents_failure(mock_DB: MagicMock) -> None:
    """Test that lack of acknowledgement during update causes RuntimeError"""
    mock_collection = AsyncMock()
    mock_collection.update_many.return_value = UpdateResult(dict(), False)
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection

    mock_DB.return_value = mock_db_instance

    update = {"status": "ACCEPTED"}
    with pytest.raises(RuntimeError):
        query = {"_id": "my-id"}
        await mongodb_handler.update(Collection.TESTING, query, update)
        mock_collection.update_many.assert_awaited_once_with(query, {"$set": update})


@patch("services.mongodb_handler.get_database")
async def test_retrieve_documents_sorted_descending(mock_DB: MagicMock) -> None:
    """Test that retrieve applies descending sort correctly"""
    SAMPLE_DOCUMENTS = [
        {"_id": 2, "application_data": {"submission_time": 20}},
        {"_id": 1, "application_data": {"submission_time": 10}},
    ]

    mock_collection = Mock()
    mock_cursor = AsyncMock()
    mock_cursor.to_list.return_value = SAMPLE_DOCUMENTS
    mock_collection.find.return_value.sort.return_value = mock_cursor

    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__.return_value = mock_collection
    mock_DB.return_value = mock_db_instance

    query = {"roles": "Hacker"}
    sort = [("application_data.submission_time", -1)]

    result = await mongodb_handler.retrieve(Collection.TESTING, query, sort=sort)

    mock_collection.find.assert_called_once_with(query, [])
    mock_collection.find.return_value.sort.assert_called_once_with(sort)
    assert result == SAMPLE_DOCUMENTS
