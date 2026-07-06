# Structure rules

Project structure is a contract, not a suggestion. Contract lives in two places, kept in sync:

1. `CLAUDE.md` "Project Structure (STRICT)" — human/AI-readable table: what goes where, what never goes where (this repo's actual tree).
2. `.claude/allowed-paths.json` — machine-enforced by `.claude/hooks/folder-structure-guard.cjs` (PreToolUse): `forbiddenGlobs` hard-block, new files outside `allowedGlobs` prompt for approval, edits to existing files always pass.

## Rules

- New file goes where the contract says. Unsure → check CLAUDE.md structure table first.
- No junk-drawer dirs (`utils/`, `helpers/`, `common/`, `shared/`, `misc/` at root). Shared code has a named home per the contract (`lib/`, `store/`, `src/lib`, `src/services`). (NestJS `src/common/` is legit and allowed by that repo's contract.)
- No new top-level dirs without updating the contract.
- Root `.md` files: only those in `exemptRootMd` (README, CLAUDE, STANDARDS, DEPLOY, PLUGINS-TO-INSTALL). Everything else → `docs/`.
- Business logic never in route/screen files — thin `app/` screens or `src/routes` handlers; logic in `lib/`/`src/services`.
- `forbiddenGlobs` encode scope/architecture decisions from the ADR (e.g. `ios/`+`android/` for Expo managed workflow, `src/**` for a monorepo, `server/**` for a separate-backend repo). A forbidden dir appearing = an architecture change → record in `docs/ADR.md` first.

## Changing the contract

Structure genuinely needs to grow:

1. Update CLAUDE.md "Project Structure (STRICT)" table — say what the new dir contains and never contains.
2. Add the glob to `allowedGlobs` in `.claude/allowed-paths.json`.
3. Same change, same commit. Contract drift = bug.

Never delete `forbiddenGlobs` entries to silence the guard — removing one is an architecture change; record why in `docs/ADR.md`.
