from unittest.mock import AsyncMock, MagicMock, patch

from routers import discord
from services.mongodb_handler import Collection


def test_normalize_discord_name() -> None:
    assert discord._normalize_discord_name("@Nathan#1234") == "nathan"
    assert discord._normalize_discord_name(" nathan ") == "nathan"
    assert discord._normalize_discord_name("") is None


def test_member_names() -> None:
    member = {
        "nick": "Server Nick",
        "user": {
            "username": "discord_user",
            "global_name": "Global Name",
        },
    }

    assert discord._member_names(member) == {
        "server nick",
        "discord_user",
        "global name",
    }


@patch("routers.discord.DISCORD_BOT_TOKEN", None)
@patch("routers.discord.DISCORD_GUILD_ID", None)
async def test_sync_discord_users_disabled_without_config() -> None:
    result = await discord.sync_discord_users()

    assert result["status"] == "disabled"
    assert result["updated_count"] == 0


@patch("routers.discord.DISCORD_BOT_TOKEN", "bot-token")
@patch("routers.discord.DISCORD_GUILD_ID", "guild-id")
@patch("routers.discord.mongodb_handler.bulk_update", autospec=True)
@patch("routers.discord.mongodb_handler.retrieve", autospec=True)
@patch("routers.discord._fetch_discord_member_names", autospec=True)
async def test_sync_discord_users_updates_matching_applicants(
    mock_fetch_names: AsyncMock,
    mock_retrieve: AsyncMock,
    mock_bulk_update: AsyncMock,
) -> None:
    mock_fetch_names.return_value = {"testuser", "other person"}
    mock_retrieve.return_value = [
        {
            "_id": "edu.uci.test",
            "application_data": {"discord_username": "@TestUser"},
        },
        {
            "_id": "edu.uci.nope",
            "application_data": {"discord_username": "not_in_server"},
        },
    ]
    mock_bulk_update.return_value = True

    result = await discord.sync_discord_users()

    mock_retrieve.assert_awaited_once_with(
        Collection.USERS,
        {"application_data.discord_username": {"$exists": True, "$ne": ""}},
        ["_id", "application_data.discord_username"],
    )
    mock_bulk_update.assert_awaited_once()
    operations = mock_bulk_update.await_args.args[1]
    assert len(operations) == 1
    assert result["status"] == "success"
    assert result["updated"] is True
    assert result["updated_count"] == 1
    assert result["discord_user_count"] == 2


@patch("routers.discord.httpx.AsyncClient")
@patch("routers.discord.DISCORD_BOT_TOKEN", "bot-token")
@patch("routers.discord.DISCORD_GUILD_ID", "guild-id")
async def test_fetch_discord_member_names(mock_client_cls: MagicMock) -> None:
    response = MagicMock()
    response.status_code = 200
    response.json.return_value = [
        {
            "nick": "Nick",
            "user": {
                "id": "1",
                "username": "UserName",
                "global_name": "Global Name",
            },
        }
    ]
    client = AsyncMock()
    client.get.return_value = response
    mock_client_cls.return_value.__aenter__.return_value = client

    names = await discord._fetch_discord_member_names()

    assert names == {"nick", "username", "global name"}
    client.get.assert_awaited_once()
