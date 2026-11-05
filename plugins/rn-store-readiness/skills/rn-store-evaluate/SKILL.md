---
name: rn-store-evaluate
description: Judge a React Native or Expo app's store readiness per stage — TestFlight internal, TestFlight external (Beta App Review), App Store, and Play internal, closed, open and production — from rn-store-scan output, code reading, project health commands and a gated catalog of current Apple and Google Play policies. Confirms or rejects every scanner finding with file:line evidence, computes BLOCKED / AT RISK / READY per stage with the bundled verdict script, and writes the readiness report (blockers in fix order, findings, store-console checklist). Use as step 2 of /rn-store-readiness, or standalone to re-evaluate after fixes. Not for publishing the dashboard (rn-store-dashboard); never changes app code.
---

# rn-store-evaluate

Evaluate, then report. **Never change app code or config** — fixes only when user asks afterwards. **Never mark check passed without evidence.**

Input: `$ARGUMENTS` = app directory (optional), release `.aab` / `.apk` path (optional).

## Stages

| Code | Stage | Typical gate |
| --- | --- | --- |
| I1 | iOS — TestFlight internal | Signed store build uploads and processes |
| I2 | iOS — TestFlight external | Beta App Review (most App Review rules) |
| I3 | iOS — App Store | Full App Review + listing |
| A1 | Android — Play internal testing | AAB uploads, signing, target API |
| A2 | Android — Play closed testing | Play review + App content declarations |
| A3 | Android — Play open testing | Public listing |
| A4 | Android — Play production | Production access + full policy compliance |

Cumulative per platform: A2 inherits everything gated at A1.

## Preflight

`rn-store-scan` not yet run this session for this app → invoke skill `rn-store-scan` first. It resolves app root + work dir `<work>` and writes `<work>/store-scan.json`. Scan stopped → STOP, relay why. Use app root + `<work>` it resolved; respect its scanner limits.

## 1. Scope

Read docs scanner listed (`project.docs`: README, CLAUDE.md, AGENTS.md, ADR…): declared platforms, current distribution stage, open escalations, known shortcuts. Default: every stage, both platforms. Ask only when answer changes verdict.

## 2. Health (BLD-09)

Run project's typecheck, lint, unit tests (scripts in `package.json`, project's package manager) and, for Expo, `npx expo-doctor` (needs network). Quote failures verbatim. List commands skipped + why. Never call failing gate passed.

## 3. Evaluate every check

Read `${CLAUDE_PLUGIN_ROOT}/references/checks.md` — each check has gate, severity, how verified. For each:

- **Scanner finding** → open its evidence, confirm. `fail` → FAIL · `warn` → LIKELY until confirmed (then FAIL, or PASS when evidence shows it's wrong) · `verify` → VERIFY · `pass` → PASS · `na` → N/A. Regex signals miss things and match comments — confirm before reporting.
- **`code` check** → follow recipe, cite file:line.
- **`manual` check** (store console, people) → VERIFY unless user or project docs confirm.
- **RISK** = judgment that reviewer may reject (login wall, AI disclosure wording, thin features).

## 4. Artifacts (optional)

Release AAB/APK given (or local release build output, or latest EAS build once user agrees to download with their login):
- Invoke skill `android-16kb-check` on it → confirms or clears BLD-07.
- `bundletool` installed → `bundletool dump manifest --bundle <app.aab>` → final merged permission list (CFG-04).

No artifact → BLD-07 stays as scanner left it; list under "Not checked".

## 5. Policy freshness

Read `${CLAUDE_PLUGIN_ROOT}/references/policy-dates.md`. "Last verified" more than 90 days before today → re-check rows verdicts depend on against listed official sources (WebFetch / WebSearch), note what changed in report, tell user which rows + scanner `POLICY` constant are stale — fix belongs in plugin's source repo, not installed copy. Offline → say policies unverified, keep dated values.

## 6. Verdicts

1. Pick report path first (step 7) — `readiness.json` records it.
2. Write `<work>/readiness.json` per `${CLAUDE_PLUGIN_ROOT}/references/readiness-schema.md`: every reported check, passing ones included; `watch` = dated rules, open decisions, what wasn't checked; `console` = tasks from `${CLAUDE_PLUGIN_ROOT}/references/console-tasks.md` adapted to app.
3. Run:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/scripts/build-dashboard-data.mjs <work>/readiness.json --out <work>/dash
   ```

   Exit 2 → fix every problem it lists, re-run. Printed stage table = **verdict of record** for report and dashboard. Never hand-edit verdicts.

Script rules, per stage, over checks gated at or before it on that platform:

- **BLOCKED** — any FAIL or LIKELY with severity `blocker`.
- **AT RISK** — no blocker, but FAIL / LIKELY / RISK with severity `high`, RISK with severity `blocker`, or VERIFY with severity `blocker` or `high`.
- **READY** — neither. Open medium/low findings don't change verdict; list them anyway.

Deferral project documents (e.g. "no iOS until Apple account approved") doesn't change verdict — mention it next to stage.

## 7. Report

Path: user-named; else `docs/store-readiness.md` when project keeps `docs/`; else `STORE-READINESS.md` at app root. Check project structure rules (CLAUDE.md, `.claude/rules/`) first; both disallowed → ask. Existing report with `Overview dashboard: <url>` line → keep that line (dashboard refresh reuses page).

Fill `${CLAUDE_PLUGIN_ROOT}/assets/report-template.md`:
- Stage table from step 6, verbatim.
- Fix order — earliest blocked stage first: `[ID] what — why it blocks — fix — effort S/M/L`.
- Findings by area; console checklist per stage (tick only what user or docs confirm); what was run; not checked / assumptions; policy sources.

## 8. Summary

Chat: stage table, blockers in fix order, report path, `<work>/readiness.json` path. Run standalone → mention `rn-store-dashboard` publishes shareable dashboard from it. Offer fixes, starting with earliest blocked stage.
