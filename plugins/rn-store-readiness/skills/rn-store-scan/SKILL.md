---
name: rn-store-scan
description: Run the bundled read-only store-readiness scanner on a React Native or Expo app and summarize what it flags — app config (Expo config or bare native projects), EAS build and submit profiles, bundle id / application id, build numbers, targetSdk, Xcode toolchain, Android permissions, iOS purpose strings, privacy manifests, 16 KB native-library risk, copyleft licenses, tracked secrets, plus account-deletion, privacy-policy, AI-consent and in-app-purchase code signals. Writes facts and preliminary findings as JSON outside the project. Use as step 1 of /rn-store-readiness, or standalone for a quick "what does the scanner flag?" pass. Not a verdict — rn-store-evaluate confirms findings and decides stages.
---

# rn-store-scan

Facts + preliminary findings, fast. **Read-only** — never writes into app.

Input: `$ARGUMENTS` = app directory (optional). Default `${CLAUDE_PROJECT_DIR}`.

## Preflight

1. **Node.** `node --version` missing or < 18 → STOP: "rn-store-scan needs Node ≥ 18 (bundled zero-dependency scanner)."
2. **App root.** Given dir missing → STOP, name path. Dir's `package.json` lacks `react-native` in `dependencies` → search subfolders (depth ≤ 3, skip `node_modules`, `.git`) for one that has it (monorepo `apps/*`). One → use it. Several → ask which. None → STOP: "No React Native / Expo app under <dir>."
3. **Work dir** `<work>` = `<scratchpad>/rn-store-readiness/<app-slug>` when session lists scratchpad directory, else `${CLAUDE_PLUGIN_DATA}/runs/<app-slug>`. `<app-slug>` = app root folder name, lowercase, non-alphanumerics → `-`. `mkdir -p` it. Never inside app — scan data stays out of project.
4. **Dependencies.** Full scan reads `node_modules` (Expo config plugins, library manifests, licenses, native libs). Missing → ask before installing with lockfile's command:
   - `package-lock.json` → `npm ci`
   - `yarn.lock` → `yarn install --immutable` (Yarn 1: `yarn install --frozen-lockfile`)
   - `pnpm-lock.yaml` → `pnpm install --frozen-lockfile`
   - `bun.lock` / `bun.lockb` → `bun install --frozen-lockfile`

   Declined or install fails → scan anyway; scanner `notes` list what got skipped.

## Run

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/scan.mjs --root <absolute app root> --out <work>/store-scan.json
```

- Spawns `git` and project's own Expo CLI (`expo config --type public` / `--type introspect`). Add `--no-exec` when user forbids running project code, or CLI hangs/fails — config then read from static files only.
- Exit 2 → quote stderr verbatim, STOP.
- stderr `Wrote … — findings: {…}` = status counts.

## Summarize

Read `<work>/store-scan.json`. Report:

```
Scan — <project.name> · <project.type> · Expo <project.expo> / RN <project.reactNative> · commit <meta.git.commit>
iOS <ios.bundleIdentifier or "not set"> · Android <android.package or "not set"> · config from <meta.configSource>
Findings: <n> fail · <n> warn · <n> verify · <n> pass · <n> na
```

Then every `fail` + `warn` finding, blockers first: `ID · severity · title — first evidence`. Then `notes` verbatim (what wasn't scanned). Then `project.docs` found — scope source for evaluation.

Statuses: `fail` = config fact breaks rule · `warn` = heuristic, likely · `verify` = repo can't tell · `pass` · `na`. Severity = impact if real. Finding IDs match `${CLAUDE_PLUGIN_ROOT}/references/checks.md`.

Close: "Preliminary — heuristic signals, unconfirmed. Stage verdicts: /rn-store-readiness (or rn-store-evaluate)."

## Scanner limits

Evaluation must not trust past these:

- Expo config evaluated with **local** env. Values read from env at build time (`EXPO_PUBLIC_*`, `app.config.*` reading `process.env`) can differ in EAS environments — confirm with `eas env:list` when user can run it.
- Android permissions = approximate pre-merge union (app config + library manifests). Built artifact's merged manifest is truth.
- `expo config --type introspect` applies plugins to generic templates: only plugin-added keys trusted (scanner ignores template ATS settings and placeholder ids).
- Copyleft detection reads package `license` fields + license texts embedded in native folders, not every source file.
- Bare projects parsed with regexes (Gradle, pbxproj, plist): unusual build scripts can hide values — confirm in IDE or build output.
- Regex code signals miss things and match comments.
