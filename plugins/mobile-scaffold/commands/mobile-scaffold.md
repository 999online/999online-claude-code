---
description: Scaffold a mobile app the agentic way — discover idea, pick profile (target mobile-only/+web × size small/large), approve ADR, scaffold sibling repos (Expo mobile + Cloudflare/NestJS backend, RN-web when +web) via official scaffolders (stubs only, zero feature code), verify each. Expo + Cloudflare highest priority. Full pipeline, one command.
argument-hint: [one-line idea (optional)]
allowed-tools: AskUserQuestion, Skill, Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch
---

# /mobile-scaffold

Full pipeline: discover → decide → build → service-scaffold → verify. Idea → separate git repos: Expo `<slug>-mobile` + backend (`<slug>-backend` Hono+D1 / NestJS+Postgres) or `<slug>-web-be` (apps/api + apps/web RN-web). Architecture decided, structure enforced per repo, `.claude` assets in place, stub code only. Feature work happens inside generated repos — never in this pipeline.

**Priority:** Expo (only mobile framework) + Cloudflare (small = pure Cloudflare) highest. Large (NestJS/Postgres/AWS) = ADR-justified escalation. Firebase = notifications only.

`$ARGUMENTS` = optional one-line idea. Missing/empty → fine, intake asks. Present → seed intake, skip answered questions.

## Resume check first

Sibling repos already exist near target (`<slug>-mobile/docs/ADR.md`, `<slug>-backend/`, `<slug>-web-be/`) → prior run. Read the ADR, summarize, AskUserQuestion: resume at build (missing repo) / resume at verify / start over / abort. Skip re-interview on resume. Filesystem is the checkpoint — no state files.

## Pipeline

1. **Discover** — run `mobile-discover`. Ends with intake summary (incl. target + size axes). Escalation trigger + user chose stop → end here.
2. **Decide** — run `mobile-decide`. Ladders → profile select → distribution mode → matrix defaults + deviations → ADR → user approval. Rung-1 (no-code tool), rung-2 (desk web → `/web-scaffold`), Flutter insisted, or abort → end here, no files written.
3. **Build (mobile)** — run `mobile-build` with approved ADR. Emits `<slug>-mobile`, git-initialized.
4. **Service-scaffold** — `mobile-build` delegates to `mobile-service-scaffold` (unless ADR names no backend). Emits `<slug>-backend` or `<slug>-web-be`, git-initialized.
5. **Verify** — run `mobile-verify` on each emitted repo.

Each stage consumes prior output from conversation.

## Final report

After verify, single summary:

- Verdict from verify report (per repo + profile checks).
- Repos emitted + paths; each own git repo.
- Local run: mobile `npm run dev` (QR scan, Expo Go); backend `npm run dev` (+ `curl /health`).
- **Cross-repo:** set mobile `EXPO_PUBLIC_API_URL` = backend base URL (Hono `:8787` / Nest `:3000` / deployed URL).
- Distribution per ADR mode: PWA → Cloudflare Pages URL; native → EAS (`npm run deploy`/`deploy:prod`) + one-time `npm i -g eas-cli && eas login && eas init`. Backend: Hono `wrangler deploy`; NestJS → documented AWS.
- Env vars to fill (per repo `.env.example`/`.dev.vars.example`); mobile `EXPO_PUBLIC_` all public; Firebase service-account = backend secret only.
- Escalations pending decision owner (Apple $99 / Play $25 trigger 9; AWS trigger 7 for large) — distribution blocked until cleared.
- Next steps: planned integrations from each README Next steps — feature work inside repos, guided by their CLAUDE.md + ADR.
- ADR location: each repo's `docs/ADR.md`.
- Cost note: Cloudflare/EAS free tiers + AWS metered (large) + shutdown path (ADR).
- Promote to automated deploy? Later run `mobile-deploy-ci` per Cloudflare-targeted repo (Pages / Workers; opt-in; NestJS/AWS + native declines).

## Failure handling

- Stage stops (incomplete intake, aborted ADR, scaffolder/network fail, build gate fail after 3 fixes) → report exact state + what user must do. Never fake progress.
- One repo scaffolds, sibling fails → say which completed; resume via this command.
- Network/registry down mid-build → repo may be partial; say which steps completed, resume path.
