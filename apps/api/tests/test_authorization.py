from unittest.mock import AsyncMock, patch

import pytest
from fastapi.exceptions import HTTPException

from auth import authorization
from auth.user_identity import GuestUser, User
from models.ApplicationData import Decision
from models.user_record import Role


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_guest_without_role_is_unapplied(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """User without status or role is not considered applicant."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.stanford.tree",
    }

    with pytest.raises(HTTPException) as excinfo:
        await authorization.require_accepted_applicant(
            GuestUser(email="tree@stanford.edu")
        )
    assert "403" in str(excinfo.value)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_rejected_applicant_is_unapplied(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """User with applicant role and rejected status is not accepted."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.ucsd.tritons",
        "roles": [Role.APPLICANT],
        "status": Decision.REJECTED,
        "first_name": "King",
        "last_name": "Triton",
    }

    with pytest.raises(HTTPException) as excinfo:
        await authorization.require_accepted_applicant(
            GuestUser(email="tritons@ucsd.edu")
        )
    assert "403" in str(excinfo.value)


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_accepted_applicant_is_fine(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """User with applicant role and accepted status is fine."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.berkeley.oski",
        "roles": [Role.APPLICANT],
        "status": Decision.ACCEPTED,
        "first_name": "Oski",
        "last_name": "Bear",
    }

    user, applicant = await authorization.require_accepted_applicant(
        GuestUser(email="oski@berkeley.edu")
    )
    assert user.uid == "edu.berkeley.oski"
    assert applicant.status == Decision.ACCEPTED


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_applicant_with_accepted_decision_is_fine(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """User with accepted decision is fine even when status is still REVIEWED."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.hacker1",
        "roles": [Role.APPLICANT],
        "status": "REVIEWED",
        "decision": Decision.ACCEPTED,
        "first_name": "Ian",
        "last_name": "Dai",
    }

    user, applicant = await authorization.require_accepted_applicant(
        User(uid="edu.uci.hacker1", email="hacker1@uci.edu")
    )
    assert user.uid == "edu.uci.hacker1"
    assert applicant.decision == Decision.ACCEPTED


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_non_applicant_is_unapplied(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """User with other role is not considered applicant."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.hack",
        "roles": [Role.DIRECTOR],
    }

    with pytest.raises(HTTPException) as excinfo:
        await authorization.require_accepted_applicant(
            User(uid="hack", email="hack@uci.edu")
        )
    assert "403" in str(excinfo.value)
