import os
import sys

import httpx

DISCORD_API_BASE = "https://discord.com/api/v10"


def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        print(f"{name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def main() -> None:
    bot_token = required_env("DISCORD_BOT_TOKEN")
    application_id = required_env("DISCORD_APPLICATION_ID")
    guild_id = required_env("DISCORD_GUILD_ID")

    command = {
        "name": "sync-teams",
        "description": "Assign ZotHacks Discord roles and team channel access",
        "options": [
            {
                "type": 5,
                "name": "dry_run",
                "description": "Preview the sync without changing Discord",
                "required": False,
            },
            {
                "type": 3,
                "name": "uid",
                "description": "Optional single user id, e.g. edu.uci.ongnh",
                "required": False,
            },
        ],
    }

    response = httpx.post(
        (
            f"{DISCORD_API_BASE}/applications/{application_id}"
            f"/guilds/{guild_id}/commands"
        ),
        headers={"Authorization": f"Bot {bot_token}"},
        json=command,
        timeout=30,
    )

    if response.status_code >= 400:
        print(response.text, file=sys.stderr)
        response.raise_for_status()

    data = response.json()
    print(f"Registered /{data['name']} ({data['id']})")


if __name__ == "__main__":
    main()
