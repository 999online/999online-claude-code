---
description: Set up the optional CurrentsAPI news MCP for idea-scout. `/init-mcp <api-token>` saves your key via the bundled server's save-config tool — works immediately, no restart. No token → prints signup + key-fetch steps. CurrentsAPI grounds "what's selling today"; idea-scout works without it via WebSearch.
argument-hint: <currentsapi-api-token>
allowed-tools: Read, Write, Bash, mcp__plugin_idea-scout_currentsapi__currentsapi_save_config
---

Set up CurrentsAPI news MCP. Token = `$ARGUMENTS`.

The `currentsapi` MCP server ships with idea-scout (bundled, zero-dependency). It's already running once the plugin loads — it just needs your key. Saving the key takes effect immediately; **no reconnect, no restart.**

## No token given (`$ARGUMENTS` empty, blank, or a placeholder like `YOUR_API_KEY` / `<token>`)

Print this, then stop. Write nothing.

```
CurrentsAPI setup (optional — idea-scout works without it via WebSearch):

1. Sign up free:   https://currentsapi.services/en/register
2. Copy your API key from the dashboard:  https://currentsapi.services/en
3. Save it:        /init-mcp YOUR_API_KEY   ← takes effect immediately, no restart

Free tier ~1,000 requests/day. Key is stored locally at ~/.currentsapi-scout.json (mode 0600, never committed).
```

## Token given

1. Call the MCP tool **`currentsapi_save_config`** with `{ "token": "$ARGUMENTS" }`. It writes `~/.currentsapi-scout.json` (mode 0600) and the server reads it lazily on the next call.
2. Report: key saved, CurrentsAPI tools live now (`currentsapi_latest_news`, `currentsapi_search`) — idea-scout's analysts will use them automatically. No restart needed.

**Fallback — tool not available yet** (fresh install, plugin MCP not loaded this session): don't fail. Write the key directly instead:
- Write `~/.currentsapi-scout.json` with content `{"token":"$ARGUMENTS"}`.
- `chmod 600 ~/.currentsapi-scout.json`.
- Tell the user: key saved; the `currentsapi` tools activate once the idea-scout plugin's MCP server loads (enable the plugin / new session). The server reads the key lazily then — still no reconnect once it's up.

**Security — say this plainly, not in caveman:** Your CurrentsAPI API key is stored in plaintext at `~/.currentsapi-scout.json` with file mode 0600 (owner-only). It lives in your home directory, never in the repo, and is never committed. Don't paste it into shared files.

## Defensive
- Token < 8 chars → `currentsapi_save_config` rejects it (`BAD_TOKEN`); surface that and re-show the setup steps.
- After saving, a quick sanity call (`currentsapi_latest_news`) that returns `UNAUTHORIZED` means the key is wrong — tell the user to mint a fresh one and re-run.
