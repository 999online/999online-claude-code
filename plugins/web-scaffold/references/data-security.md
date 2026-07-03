# Data, integration, security

## Data rules

- No sensitive production data unless explicitly approved. Prefer synthetic, anonymized, masked, or limited-scope data.
- Keep project data separate from org core systems where practical.
- Define who accesses data BEFORE deployment; define data fate after promote/pause/terminate.
- Managed databases unless local file or no-code datastore is enough.
- Schema narrow, validation-focused. Capture migrations/setup steps; no unreproducible manual DB changes.

## Data store selection

| Need | Recommended start |
|---|---|
| No persistence | Static app, form submission, analytics only |
| Simple list / workflow state | Cloudflare D1 table, Cloudflare KV, Airtable, Google Sheets, Firebase collection |
| Relational app data | Cloudflare D1, Neon Postgres (via Hyperdrive), managed Postgres (Railway/Render/Fly) |
| Realtime collaboration | Cloudflare Durable Objects (WebSockets), Firebase |
| Edge / local-first small data | Cloudflare D1, SQLite, Turso |
| Files / uploads | Cloudflare R2, Firebase Storage, S3-compatible |
| Search / vector | Managed service, only after retrieval necessary to validate |

## Integration rules

- Integrate with org core systems only when validation depends on it.
- API-based over direct DB access. Read-only unless write required.
- Batch import/export, CSV, webhook, or limited API for first validation.
- Document integration owner, credential, endpoint, rate limit, rollback path.
- No irreversible side effects in core systems without approval. Feature flags/allowlists/limited scopes for writes.

## Security baseline

- No hardcoded secrets. Env vars or approved secret manager.
- No shared personal credentials for deployed services.
- Least-privilege access for builders and users.
- Authentication for non-public tools or sensitive workflows.
- Explicit approval before external exposure of sensitive/customer/financial/regulated data.
- Access-removal path when user leaves validation group.
- Basic dependency hygiene (audit on install, no known-critical vulns shipped).
- Human review for AI outputs that materially affect people, money, compliance, operations.

## Authentication guidance

**Never build custom authentication unless authentication itself IS the idea.**

| Product type | Acceptable first auth |
|---|---|
| Public landing page | No auth; protect admin or data views |
| Private internal tool | Cloudflare Access, Google/Microsoft SSO, tool-native access, Clerk/Firebase |
| External pilot | Managed auth, invite-only, magic link, allowlisted accounts |
| Sensitive workflow | SSO or approved managed auth with explicit access owner |
| Demo, no sensitive data | Password protection or restricted preview URL may be enough |

## Cost control

Start on free/team/startup/low-cost tiers where practical. Before deployment, document: expected monthly cost, usage-based cost drivers, spend-monitoring owner, review threshold, shutdown procedure.

Avoid: long-term contracts for unvalidated ideas; enterprise tiers before validation; always-on compute when serverless/managed is enough; unbounded AI/email/SMS/scraping/data-processing usage.
