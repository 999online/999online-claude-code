# Golden path — web-be repo (MOBILE+WEB): backend + react-native-web monorepo

The `<name>-web-be` repo for **MOBILE+WEB** profiles. One monorepo holds backend (`apps/api`) + react-native-web frontend (`apps/web`). Mobile stays its own `<name>-mobile` Expo repo. Web deploys Cloudflare Pages (both sizes).

## Layout

```
apps/
  api/    backend — Hono+D1 (small) | NestJS+Postgres (large)
  web/    react-native-web app (Expo web target, web-only) → Cloudflare Pages
packages/
  db/     small only, optional — shared Drizzle schema/types
```

`apps/api` contract = `backend-hono-d1.md` (small) or `backend-nestjs-postgres.md` (large), nested under `apps/api/`. `apps/web` = the web subset of an Expo app (react-native-web + react-dom, no native).

## Scaffolder commands (non-interactive)

Monorepo shell (npm workspaces + turbo):
```bash
mkdir <name>-web-be && cd <name>-web-be
# root package.json: { "private": true, "workspaces": ["apps/*", "packages/*"] }
npm install -D turbo
```
Backend (`apps/api`):
```bash
# small:
npm create hono@latest apps/api -- --template cloudflare-workers --install --pm npm
# large:
npx @nestjs/cli new apps/api --package-manager npm --skip-git
```
Web (`apps/web`) — Expo web target (keeps Expo priority):
```bash
npx create-expo-app@latest apps/web --template blank-typescript --yes
# configure web-only: react-native-web + react-dom (npx expo install react-native-web react-dom)
```
Static web export → Cloudflare Pages: `npx expo export --platform web` → `dist/`; `wrangler pages deploy dist`. Exact Pages wiring from current docs (context7 `cloudflare`/`expo`, else WebSearch) at build time.

## Structure contract

| Location | Contains | Never contains |
|---|---|---|
| `apps/api/` | backend (per its golden path) | web/mobile UI |
| `apps/web/` | react-native-web app, web-only | native-only code, backend logic |
| `packages/db/` | shared Drizzle schema/types (small, optional) | app code |
| `docs/` | ADR, all other .md | — |

`apps/web` internal structure mirrors mobile (`app/ components/ hooks/ lib/ store/`) minus native modules.

Starter `allowed-paths.json` (monorepo root):

```json
{
  "allowedGlobs": [
    "apps/api/**", "apps/web/**", "packages/**",
    "docs/**", ".claude/**",
    "*.json", "*.jsonc", "*.js", "*.mjs", "*.cjs", "*.ts",
    ".gitignore", ".nvmrc", ".env.example", ".dev.vars.example"
  ],
  "forbiddenGlobs": [
    "src/**", "utils/**", "helpers/**", "common/**", "shared/**", "misc/**",
    "apps/*/{utils,helpers,misc}/**", "ios/**", "android/**"
  ],
  "rootOnlyFiles": [
    "package.json", "turbo.json", "tsconfig.base.json",
    ".gitignore", ".nvmrc", ".env.example", ".mcp.json"
  ],
  "exemptRootMd": ["README.md", "CLAUDE.md", "STANDARDS.md", "DEPLOY.md", "PLUGINS-TO-INSTALL.md"]
}
```
`ios/`/`android/` forbidden — web app stays web-only; native = the separate mobile repo. Top-level `src/**` forbidden — code lives under `apps/*`.

## Scaffold output (stubs only)

- `apps/api` — full stub set from its backend golden path (`GET /health`, DB stub, FCM send stub, `.dev.vars.example` or `.env.example`).
- `apps/web` — index route stub (app name + hypothesis), `store/` infra stub (zustand small | RTK large), `lib/api.ts` base client reading `EXPO_PUBLIC_API_URL` (points at `apps/api`), `.env.example` (`EXPO_PUBLIC_API_URL`, public Firebase config).
- `packages/db` (small, optional) — shared Drizzle schema re-exported to `apps/api`; `.gitkeep` if empty.
- Root `package.json` workspaces + `turbo.json` (pipeline: `dev`, `check`, `build`, `deploy`).

NO feature code in either app. Planned work → README Next steps.

## npm scripts (command shape, root via turbo)

```
dev        turbo run dev          (api + web)
check      turbo run check        (tsc/lint each)
build      turbo run build
deploy:api small: wrangler deploy (apps/api) | large: documented AWS
deploy:web expo export -p web (apps/web) + wrangler pages deploy dist   → Cloudflare Pages
logs       wrangler tail (api small / web Pages)
```
Per-app scripts also runnable inside `apps/api` / `apps/web`.

## Deploy

- `apps/web` → **Cloudflare Pages** (both sizes).
- `apps/api` → Cloudflare Workers (small) | AWS container (large, documented).

## Verify notes

- Root `npm install` (workspaces) then `turbo run check` passes.
- `apps/api` verified per its backend golden path (`/health`).
- `apps/web` `npx expo export --platform web` builds `dist/` clean.
- Web `.env.example` has `EXPO_PUBLIC_API_URL`; no secrets in web bundle.
- Guard denies root `src/**`, `apps/web/utils/**`, `ios/**`.
- Cross-repo: web + mobile both point `EXPO_PUBLIC_API_URL` at `apps/api` base URL.
