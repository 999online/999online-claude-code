---
name: web-decide
description: Pick lightest credible architecture for a specced web idea and write Architecture Decision Record (ADR) for user approval. Walks complexity ladder, selects golden path (A landing / B full-stack / C internal tool / E API service), chooses stack per layer. Use after intake exists (from web-discover or conversation), before any build. Not for reviewing existing architecture.
---

# web-decide

Input: intake summary (from `web-discover` or equivalent conversation context). Output: approved ADR in conversation. **No file writes — approval gate happens here.**

Missing intake (no hypothesis or audience known) → stop, run intake first via `web-discover`.

Read `${CLAUDE_PLUGIN_ROOT}/references/doctrine.md` and `${CLAUDE_PLUGIN_ROOT}/references/decision-standard.md`.

## 1. Walk complexity ladder

Bottom-up, stop at first rung that tests hypothesis honestly:

- Rung 1 (no-code/form) holds → say so: "This needs a Tally form / Airtable base, not a repo." Name tool, outline setup, offer to stop. Legit outcome — scaffolding here is waste.
- Rung 2+ → map to golden path:
  - Demand/interest test, no persistence beyond signups → **A** (`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-a-landing.md`)
  - Internal team audience → **C** (`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-c-internal-tool.md`)
  - UI + persistence + accounts → **B** (`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-b-fullstack.md`)
  - No UI, service/integration → **E** (`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-e-api-service.md`)
- Idea needs rung 5+ (containers, custom infra, core integration) → flag: more justification needed, capture reasoning in ADR "Why fastest credible path", consider simplifying scope first.
- Idea outside all four paths (mobile app, pure data/AI notebook) → say so, name what it needs, stop. Don't force wrong path.

## 2. Pick stack

Read chosen golden-path doc. Default = first option per layer. Override only for user constraint (existing account, team skill, stated preference) — record override reason in ADR. Respect path's Avoid list; user asks for avoided thing → push back once with doctrine reason, then follow user decision and record it as known risk.

Layout: B/C default to the **monorepo** (`apps/web` + `apps/api` + `packages/db`, Turborepo); collapse `apps/api` only if the tool is genuinely single-surface. A/E stay single-package. Cloudflare is the house default deploy target (Workers/Pages/D1/R2/KV/Access); record the ADR `Layout` field.

**Deploy model (path A static):** default **Cloudflare Pages Git integration** — dashboard-connected, zero-YAML, auto per-branch preview URLs, no repo secrets (`${CLAUDE_PLUGIN_ROOT}/references/deployment.md`). Alternative: wrangler CLI (`npm run deploy`). Record chosen deploy model in ADR. Git-integration ⇒ `web-deploy-ci` (Actions) not needed for path A. Not for B/C (Next-on-Workers via `@opennextjs/cloudflare`).

Design to pass all 8 questions in `decision-standard.md` — auth per audience, secrets in env, observability chosen, rollback path known.

## 3. Draft + approve ADR

Fill every field of `${CLAUDE_PLUGIN_ROOT}/references/adr-template.md`. "None" valid, blank not. Decision owner unknown → ask user who makes promote/pause/terminate call.

Print full ADR. Then AskUserQuestion: **approve** / **change path** / **change stack** / **abort**. On change → adjust, reprint, re-ask. On abort → stop clean. On approve → hand ADR to build.
