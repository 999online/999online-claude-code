---
name: mobile-service-scaffold
description: Scaffold the backend (or web-be monorepo) repo as a separate git repo from an approved ADR — Hono + Cloudflare Workers + D1 (small) or NestJS + Postgres/AWS (large), plus a react-native-web apps/web when the profile is MOBILE+WEB. Stub code only (GET /health, DB + FCM-send stubs, zero feature code), .claude contract, git init. Use after mobile-build, or standalone to scaffold a Cloudflare Hono+D1 / NestJS+Postgres backend. Never without an ADR or explicit stack decision.
---

# mobile-service-scaffold

Input: approved ADR + profile + parent dir. Output: the `<slug>-backend` (MOBILE-ONLY) or `<slug>-web-be` (MOBILE+WEB) repo — separate git repo, stubs only, structure enforced. Cloudflare-first; large (AWS/NestJS/Postgres) only when ADR justifies.

No ADR and no explicit user stack decision → stop, run `mobile-decide` first.

Read `${CLAUDE_PLUGIN_ROOT}/references/profiles.md`, the matching golden path(s) —
`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/backend-hono-d1.md` (small),
`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/backend-nestjs-postgres.md` (large),
`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/web-be-rn-web.md` (MOBILE+WEB) —
plus `deployment.md`, `data-security.md`.

## Ground rules

- **Official scaffolder is ground truth.** `npm create hono` / `@nestjs/cli` / `create-expo-app` outputs (configs) never hand-written.
- Non-interactive invocations only. Flags rejected → `--help`, adapt. Never interactive.
- **Dependency rule:** never hand-write versions. Drizzle/TypeORM/firebase-admin via `npm install <pkg>@latest`; Expo-coupled (web app) via `npx expo install`.
- Exact D1/wrangler/Drizzle/TypeORM/Pages wiring: current docs via context7 MCP, else WebSearch. Unavailable → scaffolder defaults, note gap.
- Scaffolder/npm fails → stop, report exact error. Never fake a skeleton.
- **Anchor every command** to the target dir — `(cd <dir> && cmd)` or absolute paths. cwd drifts.
- **No secrets** — `.dev.vars.example`/`.env.example` committed with placeholders; real `.dev.vars`/`.env` gitignored. `FIREBASE_SERVICE_ACCOUNT` server-only.
- **Stubs only** — `GET /health`, DB stub, FCM-send stub. No feature routes/modules/entities. Planned → README Next steps.

## Steps

1. **Parse.** From ADR: profile (target × size), backend type (Hono small / NestJS large), DB (D1/Postgres), parent dir, slug. Target: MOBILE-ONLY → `<slug>-backend`; MOBILE+WEB → `<slug>-web-be`. Dir exists non-empty → stop, ask.

2. **Scaffold — by profile:**
   - **MOBILE-ONLY / small (Hono+D1):** `npm create hono@latest <slug>-backend -- --template cloudflare-workers --install --pm npm`. Then `npm install drizzle-orm`, `npm install -D drizzle-kit`.
   - **MOBILE-ONLY / large (NestJS+Postgres):** `npx @nestjs/cli new <slug>-backend --package-manager npm --skip-git`. Then `npm install @nestjs/config @nestjs/typeorm typeorm pg firebase-admin`.
   - **MOBILE+WEB:** create `<slug>-web-be` monorepo (root `package.json` `"workspaces": ["apps/*","packages/*"]`, `npm install -D turbo`). `apps/api` = the small or large backend command above (target `apps/api`). `apps/web` = `npx create-expo-app@latest apps/web --template blank-typescript --yes` then `(cd apps/web && npx expo install react-native-web react-dom)`; reset to one web index route. `packages/db` (small, optional) = shared Drizzle schema.

3. **Stubs** (from golden path "Scaffold output"):
   - Backend: `GET /health` → `{ok:true,version}` (Hono `src/index.ts` / Nest `src/health/`). DB stub (Drizzle `db/schema.ts` + `db/migrations/.gitkeep` + `drizzle.config.ts` + `wrangler.jsonc` D1 binding | TypeORM DataSource + one placeholder entity + initial migration + `Dockerfile`). FCM-send **stub** (`src/services/notifications.ts` Hono / `src/common/notifications` Nest) — reads service-account env, `sendPush()` TODO, no payload logic.
   - web (`apps/web`): index stub (name+hypothesis), `store/` infra stub (zustand/RTK per size), `lib/api.ts` reading `EXPO_PUBLIC_API_URL`.

4. **npm scripts** (deployment.md command shape): backend small `dev`(`wrangler dev`)/`check`(`tsc --noEmit`)/`deploy`(`wrangler deploy`)/`db:generate`/`db:migrate`/`logs`(`wrangler tail`). large `dev`(`start:dev`)/`check`(lint+build)/`build`/`migration:generate`/`migration:run`. web-be root turbo: `dev`/`check`/`build`/`deploy:api`/`deploy:web`(`expo export -p web` + `wrangler pages deploy dist`).

5. **Docs + env.** `README.md` (10 items adapted: backend dev + `/health`, deploy path, first-deploy account setup, rollback, logs). `docs/ADR.md` verbatim. `.dev.vars.example` (Hono) / `.env.example` (NestJS + web `EXPO_PUBLIC_*`). Root docs from `${CLAUDE_PLUGIN_ROOT}/references/output-docs/` (`STANDARDS.md`, `DEPLOY.md`, `PLUGINS-TO-INSTALL.md`, `.mcp.json` ← `output-docs/mcp.json`) — substitute `{{...}}`. `.gitignore`: `.dev.vars`, `.env*`, `node_modules`, `.wrangler`/`dist`.

6. **CLAUDE.md** at repo root: Purpose; Scope + stub-only non-goals bound; "Project Structure (STRICT)" table matching actual tree (Hono `src/routes|services|...` + `db/` | Nest `src/modules|common|config|health` | monorepo `apps/api`+`apps/web`+`packages/db`); Forbidden patterns table; Commands table; Cross-repo note (this backend's dev/validation URL → mobile `EXPO_PUBLIC_API_URL`); pointers `docs/ADR.md`, `.claude/rules/`.

7. **Structure guard — LAST:**
   - Copy `${CLAUDE_PLUGIN_ROOT}/assets/hooks/folder-structure-guard.cjs` → `.claude/hooks/`.
   - Copy rule set → `.claude/rules/`: `structure.md`, `security.md`, `delivery.md`, `api-routes.md`, `database.md`, `notifications.md` (+ `state-management.md` for web-be `apps/web`).
   - Write `.claude/allowed-paths.json` from the matching golden path starter, reconcile against actual tree.
   - `.claude/settings.json` from `${CLAUDE_PLUGIN_ROOT}/assets/settings-hook.json` (deep-merge if exists).

8. **Git.** `(cd <dir> && git init && git add -A && git commit -m "feat: scaffold <dir> (<backend type>, <profile>)")`. Announce.

9. **Cross-repo reconcile.** Tell user the backend dev/validation base URL (Hono `http://localhost:8787`, Nest `http://localhost:3000`, deployed Worker/Pages URL) to set as mobile repo's `EXPO_PUBLIC_API_URL`.

## Output

Report: repo name + tree, backend type + DB, stubs (`/health`, DB, FCM-send), scripts, docs, `.claude` contract, git commit, base URL for `EXPO_PUBLIC_API_URL`, first-deploy account setup, escalations (AWS = trigger 7), doc-currency gaps, anything deferred to verify.
