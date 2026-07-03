# Path C — Internal workflow tool

## When

Idea improves internal process, review flow, operations workflow, decision-support task. First audience = internal team.

When NOT: external users → path A or B. Pure service/integration, no screens → path E.

## First question: does this need code at all?

Ladder rung 1 check. Retool, Appsmith, Airtable, Google AppSheet, Glide cover most internal CRUD/workflow needs with zero repo. No-code fits → recommend it, name the tool, stop — no scaffold. Scaffold only when workflow needs custom logic, custom UI, or integration a no-code tool can't express.

## Layers (custom build; first option = default)

| Layer | Preferred options |
|---|---|
| Framework | Next.js, SvelteKit |
| Data | Existing spreadsheet/Airtable via API, Cloudflare D1, CSV import |
| Auth | Cloudflare Access, Google/Microsoft SSO — tool must not be public |
| Deployment | Cloudflare Workers/Pages, Vercel, Railway, Render |

## Avoid

- Rebuilding full ERP, CRM, workflow platform. Smallest real workflow only.
- Deep write integration into core systems before workflow validated. Import/export, CSV, read-only API first.
- Treating tool as permanent system before promotion.
- Building for every team — build for first operating team, role-limited.

## Scaffolder commands (non-interactive)

```bash
npx create-next-app@latest <dir> --ts --app --tailwind --eslint --src-dir --yes
```

Flags rejected → scaffolder `--help` first, never interactive.

## Structure contract (Next.js default, src dir)

Same as path B contract, plus:

| Location | Contains | Never contains |
|---|---|---|
| `src/lib/audit.ts` (or equivalent) | Status-history/audit-note helper when decisions flow through tool | — |

Starter `allowed-paths.json`: use path B block.

## Scaffold output (stubs only)

1. Same as path B: stub page, health route, `.gitkeep` contract dirs, `.env.example`.
2. Stub page states "internal tool — SSO required before real data".
3. Access approach (allowlist or SSO domain restriction) recorded in ADR — not implemented.
4. README "Next steps" section: SSO/Cloudflare Access, workflow screen, audit trail — from ADR.

Planned integrations → README Next steps, never code. NO login, NO workflow screen, NO audit.ts.

## Verify notes

- Build/check passes; stub page + health route present.
- No auth code, no data-source wiring, no workflow screens — feature code present = scope-creep fail.
- ADR documents access approach + data source plan (import/synthetic/limited-scope, not live core-system writes).
- README Next steps documents ADR's planned integrations.
