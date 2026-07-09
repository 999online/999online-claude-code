# 999online-claude-code

Claude Code plugin marketplace for 999online developers. Mirrors the `morelevels-claude-code` layout. Plugins land under `plugins/` and are registered in `.claude-plugin/marketplace.json`.

## Install

### Claude Code (CLI)

```
/plugin marketplace add https://github.com/999online/999online-claude-code
/plugin install <plugin-name>
```

Local development (this machine):

```
/plugin marketplace add ~/Desktop/ideas/999online-claude-code
```

### Claude Cowork (desktop / web / iOS)

No `/plugin` command in Cowork — add via UI. Needs paid Claude subscription.

Personal (per user):

1. **Cowork** tab → **Customize** → **Plugins**.
2. **Personal plugins** → **+** → **Add marketplace** → **Add from repository**.
3. Paste `https://github.com/999online/999online-claude-code`.
4. Back in **Plugins** → **Browse plugins** → **Install** the plugin you want.

Org-wide (admin): **Organization settings → Plugins → Add plugin → GitHub**, enter `999online/999online-claude-code`. Org GitHub install requires a **private/internal** repo — public repos rejected at org level (personal path above still works for public).

Docs: [use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude) · [manage org plugins](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization).

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

Agentic web scaffolding on incubation architecture standards. **Scaffold only — stubs, zero feature code.** Claude discovers idea, walks complexity ladder, picks lightest credible golden path (A landing / B full-stack / C internal tool / E API service), drafts Architecture Decision Record for approval, scaffolds via official scaffolders (`create-next-app`, `create astro`, `create hono` — no bundled framework templates, no pinned versions), verifies structurally against 8-question decision standard. **Cloudflare is the house default** (Workers/Pages/D1/R2/KV/Queues/Access); Vercel/Netlify stay documented swaps. Full-stack paths (B/C) always scaffold the three-workspace **Turborepo monorepo** — `apps/web` (Next.js, `src/{app,components,hooks,lib,server,types}`) + `apps/api` (Hono/Workers — never collapsed) + `packages/db` (Drizzle/D1), consistent `@app/*` package names, each app tsconfig extends the shared base; landing (A) and API-only (E) stay single-package. Output: architecture in place, correct file structure, stub page + health route, strict CLAUDE.md structure contract, root `DEPLOY.md`, and a generated `.claude/` with 7 rules + 4 guard hooks (folder-structure, sensitive-file, security-pattern, dependency-audit — no auto-commit). Feature work happens inside generated project — planned integrations land in README Next steps, never code. Landing (A) default first-deploy: **Cloudflare Pages Git integration** — connect repo in dashboard, auto-deploy on push, per-branch preview URLs, zero YAML/secrets. Opt-in promotion: `web-deploy-ci` adds GitHub Actions CI + Cloudflare deploy workflows once a project graduates past laptop/dashboard deploy.

```
/plugin install web-scaffold@999online
/web-scaffold [one-line idea]
```

Skills (also standalone): `web-discover` (intake + escalation gate), `web-decide` (ladder → path → ADR), `web-build` (scaffold stubs from ADR), `web-verify` (structural audit against standard), `web-deploy-ci` (opt-in — GitHub Actions Cloudflare deploy + CI workflows for a scaffolded repo).

Needs: Node 22+, npm, network (scaffolders + `@latest` installs). Bundles context7 MCP for current library docs; falls back to WebSearch. Pages Git integration (path A default) needs no repo secrets — dashboard-connected. `web-deploy-ci` needs repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (Vercel/Netlify swap documented); you set them, never committed.

### mobile-scaffold

Agentic mobile scaffolding on incubation architecture standards. **Scaffold only — stubs, zero feature code.** Claude discovers idea (native features, platforms, offline, store hypothesis), picks a **profile** on two axes — **target** (mobile-only / mobile+web) × **size** (small / large) — drafts one Architecture Decision Record for approval, then scaffolds **separate git repos** via official scaffolders (no bundled templates, no pinned versions), and verifies each. **Expo + Cloudflare highest priority; Firebase for notifications.**

Profiles (all TypeScript, all FCM push):

| Profile | Repos emitted | Mobile | State | Backend | DB | Web |
|---|---|---|---|---|---|---|
| mobile-only / small | `<n>-mobile`, `<n>-backend` | Expo | zustand | Hono + Workers | D1 | — |
| mobile-only / large | `<n>-mobile`, `<n>-backend` | Expo | RTK | NestJS | Postgres (AWS) | — |
| mobile+web / small | `<n>-mobile`, `<n>-web-be` | Expo | zustand | Hono + Workers | D1 | RN-web (`apps/web`) |
| mobile+web / large | `<n>-mobile`, `<n>-web-be` | Expo | RTK | NestJS | Postgres (AWS) | RN-web (`apps/web`) |

Small = pure Cloudflare (default). Large (NestJS/Postgres/AWS) = ADR-justified escalation (AWS = trigger 7). Each repo own `git` + strict CLAUDE.md structure contract + `.claude/rules/` + `.claude/allowed-paths.json` + folder-structure guard, plus root docs (README/STANDARDS/DEPLOY/PLUGINS-TO-INSTALL/.mcp.json). Mobile: stub index screen, `store/` state stub, base `lib/api.ts`, `expo-notifications` stub, `ios/`/`android/` forbidden (managed workflow). Backend: `GET /health`, DB stub (Drizzle/D1 or TypeORM/Postgres), FCM-send stub, secrets server-side only. Mobile ↔ backend link via `EXPO_PUBLIC_API_URL`. Feature work happens inside generated repos — planned integrations land in README Next steps, never code. PWA default first-deploy: **Cloudflare Pages Git integration** — connect repo in dashboard (build cmd `npx expo export -p web`, output dir `dist`), auto-deploy on push, per-branch preview URLs, zero YAML/secrets; wrangler CLI is the alternative.

```
/plugin install mobile-scaffold@999online
/mobile-scaffold [one-line idea]
```

Skills (also standalone): `mobile-discover` (intake + axes + escalation gate), `mobile-decide` (ladder → profile → ADR), `mobile-build` (scaffold the Expo mobile repo, delegate the rest), `mobile-service-scaffold` (scaffold the Hono+D1 / NestJS+Postgres backend, ± react-native-web `apps/web`), `mobile-verify` (per-repo structural audit), `mobile-deploy-ci` (opt-in — Cloudflare Pages/Workers deploy + CI; NestJS/AWS + native decline).

Needs: Node 22+, npm, network; Expo Go app on a phone for local run; free Expo account for EAS; Cloudflare account for Pages/Workers/D1; Firebase project for push; AWS for the large backend. PWA via Pages Git integration (default) needs no repo secrets — dashboard-connected. `mobile-deploy-ci` needs repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (you set them, never committed). Bundles context7 MCP for current library docs; falls back to WebSearch. Pure desk web app → use web-scaffold instead (decide stage redirects).

### idea-incubation-review

Initial research + viability verdict for a raw idea against 999's incubation criteria. Fans out three analysts in parallel (buildability, market/adoption, business), then scores against the Pre-Presentation Rulebook (20-item) and the Idea Incubation Operating Model (page-09 commercial / page-10 internal scorecard). Enforces the software-first hard gate (fail → auto-RETHINK). Answers *buildable per the operating model?* and *viable per the rulebook?*, classifies Commercial vs Internal track, lists gaps to close + missing presenter deliverables. Writes dossiers + `SUMMARY.md` to `docs/incubation/<slug>/`. Stack guidance follows the operating model — prefer managed platforms (Cloudflare/Vercel/Supabase/Firebase/Railway/Render/Fly.io/Neon/Turso), **no mandated default**; pick the simplest credible for the hypothesis; mobile → managed workflow (Expo/Flutter/PWA/Ionic).

```
/plugin install idea-incubation-review@999online
/incubation-review [one-line idea]
```

Agents: `incubation-architecture-analyst` (opus), `incubation-market-analyst` (sonnet), `incubation-business-analyst` (opus). Skills (also standalone): `incubation-research` (classify track + fan out analysts), `incubation-scorecard` (score + verdict).

Needs: network (WebSearch/WebFetch). Works with zero setup — bundles distilled 999 criteria. Optional: connect a Confluence-reader MCP (tools `confluence_*`) to freshen criteria from the live PIH space and flag snapshot drift — see the plugin's `references/confluence-mcp-setup.md`.

### idea-scout

Finds **sellable** software ideas — generation, not judging. Runs one command, loops until **5 ideas that would actually sell** all pass the `idea-incubation-review` gate (verdict READY). Each round: four market analysts dig in parallel (trend / demand / whitespace / monetization, each citing sources), their briefs synthesize into software-first candidates, every candidate is deduped against a persistent ledger of past proposals, then gated through `/incubation-review`. READY → kept; REFINE → auto-refined once, re-gated; RETHINK → logged, dropped. No idea proposed twice; every kept idea carries the source URLs for **why** it was picked. Bounded (≤5 rounds) so it never spins.

Analysts run a **standing Philippines-market lens** alongside the global scan every run — PH-specific trends, pains, whitespace, and monetization (PHP pricing, GCash/Maya/InstaPay, local compliance) — regardless of focus. Each idea carries a target-market tag (`global` / `Philippines` / `both`). Want PH-only? Pass focus `"Philippines"`.

```
/plugin install idea-scout@999online
/scout-ideas [optional focus — e.g. "b2b saas"]
/init-mcp <api-token>          # optional CurrentsAPI news grounding
```

Agents: `sellable-trend-analyst`, `sellable-demand-analyst`, `sellable-whitespace-analyst`, `sellable-monetization-analyst` (all sonnet). Skills (also standalone): `idea-scout-loop` (orchestrate the gate loop to 5), `idea-generate` (fan out analysts → cited candidates), `idea-ledger` (persistent dedup ledger at `docs/proposed-ideas/LEDGER.md`).

Needs: **idea-incubation-review installed** (it's the gate — `/scout-ideas` stops with an install line if missing), network (WebSearch/WebFetch), Node ≥18 (for the bundled MCP). Token-heavy: each candidate runs a full incubation-review. Optional: `/init-mcp <token>` wires a **bundled, zero-dependency CurrentsAPI news MCP** (`mcp/server.js`, morelevels pattern) for fresh "what's selling today" grounding — key saved to `~/.currentsapi-scout.json` (mode 0600, never committed), read lazily so it works immediately, **no restart**; free tier ~1,000 req/day; no token → prints signup steps. Falls back to WebSearch when absent.

### idea-refine

Takes **one existing idea** that failed `idea-incubation-review` and drives it to **READY** — the fix-it counterpart to idea-scout's generate-new. Bounded loop: gate the idea → read the review's gaps from `SUMMARY.md` → fan out only the gap-matching refine analysts (market / business / buildability) to close each gap with **cited** web evidence → re-gate the refined idea → repeat until READY. Pass a one-line idea or a slug already reviewed under `docs/incubation/<slug>/`.

**Pushes back instead of faking a pass.** Software-first fail (needs people to run it), a fatal gap with no real evidence, or the same decisive gap two iterations → stops with a reshape-or-park recommendation. Only a re-gated READY counts; a non-READY idea is never presented as passed. Bounded (≤3 iterations) so it never spins.

```
/plugin install idea-refine@999online
/refine-idea [existing idea one-liner, or a reviewed slug]
```

Agents: `refine-market-analyst`, `refine-business-analyst`, `refine-buildability-analyst` (all sonnet, WebSearch/WebFetch, cite every claim, report a gap `UNCLOSABLE` when no real evidence). Skills (also standalone): `idea-refine-loop` (orchestrate the bounded gate loop + pushback), `idea-refine-gaps` (one refinement pass → fan out analysts → refined idea). Writes `REFINE-*.md` briefs alongside the gate's dossiers in `docs/incubation/<slug>/`.

Needs: **idea-incubation-review installed** (the gate — `/refine-idea` stops with an install line if missing), network (WebSearch/WebFetch). Token-heavy: each iteration re-runs a full incubation-review. No MCP — refinement is targeted evidence-hunting on WebSearch/WebFetch.

## Layout

```
999online-claude-code/
├── .claude-plugin/
│   └── marketplace.json    # marketplace catalog
├── plugins/                # one dir per plugin
├── LICENSE
└── README.md
```
