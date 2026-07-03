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

Agentic web scaffolding on incubation architecture standards. **Scaffold only — stubs, zero feature code.** Claude discovers idea, walks complexity ladder, picks lightest credible golden path (A landing / B full-stack / C internal tool / E API service), drafts Architecture Decision Record for approval, scaffolds via official scaffolders (`create-next-app`, `create astro`, `create hono` — no bundled templates, no pinned versions), verifies structurally against 8-question decision standard. Output: architecture in place, correct file structure, stub page + health route, strict CLAUDE.md structure contract + `.claude/rules/` + folder-structure guard hook. Feature work happens inside generated project — planned integrations land in README Next steps, never code.

```
/plugin install web-scaffold@999online
/web-scaffold [one-line idea]
```

Skills (also standalone): `web-discover` (intake + escalation gate), `web-decide` (ladder → path → ADR), `web-build` (scaffold stubs from ADR), `web-verify` (structural audit against standard).

Needs: Node 22+, npm, network (scaffolders + `@latest` installs). Bundles context7 MCP for current library docs; falls back to WebSearch.

### mobile-scaffold

Agentic mobile scaffolding on incubation architecture standards (Path F — mobile/field prototype). **Scaffold only — stubs, zero feature code.** Claude discovers idea (native features, platforms, offline, store hypothesis), walks mobile complexity ladder, picks distribution mode per Path F "prefer PWA" rule — PWA (Expo web output on Cloudflare) / native (Expo Go → EAS internal distribution) / both — one Expo codebase either way. Drafts Architecture Decision Record for approval, scaffolds via `create-expo-app` (no bundled templates, no pinned versions; optional Hono-on-Workers backend stub in `server/` with `/health` only), verifies structurally against 8-question decision standard + expo-doctor + no-secrets-in-bundle grep. Output: architecture in place, correct file structure, stub index screen, strict CLAUDE.md structure contract + `.claude/rules/` (structure, delivery, security, Apple App Review + HIG, Android core quality + Play policy) + folder-structure guard hook (`ios/`/`android/` forbidden — managed workflow enforced). Feature work happens inside generated project — planned integrations land in README Next steps, never code.

```
/plugin install mobile-scaffold@999online
/mobile-scaffold [one-line idea]
```

Skills (also standalone): `mobile-discover` (intake + escalation gate), `mobile-decide` (ladder → distribution mode → ADR), `mobile-build` (scaffold stubs from ADR), `mobile-verify` (structural audit of any Expo project against standard).

Needs: Node 22+, npm, network; Expo Go app on a phone for local run; free Expo account for EAS deploy; Cloudflare account for PWA/backend deploy. Bundles context7 MCP for current library docs; falls back to WebSearch. Pure desk web app → use web-scaffold instead (decide stage redirects).

### idea-incubation-review

Initial research + viability verdict for a raw idea against 999's incubation criteria. Fans out three analysts in parallel (buildability, market/adoption, business), then scores against the Pre-Presentation Rulebook (20-item) and the Idea Incubation Operating Model (page-09 commercial / page-10 internal scorecard). Enforces the software-first hard gate (fail → auto-RETHINK). Answers *buildable per the operating model?* and *viable per the rulebook?*, classifies Commercial vs Internal track, lists gaps to close + missing presenter deliverables. Writes dossiers + `SUMMARY.md` to `docs/incubation/<slug>/`.

```
/plugin install idea-incubation-review@999online
/incubation-review [one-line idea]
```

Agents: `incubation-architecture-analyst` (opus), `incubation-market-analyst` (sonnet), `incubation-business-analyst` (opus). Skills (also standalone): `incubation-research` (classify track + fan out analysts), `incubation-scorecard` (score + verdict).

Needs: network (WebSearch/WebFetch). Works with zero setup — bundles distilled 999 criteria. Optional: connect a Confluence-reader MCP (tools `confluence_*`) to freshen criteria from the live PIH space and flag snapshot drift — see the plugin's `references/confluence-mcp-setup.md`.

## Layout

```
999online-claude-code/
├── .claude-plugin/
│   └── marketplace.json    # marketplace catalog
├── plugins/                # one dir per plugin
├── LICENSE
└── README.md
```
