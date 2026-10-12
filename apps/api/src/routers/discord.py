import asyncio
import os
from datetime import datetime, timezone
from logging import getLogger
from typing import Any, Optional

import httpx
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
from pymongo import UpdateOne

from models.user_record import Role, Status
from services import mongodb_handler
from services.mongodb_handler import Collection
from utils.hackathon_context import HackathonName, hackathon_name_ctx

log = getLogger(__name__)

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DISCORD_GUILD_ID = os.getenv("DISCORD_GUILD_ID")
DISCORD_PUBLIC_KEY = os.getenv("DISCORD_PUBLIC_KEY")

DISCORD_HACKER_ROLE_ID = os.getenv("DISCORD_HACKER_ROLE_ID", "1492080088496476280")
DISCORD_MENTOR_ROLE_ID = os.getenv("DISCORD_MENTOR_ROLE_ID", "1492079962029559808")
DISCORD_DIRECTOR_ROLE_ID = os.getenv("DISCORD_DIRECTOR_ROLE_ID", "1492079919310569582")

DISCORD_TEAM_CHANNEL_ALLOW = (1 << 10) | (1 << 11) | (1 << 16)

router = APIRouter()


def _require_discord_config() -> str:
    if not DISCORD_BOT_TOKEN or not DISCORD_GUILD_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Discord sync is not configured",
        )

    return DISCORD_GUILD_ID


def _normalize_discord_name(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    normalized = value.strip().lower()
    if normalized.startswith("@"):
        normalized = normalized[1:]
    if "#" in normalized:
        normalized = normalized.split("#", 1)[0]

    return normalized or None


def _member_names(member: dict[str, Any]) -> set[str]:
    user = member.get("user", {})
    names = {
        _normalize_discord_name(member.get("nick")),
        _normalize_discord_name(user.get("username")),
        _normalize_discord_name(user.get("global_name")),
    }
    return {name for name in names if name}


def _member_id(member: dict[str, Any]) -> Optional[str]:
    user = member.get("user", {})
    user_id = user.get("id")
    if isinstance(user_id, str) and user_id:
        return user_id
    return None


def _discord_headers() -> dict[str, str]:
    _require_discord_config()

    return {"Authorization": f"Bot {DISCORD_BOT_TOKEN}"}


async def _discord_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    **kwargs: Any,
) -> httpx.Response:
    response = await client.request(
        method,
        f"https://discord.com/api/v10{path}",
        headers=_discord_headers(),
        **kwargs,
    )

    if response.status_code >= 400:
        log.error(
            "Discord API error: method=%s path=%s status=%s body=%s",
            method,
            path,
            response.status_code,
            response.text,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Discord API error",
        )

    return response


async def _fetch_discord_members() -> list[dict[str, Any]]:
    guild_id = _require_discord_config()
    members: list[dict[str, Any]] = []
    after = "0"

    async with httpx.AsyncClient() as client:
        while True:
            response = await _discord_request(
                client,
                "GET",
                f"/guilds/{guild_id}/members",
                params={"limit": 1000, "after": after},
            )

            page_members = response.json()
            members.extend(page_members)

            if len(page_members) < 1000:
                break

            after = page_members[-1]["user"]["id"]

    return members


async def _fetch_discord_member_names() -> set[str]:
    return {
        name
        for member in await _fetch_discord_members()
        for name in _member_names(member)
    }


async def _fetch_team_channel_ids() -> dict[int, str]:
    guild_id = _require_discord_config()

    async with httpx.AsyncClient() as client:
        response = await _discord_request(client, "GET", f"/guilds/{guild_id}/channels")

    team_channels: dict[int, str] = {}
    for channel in response.json():
        name = channel.get("name")
        channel_id = channel.get("id")
        if not isinstance(name, str) or not isinstance(channel_id, str):
            continue
        if not name.startswith("team-"):
            continue
        try:
            team_number = int(name.removeprefix("team-"))
        except ValueError:
            continue
        team_channels[team_number] = channel_id

    return team_channels


def _build_member_lookup(
    members: list[dict[str, Any]],
) -> tuple[dict[str, dict[str, Any]], set[str]]:
    lookup: dict[str, dict[str, Any]] = {}
    duplicates: set[str] = set()

    for member in members:
        for name in _member_names(member):
            if name in lookup:
                duplicates.add(name)
                continue
            lookup[name] = member

    for name in duplicates:
        lookup.pop(name, None)

    return lookup, duplicates


def _participant_discord_role_id(roles: list[str]) -> Optional[str]:
    if Role.HACKER in roles or Role.HACKER.value in roles:
        return DISCORD_HACKER_ROLE_ID
    if Role.MENTOR in roles or Role.MENTOR.value in roles:
        return DISCORD_MENTOR_ROLE_ID
    return None


def _participant_has_role(roles: list[str], role: Role) -> bool:
    return role in roles or role.value in roles


def _application_discord_username(record: dict[str, object]) -> Optional[str]:
    application_data = record.get("application_data", {})
    if not isinstance(application_data, dict):
        return None
    return _normalize_discord_name(application_data.get("discord_username"))


def _team_number(value: Any) -> Optional[int]:
    try:
        team_number = int(value)
    except (TypeError, ValueError):
        return None
    return team_number if team_number > 0 else None


async def _assign_role(
    client: httpx.AsyncClient,
    member_id: str,
    role_id: str,
    member: dict[str, Any],
    dry_run: bool,
) -> bool:
    roles = member.get("roles", [])
    if role_id in roles:
        return False

    if dry_run:
        return True

    await _discord_request(
        client,
        "PUT",
        f"/guilds/{_require_discord_config()}/members/{member_id}/roles/{role_id}",
    )
    return True


async def _allow_team_channel(
    client: httpx.AsyncClient,
    member_id: str,
    channel_id: str,
    dry_run: bool,
) -> None:
    if dry_run:
        return

    await _discord_request(
        client,
        "PUT",
        f"/channels/{channel_id}/permissions/{member_id}",
        json={
            "type": 1,
            "allow": str(DISCORD_TEAM_CHANNEL_ALLOW),
            "deny": "0",
        },
    )


async def _send_team_ping(
    client: httpx.AsyncClient,
    member_id: str,
    channel_id: str,
    team_number: int,
    roles: list[str],
    mentor_mentions: list[str],
    dry_run: bool,
) -> bool:
    if dry_run:
        return True

    if _participant_has_role(roles, Role.MENTOR):
        content = (
            f"Welcome to ZotHacks <@{member_id}> !!! "
            "<:peter_cheerful:1506848514099904572> "
            f"You're mentoring Team {team_number}"
        )
    else:
        mentor_text = ", ".join(mentor_mentions) if mentor_mentions else "TBD"
        content = (
            f"Welcome to ZotHacks <@{member_id}> !!! "
            "<:peter_cheerful:1506848514099904572> "
            f"You're on Team {team_number} and your mentor is {mentor_text}"
        )

    await _discord_request(
        client,
        "POST",
        f"/channels/{channel_id}/messages",
        json={"content": content},
    )
    return True


def _mentor_mentions_by_team(
    mentors: list[dict[str, object]],
    member_lookup: dict[str, dict[str, Any]],
    duplicate_names: set[str],
) -> dict[int, list[str]]:
    mentions: dict[int, list[str]] = {}

    for mentor in mentors:
        roles = mentor.get("roles", [])
        if not isinstance(roles, list) or not _participant_has_role(roles, Role.MENTOR):
            continue

        team_number = _team_number(mentor.get("team_number"))
        if team_number is None:
            continue

        discord_username = _application_discord_username(mentor)
        if not discord_username or discord_username in duplicate_names:
            continue

        member = member_lookup.get(discord_username)
        if not member:
            continue

        member_id = _member_id(member)
        if not member_id:
            continue

        mentions.setdefault(team_number, []).append(f"<@{member_id}>")

    return mentions


async def _retrieve_zothacks_users(
    query: dict[str, object],
    fields: list[str],
) -> list[dict[str, object]]:
    token = hackathon_name_ctx.set(HackathonName.ZOTHACKS)
    try:
        return await mongodb_handler.retrieve(Collection.USERS, query, fields)
    finally:
        hackathon_name_ctx.reset(token)


async def _retrieve_team_sync_users(uid: Optional[str]) -> list[dict[str, object]]:
    query: dict[str, object] = {
        "roles": {"$in": [Role.HACKER, Role.MENTOR]},
        "status": {"$in": [Status.CONFIRMED, Status.ATTENDING]},
    }
    if uid:
        query["_id"] = uid

    return await _retrieve_zothacks_users(
        query,
        [
            "_id",
            "roles",
            "team_number",
            "application_data.discord_username",
            "discord_team_pinged_at",
        ],
    )


async def _retrieve_team_sync_mentors() -> list[dict[str, object]]:
    return await _retrieve_zothacks_users(
        {
            "roles": Role.MENTOR,
            "status": {"$in": [Status.CONFIRMED, Status.ATTENDING]},
        },
        ["_id", "roles", "team_number", "application_data.discord_username"],
    )


async def _mark_team_pinged(uid: str, pinged_at: datetime) -> None:
    token = hackathon_name_ctx.set(HackathonName.ZOTHACKS)
    try:
        await mongodb_handler.update_one(
            Collection.USERS,
            {"_id": uid},
            {"discord_team_pinged_at": pinged_at},
        )
    finally:
        hackathon_name_ctx.reset(token)


def _new_sync_summary(dry_run: bool, participant_count: int) -> dict[str, Any]:
    return {
        "status": "success",
        "dry_run": dry_run,
        "participants": participant_count,
        "synced": 0,
        "roles_assigned": 0,
        "channels_allowed": 0,
        "pings_sent": 0,
        "missing_discord_username": [],
        "duplicate_discord_username": [],
        "member_not_found": [],
        "missing_team_number": [],
        "missing_team_channel": [],
        "skipped_already_pinged": 0,
    }


async def sync_discord_team_assignments(
    *,
    dry_run: bool,
    uid: Optional[str] = None,
) -> dict[str, Any]:
    if not DISCORD_BOT_TOKEN or not DISCORD_GUILD_ID:
        return {
            "status": "disabled",
            "message": "Discord sync is not configured",
        }

    participants = await _retrieve_team_sync_users(uid)
    mentors = await _retrieve_team_sync_mentors()

    members = await _fetch_discord_members()
    member_lookup, duplicate_names = _build_member_lookup(members)
    mentor_mentions = _mentor_mentions_by_team(mentors, member_lookup, duplicate_names)
    team_channels = await _fetch_team_channel_ids()

    summary = _new_sync_summary(dry_run, len(participants))
    now = datetime.now(timezone.utc)
    semaphore = asyncio.Semaphore(10)

    async with httpx.AsyncClient() as client:
        async def process_participant(participant: dict[str, object]) -> None:
            async with semaphore:
                await _process_participant_team_sync(
                    client,
                    participant,
                    member_lookup,
                    duplicate_names,
                    mentor_mentions,
                    team_channels,
                    summary,
                    now,
                    dry_run,
                )

        await asyncio.gather(
            *(process_participant(participant) for participant in participants)
        )

    return summary


async def _process_participant_team_sync(
    client: httpx.AsyncClient,
    participant: dict[str, object],
    member_lookup: dict[str, dict[str, Any]],
    duplicate_names: set[str],
    mentor_mentions: dict[int, list[str]],
    team_channels: dict[int, str],
    summary: dict[str, Any],
    now: datetime,
    dry_run: bool,
) -> None:
    uid_value = participant.get("_id")
    roles = participant.get("roles", [])
    if not isinstance(uid_value, str) or not isinstance(roles, list):
        return

    discord_username = _application_discord_username(participant)
    if not discord_username:
        summary["missing_discord_username"].append(uid_value)
        return
    if discord_username in duplicate_names:
        summary["duplicate_discord_username"].append(uid_value)
        return

    member = member_lookup.get(discord_username)
    if not member:
        summary["member_not_found"].append(uid_value)
        return

    member_id = _member_id(member)
    role_id = _participant_discord_role_id(roles)
    team_number = _team_number(participant.get("team_number"))
    if not member_id or not role_id:
        return
    if team_number is None:
        summary["missing_team_number"].append(uid_value)
        return

    channel_id = team_channels.get(team_number)
    if not channel_id:
        summary["missing_team_channel"].append(uid_value)
        return

    assigned_role = await _assign_role(client, member_id, role_id, member, dry_run)
    if assigned_role:
        summary["roles_assigned"] += 1

    await _allow_team_channel(client, member_id, channel_id, dry_run)
    summary["channels_allowed"] += 1

    if participant.get("discord_team_pinged_at") is not None:
        summary["skipped_already_pinged"] += 1
    else:
        ping_sent = await _send_team_ping(
            client,
            member_id,
            channel_id,
            team_number,
            roles,
            mentor_mentions.get(team_number, []),
            dry_run,
        )
        if ping_sent:
            summary["pings_sent"] += 1
            if not dry_run:
                await _mark_team_pinged(uid_value, now)

    summary["synced"] += 1


def _verify_discord_signature(
    body: bytes,
    signature: Optional[str],
    timestamp: Optional[str],
) -> None:
    if not DISCORD_PUBLIC_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Discord interactions are not configured",
        )
    if not signature or not timestamp:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    try:
        public_key = Ed25519PublicKey.from_public_bytes(
            bytes.fromhex(DISCORD_PUBLIC_KEY)
        )
        public_key.verify(bytes.fromhex(signature), timestamp.encode() + body)
    except (InvalidSignature, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


def _interaction_option(data: dict[str, Any], name: str, default: Any = None) -> Any:
    for option in data.get("data", {}).get("options", []):
        if option.get("name") == name:
            return option.get("value")
    return default


def _interaction_response(content: str, *, ephemeral: bool = True) -> dict[str, Any]:
    data: dict[str, Any] = {"content": content}
    if ephemeral:
        data["flags"] = 64
    return {"type": 4, "data": data}


def _format_sync_summary(summary: dict[str, Any]) -> str:
    lines = [
        f"Discord team sync {'dry run' if summary.get('dry_run') else 'complete'}",
        f"Participants scanned: {summary.get('participants', 0)}",
        f"Synced: {summary.get('synced', 0)}",
        f"Roles assigned: {summary.get('roles_assigned', 0)}",
        f"Team channel access updated: {summary.get('channels_allowed', 0)}",
        f"Pings sent: {summary.get('pings_sent', 0)}",
        f"Already pinged: {summary.get('skipped_already_pinged', 0)}",
    ]

    for key, label in (
        ("missing_discord_username", "Missing Discord username"),
        ("duplicate_discord_username", "Duplicate Discord username"),
        ("member_not_found", "Member not found"),
        ("missing_team_number", "Missing team number"),
        ("missing_team_channel", "Missing team channel"),
    ):
        values = summary.get(key, [])
        if values:
            preview = ", ".join(values[:10])
            suffix = f" ... +{len(values) - 10} more" if len(values) > 10 else ""
            lines.append(f"{label}: {len(values)} ({preview}{suffix})")

    return "\n".join(lines)


def _compact_sync_summary(summary: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in summary.items() if value not in ([], None)}


async def _post_interaction_followup(
    application_id: str,
    token: str,
    content: str,
) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://discord.com/api/v10/webhooks/{application_id}/{token}",
            json={"content": content, "flags": 64},
        )


async def _run_interaction_sync(
    application_id: str,
    token: str,
    dry_run: bool,
    uid: Optional[str],
) -> None:
    try:
        summary = await sync_discord_team_assignments(dry_run=dry_run, uid=uid)
        content = _format_sync_summary(summary)
    except Exception:
        log.exception("Discord team sync failed")
        content = "Discord team sync failed. Check API logs."

    await _post_interaction_followup(application_id, token, content)


@router.post("/interactions")
async def handle_interaction(
    request: Request,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    body = await request.body()
    _verify_discord_signature(
        body,
        request.headers.get("X-Signature-Ed25519"),
        request.headers.get("X-Signature-Timestamp"),
    )

    data: dict[str, Any] = await request.json()
    interaction_type = data.get("type")

    if interaction_type == 1:
        return {"type": 1}

    if interaction_type != 2:
        return _interaction_response("Unsupported Discord interaction.")

    command_name = data.get("data", {}).get("name")
    if command_name != "sync-teams":
        return _interaction_response("Unknown command.")

    member_roles = data.get("member", {}).get("roles", [])
    if DISCORD_DIRECTOR_ROLE_ID not in member_roles:
        return _interaction_response("Only directors can run this command.")

    application_id = data.get("application_id")
    interaction_token = data.get("token")
    if not isinstance(application_id, str) or not isinstance(interaction_token, str):
        return _interaction_response("Malformed Discord interaction.")

    dry_run = bool(_interaction_option(data, "dry_run", True))
    uid = _interaction_option(data, "uid")
    if uid is not None and not isinstance(uid, str):
        return _interaction_response("uid must be a string.")

    background_tasks.add_task(
        _run_interaction_sync,
        application_id,
        interaction_token,
        dry_run,
        uid,
    )

    mode = "dry run" if dry_run else "real sync"
    target = f" for `{uid}`" if uid else ""
    return {
        "type": 5,
        "data": {
            "content": f"Started Discord team {mode}{target}.",
            "flags": 64,
        },
    }


@router.post("/sync-teams")
async def sync_discord_teams(
    dry_run: bool = True,
    uid: Optional[str] = None,
) -> dict[str, Any]:
    """Assign confirmed hackers/mentors to Discord roles and team channels."""
    if os.getenv("DEPLOYMENT") != "LOCAL":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    summary = await sync_discord_team_assignments(dry_run=dry_run, uid=uid)
    return _compact_sync_summary(summary)


@router.post("/sync")
async def sync_discord_users() -> dict[str, Any]:
    """Mark participants as added to Discord by matching application usernames."""
    if not DISCORD_BOT_TOKEN or not DISCORD_GUILD_ID:
        return {
            "status": "disabled",
            "updated_count": 0,
            "message": "Discord sync is not configured",
        }

    discord_names = await _fetch_discord_member_names()
    if not discord_names:
        return {
            "status": "success",
            "updated_count": 0,
            "discord_user_count": 0,
        }

    applicants = await mongodb_handler.retrieve(
        Collection.USERS,
        {"application_data.discord_username": {"$exists": True, "$ne": ""}},
        ["_id", "application_data.discord_username"],
    )

    operations = []
    for applicant in applicants:
        application_data = applicant.get("application_data", {})
        if not isinstance(application_data, dict):
            continue

        discord_username = _normalize_discord_name(
            application_data.get("discord_username")
        )
        if discord_username in discord_names:
            operations.append(
                UpdateOne(
                    {"_id": applicant["_id"]},
                    {"$set": {"is_added_to_discord": True}},
                )
            )

    updated = await mongodb_handler.bulk_update(Collection.USERS, operations)

    return {
        "status": "success",
        "updated": updated,
        "updated_count": len(operations),
        "discord_user_count": len(discord_names),
    }
