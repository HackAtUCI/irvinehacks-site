from typing import Annotated, Any, Callable, Coroutine, Sequence

from fastapi import Depends, HTTPException, status
from pydantic import ValidationError

from auth.user_identity import User, require_user_identity
from models.ApplicationData import Decision
from models.user_record import BareApplicant, Role, Status
from services import mongodb_handler
from services.mongodb_handler import BaseRecord, Collection


class UserWithRole(BaseRecord):
    """User record where name is not important."""

    role: Role


def require_role(
    allowed_roles: Sequence[Role],
) -> Callable[[User], Coroutine[Any, Any, User]]:
    """Return a dependency which requires a user to have an allowed role."""

    async def require_allowed_role(user: User = Depends(require_user_identity)) -> User:
        """Require a user to have a role in the allowed roles."""
        record = await mongodb_handler.retrieve_one(
            Collection.USERS, {"_id": user.uid}, ["role"]
        )
        user_record = UserWithRole.model_validate(record)

        if user_record.role not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        return user

    return require_allowed_role


async def require_accepted_applicant(
    user: Annotated[User, Depends(require_user_identity)]
) -> tuple[User, BareApplicant]:
    """Require a user who is an applicant and was accepted or beyond."""
    record = await mongodb_handler.retrieve_one(
        Collection.USERS,
        {"_id": user.uid},
        ["role", "status", "first_name", "last_name"],
    )

    try:
        applicant_record = BareApplicant.model_validate(record)

        if applicant_record.status not in (
            Decision.ACCEPTED,
            Status.WAIVER_SIGNED,
            Status.CONFIRMED,
        ):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "User was not accepted.")

        return user, applicant_record
    except ValidationError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "User is not an applicant.")
