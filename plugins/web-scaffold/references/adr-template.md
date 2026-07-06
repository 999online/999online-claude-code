# Architecture Decision Record template

One page, no more. `web-decide` fills it; `web-build` copies filled version to `docs/ADR.md` in generated project. Every field required — "none" is valid answer, blank is not.

```markdown
# Architecture Decision Record — <project name>

Date: <YYYY-MM-DD>
Decision owner: <name — person who clears escalations and makes promote/pause/terminate call>
Golden path: <A landing | B full-stack | C internal tool | E API service>
Layout: <single-package | monorepo (apps/web + apps/api + packages/db)> — B/C default monorepo; A/E single-package

## Hypothesis
<one sentence — what this deployment must prove>

## Selected stack
<framework, deployment platform, data store, per layer>

## Why this is the fastest credible path
<2-3 sentences; name the ladder rung and why lower rungs don't test the hypothesis honestly>

## Local run command
<e.g. npm install && npm run dev>

## Deployment command or platform
<deploy model + command. Path A static: Cloudflare Pages Git integration (dashboard auto-deploy on push + per-branch preview URLs) OR wrangler CLI (npm run deploy / deploy:prod). B/C: npm run deploy → Cloudflare Workers preview; deploy:prod. Monorepo → per-app deploy>

## Data used
<source, sensitivity, synthetic/masked/limited-scope; where stored>

## Integrations
<external services touched; read-only or write; rollback per integration. "None" if none>

## Authentication approach
<per data-security.md auth table; "none — public page, no admin surface" is valid>

## Observability approach
<platform logs + analytics tool + feedback channel>

## Known shortcuts
<allowed shortcuts taken, per doctrine.md>

## Known risks
<what could bite; accepted why>

## Escalations required
<escalation triggers that apply + status. "None" if none>

## Hardening or rebuild expectation if promoted
<harden in place / partial rebuild / full rebuild — and what changes>
```
