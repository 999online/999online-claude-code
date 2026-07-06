# Data, integration, security — mobile

**Mobile bundle is public.** Everything shipped in the app — code, `EXPO_PUBLIC_*` env values, `google-services` config, assets — is extractable by any user. Publishable/anon keys only. Privileged operations go through the backend repo (Hono Workers / NestJS). App never holds admin, service-role, Firebase service-account, or signing secrets.

## Per-repo env + secrets model

| Repo | Public (bundled/committed example) | Secret (never bundled) |
|---|---|---|
| `<name>-mobile` | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_FIREBASE_*` (public FCM config) in `.env.example` | none on device beyond expo-secure-store tokens; `google-services.json`/`GoogleService-Info.plist` gitignored (provisioned per env) |
| `<name>-backend` small (Hono) | `.dev.vars.example` committed | `FIREBASE_SERVICE_ACCOUNT`, API secrets in `.dev.vars` (gitignored) + `wrangler secret put` |
| `<name>-backend` large (NestJS) | `.env.example` committed | `DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT` in `.env` (gitignored) + AWS Secrets Manager / task env |
| `<name>-web-be` | web `.env.example` (`EXPO_PUBLIC_*`); api example per its type | api secrets per backend type |

`.env*`, `.dev.vars`, `google-services.*` always gitignored. `*.example` committed with placeholders.

## Firebase (notifications only)

- **Public config** (`EXPO_PUBLIC_FIREBASE_API_KEY`, project id, sender id, app id) → app, safe to bundle (identifies the project, not privileged).
- **Service-account key** (admin, sends push) → **server only** (backend `.dev.vars` / `.env` / secret store). Never in mobile repo, never `EXPO_PUBLIC_`.
- `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) → gitignored; document provisioning in README. With `expo-notifications` (managed) these feed EAS credentials; with `@react-native-firebase` (dev build) they're native config.

## Data rules

- No sensitive production data unless explicitly approved. Prefer synthetic, anonymized, masked, or limited-scope.
- Keep project data separate from org core systems where practical.
- Define who accesses data BEFORE distribution; define data fate after promote/pause/terminate.
- Managed databases unless local device storage is enough.
- Schema narrow, validation-focused. Migrations tracked (Drizzle for D1, TypeORM for Postgres) — no unreproducible manual DB changes; migrations immutable once applied.
- Device permissions minimalism: request only what the hypothesis needs; record each in ADR (push = FCM permission).

## Data store selection

| Need | Recommended start |
|---|---|
| No persistence | App state (zustand/RTK), analytics events |
| Local/offline, non-sensitive | expo-sqlite, AsyncStorage |
| Tokens, credentials on device | expo-secure-store — never AsyncStorage, never `EXPO_PUBLIC_` |
| Synced app data — small | **Cloudflare D1** via Hono backend (default) |
| Synced app data — large | **Postgres (AWS RDS/Aurora)** via NestJS — only when relational/scale justifies (ADR) |
| Files / uploads | Cloudflare R2 via backend (small); S3 via backend (large) |
| Realtime | Durable Objects via Workers; alternatives per ADR |
| Push notifications | Firebase Cloud Messaging (send server-side) |

## Integration rules

- Integrate with org core systems only when validation depends on it.
- App → backend → external service. App never calls privileged APIs directly.
- Read-only unless write required.
- Batch import/export, CSV, webhook, or limited API for first validation.
- Document integration owner, credential, endpoint, rate limit, rollback path.
- No irreversible side effects in core systems without approval.

## Security baseline

- No secrets in app code or `EXPO_PUBLIC_` vars. No Firebase service-account in app.
- Backend secrets: small → `.dev.vars` (gitignored, `.dev.vars.example` committed) + wrangler secrets; large → `.env` (gitignored) + AWS secret store.
- Session tokens on device → expo-secure-store.
- No shared personal credentials for deployed services.
- Least-privilege access for builders and users; Postgres least-privilege DB role.
- Authentication for non-public tools or sensitive workflows; token verified in backend (Hono middleware / Nest guard).
- Explicit approval before external exposure of sensitive/customer/financial/regulated data.
- Access-removal path when a user leaves the validation group (revoke auth, rotate anon key, disable channel).
- Basic dependency hygiene (audit on install, no known-critical vulns shipped).
- Human review for AI outputs that materially affect people, money, compliance, operations.

## Authentication guidance

**Never build custom authentication unless authentication itself IS the idea.**

| Product type | Acceptable first auth |
|---|---|
| Field testers, no sensitive data | None — internal-distribution link / preview URL is the access control, documented in README |
| Private internal tool | Google/Microsoft SSO, Supabase Auth, Firebase Auth |
| External pilot | Managed auth, invite-only, magic link, allowlisted accounts |
| Sensitive workflow | SSO or approved managed auth with explicit access owner |

Backend present → token verified server-side (Hono middleware / Nest guard); app sends token, backend decides.

## Cost control

Start on free tiers (Cloudflare Workers/D1/Pages). Before distribution, document: expected monthly cost, usage-based drivers, spend-monitoring owner, review threshold, shutdown procedure. AWS (large) is metered — extra scrutiny. Avoid: long-term contracts for unvalidated ideas; enterprise tiers before validation; always-on compute when serverless/managed enough; unbounded AI/email/SMS/push/data usage.
