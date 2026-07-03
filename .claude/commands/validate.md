---
description: Validate the marketplace catalog and every plugin in it
argument-hint: [plugin-name]
---

Validate marketplace + run plugin-quality review. Optional `$ARGUMENTS` = single plugin name to scope review/fix-loop to that plugin (catalog still validated once).

## Phase 1 — Schema validation

1. Run `claude plugin validate .` from repo root. Catches catalog schema, duplicate names, source-path traversal, version mismatches.
2. If `$ARGUMENTS` empty: for each subdir under `plugins/` containing `.claude-plugin/plugin.json`, run `claude plugin validate ./plugins/<name>`. If `$ARGUMENTS` set: run only `claude plugin validate ./plugins/$ARGUMENTS` (stop if dir missing).
3. Collect errors/warnings, keyed by file.

## Phase 2 — Plugin quality review

Load `.claude/rules/plugin-authoring.md` once. For each plugin in scope, walk every file under `plugins/<name>/{skills,commands,agents,hooks,mcp}/` and check:

### Rules compliance (from plugin-authoring.md)

- **Rule 1 — no inline API calls**: grep prompt text for `curl`, `fetch(`, `requests.`, raw `http://`/`https://` endpoint calls. Exclude fenced code blocks shown as examples and files under `mcp/`.
- **Rule 2 — no inline secrets/env**: grep for `sk-`, `Bearer `, `api_key=`, `API_KEY=`, account IDs, hardcoded tokens/URLs that aren't generic docs links.
- **Rule 3 — no MCP server implementations**: flag runnable `.py`/`.ts`/`.js` server source under plugin dir. Configs in `mcp/` fine; server code not.
- **Rule 4 — reusable**: flag hardcoded absolute paths (`/Users/...`, `/home/...`), specific org/team names, personal emails in prompt text.
- **Rule 5 — skill granularity**: flag any `SKILL.md` over ~300 lines or listing 3+ independent responsibilities as split candidate.
- **Rule 6 — caveman lite**: flag prose with frequent articles (`the`, `a`, `an`) or filler (`just`, `really`, `basically`, `simply`) in SKILL.md / command / agent body. Skip code blocks.
- **Rule 7 — README upkeep**: compare plugins in `plugins/` against `README.md`. Flag any plugin missing from README, or README section referencing a removed plugin. If `README.md` absent entirely, flag.
- **Rule 8 — unique names**: collect every plugin/skill/command/agent name across all plugins. Flag any name appearing twice, listing the colliding file paths.
- **Rule 9 — hooks**: hooks in `plugins/<name>/hooks/hooks.json` (not `settings.json`/`.claude/hooks/`); command hooks read input from stdin JSON (`tool_input.file_path` via `jq`), not `$CLAUDE_TOOL_*` env vars.
- **Rule 10 — manifest + catalog sync**: `.claude-plugin/plugin.json` present with `name`, `description`, `version`, `author` `{name, email}`, `repository`; `name` equals plugin dir name; every path in `commands`/`agents`/`skills`/`hooks` arrays resolves to real file; plugin registered in `marketplace.json` with identical `name`/`description`/`version`. (Phase 1 catches version mismatch.)
- **Rule 11 — frontmatter contract**: commands have `description`, plus `argument-hint` when prompt reads `$ARGUMENTS`, plus least-privilege `allowed-tools`; agents have `name`/`description`/`model` (`opus`|`sonnet`); skills have `name`/`description`. Flag vague descriptions (`helper skill`, `various utilities`) that won't trigger.
- **Rule 12 — bundled paths**: bundled file refs use `${CLAUDE_PLUGIN_ROOT}/...`, not relative or absolute (`/Users/...`); persistent data `${CLAUDE_PLUGIN_DATA}`, project files `${CLAUDE_PROJECT_DIR}`. Flag dangling refs — path/skill/command name that resolves to nothing. Flag prompts assuming process cwd = project root, or `cd` then trusting it later.
- **Rule 13 — defensive prompts**: missing/malformed `$ARGUMENTS` → "stop and tell user" branch; files/dirs prompt assumes exist → checked first, not blind read; dep down (MCP, network, uninstalled CLI) → graceful failure with clear message.

### Extra heuristics (not rule-bound)

- Clear scannable structure (sections or numbered steps).
- Empty or oversized input (zero-byte file, 10MB file) → bounded?
- Hook race conditions → any hook writes shared state without atomic write?

Each finding = one line: `<file>:<line-or-section> — <rule/category> — <one-line problem> — <suggested fix>`.

## Phase 3 — Fix loop

Combine Phase 1 + Phase 2 findings.

1. If zero issues, skip to Phase 4.
2. Group issues by file. For each group, show issues and ask user via `AskUserQuestion`:
   - `Fix all` — apply every suggested fix in this file
   - `Fix some` — follow up with multi-select of which findings to fix
   - `Skip this file` — leave as-is this iteration
   - `Abort loop` — exit loop, jump to Phase 4 with current state
3. Apply approved fixes with Edit tool.
4. Re-run Phase 1 + Phase 2 on the affected scope.
5. Loop. Cap at **5 iterations**. If not clean after 5, stop and report remaining.
6. If user picks `Abort loop`, exit immediately and report.

## Phase 4 — Final report

- Targets validated (catalog + plugin list).
- Issues found / fixed / remaining, broken down by phase.
- Iteration count.
- If clean: `0 issues — plugin ready.`
- If remaining: list with `file:line` + recommended next step.

If `plugins/` empty or contains no plugin manifests, skip Phase 2/3 and note only catalog was validated.
