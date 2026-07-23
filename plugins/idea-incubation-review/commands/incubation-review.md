---
description: Run initial research on a raw idea and judge it against 999's incubation criteria — fan out research analysts, score against the Pre-Presentation Rulebook and the Idea Incubation Operating Model, then run the fit-check pass (readiness card, shape check, assumption ledger, Sean Ellis lens) whose verdict is decisive. Returns the fit-check verdict plus supporting scorecard bands, track, and gaps before Dmitry's weekly review.
argument-hint: [one-line idea]
allowed-tools: Skill, Read, Glob, AskUserQuestion, Task, Agent, Write
---

Run an incubation review on: **$ARGUMENTS**

No idea given → ask user for a one-line idea, stop.

## Flow
1. **Research** — invoke `incubation-research` skill with the idea. It classifies track, spawns three analysts in parallel, writes dossiers to `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/`.
2. **Score** — invoke `incubation-scorecard` skill with slug + track. It enforces the software-first hard gate, scores the rulebook 20-item + page-09/10 scorecard, writes `SUMMARY.md`.
3. **Fit check (decisive)** — invoke `fit-check` skill on same idea. Dossiers + SUMMARY.md already in context, so its intake skips (facts already stated). **Fit-check verdict drives the decision.** Scorecard bands (rulebook % + page-09/10) become supporting evidence. Verdicts disagree → fit-check stands; name scorecard divergence as gap to reconcile. Software-first gate FAIL is RETHINK under both — no conflict there. After it runs, append `## Fit check (decisive)` section to `SUMMARY.md`: verdict, shape read, test-first assumptions, PMF next step — on-disk record matches presented decision.
4. **Present** — lead with fit-check verdict: READY / REFINE / RETHINK + its single most decisive fix if not READY. Then track, scorecard bands as support, top gaps, and the proposal draft + cheat-sheet files fit-check produced.

## Notes
- Works with zero setup (bundled criteria). Connected Confluence-reader MCP freshens against live PIH pages + flags drift.
- Resume-safe: existing dossiers for a slug are reused, not re-run.
- Initial research + verdict only — does not draft the Proposal deliverables.
