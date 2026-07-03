# Deployment standard — mobile

Standard is NOT one distribution channel for everyone. Standard is: selected channel has simple, repeatable laptop → phone-in-hand path. Mobile "deployed URL" = PWA URL, EAS Update channel, or shareable install link — per distribution mode in ADR.

## Command shape

Every project exposes this shape (npm scripts):

```
Install:        npm install
Run local:      npm run dev          # Metro dev server + QR (Expo Go / dev build)
Check:          npm run check        # typecheck + lint
Doctor:         npm run doctor       # expo-doctor project health
Deploy preview: npm run deploy       # native: eas update --channel preview | PWA: expo export -p web + wrangler deploy
Deploy prod:    npm run deploy:prod  # native: eas build internal distribution | PWA: wrangler prod deploy
Logs:           npm run logs         # native: eas update:list | PWA/backend: wrangler tail
```

Backend present → add `server:dev` / `server:deploy` proxying into `server/`. EAS scripts need one-time `npm i -g eas-cli && eas login && eas init` — build does not run these; README documents as first-deploy setup.

## Validation ladder

Lightest rung that fits risk:

| Rung | Use when | Accounts needed | Standard |
|---|---|---|---|
| Expo Go QR (`npm run dev`) | Builder + same-room testers, Expo SDK modules only | None | NOT a deployment — laptop dependency; day-1 demo only |
| PWA on Cloudflare (`npm run deploy`, PWA mode) | Usable-on-phone without store install | Cloudflare (free) | The mobile "deployed URL" for browser-capable hypotheses |
| EAS Update channel (`npm run deploy`, native mode) | JS-only iteration to installed runtimes | Expo (free tier) | Repeatable one-command OTA publish |
| Dev build (`eas build --profile development`) | Custom native modules beyond Expo Go | Expo; iOS also Apple $99/yr (escalation 9) | Testers install once, OTA updates after |
| EAS internal distribution (`npm run deploy:prod`) | First real validation cohort | Expo; Android free APK link; iOS Apple $99 + device UDIDs | Shareable install link |
| TestFlight / Play internal testing | Pilot needs store-install trust or exceeds ad-hoc device caps | Apple $99/yr / Play $25 one-time + review lag | Only when required (Path F); escalation 9 |

Public app-store launch is never the first validation path.

## Environment model

Minimum: **local** (Metro) + **validation channel/URL** (`preview` EAS channel, or PWA validation URL). "Production" channel only at promotion. No environment complexity without risk justification.

## Minimum repository documentation (README)

1. What the app does.
2. Required runtime version (Node; Expo Go app on phone).
3. Required local tools.
4. Required environment variables (all `EXPO_PUBLIC_`, all public — note it).
5. How to install dependencies.
6. How to run locally on a device (QR scan steps).
7. How to run checks (`check`, `doctor`).
8. How to deploy — both OTA update publish AND build+install path (or PWA deploy).
9. How to view logs/status — `eas update:list`, EAS dashboard, wrangler tail, Metro logs locally.
10. How to roll back — pull a bad update (`eas update:republish` prior group), disable channel, re-deploy PWA, revoke install access; per integration.

## Deployment baseline

Each project must have: source-controlled code; repeatable build + distribute path; separate local and validation channels; secrets outside app bundle (backend env only); basic logging or error visibility; rollback/disable/access-removal path; named distribution owner; known first-user audience; feedback + usage measurement path.

## Operations minimum

Every distributed project answers: is it used? by whom? where failing? what feedback? what evidence for next decision?

Minimum observability:
- EAS dashboard (builds, updates, who's on what) and/or wrangler tail for PWA/backend.
- Basic usage analytics tied to validation hypothesis (PostHog RN, Amplitude, or backend-side events).
- Feedback channel (form or in-app prompt).
- Distribution date + channel/URL recorded (README or ADR).
- Named owner for user issues.

Sentry (`@sentry/react-native` via `npx expo install`) only for meaningful runtime risk.

## Cost control

EAS free tier has finite monthly build minutes and update limits — check current numbers at build time (context7/WebSearch), don't assume. Apple Developer $99/yr, Play Console $25 one-time — both behind escalation trigger 9. Before distribution, document: expected monthly cost, cost drivers, spend-monitoring owner, shutdown procedure.
