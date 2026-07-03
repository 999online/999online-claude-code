---
name: mobile-build
description: Generate Expo mobile project from approved Architecture Decision Record — run create-expo-app, add minimal feature slice, optional Hono Workers backend, write README/ADR/CLAUDE.md, install structure-guard hook. Use after mobile-decide approval, or standalone when user names stack + distribution mode explicitly. Never without an ADR or explicit stack decision.
---

# mobile-build

Input: approved ADR. Output: working Expo project directory, git-initialized, structure contract enforced.

No ADR and no explicit user stack decision → stop, run `mobile-decide` first.

Read `${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-f-expo.md`, `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`, `${CLAUDE_PLUGIN_ROOT}/references/data-security.md`.

## Ground rules

- **Official scaffolder is ground truth.** `app.json`, `tsconfig.json`, eslint config, `expo-env.d.ts` come from `create-expo-app`, never hand-written from memory.
- Scaffolder commands: exact non-interactive invocations from golden-path doc. Flags rejected → run `--help`, adapt. Never launch interactive mode.
- **Dependency rule:** Expo/RN-coupled packages (`expo-*`, `react-native-*`) via `npx expo install <pkg>` — SDK-matched version. Never `npm install <pkg>@latest` for these. Pure-JS deps: `npm install <pkg>@latest`. Never hand-write version numbers into package.json.
- **Never run `npx expo prebuild` or `npx expo run:ios|android`** — project stays managed workflow; `ios/`/`android/` are forbidden by structure contract.
- Library wiring (backend client, auth SDK, analytics): current official docs via context7 MCP tools when available, else WebSearch. Both unavailable → scaffolder defaults only, note gap in final report.
- Scaffolder or npm install fails (network, registry) → stop, report exact error. Never hand-write fake project skeleton as fallback.
- **Anchor every target-dir command.** cwd drifts across Bash calls — run in-project commands as `(cd <target> && cmd)` subshell or with absolute paths. Never `cd` once and trust it later.

## Steps

1. **Target dir.** Confirm target from ADR/conversation. Dir exists non-empty → stop, ask: new subdir or abort. Never scaffold over existing files.
2. **Scaffold.** `npx create-expo-app@latest <dir> --template default --yes`. Then `(cd <dir> && npm run reset-project)` (don't keep example files; delete `app-example/`). Script absent → move example screens out manually, keep clean `app/` with one index route. Inspect produced tree — layout varies by template version; contract reconciliation (step 8) depends on actual tree.
3. **Backend (only when ADR names one).** `npm create hono@latest server -- --template cloudflare-workers --install --pm npm`. Data via Cloudflare D1 per current docs. Backend secrets: `server/.dev.vars.example` committed, real `.dev.vars` gitignored.
4. **Feature slice.** Implement golden-path doc's minimum slice, nothing more. Respect Avoid list. Thin screens in `app/`, logic + clients in `lib/`.
5. **npm scripts.** Command shape from deployment.md, per ADR distribution mode:
   - Always: `dev` (`expo start`), `check` (typecheck + `expo lint`), `doctor` (`npx expo-doctor`).
   - Native mode: `deploy` (`eas update --channel preview`), `deploy:prod` (`eas build --profile preview --platform all`), `logs` (`eas update:list --branch preview --non-interactive`).
   - PWA mode: `deploy` (`expo export --platform web` + wrangler deploy of `dist/` — exact assets wiring from current docs), `deploy:prod` (prod variant), `logs` (`wrangler tail`).
   - Both mode: ship both sets, suffixed (`deploy:web`).
   - Backend: `server:dev`, `server:deploy` proxying into `server/`.
   EAS scripts need one-time `npm i -g eas-cli && eas login && eas init` — do NOT run these; README documents as first-deploy setup.
6. **Docs + env.**
   - `README.md`: all 10 minimum-documentation items from deployment.md, including device run steps (QR scan), both deploy paths, and pull-a-bad-update rollback.
   - `docs/ADR.md`: approved ADR verbatim.
   - `.env.example`: every required var, placeholder values, each commented — `# EXPO_PUBLIC_ vars are baked into public app bundle — publishable values only, never secrets`. Never real values.
7. **CLAUDE.md.** Write fresh at project root:
   - Purpose + hypothesis (from ADR).
   - Scope + non-goals (platforms, distribution mode, offline stance).
   - "Project Structure (STRICT)" — per-folder table matching ACTUAL generated tree (contains / never contains).
   - Forbidden patterns table (from golden-path contract, incl. `ios/`/`android/`).
   - Commands table.
   - Known shortcuts + hardening expectation (from ADR).
   - Pointer: `docs/ADR.md`, `.claude/rules/`.
8. **Structure guard — LAST, after tree final:**
   - Copy `${CLAUDE_PLUGIN_ROOT}/assets/hooks/folder-structure-guard.cjs` → `.claude/hooks/`.
   - Copy `${CLAUDE_PLUGIN_ROOT}/assets/rules/*.md` → `.claude/rules/`.
   - Write `.claude/allowed-paths.json`: start from golden-path doc's starter block, reconcile against actual tree (walk it — every existing dir the project legitimately uses gets a glob; drop `server/**` when no backend; keep forbiddenGlobs from doc).
   - `.claude/settings.json`: content of `${CLAUDE_PLUGIN_ROOT}/assets/settings-hook.json`. File already exists → deep-merge hooks array, don't clobber.
9. **Git.** Repo absent → `git init`. Stage all, initial commit `feat: scaffold <name> (path F, mobile-scaffold)`. Announce commit.

## Output

Report: tree summary, feature slice built, distribution mode + scripts written, files written, doc-currency gaps (context7/WebSearch unavailable), anything deferred to verify.
