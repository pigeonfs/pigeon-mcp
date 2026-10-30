# Pigeon MCP Server

Local MCP server so Cursor, Claude Code, and other agents can send mail and manage domains through [Pigeon](https://github.com/pigeonfs/pigeon). Layout and setup follow [resend-mcp](https://github.com/resend/resend-mcp) (stdio, API key, default sender).

## Install

```bash
npm install github:pigeonfs/pigeon-mcp
```

You need a Pigeon API key and a verified sending domain.

## Cursor

```json
{
  "mcpServers": {
    "pigeon": {
      "command": "npx",
      "args": ["-y", "github:pigeonfs/pigeon-mcp"],
      "env": {
        "PIGEON_API_KEY": "pg_xxxxxxxxx",
        "PIGEON_BASE_URL": "http://localhost:4005",
        "SENDER_EMAIL_ADDRESS": "ada@yourdomain.com"
      }
    }
  }
}
```

## Claude Code

```bash
claude mcp add pigeon \
  -e PIGEON_API_KEY=pg_xxxxxxxxx \
  -e PIGEON_BASE_URL=http://localhost:4005 \
  -e SENDER_EMAIL_ADDRESS=ada@yourdomain.com \
  -- npx -y github:pigeonfs/pigeon-mcp
```

## Grok

Add this to `~/.grok/config.toml`. Use a full-access key when the agent should verify a domain. `PIGEON_BASE_URL` for the hosted app is `https://pigeonfs.com`.

```toml
[mcp_servers.pigeon]
command = "npx"
args = ["-y", "github:pigeonfs/pigeon-mcp"]
enabled = true

[mcp_servers.pigeon.env]
PIGEON_API_KEY = "pg_xxxxxxxxx"
PIGEON_BASE_URL = "https://pigeonfs.com"
SENDER_EMAIL_ADDRESS = "ada@yourdomain.com"
```

Then ask Grok to verify the domain, and to create a newsletter. `verify_domain` rechecks DNS. `create_newsletter` returns `url`, the public subscribe page. It does not send an issue.

The same page can be created without the agent:

```bash
curl -X POST https://pigeonfs.com/api/newsletters \
  -H "Authorization: Bearer $PIGEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pigeon notes","from":"Pigeon <ada@yourdomain.com>","description":"Notes from the API."}'
```

## Tools

- **Emails:** `send_email`, `list_emails`, `get_email`, `cancel_email`
- **Domains:** `list_domains`, `create_domain`, `verify_domain` (create/verify need a full-access key)
- **Newsletters:** `list_newsletters`, `create_newsletter`, `get_newsletter`
- **Contacts:** `create_contact`
- **Automations:** `trigger_automation`

Flags: `--key`, `--sender`. Env: `PIGEON_API_KEY`, `PIGEON_BASE_URL`, `SENDER_EMAIL_ADDRESS`.

## License

MIT
