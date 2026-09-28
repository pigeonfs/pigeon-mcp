#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const apiKey = process.env.PIGEON_API_KEY || argValue("--key");
const baseUrl = (process.env.PIGEON_BASE_URL || "http://localhost:4005").replace(/\/$/, "");
const defaultFrom = process.env.SENDER_EMAIL_ADDRESS || argValue("--sender") || "";

if (!apiKey) {
  console.error("PIGEON_API_KEY (or --key) is required");
  process.exit(1);
}

const server = new McpServer({
  name: "pigeon",
  version: "0.1.0"
});

server.tool(
  "send_email",
  "Send an email through Pigeon from a verified domain",
  {
    from: z.string().optional().describe("From address. Defaults to SENDER_EMAIL_ADDRESS."),
    to: z.union([z.string(), z.array(z.string())]).describe("Recipient email(s)"),
    subject: z.string(),
    html: z.string().optional(),
    text: z.string().optional(),
    cc: z.union([z.string(), z.array(z.string())]).optional(),
    bcc: z.union([z.string(), z.array(z.string())]).optional(),
    reply_to: z.union([z.string(), z.array(z.string())]).optional()
  },
  async (args) => {
    const from = args.from || defaultFrom;
    if (!from) {
      return textResult("Provide from or set SENDER_EMAIL_ADDRESS / --sender");
    }
    if (!args.html && !args.text) {
      return textResult("Provide html or text");
    }
    const body = await api("POST", "/api/emails", {
      from,
      to: list(args.to),
      subject: args.subject,
      html: args.html,
      text: args.text,
      cc: list(args.cc),
      bcc: list(args.bcc),
      reply_to: list(args.reply_to)
    });
    return jsonResult(body);
  }
);

server.tool("list_emails", "List recent outbound emails", {
  status: z.string().optional(),
  q: z.string().optional()
}, async (args) => jsonResult(await api("GET", "/api/emails", null, args)));

server.tool("get_email", "Get one email by id", {
  id: z.string()
}, async ({ id }) => jsonResult(await api("GET", `/api/emails/${id}`)));

server.tool("cancel_email", "Cancel a queued email", {
  id: z.string()
}, async ({ id }) => jsonResult(await api("POST", `/api/emails/${id}/cancel`)));

server.tool("list_domains", "List sending domains", {}, async () =>
  jsonResult(await api("GET", "/api/domains"))
);

server.tool("create_domain", "Add a sending domain (full-access API key)", {
  name: z.string(),
  region: z.string().optional()
}, async (args) => jsonResult(await api("POST", "/api/domains", args)));

server.tool("verify_domain", "Re-check domain DNS / SES verification", {
  id: z.string()
}, async ({ id }) => jsonResult(await api("POST", `/api/domains/${id}/verify`)));

server.tool("create_contact", "Create an audience contact", {
  email: z.string(),
  name: z.string().optional()
}, async (args) => jsonResult(await api("POST", "/api/contacts", args)));

server.tool("trigger_automation", "Run an automation for a recipient", {
  id: z.string(),
  to: z.string().optional(),
  variables: z.record(z.string(), z.unknown()).optional()
}, async ({ id, ...payload }) =>
  jsonResult(await api("POST", `/api/automations/${id}/trigger`, payload))
);

const transport = new StdioServerTransport();
await server.connect(transport);

function list(value) {
  if (value == null || value === "") return undefined;
  return Array.isArray(value) ? value : [value];
}

function jsonResult(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function textResult(text) {
  return { content: [{ type: "text", text }], isError: true };
}

async function api(method, path, body, query) {
  const url = new URL(baseUrl + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== "") url.searchParams.set(key, String(value));
    }
  }
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || response.statusText);
  }
  return data;
}

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}
