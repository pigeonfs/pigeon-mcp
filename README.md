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

## Tools

- **Emails:** `send_email`, `list_emails`, `get_email`, `cancel_email`
- **Domains:** `list_domains`, `create_domain`, `verify_domain` (create/verify need a full-access key)
- **Contacts:** `create_contact`
- **Automations:** `trigger_automation`

Flags: `--key`, `--sender`. Env: `PIGEON_API_KEY`, `PIGEON_BASE_URL`, `SENDER_EMAIL_ADDRESS`.

## License

MIT
