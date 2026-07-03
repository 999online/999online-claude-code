# 999online-claude-code

Claude Code plugin marketplace for 999online developers. Mirrors the `morelevels-claude-code` layout. Plugins land under `plugins/` and are registered in `.claude-plugin/marketplace.json`.

## Install

```
/plugin marketplace add https://github.com/999online/999online-claude-code
/plugin install <plugin-name>
```

Local development (this machine):

```
/plugin marketplace add ~/Desktop/ideas/999online-claude-code
```

## Adding a plugin

1. Create `plugins/<name>/` with a `.claude-plugin/plugin.json` manifest:

   ```json
   {
     "name": "<name>",
     "description": "What it does.",
     "version": "0.1.0",
     "author": { "name": "Your Name", "email": "you@legalmatch.com" },
     "repository": "https://github.com/999online/999online-claude-code",
     "commands": ["./commands/<name>.md"],
     "skills": ["./skills/<skill-name>"]
   }
   ```

2. Add `commands/` (slash commands), `skills/` (SKILL.md dirs), and optionally `.mcp.json` + `mcp/` (MCP server, use `${CLAUDE_PLUGIN_ROOT}` for paths) as needed.
3. Register it in `.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "<name>",
     "source": "./plugins/<name>/",
     "description": "What it does.",
     "version": "0.1.0"
   }
   ```

See `999online/morelevels-claude-code` for a complete working example.

## Plugins

### web-scaffold

Agentic web scaffolding on incubation architecture standards. Claude discovers idea, walks complexity ladder, picks lightest credible golden path (A landing / B full-stack / C internal tool / E API service), drafts Architecture Decision Record for approval, builds via official scaffolders (`create-next-app`, `create astro`, `create hono` — no bundled templates, no pinned versions), verifies against 8-question decision standard. Generated projects get strict CLAUDE.md structure contract + `.claude/rules/` + one folder-structure guard hook.

```
/plugin install web-scaffold@999online
/web-scaffold [one-line idea]
```

Skills (also standalone): `web-discover` (intake + escalation gate), `web-decide` (ladder → path → ADR), `web-build` (scaffold from ADR), `web-verify` (audit any project against standard).

Needs: Node 22+, npm, network (scaffolders + `@latest` installs). Bundles context7 MCP for current library docs; falls back to WebSearch.

## Layout

```
999online-claude-code/
├── .claude-plugin/
│   └── marketplace.json    # marketplace catalog
├── plugins/                # one dir per plugin
├── LICENSE
└── README.md
```
