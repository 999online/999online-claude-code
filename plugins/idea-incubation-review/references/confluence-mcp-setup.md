# Confluence-reader MCP — optional setup

This plugin works with **zero setup** — bundled `operating-model-criteria.md` is authoritative. A connected Confluence-reader MCP is a **bonus**: it lets `incubation-architecture-analyst` fetch the live "Idea Incubation Operating Model" pages and flag when the bundled snapshot has drifted.

The plugin never calls Confluence's HTTP API directly and ships no server or credentials. It uses whatever Confluence-reader MCP you connect in your own client config.

## What the plugin expects

An MCP exposing read tools named like:

- `confluence_search` — search pages by text/title, scoped to a space.
- `confluence_get_page` — fetch a page's body by id.
- `confluence_get_page_children` — list child pages (optional).

The plugin detects these by capability, not by server name. It targets space **PIH**, page title "Idea Incubation Operating Model" (and children 00 / 09 / 10 / 02 / 03-a). On missing/ambiguous match or auth error, it falls back to the snapshot and says so.

## Already have one?

Many 999 setups expose Atlassian/Confluence tools already (e.g. an internal MCP or the Atlassian connector). If tools named `confluence_*` are connected, nothing more to do — the plugin uses them.

## Need to build one?

Paste this prompt into your own model/agent to generate a minimal read-only Confluence MCP server. Fill your own values; keep secrets out of source (env only).

```
Build a minimal, read-only MCP server (stdio) that wraps Atlassian Confluence Cloud REST API v2.
Config from env only — never hardcode: CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN.
Auth: HTTP Basic (email + API token).
Expose three tools:
  1. confluence_search(query, space_key?, limit?) -> [{id, title, space}]  (CQL text/title search)
  2. confluence_get_page(page_id) -> {id, title, body_text}  (strip HTML to text)
  3. confluence_get_page_children(page_id) -> [{id, title}]
Read-only: no create/update/delete. Handle 401/403/404 with clear error messages, not stack traces.
Return JSON. Include a README with the env vars and the client mcp config snippet.
```

Then register it in your client config (project or user `.mcp.json`). Do not commit real tokens; use a gitignored `.env` or your client's secret store.
