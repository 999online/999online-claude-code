# Architecture Decision Record template — mobile

One page, no more. `mobile-decide` fills it; `mobile-build` copies filled version to `docs/ADR.md` in generated project. Every field required — "none" is valid answer, blank is not.

```markdown
# Architecture Decision Record — <project name>

Date: <YYYY-MM-DD>
Decision owner: <name — person who clears escalations and makes promote/pause/terminate call>
Golden path: F — Expo mobile

## Hypothesis
<one sentence — what this app must prove>

## Platforms
<iOS / Android / both — and why, if not both>

## Native device features
<camera, location, push, offline capture, background, biometrics, sensors — or "none">

## Distribution mode + rung
<PWA (Cloudflare URL) | native (Expo Go → dev build → EAS internal) | both; name the target rung from deployment.md validation ladder>

## Selected stack
<app framework, backend (or "none"), data store, per layer from path-f-expo.md>

## Why this is the fastest credible path
<2-3 sentences; name the ladder rung and why lower rungs don't test the hypothesis honestly>

## Local run command
<e.g. npm install && npm run dev — scan QR with Expo Go>

## Deployment command or channel
<e.g. npm run deploy → EAS Update channel preview; npm run deploy:prod → internal-distribution build. PWA: npm run deploy → Cloudflare URL>

## Offline behavior
<what works offline, what fails, explicitly — "nothing works offline; app shows connectivity notice" is valid>

## Device permissions requested
<each permission + why hypothesis needs it. "None" if none>

## Data used
<source, sensitivity, synthetic/masked/limited-scope; where stored — device vs backend>

## Integrations
<external services touched; read-only or write; rollback per integration. "None" if none>

## Authentication approach
<per data-security.md auth table; "none — internal distribution link is the access control" is valid>

## Observability approach
<EAS dashboard / wrangler tail + analytics tool + feedback channel>

## Store accounts required
<none | Apple Developer ($99/yr) | Play Console ($25) — owner + escalation status per account>

## Known shortcuts
<allowed shortcuts taken, per doctrine.md>

## Known risks
<what could bite; accepted why>

## Escalations required
<escalation triggers (1–9) that apply + status. "None" if none>

## Hardening or rebuild expectation if promoted
<harden in place / partial rebuild / full rebuild — and what changes>
```
