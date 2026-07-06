# Architecture Decision Record template — mobile

One page. Covers the whole **profile** (all emitted repos). `mobile-decide` fills it; `mobile-build` + `mobile-service-scaffold` copy the filled version to each repo's `docs/ADR.md`. Every field required — "none" is valid, blank is not.

```markdown
# Architecture Decision Record — <project name>

Date: <YYYY-MM-DD>
Decision owner: <name — clears escalations, makes promote/pause/terminate call>

## Profile
<target: MOBILE-ONLY | MOBILE+WEB>  ×  <size: small | large>

## Repos emitted
<e.g. <name>-mobile (Expo) + <name>-backend (Hono+D1)  |  <name>-mobile + <name>-web-be (apps/api + apps/web)>

## Hypothesis
<one sentence — what this app must prove>

## Platforms
<iOS / Android / both — and why, if not both; web too if MOBILE+WEB>

## Native device features
<camera, location, push, offline capture, background, biometrics, sensors — or "none">

## Distribution mode + rung
<mobile: PWA (Cloudflare Pages) | native (Expo Go → dev build → EAS internal) | both; name target rung from deployment.md ladder. PWA deploy model: Pages Git integration (dashboard auto-deploy on push + per-branch preview URLs) OR wrangler CLI>

## Selected stack (per repo)
<mobile: Expo + state (zustand small | RTK large) + FCM notifications
 backend: Hono+Workers+D1 (small) | NestJS+Postgres/AWS (large)
 web (if MOBILE+WEB): react-native-web on Cloudflare Pages>

## Cloudflare-vs-alternative justification
<small (pure Cloudflare) is the default. If large (NestJS/Postgres/AWS): the decisive factor — relational integrity / transactions / existing mandate / scale beyond Workers-D1. "n/a — small" is valid>

## Notifications (FCM) setup
<expo-notifications (managed, default) | @react-native-firebase/messaging (dev build). Public config keys in app; service-account key = server secret. google-services.* provisioned per env, not committed>

## Cross-repo API contract
<mobile EXPO_PUBLIC_API_URL → backend base URL (dev + validation); auth token flow app→backend>

## Why this is the fastest credible path
<2-3 sentences; ladder rung + why lower rungs don't test the hypothesis honestly>

## Local run commands
<mobile: npm install && npm run dev — scan QR. backend: npm install && npm run dev — /health>

## Deployment command or channel (per repo)
<mobile: npm run deploy → EAS Update channel / PWA Cloudflare Pages. backend small: wrangler deploy. large: documented AWS. web: expo export -p web + Pages>

## Offline behavior
<what works offline, what fails, explicitly — "nothing offline; app shows connectivity notice" is valid>

## Device permissions requested
<each permission + why. push (FCM) listed here. "None" if none>

## Data used
<source, sensitivity, synthetic/masked/limited-scope; where stored — device vs backend (D1/Postgres)>

## Integrations
<external services touched; read-only or write; rollback per integration. "None" if none>

## Authentication approach
<per data-security.md auth table; "none — internal-distribution link is the access control" is valid; token verified server-side when backend present>

## Observability approach
<mobile: EAS dashboard + analytics + feedback. backend: wrangler tail (small) / CloudWatch (large)>

## Store / cloud accounts required
<none | Cloudflare (free) | Apple Developer ($99/yr) | Play Console ($25) | AWS (large) — owner + escalation status per account>

## Known shortcuts
<allowed shortcuts taken, per doctrine.md>

## Known risks
<what could bite; accepted why>

## Escalations required
<escalation triggers (1–9) that apply + status. AWS large = trigger 7. "None" if none>

## Hardening or rebuild expectation if promoted
<harden in place / partial rebuild / full rebuild — and what changes, per repo>
```
