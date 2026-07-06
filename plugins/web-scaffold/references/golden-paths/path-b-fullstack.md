# Path B — Lightweight full-stack web app

## When

Idea requires user interaction, persisted state, authentication, usable workflow.

When NOT: only measuring interest → path A. Internal-team process tool → path C. No UI, service only → path E.

## Layout — monorepo (default)

Full-stack default is a **Turborepo + npm-workspaces monorepo**: `apps/web` (frontend), `apps/api` (backend), `packages/db` (shared data layer). Not premature microservices — three workspaces in one repo, one deploy story per app. `apps/api` is **always present** — never collapse it into Next route handlers. A shared Hono backend is part of the contract for both B and C.

## Layers (first option = default)

| Layer | Preferred options |
|---|---|
| Frontend framework | Next.js, SvelteKit, Nuxt, Remix |
| API framework | Hono (on Workers) |
| Deployment | Cloudflare Workers/Pages, Vercel, Netlify, Railway, Render, Fly.io |
| Database | Cloudflare D1, Neon Postgres (via Hyperdrive), Turso |
| ORM | Drizzle |
| Auth | Clerk, Firebase Auth, Better Auth, Cloudflare Access, platform SSO — never custom |
| File storage | Cloudflare R2, Firebase Storage, S3-compatible |
| Background jobs | Cloudflare Queues, Cloudflare Cron Triggers, Inngest, Trigger.dev |

Default combo: **Next.js (`apps/web`) on Cloudflare Workers via `@opennextjs/cloudflare` + Hono (`apps/api`) on Workers + Drizzle/D1 (`packages/db`) + Clerk** — deploy and local dev via wrangler + turbo. Cloudflare is the house default; alternates above are documented swaps.

## Avoid

- Splitting into more than web + api + db before validation. No separate job-worker, admin app, or gateway app unless required.
- Premature microservices — `services/`, `microservices/` are forbidden.
- Custom Kubernetes, VM provisioning, service mesh, enterprise CI/CD before validation.
- Wide data model — keep schema narrow, aligned to hypothesis.
- Permissions beyond what first audience needs.

## Scaffolder commands (non-interactive)

Frontend into `apps/web` (Next.js default):
```bash
npx create-next-app@latest apps/web --ts --app --tailwind --eslint --src-dir --yes
```
Alternate frontend (SvelteKit): `npx sv create apps/web --template minimal --types ts --no-add-ons --install npm`

Backend into `apps/api` (Hono on Workers):
```bash
npm create hono@latest apps/api -- --template cloudflare-workers --install --pm npm
```

Monorepo glue + data layer (not from a scaffolder — web-build authors these per **current Turborepo + Drizzle docs via context7/WebSearch**, install via `npm install <pkg>@latest`):
- Root `package.json` with `"workspaces": ["apps/*", "packages/*"]`, `turbo@latest` dev dep.
- Workspace package names use one scope: `@app/web`, `@app/api`, `@app/db` (scaffolders name packages after the dir — rename). Root scripts reference workspaces as `-w @app/web` etc.
- `turbo.json`, `tsconfig.base.json` (path aliases `@/*`, `@app/db`), `.prettierrc.json`, `eslint.config.mjs`, `.nvmrc`. **Each app's `tsconfig.json` extends `../../tsconfig.base.json`** and re-declares `@/*` → `./src/*` plus the `@app/db` alias at its own depth — never leave the scaffolder's standalone tsconfig unlinked from the base.
- `packages/db`: Drizzle + D1 wiring only (config + `createDb` client + empty schema stub). Drizzle/D1 and `@opennextjs/cloudflare` are **data/deploy-layer wiring (architecture), not feature libraries** — installed. Auth SDK, analytics, business CRUD stay out (README Next steps).

Flags rejected → scaffolder `--help` first, never interactive.

## Structure contract (monorepo)

| Location | Contains | Never contains |
|---|---|---|
| `apps/web/src/app/` | Routes, pages, route handlers | Shared business logic |
| `apps/web/src/components/` | UI components | Data access |
| `apps/web/src/hooks/` | React hooks (`useX.ts`) | Non-hook utilities |
| `apps/web/src/lib/` | Clients, web-side helpers | Components |
| `apps/api/src/index.ts` | Hono app entry, route mounting | Business logic |
| `apps/api/src/routes/` | Route handlers, thin | Service logic, SQL |
| `apps/api/src/services/` | Business logic | HTTP handling |
| `apps/api/src/schemas/` | Zod input schemas | Runtime logic |
| `packages/db/src/` | Drizzle schema + client (`createDb`) | Routes, UI |
| `packages/db/migrations/` | Generated SQL migrations | Handwritten app code |
| root | `turbo.json`, `package.json` (workspaces), `tsconfig.base.json`, config | App source |
| `docs/` | ADR, all other .md | — |

Starter `allowed-paths.json` (reconcile against actual tree):

```json
{
  "allowedGlobs": [
    "apps/*/src/**", "apps/*/public/**",
    "apps/*/*.json", "apps/*/*.jsonc", "apps/*/*.toml", "apps/*/*.mjs", "apps/*/*.cjs", "apps/*/*.ts",
    "packages/*/src/**", "packages/*/migrations/**",
    "packages/*/*.json", "packages/*/*.ts",
    "docs/**", ".claude/**",
    "*.json", "*.jsonc", "*.toml", "*.mjs", "*.cjs", "*.ts",
    ".gitignore", ".env.example", ".nvmrc"
  ],
  "forbiddenGlobs": [
    "apps/*/src/{utils,helpers,common,shared,misc}/**",
    "packages/*/src/{utils,helpers,common,shared,misc}/**",
    "services/**", "microservices/**"
  ],
  "rootOnlyFiles": [".gitignore", ".env.example", ".nvmrc"],
  "exemptRootMd": ["README.md", "CLAUDE.md", "DEPLOY.md"]
}
```

Rationale: `services/`, `microservices/` forbidden = no split beyond the three workspaces. Junk-drawer dirs forbidden = shared code goes in a workspace's `lib`/`services`.

## Scaffold output (stubs only)

1. `apps/web/src/app/page.tsx` stub: app name + one-line hypothesis from ADR.
2. `apps/web/src/app/api/health/route.ts` returning `{ok: true, version}`.
3. `apps/api/src/index.ts`: Hono app mounting `GET /health` only.
4. `packages/db/src/schema.ts`: empty/example schema stub (commented example table — no real entities).
5. `packages/db/src/index.ts`: `createDb(d1)` → `drizzle(d1)` client wiring only.
6. `packages/db/drizzle.config.ts`: dialect `sqlite` (D1). `packages/db/migrations/.gitkeep`.
7. `.gitkeep` in `apps/web/src/{components,hooks,lib,server,types}`, `apps/api/src/{routes,services,schemas}`.
8. Deploy/platform wiring per ADR: `apps/web/open-next.config.ts` + `apps/web/wrangler.jsonc`; `apps/api/wrangler.toml` (D1 binding); root `turbo.json` + workspaces. Architecture, not feature.
9. `.env.example` lists every planned key with placeholder.
10. README "Next steps": auth provider, schema + first migration, first CRUD entity — from ADR.

Planned integrations → README Next steps, never code. NO auth, NO real schema/migrations, NO CRUD.

## Verify notes

- `npm run check` passes at repo root (turbo runs each workspace's typecheck + lint + build).
- Monorepo present: `apps/web` (incl. `src/hooks/`), `apps/api` (always — never collapsed), `packages/db`, root `turbo.json` + workspaces. Each app `tsconfig.json` extends `tsconfig.base.json`; workspace package names use the `@app/*` scope.
- Stub web page + web health route + api `GET /health` present.
- No auth code, no real Drizzle schema/migrations, no CRUD routes — feature code present = scope-creep fail.
- `.env.example` complete; README Next steps documents ADR's planned integrations.
