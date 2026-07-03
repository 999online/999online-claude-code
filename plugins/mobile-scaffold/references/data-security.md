# Data, integration, security — mobile

**Bundle is public.** Everything shipped in the app — code, `EXPO_PUBLIC_*` env values, assets — is extractable by any user. Publishable/anon keys only. Privileged operations go through backend (Hono Workers routes; alternatives: Supabase RLS/Edge Functions, Firebase rules). App never holds admin, service-role, or signing secrets.

## Data rules

- No sensitive production data unless explicitly approved. Prefer synthetic, anonymized, masked, or limited-scope data.
- Keep project data separate from org core systems where practical.
- Define who accesses data BEFORE distribution; define data fate after promote/pause/terminate.
- Managed databases unless local device storage is enough.
- Schema narrow, validation-focused. Capture migrations/setup steps; no unreproducible manual DB changes.
- Device permissions minimalism: request only permissions the hypothesis needs; record each in ADR.

## Data store selection

| Need | Recommended start |
|---|---|
| No persistence | App state only, analytics events |
| Local/offline, non-sensitive | expo-sqlite, AsyncStorage |
| Tokens, credentials on device | expo-secure-store — never AsyncStorage, never `EXPO_PUBLIC_` |
| Synced app data | Cloudflare D1 via `server/` Hono API, Supabase Postgres, Firebase |
| Files / uploads | Cloudflare R2 via backend, Supabase Storage, Firebase Storage |
| Realtime | Supabase Realtime, Firebase, Durable Objects via backend |

## Integration rules

- Integrate with org core systems only when validation depends on it.
- App → backend → external service. App never calls privileged APIs directly.
- Read-only unless write required.
- Batch import/export, CSV, webhook, or limited API for first validation.
- Document integration owner, credential, endpoint, rate limit, rollback path.
- No irreversible side effects in core systems without approval.

## Security baseline

- No secrets in app code or `EXPO_PUBLIC_` vars. Backend secrets: `server/.dev.vars` locally (gitignored, `.dev.vars.example` committed), wrangler secrets deployed.
- Session tokens on device → expo-secure-store.
- No shared personal credentials for deployed services.
- Least-privilege access for builders and users.
- Authentication for non-public tools or sensitive workflows.
- Explicit approval before external exposure of sensitive/customer/financial/regulated data.
- Access-removal path when user leaves validation group (revoke auth, rotate anon key, disable channel).
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

Backend present → token verified in Hono middleware; app sends token, backend decides.

## Cost control

Start on free tiers where practical. Before distribution, document: expected monthly cost, usage-based cost drivers, spend-monitoring owner, review threshold, shutdown procedure.

Avoid: long-term contracts for unvalidated ideas; enterprise tiers before validation; always-on compute when serverless/managed is enough; unbounded AI/email/SMS/push/data-processing usage.
