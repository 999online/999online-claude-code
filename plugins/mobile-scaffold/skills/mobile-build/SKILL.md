---
name: mobile-build
description: Scaffold the Expo mobile repo from an approved ADR — run create-expo-app, wire state (zustand small / RTK large), FCM notification stub, base API client, stub code only (zero feature code), write docs + .claude contract, git init; then delegate the backend/web-be repo to mobile-service-scaffold. Use after mobile-decide approval, or standalone when user names profile + stack explicitly. Never without an ADR.
---

# mobile-build

Input: approved ADR (covers the whole profile). Output: the `<slug>-mobile` Expo repo (stubs only, git-initialized, structure enforced), then the sibling backend/web-be repo via `mobile-service-scaffold`. Feature work happens later inside generated repos — never here.

No ADR and no explicit user stack decision → stop, run `mobile-decide` first.

Read `${CLAUDE_PLUGIN_ROOT}/references/profiles.md`, `${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-f-expo.md`, `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`, `${CLAUDE_PLUGIN_ROOT}/references/data-security.md`.

## Ground rules

- **Official scaffolder is ground truth.** `app.json`, `tsconfig.json`, eslint config, `expo-env.d.ts` come from `create-expo-app`, never hand-written.
- Scaffolder commands: exact non-interactive invocations from golden path. Flags rejected → `--help`, adapt. Never interactive.
- **Dependency rule:** Expo/RN-coupled (`expo-*`, `react-native-*`, `expo-notifications`) via `npx expo install <pkg>` — SDK-matched. Pure-JS (`zustand`, `@reduxjs/toolkit`, `react-redux`) via `npm install <pkg>@latest`. Never hand-write versions.
- **Never `npx expo prebuild` / `expo run:ios|android`** — managed workflow; `ios/`/`android/` forbidden.
- Platform/deploy wiring (Expo web → Cloudflare Pages, EAS config, FCM setup): current docs via context7 MCP, else WebSearch. Both unavailable → scaffolder defaults, note gap. Feature libraries (auth SDK, analytics, real API endpoints) NOT installed → README Next steps.
- Scaffolder/npm fails (network, registry) → stop, report exact error. Never hand-write a fake skeleton.
- **Anchor every target-dir command.** cwd drifts — run in-repo commands as `(cd <dir> && cmd)` or absolute paths.
- **Separate repos.** Backend is NOT a subdir — it is a sibling repo built by `mobile-service-scaffold`. No `server/` here.

## Steps

1. **Parse + target.** From ADR: profile, repos + names, mobile state lib (zustand/RTK), distribution mode, backend present?. Base slug from project name. Confirm parent dir; sibling repos created under it: `<slug>-mobile` + (`<slug>-backend` | `<slug>-web-be`). Any target dir exists non-empty → stop, ask (new name / abort). Never scaffold over files.
2. **Scaffold mobile.** `npx create-expo-app@latest <slug>-mobile --template default --yes`; then `(cd <slug>-mobile && npm run reset-project)` (delete `app-example/`). Script absent → move example screens out, keep clean `app/` + one index route. Inspect actual tree (varies by template version).
3. **State + notifications deps.** small: `npm install zustand`. large: `npm install @reduxjs/toolkit react-redux`. Both: `npx expo install expo-notifications expo-device`.
4. **Stubs only** (path-f-expo "Scaffold output"):
   - `app/index.tsx` — stub screen: app name + hypothesis.
   - `store/` — infra stub: small `store/app-store.ts` (one zustand store, placeholder field+setter); large `store/index.ts` (`configureStore`) + `store/app-slice.ts` + `store/hooks.ts`, `<Provider>` in `app/_layout.tsx`.
   - `lib/api.ts` — base client: reads `EXPO_PUBLIC_API_URL`, `apiFetch(path)` + `health()`. No domain endpoints.
   - `lib/notifications.ts` — `expo-notifications` register + get-token + log, permission-gated. No send logic.
   - `.gitkeep` for empty contract dirs (`components/`, `hooks/`, `constants/`).
   - NO feature code: no auth, no native-feature code, no domain API, no FCM send. Planned → README Next steps.
5. **npm scripts** (deployment.md, per distribution mode): always `dev` (`expo start`), `check` (typecheck + `expo lint`), `doctor` (`npx expo-doctor`). Native: `deploy`(`eas update --channel preview`), `deploy:prod`(`eas build --profile preview --platform all`), `logs`(`eas update:list`). PWA: `deploy`(`expo export -p web` + wrangler Pages), `deploy:prod`(prod Pages), `logs`(`wrangler tail`). Both: suffixed. EAS one-time setup documented (not run). PWA + Pages Git-integration deploy model (ADR): deploy happens on push via dashboard — deploy scripts optional manual fallback; DEPLOY.md documents the dashboard flow as primary.
6. **Docs + env.**
   - `README.md`: 10 minimum-doc items (deployment.md) incl. device run (QR), both deploy paths, rollback; "Next steps" (ADR integrations); offline statement; note `EXPO_PUBLIC_API_URL` → backend repo URL.
   - `docs/ADR.md`: approved ADR verbatim.
   - `.env.example`: `EXPO_PUBLIC_API_URL` + `EXPO_PUBLIC_FIREBASE_*` (public config), each commented `# EXPO_PUBLIC_ baked into public bundle — publishable values only`.
   - Root docs from `${CLAUDE_PLUGIN_ROOT}/references/output-docs/`: `STANDARDS.md`, `DEPLOY.md`, `PLUGINS-TO-INSTALL.md`, `.mcp.json` (copy from `output-docs/mcp.json`) — substitute `{{...}}` for this repo. PWA + Pages Git-integration model → fill `DEPLOY.md` with the dashboard connect walkthrough (Connect to Git, build cmd `npx expo export -p web`, output dir `dist`, auto-deploy + preview URLs) as primary; wrangler CLI as fallback.
   - `.gitignore`: ensure `.env*`, `google-services.json`, `GoogleService-Info.plist`, `dist/` ignored.
7. **CLAUDE.md** at repo root:
   - Purpose + hypothesis; Scope + non-goals (platforms, distribution mode, offline).
   - Non-goals hard bound: "Stub-only scaffold — do NOT implement features outside scope. Feature work = separate tasks inside this repo."
   - "Project Structure (STRICT)" per-folder table matching actual tree (incl. `store/`).
   - Forbidden patterns table (incl. `ios/`/`android/`/`src/`/`pages/`/`public/`/`server/`).
   - Commands table; Cross-repo note (`EXPO_PUBLIC_API_URL` → backend repo); Known shortcuts + hardening (ADR).
   - Pointers: `docs/ADR.md`, `.claude/rules/`.
8. **Structure guard — LAST, after tree final:**
   - Copy `${CLAUDE_PLUGIN_ROOT}/assets/hooks/folder-structure-guard.cjs` → `.claude/hooks/`.
   - Copy mobile rule set from `${CLAUDE_PLUGIN_ROOT}/assets/rules/` → `.claude/rules/`: `structure.md`, `security.md`, `delivery.md`, `state-management.md`, `notifications.md`, `apple-hig.md`, `apple-app-review.md`, `android-core-quality.md`, `android-play-policy.md`.
   - Write `.claude/allowed-paths.json`: from path-f-expo starter, reconcile against actual tree (+`store/**`; keep forbiddenGlobs incl. `server/**`).
   - `.claude/settings.json`: content of `${CLAUDE_PLUGIN_ROOT}/assets/settings-hook.json`. Exists → deep-merge hooks, don't clobber.
9. **Git.** `(cd <slug>-mobile && git init && git add -A && git commit -m "feat: scaffold <slug>-mobile (mobile, <profile>)")`. Announce.
10. **Delegate service repo.** Backend present → run `mobile-service-scaffold` with: ADR, profile, parent dir, mobile repo's `EXPO_PUBLIC_API_URL` placeholder to reconcile. No backend → skip, note mobile-only-no-server.

## Output

Report per repo: tree summary, stubs generated, state lib wired, distribution mode + scripts, docs written, `.claude` contract installed, git commit. Cross-repo `EXPO_PUBLIC_API_URL` link. Doc-currency gaps (context7/WebSearch unavailable). Then service-repo result. Anything deferred to verify.
