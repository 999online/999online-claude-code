---
description: Run initial research on a raw idea and judge it against 999's incubation criteria — fan out research analysts, then score against the Pre-Presentation Rulebook and the Idea Incubation Operating Model. Returns a dual verdict (buildable? viable?), track, scorecards, and gaps before Dmitry's weekly review.
argument-hint: [one-line idea]
allowed-tools: Skill, Read, Glob, AskUserQuestion, Task, Agent, Write
---

Run an incubation review on: **$ARGUMENTS**

No idea given → ask user for a one-line idea, stop.

## Flow
1. **Research** — invoke `incubation-research` skill with the idea. It classifies track, spawns three analysts in parallel, writes dossiers to `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/`.
2. **Score** — invoke `incubation-scorecard` skill with slug + track. It enforces the software-first hard gate, scores the rulebook 20-item + page-09/10 scorecard, writes `SUMMARY.md`.
3. **Present** — show the verdict: READY / REFINE / RETHINK, track, both band results, top gaps. Lead with the single most decisive fix if not READY.

## Notes
- Works with zero setup (bundled criteria). Connected Confluence-reader MCP freshens against live PIH pages + flags drift.
- Resume-safe: existing dossiers for a slug are reused, not re-run.
- Initial research + verdict only — does not draft the Proposal deliverables.
