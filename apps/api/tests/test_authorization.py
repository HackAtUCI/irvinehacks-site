from datetime import datetime
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.exceptions import HTTPException
from test_user_apply import SAMPLE_APPLICATION

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
        "status": Decision.REJECTED,
        "role": Role.APPLICANT,
        "application_data": {**SAMPLE_APPLICATION, "submission_time": datetime.now()},
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
        "status": Decision.ACCEPTED,
        "role": Role.APPLICANT,
        "application_data": {**SAMPLE_APPLICATION, "submission_time": datetime.now()},
    }

    user, applicant = await authorization.require_accepted_applicant(
        GuestUser(email="oski@berkeley.edu")
    )
    assert user.uid == "edu.berkeley.oski"
    assert applicant.status == Decision.ACCEPTED


@patch("services.mongodb_handler.retrieve_one", autospec=True)
async def test_non_applicant_is_unapplied(
    mock_mongodb_handler_retrieve_one: AsyncMock,
) -> None:
    """User with other role is not considered applicant."""
    mock_mongodb_handler_retrieve_one.return_value = {
        "_id": "edu.uci.hack",
        "role": Role.DIRECTOR,
    }

    with pytest.raises(HTTPException) as excinfo:
        await authorization.require_accepted_applicant(
            User(uid="hack", email="hack@uci.edu")
        )
    assert "403" in str(excinfo.value)
