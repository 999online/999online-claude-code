---
name: incubation-scorecard
description: >
  Score a 999 incubation idea from its research dossiers and produce the verdict —
  reads BUILDABILITY/MARKET/BUSINESS in docs/incubation/<slug>/, applies the rulebook
  20-item self-assessment and the Confluence page-09 (or page-10 internal) scorecard,
  enforces the software-first hard gate, and writes SUMMARY.md answering "buildable per
  operating model?" and "viable per rulebook?" with track, verdict, gaps, and missing
  presenter deliverables. Use after incubation-research, or standalone to re-score a
  revised idea. Owns the authoritative scoring.
---

# Incubation scorecard

Turn dossiers into the two verdicts a 999 dev needs before Dmitry's weekly review. **Scorecard owns the authoritative scoring** — dossiers supply evidence, not scores.

## Inputs
Slug + track from `incubation-research`. Read all dossiers in `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/`. Missing dossier → note it, score what exists, mark affected lines as unproven (not a free pass).

Criteria: `${CLAUDE_PLUGIN_ROOT}/references/pre-presentation-rulebook.md` + `${CLAUDE_PLUGIN_ROOT}/references/operating-model-criteria.md`.

## Hard gate first (short-circuit)
Read BUILDABILITY software-first result. **FAIL → verdict RETHINK, stop.** Write SUMMARY with the gate failure as decisive factor; do not compute or report a rescuing total. A firing escalation trigger that implies mandatory manual ops = same fail. High scores never override a failed hard gate.

## Scoring (gate passed)
1. **Rulebook 20-item.** Tick only items with evidence in the dossiers. Count per group A/B/C/D/E and total. `%` of 20 → Ready ≥90 / Refine ≥60 / Rethink <60.
2. **Page-09 scorecard** (Commercial) or **page-10 variant** (Internal) per track. Score each of 10 lines 0/1/2 from evidence. Total /20 → READY ≥15 / REFINE 9–14 / RETHINK ≤8. Line 1 (software-first) must be 2; no line 0.
3. **One fatal gap outweighs total.** A single decisive gap (no owner, no revenue path, uncontrollable risk) → downgrade verdict + name it. Thresholds are guidance, not arithmetic.
4. Reconcile the two bands into one overall verdict (Ready/Refine/Rethink). Disagree → take the lower, name why.

## Output — write `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/SUMMARY.md`
```markdown
# Incubation Review — <slug>
## Idea            <1–2 lines: what, who for>
## Verdict         **READY | REFINE | RETHINK**  ·  Track: Commercial (09) | Internal (10)  ·  Decisive factor: <one line>

## Q1 — Buildable per Operating Model?   **YES | NO | CONDITIONAL**
- Software-first hard gate: PASS | FAIL   (FAIL → auto-RETHINK, stop)
- Architecture Decision Standard: <n>/8 yes — fails: <list>
- Lightest-credible stack rung: <rung + platform>
- 30-day viable MVP feasible: yes/no — <why>
- Escalation triggers firing: none | <list> (deploy-blocking)
<criteria source: Confluence PIH live | bundled snapshot v1 (+drift note)>

## Q2 — Viable per Rulebook?   **READY ≥90% | REFINE ≥60% | RETHINK**
20-item: <n>/20 with evidence (<pct>%)  ·  A<n> B<n> C<n> D<n> E<n>  ·  Unchecked: <#s>

## Page-09 / 10 Scorecard
| # | Criterion | 0/1/2 | Evidence |
|---|---|---|---|
<10 lines>
Total <n>/20 → READY≥15 / REFINE 9–14 / RETHINK≤8  ·  Fatal gap: none | <the one gap>

## 5 Hard Business Requirements   <software-first · 3-yr $2–20M ARR+driver · 30-day MVP · day-120 (20 SMB/1,000 consumer + paying) · day-180 cash-flow incl. labor — met/unmet each>
## Spend & spin-off   <4-mo caps labor ≤$10k / marketing ≤$5k — within? · spin-off $20k/mo rev AND $10k/mo profit — path?>
## Gaps to close (to reach READY)   <gap → the evidence/change that closes it>
## Missing presenter deliverables   <demo · named owner + Business Guru · written hypothesis · competitive analysis · organic-demand evidence · …>
## Dossiers   BUILDABILITY.md · MARKET.md · BUSINESS.md
## Sources   <rolled up from dossiers + criteria source>
```

## Present
Report the verdict, both band results, track, top 3 gaps. If REFINE/RETHINK, lead with the single most decisive fix.
