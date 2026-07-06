---
name: mobile-verify
description: Audit each scaffolded repo (mobile + backend/web-be) against the decision standard and deployment baseline — builds pass, health endpoint responds, 8 questions answered per repo with evidence, no secrets in bundles, structure guard functional, no feature code beyond stubs, cross-repo API link coherent. Structural audit, not app-behavior QA. Use after mobile-build + mobile-service-scaffold, or standalone to audit any of these repos. Read-heavy; only writes fixes for failures it finds.
---

# mobile-verify

Input: the emitted repo dirs (from ADR/conversation, or discover siblings `<slug>-mobile` + `<slug>-backend|-web-be`). Output: per-repo pass/fail report + profile checks + overall verdict.

Run every gate anchored to its repo dir — `(cd <repo> && cmd)` or absolute paths; cwd drifts.

Read `${CLAUDE_PLUGIN_ROOT}/references/decision-standard.md`, `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`, `${CLAUDE_PLUGIN_ROOT}/references/profiles.md`, and each repo's golden path. Distribution mode + profile from `docs/ADR.md` (no ADR → audit against decision standard only, flag missing ADR).

Cap **3 fix attempts** per gate. Still failing → stop fixing, report exact errors honestly. Never claim pass. Checks needing accounts/devices (Expo Go boot, EAS publish, live Cloudflare URL, Postgres) → mark "pending — needs <account/device>", list as follow-up.

## Profile checks (once)

- **P1 lightest credible:** profile matches ADR; small (Cloudflare) unless ADR "Cloudflare-vs-alternative justification" filled for large.
- **P2 repo separation:** each repo own `git` + `.claude/` + root docs; mobile `EXPO_PUBLIC_API_URL` ↔ backend base URL; no shared privileged creds.

## Mobile repo (`<slug>-mobile`)

1. **Build:** `npm install` → `npm run check`. Bundle: `npx expo export --platform ios --platform android` (+`--platform web` if PWA/both).
2. **Doctor:** `npx expo-doctor`.
3. **Decision standard (8):** per decision-standard.md evidence. Secrets: `.env.example` only `EXPO_PUBLIC_`; `.env*` gitignored; grep tracked files for non-`EXPO_PUBLIC_` credentials, Firebase admin keys, committed `google-services.*` — any hit = fail.
4. **Deployment baseline:** 10 README items; scripts per mode; ADR names mode+rung, observability, offline.
5. **Structure contract:** `.claude/allowed-paths.json`+`settings.json` parse; guard denies a forbidden path:
   ```bash
   echo '{"tool_input":{"file_path":"<repo>/ios/Podfile"},"cwd":"<repo>"}' | node "<repo>/.claude/hooks/folder-structure-guard.cjs"
   ```
   expect exit 0 + `"permissionDecision":"deny"`. `ios/`/`android/` absent. Tree matches CLAUDE.md table (incl. `store/`).
6. **Stub checks:** stub index screen; `store/` infra-only; `lib/api.ts` no domain endpoints; `lib/notifications.ts` no send logic — feature code = scope-creep fail. `EXPO_PUBLIC_API_URL` in `.env.example`. README Next steps documents ADR integrations.

## Backend repo (`<slug>-backend`) — small (Hono+D1)

1. `npm install` → `npm run check` (tsc).
2. `wrangler dev` boots; `curl localhost:8787/health` → `{"ok":true,...}` (no account needed; if wrangler needs login for D1 bind, mark pending).
3. Secrets: `.dev.vars` gitignored, `.dev.vars.example` committed; grep no committed secrets/service-account.
4. `db/migrations/` present; `drizzle.config.ts` parses.
5. Guard denies forbidden path (`src/utils/x.ts`, `app/x.ts`). No feature routes (only `/health`); FCM send is a stub.
6. Decision standard rows 1–8 for a backend.

## Backend repo (`<slug>-backend`) — large (NestJS+Postgres)

1. `npm install` → `npm run build`; `npm run check`.
2. Boot + `curl localhost:3000/health` → `{"ok":true,...}` (needs Postgres — local Docker or mark pending).
3. `src/migrations/` present; DataSource config parses. `Dockerfile` present.
4. Secrets: `.env` gitignored, `.env.example` committed; grep clean.
5. Guard denies forbidden path. No feature modules/entities (health + placeholder only).
6. ADR Cloudflare-vs-alternative justification filled; trigger 7 recorded.

## Web-be repo (`<slug>-web-be`) — MOBILE+WEB

1. Root `npm install` (workspaces) → `turbo run check`.
2. `apps/api` verified per its backend section above.
3. `apps/web`: `npx expo export --platform web` builds `dist/`. Web `.env.example` has `EXPO_PUBLIC_API_URL`; no secrets in web bundle.
4. Guard denies root `src/**`, `apps/web/utils/**`, `ios/**`.

## Report

```
## Verify report — <profile>
Profile checks: P1 PASS/FAIL, P2 PASS/FAIL
--- <slug>-mobile ---
Build / Doctor / Decision standard (8) / Deployment baseline / Structure / Stub checks: PASS/FAIL/PENDING (evidence)
--- <slug>-backend | -web-be ---
Build / Health / Secrets / Migrations / Structure / Stub checks: PASS/FAIL/PENDING (evidence)
Verdict: SCAFFOLD READY / NOT READY (blockers) / SCAFFOLD READY WITH PENDING ITEMS
```

Escalation triggers recorded in ADR → verdict "SCAFFOLD READY — distribution blocked pending decision owner" (local scaffold fine; distribution blocked until cleared).
