# Plan: Include `is_voided` in `/api/user/me` Response

## Context
The `ApplicantPortal.tsx` checks `identity?.is_voided` to determine if an applicant is voided, but the `/api/user/me` endpoint never fetches or returns `is_voided` from the database. The field is always `undefined` on the frontend, so voided applicants don't see the rejected status.

## Changes

### File: `apps/api/src/routers/user.py`

**1. Add `is_voided` to `IdentityResponse` model (line 60):**
```python
class IdentityResponse(BaseModel):
    uid: Union[str, None] = None
    status: Union[str, None] = None
    decision: Union[str, None] = None
    roles: list[Role] = []
    is_voided: bool = False
```

**2. Add `is_voided` to the MongoDB projection in the `/me` endpoint (line 137):**
```python
user_record = await mongodb_handler.retrieve_one(
    Collection.USERS, {"_id": user.uid}, ["roles", "status", "decision", "is_voided"]
)
```

No frontend changes needed — the `Identity` interface in `useUserIdentity.ts` already has `is_voided?: boolean`.

## Verification
1. Start the API server, call `/api/user/me` as a voided applicant
2. Confirm the response includes `"is_voided": true`
3. Visit the portal as that applicant and confirm the timeline shows "Application Rejected"
