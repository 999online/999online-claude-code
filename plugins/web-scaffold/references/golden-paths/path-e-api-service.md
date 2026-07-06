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
  "exemptRootMd": ["README.md", "CLAUDE.md", "DEPLOY.md"]
}
```

Rationale: UI dirs forbidden — service has no frontend; one appearing signals path drift.

## Scaffold output (stubs only)

1. Health route (`GET /health`) returning `{ok: true, version}` — only route.
2. `.gitkeep` in `src/routes/`, `src/services/`, `src/schemas/`, `src/lib/`.
3. README "Next steps" section: first endpoint + validation schema, webhook handler + idempotency guard, request logging — from ADR.

Planned integrations → README Next steps, never code. NO feature endpoints, NO webhook handler.

## Verify notes

- Build/check passes; `GET /health` responds locally (`wrangler dev` / `npm run dev`, curl).
- No routes beyond health — feature endpoints present = scope-creep fail.
- README Next steps documents ADR's planned endpoints + integrations.
