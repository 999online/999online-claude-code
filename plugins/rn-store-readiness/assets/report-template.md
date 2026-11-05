# Store readiness — {App name}

- **Project:** `{root}` · {project type} · Expo {x} / React Native {y} · commit `{sha}`{, uncommitted changes}
- **Identifiers:** iOS `{bundle id or "not set"}` · Android `{package or "not set"}` · version {version} (iOS build {n}, Android versionCode {n})
- **Evaluated:** {YYYY-MM-DD} with rn-store-readiness {scanner version} · store policies verified {policy date}{ — re-verified today / older than 90 days}
- **Declared scope:** {what the project docs say: target platforms, current distribution stage, open escalations — or "none found"}

## Verdict by stage

| Stage | Verdict | Blocking checks | Next step |
| --- | --- | --- | --- |
| iOS · TestFlight internal (I1) | | | |
| iOS · TestFlight external (I2) | | | |
| iOS · App Store (I3) | | | |
| Android · Internal testing (A1) | | | |
| Android · Closed testing (A2) | | | |
| Android · Open testing (A3) | | | |
| Android · Production (A4) | | | |

**BLOCKED** — at least one blocker gated at or before the stage. **AT RISK** — no known blocker, but high-severity problems or blocker-level items nobody has confirmed. **READY** — nothing blocker- or high-severity open or unconfirmed at or before the stage; medium/low findings may remain (listed below).

## Fix order

<!-- Earliest blocked stage first. One line each: [ID] what — why it blocks — fix — effort S/M/L. -->
1.

## Findings

<!-- Group by area (Build & identity, Native config, Accounts, Privacy, Payments, Legal & content, Assets, Quality, Release ops).
     Status: FAIL (confirmed) · LIKELY (heuristic) · VERIFY (can't tell from the repo) · PASS · N/A.
     Evidence = file:line, config key, command output or scanner fact. Keep each row to one or two sentences. -->

### {Area}

| ID | Status | Severity | Gate | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- | --- | --- |

## Console checklist

<!-- From references/console-tasks.md, per stage. Tick only what the user or project docs confirm. -->

## What was run

- Scanner: `node scan.mjs --root {root}` → {n} findings ({fail}/{warn}/{verify}/{pass})
- Commands: {e.g. `npm run check` → pass; `npx expo-doctor` → 1 issue: …}
- Artifact checks: {e.g. `check-elf-alignment.mjs app.aab` → …, or "no release artifact available"}

## Not checked / assumptions

<!-- e.g. EAS environment variables not readable without login; no device run; backend not inspected. -->

## Policy sources

Verified {date}: {links from references/policy-dates.md that the verdicts depend on}.
