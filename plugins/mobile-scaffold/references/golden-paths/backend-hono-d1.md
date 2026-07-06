# Golden path — backend repo, small (Hono + Cloudflare Workers + D1)

The `<name>-backend` repo for **small** profiles (default when backend needed). Pure Cloudflare. Separate git repo from mobile.

## Stack

| Layer | Value |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | Hono (TypeScript) |
| DB | Cloudflare D1 via Drizzle ORM |
| Notifications send | Firebase Cloud Messaging HTTP v1 (service-account key = Worker secret) |
| Auth (when needed) | token verified in Hono middleware; managed provider, never custom |

## Scaffolder commands (non-interactive)

```bash
npm create hono@latest <name>-backend -- --template cloudflare-workers --install --pm npm
```
Then, inside dir:
```bash
npm install drizzle-orm
npm install -D drizzle-kit
```
D1 database (needs Cloudflare account — first-deploy setup, document, don't assume):
```bash
npx wrangler d1 create <name>-db     # copy database_id into wrangler.jsonc binding
```
Exact D1 + Drizzle + wrangler wiring from current docs (context7 `cloudflare`/`drizzle`, else WebSearch) at build time — versions drift.

## Structure contract

| Location | Contains | Never contains |
|---|---|---|
| `src/routes/` | HTTP route handlers (thin) | Business logic |
| `src/middleware/` | auth, cors, logging | Route handlers |
| `src/services/` | business logic, FCM send | HTTP concerns |
| `src/schemas/` | zod request/response validation | Logic |
| `src/lib/` | clients, db handle, helpers | Routes |
| `src/types/` | shared types | Runtime code |
| `db/` | Drizzle schema + migrations | App logic |
| `docs/` | ADR, all other .md | — |

`src/index.ts` = app entry + `GET /health`.

Starter `allowed-paths.json`:

```json
{
  "allowedGlobs": [
    "src/routes/**", "src/middleware/**", "src/services/**",
    "src/schemas/**", "src/lib/**", "src/types/**",
    "db/**", "docs/**", ".claude/**",
    "*.json", "*.jsonc", "*.toml", "*.js", "*.mjs", "*.cjs", "*.ts",
    ".gitignore", ".dev.vars.example", ".nvmrc"
  ],
  "forbiddenGlobs": [
    "src/{utils,helpers,common,shared,misc}/**",
    "utils/**", "helpers/**", "common/**", "shared/**", "misc/**",
    "app/**", "pages/**", "public/**"
  ],
  "rootOnlyFiles": [
    ".gitignore", ".dev.vars.example", ".nvmrc", "wrangler.jsonc", "wrangler.toml",
    "drizzle.config.ts", "package.json", "tsconfig.json", ".mcp.json"
  ],
  "exemptRootMd": ["README.md", "CLAUDE.md", "STANDARDS.md", "DEPLOY.md", "PLUGINS-TO-INSTALL.md"]
}
```

## Scaffold output (stubs only)

1. `src/index.ts` — Hono app; only route `GET /health` → `{ ok: true, version }`. No feature endpoints.
2. `db/schema.ts` — Drizzle; one placeholder table commented out or a single `_health` table; `db/migrations/.gitkeep`.
3. `drizzle.config.ts` — D1 dialect, points at `db/schema.ts` + `db/migrations`.
4. `wrangler.jsonc` — name, main `src/index.ts`, `compatibility_date`, `d1_databases` binding placeholder (`DB`).
5. `src/lib/db.ts` — Drizzle client from D1 binding. Glue, no queries.
6. `src/services/notifications.ts` — FCM HTTP v1 send **stub**: reads `FIREBASE_SERVICE_ACCOUNT` from env, `sendPush()` signature + TODO. No real payload logic (Next steps).
7. `.dev.vars.example` — `FIREBASE_SERVICE_ACCOUNT` (JSON, one line), other server secrets. Committed. Real `.dev.vars` gitignored.
8. `.gitignore` includes `.dev.vars`, `.env`, `node_modules`, `.wrangler`.

NO feature routes, NO auth implementation, NO domain tables. Planned work → README Next steps.

## npm scripts (command shape)

```
dev           wrangler dev
check         tsc --noEmit   (+ lint if present)
deploy        wrangler deploy
db:generate   drizzle-kit generate
db:migrate    wrangler d1 migrations apply <name>-db --remote
db:migrate:local  wrangler d1 migrations apply <name>-db --local
logs          wrangler tail
```

## Secrets model

- App bundle never touches these — this is the server. Secrets in `.dev.vars` locally (gitignored, `.dev.vars.example` committed), `wrangler secret put` for deployed.
- `FIREBASE_SERVICE_ACCOUNT` = server-only, sends push. Never in mobile repo.

## Verify notes

- `npm run check` (tsc) passes.
- `wrangler dev` boots; `curl localhost:8787/health` → `{"ok":true,...}`.
- `db/migrations/` present; `drizzle.config.ts` parses.
- No secrets in tracked files; `.dev.vars` gitignored, `.dev.vars.example` committed.
- Guard denies forbidden path (`src/utils/x.ts`, `app/x.ts`).
- Deploy check (`wrangler deploy --dry-run`) if account available, else mark pending.
