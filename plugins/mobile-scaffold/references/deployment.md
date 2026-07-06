# Deployment standard — mobile

Standard is NOT one distribution channel for everyone. Standard is: each repo has a simple, repeatable path from laptop → running artifact. Cloudflare-first for backend + web hosting. Every repo exposes a consistent npm-script shape.

## Command shape per repo

### Mobile repo (`<name>-mobile`)
```
Install:        npm install
Run local:      npm run dev          # Metro + QR (Expo Go / dev build)
Check:          npm run check        # typecheck + lint
Doctor:         npm run doctor       # expo-doctor
Deploy preview: npm run deploy       # native: eas update --channel preview | PWA: expo export -p web + wrangler pages deploy
Deploy prod:    npm run deploy:prod  # native: eas build internal distribution | PWA: prod Pages deploy
Logs:           npm run logs         # native: eas update:list | PWA: wrangler tail
```
EAS scripts need one-time `npm i -g eas-cli && eas login && eas init` — build does NOT run these; README documents as first-deploy setup.

### Backend repo — small (Hono + Workers + D1)
```
dev            wrangler dev
check          tsc --noEmit
deploy         wrangler deploy
db:generate    drizzle-kit generate
db:migrate     wrangler d1 migrations apply <name>-db --remote
logs           wrangler tail
```
First-deploy: `npx wrangler login`, `npx wrangler d1 create <name>-db`, set `FIREBASE_SERVICE_ACCOUNT` via `wrangler secret put`.

### Backend repo — large (NestJS + Postgres/AWS)
```
dev                start:dev
check              lint + build
build              nest build
migration:generate typeorm migration:generate
migration:run      typeorm migration:run
logs               AWS CloudWatch (documented)
```
Deploy = AWS container (App Runner / ECS), documented per env — not one wrangler command. AWS account = escalation trigger 7.

### Web-be repo (`<name>-web-be`, MOBILE+WEB) — turbo root
```
dev         turbo run dev
check       turbo run check
build       turbo run build
deploy:api  small: wrangler deploy (apps/api) | large: documented AWS
deploy:web  expo export -p web (apps/web) + wrangler pages deploy dist   # Cloudflare Pages
logs        wrangler tail
```

## Validation ladder (mobile distribution)

Lightest rung that fits risk:

| Rung | Use when | Accounts needed | Standard |
|---|---|---|---|
| Expo Go QR (`npm run dev`) | Builder + same-room testers, Expo SDK modules only | None | NOT a deployment — laptop dependency; day-1 demo only |
| PWA on Cloudflare Pages (`npm run deploy`, PWA mode) | Usable-on-phone without store install | Cloudflare (free) | The mobile "deployed URL" for browser-capable hypotheses |
| EAS Update channel (`npm run deploy`, native mode) | JS-only iteration to installed runtimes | Expo (free tier) | Repeatable one-command OTA publish |
| Dev build (`eas build --profile development`) | Custom native modules beyond Expo Go (incl. `@react-native-firebase`) | Expo; iOS also Apple $99/yr (trigger 9) | Testers install once, OTA after |
| EAS internal distribution (`npm run deploy:prod`) | First real validation cohort | Expo; Android free APK link; iOS Apple $99 + UDIDs | Shareable install link |
| TestFlight / Play internal testing | Store-install trust or exceeds ad-hoc caps | Apple $99/yr / Play $25 + review lag | Only when required; trigger 9 |

Public app-store launch is never the first validation path.

### Cloudflare Pages Git integration (dashboard, zero-YAML)

Lightest Git-driven deploy for the **PWA build** and web-be `apps/web` — the dashboard-Git variant of the "PWA on Cloudflare Pages" ladder rung. No YAML, no repo secrets, no API token; alternative to the imperative `wrangler pages deploy` and to `mobile-deploy-ci` (Actions).

Setup (one-time, Cloudflare dashboard): Workers & Pages → Create → **Pages** tab → **Connect to Git** → pick the GitHub repo → build: framework preset **None**, build command **`npx expo export -p web`**, output dir **`dist`** → **Save and Deploy**.

After connect: push to production branch auto-deploys; every other branch auto-gets an isolated **Preview** URL (`<branch>.<project>.pages.dev`), production untouched. Rollback = re-deploy a prior deployment from the dashboard Deployments tab.

### CI/CD promotion (opt-in — `mobile-deploy-ci`)

Cloudflare targets automatable via GitHub Actions (opt-in, not default scaffold):
- Mobile PWA / web-be `apps/web` → `deploy-web.yml` (Cloudflare Pages).
- Hono backend → `deploy-worker.yml` (Cloudflare Workers).
- `ci.yml` → `npm run check` on PR + push.
Each needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in a `production` GitHub Environment.
NestJS/AWS deploy = manual/DevOps-coordinated, not templated. Native EAS Build/Update automation stays manual (out of scope).

## Environment model

Minimum per repo: **local** + **validation channel/URL**. Mobile: Metro + EAS channel/PWA URL. Backend: `wrangler dev` + deployed Worker URL / local Nest + AWS validation URL. "Production" only at promotion. No environment complexity without risk justification.

## Minimum repository documentation (README) — per repo

1. What it does.
2. Required runtime version (Node; Expo Go on phone for mobile).
3. Required local tools.
4. Required environment variables — mobile: all `EXPO_PUBLIC_`, all public (note it); backend: server secrets via `.dev.vars`/`.env`, never bundled.
5. How to install dependencies.
6. How to run locally (mobile: QR scan steps; backend: dev server + `/health`).
7. How to run checks (`check`, `doctor`).
8. How to deploy — repo's deploy path + first-deploy account setup.
9. How to view logs/status.
10. How to roll back (`eas update:republish` / PWA re-deploy / `wrangler rollback` / AWS redeploy; disable/revoke per integration).

Plus "Next steps" — planned integrations from ADR (one line each). Mobile: `EXPO_PUBLIC_API_URL` points at backend repo's URL.

## Deployment baseline (each repo)

Source-controlled; repeatable build + distribute; separate local + validation channels; secrets outside app bundle (server env only); basic logging/error visibility; rollback/disable/access-removal path; named owner; known first-user audience; feedback + usage path.

## Operations minimum

Every distributed repo answers: is it used? by whom? where failing? what feedback? what evidence for next decision?

Observability:
- Mobile: EAS dashboard + analytics (PostHog RN / Amplitude / backend events) + feedback channel.
- Backend small: `wrangler tail`; large: AWS CloudWatch.
- Distribution date + channel/URL recorded (README or ADR); named owner.
- Sentry (`@sentry/react-native` via `npx expo install`) only for meaningful runtime risk.

## Cost control

Cloudflare free tiers where practical (Workers, D1, Pages). EAS free tier has finite build minutes/updates — check current numbers at build time. Apple $99/yr, Play $25 (trigger 9). AWS (large) = metered — document expected monthly cost, drivers, spend owner, shutdown, before distribution. Avoid always-on compute when serverless/managed enough.
