# Plugin authoring rules

Applies when creating or editing anything under `plugins/`.

## 1. No inline API calls
Never call external APIs from skill/command prompt text. Wrap the API as an MCP server the developer supplies via their own config. Skill text instructs the developer how to wire the MCP — it never contains the API call itself.

## 2. No inline env vars or secrets
Never hardcode API keys, tokens, URLs, account IDs, or any sensitive value in skill/command text. Preferred path: route the secret through an MCP server's config. Fallback (only if MCP unsuitable): skill ships a `.env.example` template at the plugin root, the SKILL.md body documents copy-and-fill setup steps, and the runtime reference is `${CLAUDE_PLUGIN_ROOT}/.env`. Never commit a real `.env`.

## 3. Do not code MCP servers
This marketplace ships plugins (skills, commands, agents, hooks) — not MCP server implementations. When a plugin needs an MCP, write the prompt the developer pastes into their own model to build the MCP. Display that prompt to the developer; do not implement the MCP here.

**Exception — bundled zero-dependency stdio wrapper.** A plugin MAY bundle a single-file MCP server (`mcp/server.js`, Node ≥18, global `fetch`, no npm deps, no `node_modules`, no build step) that thinly wraps one external REST API. Launch it from a plugin-root `.mcp.json` (`node ${CLAUDE_PLUGIN_ROOT}/mcp/server.js`) referenced by `plugin.json` `"mcpServers": "./.mcp.json"`. Route any secret through a `*_save_config` tool that writes a `0600` home-dir file (never a repo `.env`, never committed), read lazily so it applies without restart. This is the ONLY sanctioned in-repo server — anything with dependencies, a build, or non-trivial logic still follows the default above (ship a paste-able build prompt). Pattern: `plugins/morelevels`, `plugins/idea-scout`.

## 4. Plugins must be reusable
Write for general scenarios, not the author's setup. No hardcoded paths, org names, team names, or personal assumptions. Parameterize via `$ARGUMENTS`, MCP config the developer supplies, or values the user provides at runtime. A plugin only the author can use is a bug.

## 5. Break skills down
Analyze the plugin's intent before writing. Any step that is independent and reusable on its own becomes a separate skill. Many small focused skills beat one monolithic skill — they compose, they get triggered precisely, and other developers can adopt them piecemeal.

## 6. Caveman lite for prompt text
Write SKILL.md, command, and agent prompt text in caveman mode lite. Drop articles (a/an/the), filler (just/really/basically/simply), and hedging. Keep technical terms exact. Code blocks unchanged. Goal: concise prompts that get to the point.

## 7. Update README on every plugin change
Adding or editing any plugin under `plugins/` requires updating `README.md` in same change — install line, usage, dependencies. New plugin: add section. Removed plugin: drop section. Write README in caveman lite (Rule 6). Stale README = bug.

## 8. Names must be unique
Every plugin, skill, command, and agent name unique across whole marketplace. No two tools share a name. Duplicate names cause trigger collisions and shadow users' other installed plugins. Prefer descriptive, namespaced names (`wiki-ingest`, not `ingest`).

## 9. Hooks live in hooks/hooks.json
Plugin hooks go in `plugins/<plugin>/hooks/hooks.json`. Never user/project `settings.json` or `.claude/hooks/` — those are out-of-plugin scope. Optional top-level `description`, then `hooks` object.

**Shape — 3 levels:** event → matcher group → handler.

```json
{
  "description": "what these hooks do",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/check.sh", "args": [] }
        ]
      }
    ]
  }
}
```

**Events (when fire):** `SessionStart`/`SessionEnd` (per session); `UserPromptSubmit`, `Stop` (per turn); `PreToolUse`, `PostToolUse`, `PostToolUseFailure` (per tool call); `SubagentStart`/`SubagentStop`, `PreCompact`/`PostCompact`, `Notification`. Full list → docs.

**Matchers** (filter when hook fires): `*`/`""`/omit = all; letters+digits+`_`+`|` = exact or `|`-list (`Edit|Write`); other chars = regex. Tool events match `tool_name`. MCP tools are `mcp__<server>__<tool>` — `mcp__memory__.*` matches all of a server's tools. Narrow tool+args with handler `if`: `"Bash(git *)"`, `"Edit(*.ts)"`.

**Handler types:** `command` (shell; stdin JSON → exit code/stdout), `http` (POST), `mcp_tool` (call connected MCP), `prompt` (LLM yes/no), `agent` (subagent verifier).

**Command handler:** `command` required. With `args` = exec form (no shell, each arg literal — use for path placeholders). Without `args` = shell form (pipes, `&&`). `async`/`asyncRewake` run background. `timeout` in seconds.

**Path placeholders:** `${CLAUDE_PLUGIN_ROOT}` (bundled scripts — use this), `${CLAUDE_PLUGIN_DATA}` (persistent data), `${CLAUDE_PROJECT_DIR}` (project root). Never relative paths.

**Input:** command hook gets JSON on **stdin** — `session_id`, `cwd`, `hook_event_name`. Tool events add `tool_name`, `tool_input` (+`tool_response` on PostToolUse). Read file path via `jq -r '.tool_input.file_path'`. No `$CLAUDE_TOOL_*` env vars exist.

**Output + exit codes:** exit 0 = ok (stdout parsed for JSON); exit 2 = block (stderr → Claude); other = non-blocking error. Or exit 0 + JSON: `continue:false` stops; PreToolUse `hookSpecificOutput.permissionDecision` (`allow`/`deny`/`ask`); `additionalContext` injects context. Use exit codes OR JSON — not both.

**Security:** validate stdin, quote `"$VAR"`, no secrets (Rule 2), absolute paths via `${CLAUDE_PLUGIN_ROOT}`, skip `.env`/`.git`.

Full reference: https://code.claude.com/docs/en/hooks

## 10. Manifest + catalog stay in sync
Plugin ships `.claude-plugin/plugin.json`: `name` (equals plugin dir name), `description`, `version` (semver), `author` `{name, email}`, `repository`. List bundled tools in `commands`/`agents`/`skills`/`hooks` arrays — every path hits real file.

Register plugin in root `.claude-plugin/marketplace.json` `plugins[]`. `name`, `description`, `version` **identical** in plugin.json and marketplace.json. Plugin change bumps `version` in **both** files, same commit. Mismatch = bug. `/release` automates bump — never hand-edit one file.

## 11. Frontmatter contract per tool type
Commands (`commands/*.md`): `description` required; `argument-hint` required when prompt reads `$ARGUMENTS`; `allowed-tools` least privilege — only tools command needs.
Agents (`agents/*.md`): `name`, `description`, `model` (`opus` or `sonnet`) required; `color` optional.
Skills (`skills/<name>/SKILL.md`): `name`, `description` required.
Descriptions drive triggering — state what tool does plus when to use, when not. Specific verbs. Never vague (`helper skill`, `various utilities`).

## 12. Bundled paths use ${CLAUDE_PLUGIN_ROOT}
Reference bundled file (script, asset, reference doc) in skill/command/agent text via `${CLAUDE_PLUGIN_ROOT}/...` — never relative, never absolute (`/Users/...`). Persistent data → `${CLAUDE_PLUGIN_DATA}`; project files → `${CLAUDE_PROJECT_DIR}`. No dangling refs: every path, skill name, command name resolves to real file. Extends Rule 9 placeholders beyond hooks to all prompt text.

Never assume process cwd = project root. Hook scripts read `cwd` from stdin JSON (Rule 9), not from where script runs; other scripts/commands resolve project files via `${CLAUDE_PROJECT_DIR}`. cwd persists across Bash calls — `cd` then trusting it later breaks. Use absolute paths or subshell `(cd dir && cmd)`. Never claim cwd "not initialized" off failed relative-path check.

## 13. Defensive prompts, validate before commit
Prompt handles failure: missing/malformed `$ARGUMENTS` → stop, tell user; files prompt assumes exist → check first, not blind read; dep down (MCP, network, uninstalled CLI) → fail clean with clear message. Run `claude plugin validate .` (or `/validate`) before committing `plugins/` change; commit only when clean.
