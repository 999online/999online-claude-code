# Golden path — backend repo, large (NestJS + Postgres on AWS)

The `<name>-backend` repo for **large** profiles. Escalation over the small (Cloudflare) default — ADR must justify why not Hono+D1. Separate git repo from mobile. AWS = escalation trigger 7.

## When large

Relational integrity across many entities, complex multi-table transactions, existing Postgres/AWS mandate, or scale beyond Workers/D1 limits. Else use `backend-hono-d1.md` (small).

## Stack

| Layer | Value |
|---|---|
| Framework | NestJS (TypeScript) |
| DB | Postgres (AWS RDS / Aurora) via TypeORM (default) — Prisma allowed, record in ADR |
| Deploy | AWS container (App Runner / ECS / Elastic Beanstalk) — documented, not wired |
| Notifications send | Firebase Cloud Messaging via `firebase-admin` (service-account key = env secret) |
| Auth (when needed) | Nest guards + managed provider token verify; never custom |

## Scaffolder commands (non-interactive)

```bash
npx @nestjs/cli new <name>-backend --package-manager npm --skip-git
```
(`--skip-git` — mobile-service-scaffold runs `git init` itself.) Then:
```bash
npm install @nestjs/config @nestjs/typeorm typeorm pg
npm install firebase-admin
```
Exact TypeORM + Nest wiring from current docs (context7 `nestjs`/`typeorm`, else WebSearch) at build time.

## Structure contract

| Location | Contains | Never contains |
|---|---|---|
| `src/modules/` | feature modules (controller + service + module per feature) | Cross-cutting infra |
| `src/common/` | guards, interceptors, filters, pipes, decorators | Feature logic |
| `src/config/` | ConfigModule, env schema, DB config | Business logic |
| `src/health/` | health module (`GET /health`) | Feature logic |
| `src/migrations/` | TypeORM migrations (immutable once applied) | App code |
| `test/` | e2e tests | Source |
| `docs/` | ADR, all other .md | — |

`src/main.ts` = bootstrap; `src/app.module.ts` = root module.

Starter `allowed-paths.json`:

```json
{
  "allowedGlobs": [
    "src/modules/**", "src/common/**", "src/config/**", "src/health/**",
    "src/migrations/**", "prisma/**", "test/**", "docs/**", ".claude/**",
    "*.json", "*.js", "*.mjs", "*.cjs", "*.ts",
    ".gitignore", ".env.example", ".nvmrc", "Dockerfile", ".dockerignore"
  ],
  "forbiddenGlobs": [
    "src/{utils,helpers,misc}/**",
    "utils/**", "helpers/**", "shared/**", "misc/**",
    "app/**", "pages/**", "public/**"
  ],
  "rootOnlyFiles": [
    ".gitignore", ".env.example", ".nvmrc", "nest-cli.json", "tsconfig.json",
    "tsconfig.build.json", "package.json", "Dockerfile", ".dockerignore", ".mcp.json"
  ],
  "exemptRootMd": ["README.md", "CLAUDE.md", "STANDARDS.md", "DEPLOY.md", "PLUGINS-TO-INSTALL.md"]
}
```
`src/common/` is legit NestJS — not junk-drawer; `common/**` in forbidden = root-level only.

## Scaffold output (stubs only)

1. Nest default app (`main.ts`, `app.module.ts`) from CLI.
2. `src/health/` — `health.controller.ts` `GET /health` → `{ ok: true, version }` + `health.module.ts`.
3. `src/config/` — ConfigModule + env validation (`DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT`, `PORT`); TypeORM DataSource from `DATABASE_URL`.
4. One placeholder entity + initial migration scaffold. NO feature entities.
5. `src/common/notifications/` — `firebase-admin` init + `sendPush()` **stub** (no message logic). Next steps.
6. `.env.example` — `DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT`, `PORT`. Placeholders, never real.
7. `Dockerfile` stub — container build for AWS deploy.
8. `.gitignore` includes `.env`, `node_modules`, `dist`.

NO feature modules, NO auth impl, NO domain entities. Planned work → README Next steps.

## npm scripts (command shape)

```
dev                start:dev         (nest start --watch)
check              lint + build      (eslint + nest build / tsc)
build              nest build
migration:generate typeorm migration:generate
migration:run      typeorm migration:run
test               jest
logs               documented — AWS CloudWatch (deploy target dependent)
```

## Secrets model

- Server-only secrets. `.env` gitignored, `.env.example` committed. Deployed: AWS Secrets Manager / task env, never in image.
- `FIREBASE_SERVICE_ACCOUNT` = server-only push send. Never in mobile repo.
- Postgres creds via `DATABASE_URL` — managed, least-privilege.

## Verify notes

- `npm run build` passes.
- `npm run check` (lint + build) clean.
- Boot + `curl localhost:3000/health` → `{"ok":true,...}` (needs Postgres — run local Docker Postgres or mark pending).
- `src/migrations/` present; DataSource config parses.
- No secrets in tracked files; `.env` gitignored.
- Guard denies forbidden path (`src/utils/x.ts`, `app/x.ts`).
- ADR "Cloudflare-vs-alternative justification" filled; escalation trigger 7 (AWS) recorded.
