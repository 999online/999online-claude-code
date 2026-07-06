---
description: Scaffold a web project the agentic way — discover idea, pick lightest credible architecture, approve ADR, scaffold via official scaffolders (stubs only, zero feature code), verify against decision standard. Full pipeline, one command.
argument-hint: [one-line idea (optional)]
allowed-tools: AskUserQuestion, Skill, Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch
---

# /web-scaffold

Full pipeline: discover → decide → build → verify. Idea → scaffold: architecture decided, structure enforced, `.claude` assets in place, stub code only. Feature work happens inside generated project — never in this pipeline.

Layout: full-stack paths (B/C) scaffold a Cloudflare-targeted Turborepo monorepo (`apps/web` + `apps/api` + `packages/db`); landing (A) and API-only (E) stay single-package. Generated `.claude/` ships 4 guard hooks + 7 rules; project root gets `DEPLOY.md`.

`$ARGUMENTS` = optional one-line idea. Missing/empty → fine, intake asks. Present → seed intake, skip answered questions.

## Resume check first

Current dir (or named target) already has `docs/ADR.md` → prior run. Read it, summarize, AskUserQuestion: resume at build / resume at verify / start over / abort. Skip re-interview on resume.

## Pipeline

1. **Discover** — run `web-discover` skill. Ends with intake summary. Escalation trigger + user chose stop → end here.
2. **Decide** — run `web-decide` skill. Complexity ladder → golden path → ADR → user approval. Rung-1 outcome (no-code tool suffices) or abort → end here, no files written.
3. **Build** — run `web-build` skill with approved ADR.
4. **Verify** — run `web-verify` skill on built project.

Each stage consumes prior stage's output from conversation. No state files beyond project itself — filesystem is the checkpoint.

## Final report

After verify, single summary:

- Verdict from verify report.
- Local run: command.
- Deploy: command + remaining account setup (platform login, project link, env secrets).
- Env vars to fill (from `.env.example`).
- Escalations pending decision owner, if any — deploy blocked until cleared.
- Next steps: planned integrations from generated README Next steps section — feature work happens inside project, guided by its CLAUDE.md + ADR.
- Layout: single-package or monorepo (`apps/web` + `apps/api` + `packages/db`).
- ADR location: `docs/ADR.md`. Deploy walkthrough: `DEPLOY.md`.
- Cost note: expected tier + shutdown path (from ADR).
- Delivery framing: "Scaffold deploys as-is — `npm run deploy` after connecting <platform>. Feature work follows inside project."
- Promote to automated deploy? Later, run `web-deploy-ci` to add GitHub Actions CI + Cloudflare deploy workflows (opt-in — laptop deploy stays the default).

## Failure handling

- Stage stops (incomplete intake, aborted ADR, scaffolder/network failure, build gate fail after 3 fixes) → report exact state + what user must do. Never fake progress past a failed stage.
- Network/registry down mid-build → project may be partial; say which steps completed, resume path via this command.
