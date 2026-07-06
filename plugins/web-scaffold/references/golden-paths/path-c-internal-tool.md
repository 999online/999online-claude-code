# Path C — Internal workflow tool

## When

Idea improves internal process, review flow, operations workflow, decision-support task. First audience = internal team.

When NOT: external users → path A or B. Pure service/integration, no screens → path E.

## First question: does this need code at all?

Ladder rung 1 check. Retool, Appsmith, Airtable, Google AppSheet, Glide cover most internal CRUD/workflow needs with zero repo. No-code fits → recommend it, name the tool, stop — no scaffold. Scaffold only when workflow needs custom logic, custom UI, or integration a no-code tool can't express.

## Layout — monorepo (default), same as path B

Custom build uses path B's **Turborepo monorepo**: `apps/web` + `apps/api` (Hono on Workers) + `packages/db` — same three workspaces as path B. `apps/api` is **required** for path C: internal tools route through a shared Hono backend, not ad-hoc Next route handlers. Record the stack in ADR.

## Layers (custom build; first option = default)

| Layer | Preferred options |
|---|---|
| Frontend framework | Next.js, SvelteKit |
| API framework | Hono (on Workers) |
| Data | Existing spreadsheet/Airtable via API, Cloudflare D1 (via Drizzle in `packages/db`), CSV import |
| Auth | Cloudflare Access, Google/Microsoft SSO — tool must not be public |
| Deployment | Cloudflare Workers/Pages, Vercel, Railway, Render |

## Avoid

- Rebuilding full ERP, CRM, workflow platform. Smallest real workflow only.
- Deep write integration into core systems before workflow validated. Import/export, CSV, read-only API first.
- Treating tool as permanent system before promotion.
- Building for every team — build for first operating team, role-limited.

## Scaffolder commands (non-interactive)

Same as path B — `create-next-app` into `apps/web`, `create hono` into `apps/api`, monorepo glue + `packages/db`:
```bash
npx create-next-app@latest apps/web --ts --app --tailwind --eslint --src-dir --yes
npm create hono@latest apps/api -- --template cloudflare-workers --install --pm npm
```

Flags rejected → scaffolder `--help` first, never interactive.

## Structure contract (monorepo, same as path B)

Use path B contract and starter `allowed-paths.json`. Internal-tool addition: `apps/web/src/lib/audit.ts` (or equivalent) holds a status-history/audit-note helper when decisions flow through the tool — documented, stubbed only.

## Scaffold output (stubs only)

1. Same as path B: stub `apps/web` page, web health route, `apps/api` Hono app mounting `GET /health` only, `packages/db` schema stub + client, `.gitkeep` contract dirs, `.env.example`.
2. Stub page states "internal tool — SSO required before real data".
3. Access approach (allowlist or SSO domain restriction) recorded in ADR — not implemented.
4. README "Next steps" section: SSO/Cloudflare Access, workflow screen, audit trail — from ADR.

Planned integrations → README Next steps, never code. NO login, NO workflow screen, NO audit.ts implementation.

## Verify notes

- Build/check passes; stub page + health route present.
- No auth code, no data-source wiring, no workflow screens — feature code present = scope-creep fail.
- ADR documents access approach + data source plan (import/synthetic/limited-scope, not live core-system writes).
- README Next steps documents ADR's planned integrations.
