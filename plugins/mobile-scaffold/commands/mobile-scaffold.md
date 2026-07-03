---
description: Scaffold a mobile app the agentic way — discover idea, pick distribution mode (PWA / native / both) and lightest credible Expo architecture, approve ADR, build via create-expo-app, verify against decision standard. Full pipeline, one command.
argument-hint: [one-line idea (optional)]
allowed-tools: AskUserQuestion, Skill, Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch
---

# /mobile-scaffold

Full pipeline: discover → decide → build → verify. Idea → distribution-ready Expo validation project, lightest credible architecture, strict structure.

`$ARGUMENTS` = optional one-line idea. Missing/empty → fine, intake asks. Present → seed intake, skip answered questions.

## Resume check first

Current dir (or named target) already has `docs/ADR.md` → prior run. Read it, summarize, AskUserQuestion: resume at build / resume at verify / start over / abort. Skip re-interview on resume.

## Pipeline

1. **Discover** — run `mobile-discover` skill. Ends with intake summary. Escalation trigger + user chose stop → end here.
2. **Decide** — run `mobile-decide` skill. Mobile ladder → distribution mode → Path F stack → ADR → user approval. Rung-1 outcome (no-code tool suffices), rung-2 outcome (desk web app → `/web-scaffold`), Flutter insisted, or abort → end here, no files written.
3. **Build** — run `mobile-build` skill with approved ADR.
4. **Verify** — run `mobile-verify` skill on built project.

Each stage consumes prior stage's output from conversation. No state files beyond project itself — filesystem is the checkpoint.

## Final report

After verify, single summary:

- Verdict from verify report.
- Local run: `npm run dev` — scan QR with Expo Go on phone.
- Distribution, per ADR mode:
  - PWA: `npm run deploy` → Cloudflare URL; remaining account setup (wrangler login).
  - Native: `npm run deploy` (EAS Update) / `npm run deploy:prod` (internal-distribution build); remaining setup: `npm i -g eas-cli`, `eas login`, `eas init`.
- Env vars to fill (from `.env.example` — all `EXPO_PUBLIC_`, all public).
- Escalations pending decision owner, if any — distribution blocked until cleared (incl. Apple $99/yr / Play $25 account purchases, trigger 9).
- ADR location: `docs/ADR.md`.
- Cost note: EAS free tier + expected tier + shutdown path (from ADR).
- Delivery-target framing: "On a phone today via Expo Go. First shareable artifact target: 1–2 working days — `npm run deploy` after account login."

## Failure handling

- Stage stops (incomplete intake, aborted ADR, scaffolder/network failure, build gate fail after 3 fixes) → report exact state + what user must do. Never fake progress past a failed stage.
- Network/registry down mid-build → project may be partial; say which steps completed, resume path via this command.
- EAS build queue/failure → project still runs locally via Expo Go; report which distribution steps remain.
