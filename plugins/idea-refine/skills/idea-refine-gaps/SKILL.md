---
name: idea-refine-gaps
description: Run one refinement pass on an idea against its incubation-review gaps — classify each gap by dimension (buildability/market/business), fan out only the matching refine analysts to close them with cited web research, then synthesize a refined one-liner with per-gap fixes and flag any gap that came back unclosable. Use inside idea-refine-loop each iteration, or standalone to close a known SUMMARY's gaps. Does not score — the gate owns the verdict.
---

# idea-refine-gaps

Turn a review's open gaps into a **refined idea** backed by cited evidence — or an honest "this gap won't close." One pass; the loop re-gates the result.

Input from caller: current idea text, the SUMMARY gaps (+ Q1/Q2/scorecard context), track.

## Step 1 — Classify the gaps

Read `## Gaps to close (to reach READY)` plus Q1 (buildable?) and the scorecard lines. Bucket each open gap by dimension:
- **buildability** (Q1) — software-first, Architecture Decision Standard nos, stack forced to custom infra, 30-day MVP not credible, deploy-blocking escalation trigger.
- **market** — undefined segment, no competitive analysis, weak / mandated-only adoption, day-120 traction unrealistic.
- **business** — no revenue driver, no $2–20M ARR path, high cost of sale, no virality, spend over caps, no owner.

Only dimensions with an open gap get worked. No gaps in a dimension → skip its analyst.

## Step 2 — Fan out (one message, parallel)

Spawn **only the analysts whose dimension has open gaps** — mirror `incubation-research`'s parallel fan-out. Pass each: the current idea, the exact gaps in its dimension, the track. Each writes ONE cited brief:
- `refine-market-analyst` → `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/REFINE-market.md`
- `refine-business-analyst` → `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/REFINE-business.md`
- `refine-buildability-analyst` → `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/REFINE-buildability.md`

Each brief: per gap, either the cited evidence / concrete reframe that closes it, or **UNCLOSABLE** with why (no real evidence, or a fundamental block). Any agent failed / empty → retry once, else note the gap unclosed.

## Step 3 — Synthesize

Merge the briefs into:
- **Refined one-liner** — the idea rewritten so the closable gaps are closed (sharper segment, named revenue driver, software-first reframe). Keep it one product, not a pile of patches.
- **Per-gap changelog** — `<gap> → <what changed / evidence> · <url>`.
- **Sources** — rolled up from the briefs.
- **Unclosable gaps** — every gap an analyst marked UNCLOSABLE, with its reason.

## Return

Hand the loop: refined one-liner, per-gap changelog, sources, and the unclosable-gap list. Do **not** re-score — `incubation-scorecard` owns the verdict.

## Rules

- Work only the open gaps. Don't rewrite what already passed.
- A gap is closed only with a fetched URL behind it. No source → leave it UNCLOSABLE, don't paper over it.
- Software-first fail is buildability's call — if that analyst says UNCLOSABLE, carry it up unchanged. Don't cosmetically reword a service that needs people.
- One refined idea out, not five variants. The loop gates one.
