---
name: web-build
description: Scaffold web project from approved Architecture Decision Record — run official scaffolder, stub code only (zero feature implementation), write README/ADR/CLAUDE.md, install structure-guard hook. Use after web-decide approval, or standalone when user names path + stack explicitly. Never without an ADR or explicit stack decision.
---

# web-build

Input: approved ADR. Output: scaffolded project directory (stubs only), git-initialized, structure contract enforced. Feature work happens later inside generated project — never here.

No ADR and no explicit user stack decision → stop, run `web-decide` first.

Read chosen golden-path doc (`${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-*.md`), `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`, `${CLAUDE_PLUGIN_ROOT}/references/data-security.md`.

## Ground rules

- **Official scaffolder is ground truth.** Framework configs (next.config, astro.config, tsconfig, wrangler config) come from scaffolder, never hand-written from memory.
- Scaffolder commands: exact non-interactive invocations from golden-path doc. Flags rejected → run `--help`, adapt. Never launch interactive mode.
- Extra deps: `npm install <pkg>@latest`. Never hand-write version numbers into package.json.
- Platform/deploy wiring only (e.g. `@opennextjs/cloudflare` adapter, wrangler config — needed by npm scripts): current official docs via context7 MCP tools when available, else WebSearch. Both unavailable → scaffolder defaults only, note gap in final report. Feature libraries (DB client, auth SDK, analytics) NOT installed — they go in README Next steps.
- Scaffolder or npm install fails (network, registry) → stop, report exact error. Never hand-write fake project skeleton as fallback.
- **Anchor every target-dir command.** cwd drifts across Bash calls — run in-project commands as `(cd <target> && cmd)` subshell or with absolute paths. Never `cd` once and trust it later.

## Steps

1. **Target dir.** Confirm target from ADR/conversation. Dir exists non-empty → stop, ask: new subdir or abort. Never scaffold over existing files.
2. **Scaffold.** Run scaffolder. Inspect produced tree — layout varies by scaffolder version; contract reconciliation (step 7) depends on actual tree.
3. **Stubs only.** Generate golden-path doc's "Scaffold output (stubs only)" list exactly — stub page/route showing app name + hypothesis from ADR, contract dirs with `.gitkeep`. Respect path Avoid list. NO feature code: no auth, no DB client, no forms, no analytics, no CRUD. Planned integrations from ADR → README Next steps.
4. **npm scripts.** Ensure command shape from deployment.md: `dev`, `check` (typecheck+lint+tests as applicable), `deploy`, `deploy:prod`, `logs`. Platform CLI commands (vercel, wrangler, netlify) wrapped as scripts.
5. **Docs + env.**
   - `README.md`: all 10 minimum-documentation items from deployment.md, including rollback/disable per integration. Plus "Next steps" section — planned integrations from ADR (auth, data, forms, analytics), each one line.
   - `docs/ADR.md`: approved ADR verbatim.
   - `.env.example`: every required var, placeholder values, one-line comment each. Never real values.
6. **CLAUDE.md.** Write fresh at project root:
   - Purpose + hypothesis (from ADR).
   - Scope + non-goals.
   - Non-goals hard bound: "Stub-only scaffold — do NOT implement features outside scope. Never add adjacent features for completeness. Feature work = separate tasks inside this repo."
   - "Project Structure (STRICT)" — per-folder table matching ACTUAL generated tree (contains / never contains).
   - Forbidden patterns table (from golden-path contract).
   - Commands table.
   - Known shortcuts + hardening expectation (from ADR).
   - Pointer: `docs/ADR.md`, `.claude/rules/`.
7. **Structure guard — LAST, after tree final:**
   - Copy `${CLAUDE_PLUGIN_ROOT}/assets/hooks/folder-structure-guard.cjs` → `.claude/hooks/`.
   - Copy `${CLAUDE_PLUGIN_ROOT}/assets/rules/*.md` → `.claude/rules/`.
   - Write `.claude/allowed-paths.json`: start from golden-path doc's starter block, reconcile against actual tree (walk it — every existing dir the project legitimately uses gets a glob; keep forbiddenGlobs from doc).
   - `.claude/settings.json`: content of `${CLAUDE_PLUGIN_ROOT}/assets/settings-hook.json`. File already exists → deep-merge hooks array, don't clobber.
8. **Git.** Repo absent → `git init`. Stage all, initial commit `feat: scaffold <name> (path <X>, web-scaffold)`. Announce commit.

## Output

Report: tree summary, stubs generated, next-step integrations listed, files written, doc-currency gaps (context7/WebSearch unavailable), anything deferred to verify.
