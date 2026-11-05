---
description: Full store-readiness audit of a React Native or Expo app, stage by stage — TestFlight internal, TestFlight external, App Store, and Play internal, closed, open and production. Scans the app read-only, evaluates every check against current Apple and Google Play policies, writes a readiness report (verdict per stage, blockers in fix order, store-console tasks) and publishes or refreshes a shareable claude.ai dashboard. Use when asked whether an RN/Expo app is ready for the App Store or Play Store, for a pre-submission audit or store checklist, before a first TestFlight / Play upload, or "what blocks us from closed testing / production?".
argument-hint: [app directory] [release .aab/.apk]
allowed-tools: Skill, Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, WebFetch, WebSearch, Artifact, ArtifactData
---

# /rn-store-readiness

Full pipeline: scan → evaluate → dashboard. **Read-only on app code + config** — only file written into app is readiness report (plus `node_modules` when user approves install). Fixes only when user asks afterwards.

## Arguments

`$ARGUMENTS` — optional, any order:
- directory → app root (default `${CLAUDE_PROJECT_DIR}`)
- path ending `.aab` / `.apk` → release artifact for 16 KB + merged-manifest checks

Path that doesn't exist → STOP, name it. Token that's neither → ask what it is; don't guess.

## Pipeline

1. **Scan** — invoke skill `rn-store-scan` with app root. Resolves app root + work dir, installs dependencies only with consent, writes `store-scan.json`. Stops → end here, relay why.
2. **Evaluate** — invoke skill `rn-store-evaluate` with app root (+ artifact path). Health commands, every catalog check confirmed with evidence, artifact checks via `android-16kb-check`, policy freshness, verdicts via bundled script, report written.
3. **Dashboard** — invoke skill `rn-store-dashboard`. Publishes or refreshes claude.ai dashboard, links it at top of report. No Artifact tool → skipped, say so.

Each skill owns its preflight and failure handling. Don't reimplement here.

## Final summary

- Stage table — verdict of record from `rn-store-evaluate`. Never present a stage READY the script didn't compute READY.
- Blockers in fix order, earliest blocked stage first.
- Report path · dashboard link (or "skipped").
- Not checked: no artifact, no device run, unconfirmed console items.
- Offer fixes, starting with earliest blocked stage.
