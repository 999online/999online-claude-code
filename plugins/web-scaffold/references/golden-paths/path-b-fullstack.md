# Path B — Lightweight full-stack web app

## When

Idea requires user interaction, persisted state, authentication, usable workflow.

When NOT: only measuring interest → path A. Internal-team process tool → path C. No UI, service only → path E.

## Layers (first option = default)

| Layer | Preferred options |
|---|---|
| Full-stack framework | Next.js, SvelteKit, Nuxt, Remix |
| Deployment | Cloudflare Workers/Pages, Vercel, Netlify, Railway, Render, Fly.io |
| Database | Cloudflare D1, Neon Postgres (via Hyperdrive), Turso |
| Auth | Clerk, Firebase Auth, Better Auth, platform SSO where available — never custom |
| File storage | Cloudflare R2, Firebase Storage, S3-compatible |
| Background jobs | Cloudflare Queues, Cloudflare Cron Triggers, Inngest, Trigger.dev |

Default combo: Next.js on Cloudflare Workers (`@opennextjs/cloudflare`) + D1 + Clerk — deploy and local dev via wrangler.

## Avoid

- Separate frontend, backend, API gateway, job worker, admin app unless required.
- Custom Kubernetes, VM provisioning, service mesh, enterprise CI/CD before validation.
- Premature microservices.
- Wide data model — keep schema narrow, aligned to hypothesis.
- Permissions beyond what first audience needs.

## Scaffolder commands (non-interactive)

Default (Next.js):
```bash
npx create-next-app@latest <dir> --ts --app --tailwind --eslint --src-dir --yes
```

Alternate (SvelteKit):
```bash
npx sv create <dir> --template minimal --types ts --no-add-ons --install npm
```

Cloudflare wiring: follow current official docs (context7 or WebSearch) for `@opennextjs/cloudflare` setup + wrangler D1 bindings; install via `npm install <pkg>@latest`. Flags rejected → scaffolder `--help` first, never interactive.

## Structure contract (Next.js default, src dir)

| Location | Contains | Never contains |
|---|---|---|
| `src/app/` | Routes, pages, route handlers | Shared business logic |
| `src/components/` | UI components | Data access |
| `src/lib/` | Clients (db, auth), utilities, shared logic | Components |
| `src/server/` | Server-only logic, data access | Client components |
| `src/types/` | Shared types | Runtime code |
| `public/` | Static assets | Source |
| `docs/` | ADR, all other .md | — |

Starter `allowed-paths.json` (reconcile against actual tree):

```json
{
  "allowedGlobs": [
    "src/app/**", "src/components/**", "src/lib/**", "src/server/**",
    "src/types/**", "src/styles/**", "public/**", "docs/**", ".claude/**",
    "migrations/**",
    "*.json", "*.jsonc", "*.toml", "*.mjs", "*.cjs", "*.ts", ".gitignore", ".env.example", ".nvmrc"
  ],
  "forbiddenGlobs": [
    "src/{utils,helpers,common,shared,misc}/**",
    "packages/**", "services/**", "microservices/**"
  ],
  "rootOnlyFiles": [".gitignore", ".env.example", ".nvmrc"],
  "exemptRootMd": ["README.md", "CLAUDE.md"]
}
```

Rationale: `packages/`, `services/` forbidden = no premature monorepo/microservices. Junk-drawer dirs forbidden = shared code goes in `src/lib`.

## Feature slice (minimum build proves)

1. Auth flow: sign in via managed auth (magic link or OAuth), protected route redirects unauthenticated users.
2. One CRUD slice end-to-end: create + list one core entity, persisted in DB, scoped to logged-in user.
3. Schema/migration captured (SQL file or migration tool output committed).
4. `.env.example` lists every required key with placeholder.

## Verify notes

- `npm run check` passes (typecheck + lint + build).
- CRUD slice works against local/dev database, or documented as blocked on account provisioning.
- Auth pages come from managed provider — no password-hashing code in repo.
- Per-user access scoping enforced in data layer (D1) or via row-level security (Postgres), noted in ADR.
