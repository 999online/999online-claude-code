---
name: mobile-decide
description: Pick lightest credible mobile architecture for a specced idea and write Architecture Decision Record (ADR) for user approval. Walks mobile complexity ladder, picks distribution mode (PWA / native / both) per Path F "prefer PWA" rule, chooses Expo stack per layer. Use after intake exists (from mobile-discover or conversation), before any build. Not for reviewing existing architecture.
---

# mobile-decide

Input: intake summary (from `mobile-discover` or equivalent conversation context). Output: approved ADR in conversation. **No file writes — approval gate happens here.**

Missing intake (no hypothesis or audience known) → stop, run intake first via `mobile-discover`.

Read `${CLAUDE_PLUGIN_ROOT}/references/doctrine.md` and `${CLAUDE_PLUGIN_ROOT}/references/decision-standard.md`.

## 1. Walk mobile complexity ladder

Bottom-up, stop at first rung that tests hypothesis honestly:

- Rung 1 (no app) holds → say so: "This needs a Tally form / Airtable base / chat workflow, not an app." Name tool, outline setup, offer to stop. Legit outcome — scaffolding here is waste.
- Rung 2 (pure desk web workflow, zero on-phone context) → recommend `/web-scaffold`; not installed → `/plugin install web-scaffold@999online` first. Stop — this plugin builds phone-first apps.
- Rung 3+ → Path F. Read `${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-f-expo.md`.
- Idea needs rung 7 (bare workflow, custom native modules beyond Expo SDK) → flag: more justification needed, capture reasoning in ADR "Why fastest credible path", consider simplifying scope first.

## 2. Pick distribution mode

Path F standard: **prefer PWA when app-store distribution is not part of the hypothesis.** One Expo codebase covers all modes — this decides which outputs ship first.

- **PWA mode** — native features none-or-browser-capable (photo via file input, basic geolocation) AND store not in hypothesis → Expo web output, Cloudflare URL. Lightest shareable artifact.
- **Native mode** — device features beyond browser (push, offline capture, background, biometrics, camera UX) or store-install part of the learning → Expo Go → dev build (only if custom native modules) → EAS internal distribution.
- **Both** — PWA for reach + native internal build for device features.

State mode + reason. User wants native despite PWA verdict → push back once with Path F reason, then follow user decision, record override as known risk.

Record mode + target rung (from `${CLAUDE_PLUGIN_ROOT}/references/deployment.md` validation ladder) in ADR — drives escalations (Apple/Play accounts) and verify baseline.

## 3. Pick stack

From `path-f-expo.md`: default = first option per layer. Backend layer only when intake shows persistence/auth/API → Hono + Cloudflare Workers in `server/`. Override only for user constraint (existing account, team skill, stated preference) — record override reason in ADR. Respect path's Avoid list; user asks for avoided thing → push back once with doctrine reason, then follow user decision and record it as known risk.

User insists on Flutter/Ionic → state: this plugin scaffolds Expo only; those are allowed by incubation standards but mean running their scaffolder outside this pipeline. Record decision, stop before build.

Design to pass all 8 questions in `decision-standard.md` — auth per audience, secrets outside bundle, observability chosen, rollback path known.

## 4. Draft + approve ADR

Fill every field of `${CLAUDE_PLUGIN_ROOT}/references/adr-template.md` — including Platforms, Native features, Distribution mode + rung, Offline behavior, Device permissions, Store accounts. "None" valid, blank not. Decision owner unknown → ask user who makes promote/pause/terminate call.

Print full ADR. Then AskUserQuestion: **approve** / **change mode** / **change stack** / **abort**. On change → adjust, reprint, re-ask. On abort → stop clean. On approve → hand ADR to build.
