---
name: android-16kb-check
description: Check Android native libraries for Google Play's 16 KB page-size requirement — reads a release .aab, .apk, .aar or .so (or a folder of them) with a bundled zero-dependency script, reports each 64-bit library's smallest ELF LOAD-segment alignment (must be ≥ 16 KB) and, for uncompressed libraries in APKs, 16 KB zip alignment, then traces failing libraries to the package that ships them and names the fix. No Android SDK needed. Use when asked "is my AAB/APK 16 KB compatible?", before a Play upload targeting Android 15+, or to confirm check BLD-07 for rn-store-evaluate. Not for iOS builds.
---

# android-16kb-check

Play rejects new apps and updates targeting Android 15+ whose 64-bit native libs aren't 16 KB-aligned (dates in `${CLAUDE_PLUGIN_ROOT}/references/policy-dates.md`). Built artifact = truth; source heuristics only guess. **Read-only** — never modifies artifact or project.

Input: `$ARGUMENTS` = one or more paths: `.aab`, `.apk`, `.apks`, `.aar`, `.zip`, `.so`, or folder (scanned recursively, skips `node_modules` / `.git`).

## Preflight

1. **Node.** `node --version` missing or < 18 → STOP: "android-16kb-check needs Node ≥ 18."
2. **Artifact.** Given path missing → STOP, name it. No path → look under `${CLAUDE_PROJECT_DIR}`: `android/app/build/outputs/bundle/*/*.aab`, `android/app/build/outputs/apk/release/*.apk`, `*.aab` / `*.apk` at root (EAS local builds). Found → confirm which with user. None → ask for path; EAS project → offer to download latest Android build (`eas build:list --platform android --limit 1`) only with user's consent and login. Still none → STOP: source trees and debug builds don't prove alignment.

## Run

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/check-elf-alignment.mjs <file-or-dir> [...]
```

`--json` for machine-readable output. Exit 0 = every 64-bit lib aligned · 1 = at least one `UNALIGNED` · 2 = usage or read error → quote stderr, STOP.

Per-lib status: `ALIGNED` (LOAD alignment ≥ 16 KB, zip-aligned when stored uncompressed in APK) · `UNALIGNED` · `EXEMPT` (32-bit or unknown ABI — rule covers 64-bit only) · `NOT-ELF` · `ERROR`.

## Interpret

Quote output. For each `UNALIGNED` lib:

1. **Find owner.** `.so` name → search app's `node_modules` for `CMakeLists.txt` with `add_library(<name>`, `Android.mk`, or prebuilt `.so` / `.aar` with that name. Cite file.
2. **Fix by cause:**
   - Library compiles own native code with NDK < r28 → upgrade library; or patch its CMake arguments with `-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON` (`patch-package`); or build with NDK r28+. React Native's Gradle plugin adds that flag only to app's own CMake build, not libraries'.
   - Prebuilt `.so` / `.aar` → vendor must rebuild with `-Wl,-z,max-page-size=16384`; upgrade or replace library.
   - `zip:NOT-16K` (uncompressed lib in APK) → Android Gradle Plugin ≥ 8.5.1 zip-aligns at 16 KB.
   - Core React Native lib unaligned → React Native ≥ 0.77 / Expo ≥ 53.0.14 ship aligned core libs; upgrade.
3. **Cross-check** in Play Console → App bundle explorer (shows 16 KB support per bundle) when user has access.

## Report

```
16 KB check — <artifact> · <n> libs · <n> UNALIGNED (64-bit) · <n> errors
Verdict: 16 KB READY | NOT READY
UNALIGNED: <lib> (<abi>, align <n>) — owner <package> — fix <…>
```

`EXEMPT` / `NOT-ELF` rows don't affect verdict. `ERROR` rows → verdict unknown for those libs; say so.
