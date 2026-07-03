---
name: mobile-verify
description: Audit Expo mobile project against architecture decision standard and deployment baseline — bundle must build, expo-doctor clean, 8 decision questions answered with repo evidence, no secrets in public bundle, structure guard functional. Use after mobile-build, or standalone to audit any existing Expo project against the standard. Read-heavy; only writes fixes for failures it finds.
---

# mobile-verify

Input: project directory (freshly built or existing). Output: pass/fail checklist report with evidence per item.

Run every gate command anchored to project dir — `(cd <project> && cmd)` subshell or absolute paths; cwd drifts across Bash calls.

Read `${CLAUDE_PLUGIN_ROOT}/references/decision-standard.md`, `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`, and `${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-f-expo.md` (distribution mode recorded in `docs/ADR.md`; no ADR → audit against decision standard only, flag missing ADR as failure).

## 1. Build gate

- `npm install` then `npm run check`.
- Bundle check, no accounts or devices needed: `npx expo export --platform ios --platform android` (add `--platform web` when ADR mode is PWA/both) — Metro bundles all targets, catches import/asset errors.
- Failure → fix, re-run. **Cap 3 fix attempts.** Still failing → stop fixing, report exact errors honestly. Never claim pass.

## 2. Doctor gate

`npx expo-doctor`. Failures → fix (within same 3-attempt cap) or report. Warnings → list in report.

## 3. Decision standard — 8 questions

Audit each against repo evidence per decision-standard.md evidence column. Concrete checks:

- Secrets: `.env.example` exists; `.env*` in `.gitignore`; **grep tracked files for key/token/secret literals AND for non-`EXPO_PUBLIC_`-prefixed env references holding credentials — any hit = fail (bundle is public)**. Backend present → `server/.dev.vars` gitignored, `.dev.vars.example` committed.
- Token storage: auth present → session persisted via expo-secure-store; grep for tokens in AsyncStorage = fail.
- Run/deploy/logs: npm scripts exist AND README documents them.
- Auth vs audience: compare ADR audience against implemented auth.
- Rollback: README section exists — pull-a-bad-update (`eas update:republish`) or PWA re-deploy, plus per-integration disable/revoke.

## 4. Deployment baseline

- All 10 README minimum-documentation items present (incl. device run steps, both deploy paths).
- Command shape scripts present per ADR distribution mode (`dev`, `check`, `doctor`, `deploy`, `deploy:prod`, `logs`).
- ADR names distribution mode + rung, observability (EAS dashboard / wrangler tail + analytics + feedback channel), offline behavior — offline documented in README when intake required it.

## 5. Structure contract

- `.claude/allowed-paths.json` + `.claude/settings.json` parse as JSON.
- Guard functional — feed forbidden path via stdin, expect exit 0 + stdout JSON with `"permissionDecision":"deny"`:
  ```bash
  echo '{"tool_input":{"file_path":"<repo>/ios/Podfile"},"cwd":"<repo>"}' | node "<repo>/.claude/hooks/folder-structure-guard.cjs"
  ```
- `ios/` and `android/` dirs absent (managed-workflow contract).
- Actual tree matches CLAUDE.md structure table — no dirs outside contract, no forbidden dirs present.

## 6. Path F checks

Run "Verify notes" from `path-f-expo.md`: app boots in Expo Go (manual QR — needs device); backend health + main endpoint respond locally; auth from managed provider (no password-hashing code); native-feature stub only where hypothesis needs it.

Checks needing external accounts or devices (Expo Go boot on phone, EAS publish, TestFlight, live Cloudflare URL) → don't fake: mark "pending — needs <account/device>", list as user follow-up.

## Report

```
## Verify report — <project>
Build gate: PASS/FAIL (evidence)
Doctor gate: PASS/FAIL (+warnings)
Decision standard: 8 rows — PASS/FAIL + evidence each
Deployment baseline: PASS/FAIL per item
Structure contract: PASS/FAIL
Path F checks: PASS/FAIL/PENDING per item
Verdict: READY FOR VALIDATION DISTRIBUTION / NOT READY (blockers listed) / READY WITH PENDING ITEMS
```

Escalation triggers recorded in ADR → verdict caps at "NOT READY — escalation pending decision owner".
