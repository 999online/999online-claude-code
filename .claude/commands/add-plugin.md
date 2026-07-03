---
description: Scaffold a new plugin in this marketplace
argument-hint: <plugin-name>
---

Scaffold new plugin named `$ARGUMENTS` in this marketplace.

Steps:

1. Validate `$ARGUMENTS` is kebab-case (lowercase letters, digits, hyphens only — no spaces, no uppercase). If not, stop, tell user rule.
2. Confirm `plugins/$ARGUMENTS/` does not exist. If it does, stop, tell user.
3. Ask user (via `AskUserQuestion`):
   - One-line description of plugin.
   - Which component types it includes (multi-select: skills, commands, agents, hooks, mcpServers).
4. Create directory structure:
   - `plugins/$ARGUMENTS/.claude-plugin/`
   - One subdir per chosen component type (e.g. `plugins/$ARGUMENTS/skills/`). Add `.gitkeep` to each so empty dirs track.
5. Write `plugins/$ARGUMENTS/.claude-plugin/plugin.json` with full Rule 10 field set. Derive `author` from `git config user.name` / `git config user.email`; copy `repository` from a sibling `plugins/*/.claude-plugin/plugin.json` that has it:
   ```json
   {
     "name": "$ARGUMENTS",
     "description": "<description from step 3>",
     "version": "0.1.0",
     "author": { "name": "<git user.name>", "email": "<git user.email>" },
     "repository": "<repository from sibling plugin.json>"
   }
   ```
6. Add entry to `plugins` array in `.claude-plugin/marketplace.json`. `name`/`description`/`version` must match plugin.json (Rule 10). Match existing entry shape — trailing slash on `source`:
   ```json
   {
     "name": "$ARGUMENTS",
     "source": "./plugins/$ARGUMENTS/",
     "description": "<same description>",
     "version": "0.1.0"
   }
   ```
   Preserve existing JSON formatting.
7. Run `claude plugin validate .` from repo root. If errors, fix and re-run.
8. Update `README.md` — add `$ARGUMENTS` section under plugins list: one-line description, install line, usage, dependencies. Caveman lite (authoring Rule 7).
9. Report what was created (file tree + next steps for filling component files). Point to Rule 11 for frontmatter contract when writing commands/agents/skills. If `hooks` chosen, note hooks live in `plugins/$ARGUMENTS/hooks/hooks.json` — see Rule 9.

Do not commit — leave changes staged for user review.
