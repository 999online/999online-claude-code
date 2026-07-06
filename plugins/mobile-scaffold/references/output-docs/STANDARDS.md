<!-- TEMPLATE — mobile-build / mobile-service-scaffold copy this to each repo root as STANDARDS.md, substituting {{...}}. Trim sections not matching the repo (state block = mobile/web only; API/DB block = backend only). -->
# Coding standards — {{REPO_NAME}}

Conventions for this repo ({{PROFILE}} — {{STACK}}). Enforced by review + `.claude/rules/` + structure guard.

## Naming
- Files: kebab-case. React components: PascalCase file + export.
- Vars/functions: camelCase. Types/interfaces: PascalCase. Constants: UPPER_SNAKE.

## Imports
- Order: external → internal (`@/…`) → relative. No deep relative chains — use path alias.

## TypeScript
- `strict` on. No `any` — use `unknown` + narrow. Explicit return types on exported functions.

## Structure
- Follow CLAUDE.md "Project Structure (STRICT)". New file goes where the contract says. No junk-drawer dirs (`utils/helpers/common/shared/misc`).
- Business logic out of screens/routes — thin `app/` (or `src/routes`), logic in `lib/`/`src/services`.

## State (mobile/web repos)
- Store in `store/`. See `.claude/rules/state-management.md` ({{STATE_LIB}}: zustand | Redux Toolkit).

## API + DB (backend repo)
- Routes/modules per `.claude/rules/api-routes.md`. Migrations per `.claude/rules/database.md` — immutable once applied.

## Errors
- Structured `{ error: { code, message } }` at API boundaries. No stack traces to clients. Handle failure paths.

## Secrets
- Never commit secrets. Mobile: only `EXPO_PUBLIC_` (public). Backend: `.dev.vars`/`.env` gitignored. See `.claude/rules/security.md`.

## Commits
- Conventional Commits: `feat:` `fix:` `chore:` `docs:` `refactor:` `test:`. Subject ≤72 chars, imperative. See `.claude/rules/commits.md` if present.
