# Deployment standard

Standard is NOT one platform for everyone. Standard is: selected platform has simple, repeatable laptop → deployed URL path.

## Command shape

Every custom-code project exposes this shape (npm scripts, or documented equivalents for non-Node stacks):

```
Install:        npm install
Run local:      npm run dev
Check:          npm run check        # typecheck + lint + tests, whatever applies
Deploy preview: npm run deploy
Deploy prod:    npm run deploy:prod
Logs:           npm run logs
```

Stack can't be represented by similarly short sequence → confirm extra complexity is required for validation.

Every scaffolded project also ships a root `DEPLOY.md` — the target-specific deploy walkthrough (Cloudflare by default): prereqs (wrangler auth, `wrangler d1 create` for D1 paths), preview + prod deploy, logs, rollback/disable. Monorepo → per-app deploy steps.

## Minimum repository documentation (README)

1. What the app does.
2. Required runtime version.
3. Required local tools.
4. Required environment variables.
5. How to install dependencies.
6. How to run locally.
7. How to run tests or smoke checks.
8. How to deploy.
9. How to view logs.
10. How to roll back, disable, or remove access.

## Deployment models

Lightest model that fits risk:

| Model | Use when | Standard |
|---|---|---|
| CLI deploy from laptop | Early validation, small team, low risk | Commands documented, repeatable by another builder |
| Git-based preview deploy | Multiple builders, static frontend | Branch/PR produces preview URL — Cloudflare Pages Git integration (below) |
| Platform dashboard deploy | Dashboard-connected Git deploy, no-code/low-code | Ownership, access, rollback documented — Pages Git integration (below) |
| Container deploy | Custom runtime, background jobs | Dockerfile/platform config committed |
| CI/CD pipeline | Promotion candidate, higher risk | Build/test/deploy/rollback automated |

No CI/CD required before first deployment when platform CLI or Git deploy safely produces validation environment.

### Cloudflare Pages Git integration (dashboard, zero-YAML)

Lightest Git-driven deploy for **static frontend output** (path A landing; any static export). No YAML, no repo secrets, no API token — dashboard-managed.

Setup (one-time, Cloudflare dashboard): Workers & Pages → Create → **Pages** tab → **Connect to Git** → pick the GitHub repo → set build (framework preset or None, build command, output dir) → **Save and Deploy**. Build settings per scaffolder: Astro `npm run build` → `dist`; static Next `next build && next export` → `out`; SvelteKit/Vite → per adapter.

After connect: push to production branch auto-deploys; every other branch auto-gets an isolated **Preview** URL (`<branch>.<project>.pages.dev`), production branch untouched. Rollback = re-deploy a prior deployment from the dashboard Deployments tab.

**Static output only** — NOT for Next-on-Workers via `@opennextjs/cloudflare` (path B/C default). Contrast `web-deploy-ci`: that uses GitHub Actions + wrangler + repo secrets; Git integration needs none. Pick Git integration first for path A; escalate to Actions only when CI checks must gate deploys.

### CI/CD promotion (opt-in)

Promoting past validation → automated deploy: run `web-deploy-ci`. Copies bundled GitHub Actions templates (`ci.yml` PR checks + `deploy-web.yml` Cloudflare deploy on push, 3× retry on transient API errors) into the project, wiring the existing `check` + `deploy:prod` npm scripts. Requires two repo secrets in a `production` environment: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (Vercel/Netlify swap documented by the skill). Not emitted by default — this is the promotion step, not the first-deploy path.

## Environment model

Minimum: **local** (builder) + **deployed validation** (users). "Production" may simply mean live validation URL. Staging only for higher-risk or promoted products. No environment complexity without risk justification.

## Deployment baseline

Each project must have: source-controlled code; repeatable build+deploy; separate local and deployed envs; env vars for secrets/config; basic logging or error visibility; rollback/disable/access-removal path; named deployment owner; known first-user audience; feedback + usage measurement path.

## Operations minimum

Every deployed project answers: is it used? by whom? where failing? what feedback? what evidence for next decision?

Minimum observability:
- Platform logs or error visibility (Cloudflare/Vercel/Railway/Render/Fly/Firebase native).
- Basic usage analytics tied to validation hypothesis (Plausible, PostHog, GA, Vercel Analytics, Cloudflare Web Analytics).
- Feedback channel (form or in-product prompt).
- Deployment date + URL recorded (in README or ADR).
- Named owner for user issues.

Sentry or platform-native error tracking only for meaningful runtime risk.
