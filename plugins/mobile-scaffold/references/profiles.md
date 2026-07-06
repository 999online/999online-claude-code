# Profile matrix — mobile-scaffold

Two axes pick profile. Profile sets **defaults**; ADR records deviations (matrix = default, still deliberate). `mobile-discover` captures axes, `mobile-decide` selects profile + writes ADR, `mobile-build` + `mobile-service-scaffold` emit repos.

## Axes

- **Target** — MOBILE-ONLY | MOBILE+WEB
- **Size** — small | large

## Priority (highest, near non-negotiable)

- **Expo** = only mobile framework this pipeline scaffolds. Managed workflow. Flutter/Ionic = out of pipeline (allowed by incubation standards, run their scaffolder elsewhere).
- **Cloudflare** = first-choice infra for every service. Small = pure Cloudflare (Hono Workers + D1 + Pages). Web always deploys Cloudflare Pages/Workers, both sizes.
- **Large** (NestJS + Postgres + AWS) = escalation, only when relational/scale needs exceed Cloudflare fit. ADR must justify why not Cloudflare. AWS = new cloud account → escalation trigger 7 before deploy.
- **Firebase** = notifications only (Cloudflare has no push service). Public FCM config ships in app; server service-account key = secret, never bundled.

## Matrix

| Profile | Repos emitted | Mobile | State | Backend | DB | Web |
|---|---|---|---|---|---|---|
| MOBILE-ONLY / small | `<name>-mobile`, `<name>-backend` | Expo | zustand | Hono + Workers | D1 | — |
| MOBILE-ONLY / large | `<name>-mobile`, `<name>-backend` | Expo | RTK (Redux Toolkit) | NestJS | Postgres (AWS) | — |
| MOBILE+WEB / small | `<name>-mobile`, `<name>-web-be` | Expo | zustand | Hono + Workers | D1 | react-native-web (`apps/web`) |
| MOBILE+WEB / large | `<name>-mobile`, `<name>-web-be` | Expo | RTK | NestJS | Postgres (AWS) | react-native-web (`apps/web`) |

All TypeScript. FCM notifications all profiles.

## Repo separation

- Each emitted repo = own `git init`, own `.claude/` contract, own root docs (README/CLAUDE/STANDARDS/DEPLOY/PLUGINS-TO-INSTALL/.mcp.json). No shared monorepo across mobile and backend.
- **MOBILE-ONLY** → 2 repos: `<name>-mobile` (Expo) + `<name>-backend` (Hono small | NestJS large).
- **MOBILE+WEB** → 2 repos: `<name>-mobile` (Expo, native distribution) + `<name>-web-be` (monorepo: `apps/api` backend + `apps/web` react-native-web).
- Mobile app → backend over HTTP only. Mobile `.env` `EXPO_PUBLIC_API_URL` = backend base URL. App never holds privileged/service credentials.
- Shared UI mobile ↔ web: NOT wired at scaffold. Document sharing path (publish `@<name>/ui` package, or duplicate) — feature work inside repos.

## Distribution per profile

- **MOBILE-ONLY** — mobile repo distribution = PWA (Expo web → Cloudflare Pages) | native (EAS) | both, per ADR. No separate web app.
- **MOBILE+WEB** — mobile repo distribution defaults **native** (EAS); web presence = dedicated react-native-web app in `-web-be` (better web UX, shares backend). Avoid two web builds; if ADR still wants mobile PWA too, record as deviation.

## Golden path per repo

- Mobile (Expo) → `golden-paths/path-f-expo.md`
- Backend small (Hono + Workers + D1) → `golden-paths/backend-hono-d1.md`
- Backend large (NestJS + Postgres/AWS) → `golden-paths/backend-nestjs-postgres.md`
- Web-be monorepo (`apps/api` + `apps/web` RN-web) → `golden-paths/web-be-rn-web.md`

## When large justified

Postgres/NestJS/AWS only when: relational integrity across many entities, complex multi-table transactions, existing Postgres/AWS mandate, or scale beyond Workers/D1 limits. Else small (Cloudflare) — the default. Record decisive factor in ADR "Cloudflare-vs-alternative justification". Unjustified large = pick small.
