from typing import Any, Callable, Coroutine, Sequence

from fastapi import Depends, HTTPException, status

from auth.user_identity import User, require_user_identity
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils.user_record import Role, UserRecord


def require_role(
    allowed_roles: Sequence[Role],
) -> Callable[[User], Coroutine[Any, Any, User]]:
    """Return a dependency which requires a user to have an allowed role."""

    async def require_allowed_role(user: User = Depends(require_user_identity)) -> User:
        """Require a user to have a role in the allowed roles."""
        record = await mongodb_handler.retrieve_one(Collection.USERS, {"_id": user.uid})
        user_record = UserRecord.model_validate(record)

        if user_record.role not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN)
        return user

    return require_allowed_role
