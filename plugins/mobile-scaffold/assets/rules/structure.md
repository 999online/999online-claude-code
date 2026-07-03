# Structure rules

Project structure is a contract, not a suggestion. Contract lives in two places, kept in sync:

1. `CLAUDE.md` "Project Structure (STRICT)" — human/AI-readable table: what goes where, what never goes where.
2. `.claude/allowed-paths.json` — machine-enforced by `.claude/hooks/folder-structure-guard.cjs` (PreToolUse): `forbiddenGlobs` hard-block, new files outside `allowedGlobs` prompt for approval, edits to existing files always pass.

## Rules

- New file goes where contract says. Unsure → check CLAUDE.md structure table first.
- No junk-drawer dirs: `utils/`, `helpers/`, `common/`, `shared/`, `misc/`. Shared code has a named home (`lib/`).
- No new top-level dirs without updating contract.
- Root `.md` files: only README.md and CLAUDE.md. Everything else → `docs/`.
- Business logic never in route/screen files — thin screens in `app/`, logic in `lib/`.
- `ios/`, `android/` are forbidden — this project stays on Expo managed workflow. Needing them = architecture change recorded in `docs/ADR.md` first.

## Changing the contract

Structure genuinely needs to grow:

1. Update CLAUDE.md "Project Structure (STRICT)" table — say what the new dir contains and never contains.
2. Add glob to `allowedGlobs` in `.claude/allowed-paths.json`.
3. Same change, same commit. Contract drift = bug.

Never delete `forbiddenGlobs` entries to silence the guard — they encode scope decisions from the ADR. Removing one is an architecture change; record why in `docs/ADR.md`.
