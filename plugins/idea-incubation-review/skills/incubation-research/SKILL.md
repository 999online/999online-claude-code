---
name: incubation-research
description: >
  Run parallel research on a raw idea for 999 idea incubation — classify track
  (Commercial vs Internal), then fan out three analysts (architecture/buildability,
  market/adoption, business viability) that each write one cited dossier to
  docs/incubation/<slug>/. Use as the first step of /incubation-review, or standalone
  to gather evidence before scoring. Not for scoring/verdict — that's incubation-scorecard.
---

# Incubation research

Gather cited evidence before any verdict. Analysts do the digging in parallel, isolated contexts. Don't research inline.

## Inputs
Idea description (from `$ARGUMENTS` or the caller). Missing → ask user for a one-line idea, stop.

## Flow

### 1. Slug + track
- Slug: kebab-case from idea (e.g. "standup summary bot" → `standup-summary-bot`).
- Classify track: **Commercial** (outside customers pay) vs **Internal** (org staff use it, not yet commercial). Ambiguous → default Commercial, note it. Track is passed to `incubation-scorecard` (picks page-09 vs page-10 scorecard).

### 2. Resume check
Dossier already on disk for this slug (`${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/<FILE>.md`) → don't re-spawn that analyst. Resume-safe.

### 3. Fan out (parallel)
Spawn all three in one message. Pass each the idea description, notes, slug. Each writes ONE dossier to `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/`:

- `incubation-architecture-analyst` → `BUILDABILITY.md` (software-first gate, 8-Q standard, stack rung, 30-day MVP, escalation).
- `incubation-market-analyst` → `MARKET.md` (segment, competition, adoption ladder, day-120 realism).
- `incubation-business-analyst` → `BUSINESS.md` (ARR path, milestones, caps, spin-off, cost of sale, virality).

### 4. Confirm
All three dossiers written + each closing verdict line present. Any analyst failed / empty → report which, retry once, else note the gap for scorecard.

## Output
Report slug, track, dossier paths. Hand to `incubation-scorecard` for the verdict.
