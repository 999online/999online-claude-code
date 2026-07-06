---
name: mobile-decide
description: Select the mobile profile (target mobile-only/+web × size small/large) from intake, apply matrix defaults (Cloudflare + Expo highest priority), deliberate deviations, and write one Architecture Decision Record covering all emitted repos for user approval. Use after intake exists (from mobile-discover or conversation), before any build. Not for reviewing existing architecture.
---

# mobile-decide

Input: intake summary (from `mobile-discover` or equivalent). Output: approved ADR in conversation. **No file writes — approval gate happens here.**

Missing intake (no hypothesis or audience) → stop, run intake first via `mobile-discover`.

Read `${CLAUDE_PLUGIN_ROOT}/references/profiles.md`, `${CLAUDE_PLUGIN_ROOT}/references/doctrine.md`, `${CLAUDE_PLUGIN_ROOT}/references/decision-standard.md`.

## 1. Validate ladders

Bottom-up, stop at first rung that tests hypothesis honestly (doctrine.md):
- Rung 1 (no app) holds → say so: "This needs a Tally form / Airtable / chat workflow, not an app." Name tool, offer to stop. Legit outcome.
- Rung 2 (pure desk web, zero on-phone context) → recommend `/web-scaffold`; not installed → `/plugin install web-scaffold@999online`. Stop — this plugin builds phone-first apps.
- Rung 3+ → mobile. Continue.
- Backend size ladder: prefer **small (Hono+D1)**. Large (NestJS+Postgres/AWS) only when relational/scale justifies — else pick small.

## 2. Select profile

From intake axes → one of four (profiles.md matrix):

| Target × Size | Repos | Mobile | State | Backend | DB | Web |
|---|---|---|---|---|---|---|
| MOBILE-ONLY / small | `-mobile`, `-backend` | Expo | zustand | Hono+Workers | D1 | — |
| MOBILE-ONLY / large | `-mobile`, `-backend` | Expo | RTK | NestJS | Postgres(AWS) | — |
| MOBILE+WEB / small | `-mobile`, `-web-be` | Expo | zustand | Hono+Workers | D1 | RN-web (`apps/web`) |
| MOBILE+WEB / large | `-mobile`, `-web-be` | Expo | RTK | NestJS | Postgres(AWS) | RN-web (`apps/web`) |

Read the golden path(s) for the selected repos:
- mobile → `golden-paths/path-f-expo.md`
- backend small → `golden-paths/backend-hono-d1.md`; large → `golden-paths/backend-nestjs-postgres.md`
- MOBILE+WEB → `golden-paths/web-be-rn-web.md`

## 3. Distribution mode (mobile repo)

- MOBILE-ONLY: **prefer PWA** (Expo web → Cloudflare Pages) when store not in hypothesis + features browser-capable; else native (EAS); or both.
- MOBILE+WEB: native default (web presence = `-web-be` RN-web app). Mobile-PWA-too only as recorded deviation.
- PWA (or both) deploy model: default **Cloudflare Pages Git integration** (dashboard, zero-YAML, auto per-branch preview URLs, no repo secrets — deployment.md); wrangler CLI script is the alternative.

State mode + reason. Record target rung (deployment.md ladder) + PWA deploy model in ADR.

## 4. Apply matrix defaults + deliberate

Matrix = **defaults, not a cage** (still deliberate). Priority order: **Expo + Cloudflare first.**
- Backend needed only when intake shows persistence/auth/server-API/push. No backend → emit mobile repo only (drop `-backend`), note it.
- Deviations allowed for a real constraint (existing account, team skill, stated preference): e.g. Supabase instead of D1, Prisma instead of TypeORM. Record each deviation + reason in ADR.
- **Large (NestJS/Postgres/AWS) requires ADR "Cloudflare-vs-alternative justification"** — the decisive factor. Unjustified → drop to small.
- Push notifications ⇒ Firebase FCM (public config in app, service-account key server-side). All profiles.
- Expo only. User insists Flutter/Ionic → state: this plugin scaffolds Expo only; those run outside this pipeline. Record decision, stop before build.
- User wants an Avoid-list thing → push back once with doctrine reason, then follow user decision, record as known risk.

Design to pass all 8 decision-standard questions **per repo** — auth per audience, secrets outside bundle, observability, rollback.

## 5. Draft + approve ADR

Fill every field of `${CLAUDE_PLUGIN_ROOT}/references/adr-template.md` — Profile, Repos emitted, per-repo stack, Cloudflare-vs-alternative justification, Notifications (FCM), Cross-repo API contract (`EXPO_PUBLIC_API_URL`), Distribution mode + rung, Escalations. "None" valid, blank not. Decision owner unknown → ask who makes promote/pause/terminate call.

One ADR covers the whole profile (all repos); build copies it into each repo's `docs/ADR.md`.

Print full ADR. Then AskUserQuestion: **approve** / **change profile** / **change stack/mode** / **abort**. On change → adjust, reprint, re-ask. On abort → stop clean. On approve → hand ADR to build.
