# Path E — API, integration, backend service

## When

Product needs lightweight API, webhook receiver, scheduled task, data sync, integration adapter. No UI, or UI lives elsewhere.

When NOT: humans interact through screens → path B or C. Demand test → path A.

## Layers (first option = default)

| Layer | Preferred options |
|---|---|
| API framework | Hono, Express, FastAPI |
| Runtime | Cloudflare Workers, Vercel Functions, AWS Lambda, Railway, Render, Fly.io |
| Data | Cloudflare D1, Cloudflare KV, Neon Postgres (via Hyperdrive), managed Redis/queue where needed |
| Jobs / queues | Cloudflare Queues, Inngest, Trigger.dev, Upstash QStash, platform cron |
| Secrets | Platform environment variables or approved secret manager |

Default combo: Hono + Cloudflare Workers — local dev and deploy through one CLI (wrangler).

## Avoid

- Shared infrastructure dependencies for one-off validation.
- Reusable integration platform before single use case validated.
- Direct production database writes without explicit approval.
- Wide API surface — every endpoint must serve the hypothesis.

## Rules of the path

- Start read-only unless write access required for validation.
- Webhooks and scheduled pulls over direct database coupling.
- Idempotency for webhook and job processing (dedupe key or idempotency check).
- Rollback documented per integration: how to disable, revoke credential, undo side effects.

## Scaffolder commands (non-interactive)

Default (Hono on Workers):
```bash
npm create hono@latest <dir> -- --template cloudflare-workers --install --pm npm
```

Flags rejected → scaffolder `--help` first, never interactive.

## Structure contract (Hono default)

| Location | Contains | Never contains |
|---|---|---|
| `src/index.ts` | App entry, route mounting | Business logic |
| `src/routes/` | Route handlers, thin | Service logic, SQL |
| `src/services/` | Business logic | HTTP handling |
| `src/schemas/` | Input validation schemas | Runtime logic |
| `src/lib/` | Clients, helpers | Routes |
| `docs/` | ADR, all other .md | — |

Starter `allowed-paths.json` (reconcile against actual tree):

```json
{
  "allowedGlobs": [
    "src/routes/**", "src/services/**", "src/schemas/**", "src/lib/**",
    "src/types/**", "src/*.ts", "test/**", "docs/**", ".claude/**",
    "*.json", "*.jsonc", "*.toml", "*.mjs", "*.cjs", "*.ts",
    ".gitignore", ".env.example", ".nvmrc", ".dev.vars.example"
  ],
  "forbiddenGlobs": [
    "src/{utils,helpers,common,shared,misc}/**",
    "public/**", "pages/**", "components/**"
  ],
  "rootOnlyFiles": [".gitignore", ".env.example", ".nvmrc", ".dev.vars.example"],
  "exemptRootMd": ["README.md", "CLAUDE.md"]
}
```

Rationale: UI dirs forbidden — service has no frontend; one appearing signals path drift.

## Feature slice (minimum build proves)

1. Health route (`GET /health`) returning version + ok.
2. One read-only endpoint serving the hypothesis, input validated at boundary, structured error shape `{error: {code, message}}`.
3. Webhook handler shape when integration is webhook-driven: signature/secret check stub + idempotency guard.
4. Request logging visible in platform logs (wrangler tail or equivalent).

## Verify notes

- Health + main endpoint respond locally (`wrangler dev` / `npm run dev`, curl both).
- Write endpoints absent, or ADR records why write access required for validation.
- Idempotency present in webhook/job handlers.
- README rollback section covers each integration separately.
