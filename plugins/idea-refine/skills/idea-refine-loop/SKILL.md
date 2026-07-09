---
name: idea-refine-loop
description: Orchestrate refining one existing idea to a READY verdict — preflight (require idea-incubation-review), gate the idea, read the review's gaps, invoke idea-refine-gaps to close them with cited web research, re-gate, loop until READY or a bounded stop. Pushes back honestly (software-first fail, unclosable fatal gap, non-convergence) instead of faking a pass. Use when the user runs /refine-idea or asks to fix an idea that failed incubation review.
---

# idea-refine-loop

Drive **one existing idea to READY** on the idea-incubation-review gate, or prove it can't and push back. Web-grounded, cited. Bounded — never spin.

Input: `idea-or-slug` from the caller (one-line idea, or a slug already reviewed).

## Preflight

1. **Require idea-incubation-review.** Probe for its skills `incubation-research` + `incubation-scorecard` (or command `/incubation-review`). Not available → STOP:
   > idea-refine needs the idea-incubation-review plugin (it's the gate every refinement re-passes). Install it, then re-run:
   > `/plugin install idea-incubation-review@999online`
2. **Set expectations.** Say once: each iteration re-runs a full incubation-review (3 analysts) plus refine research — token-heavy by design. Cap = 3 iterations.

## Resolve input → baseline verdict

- Arg matches an existing `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/SUMMARY.md` → read it, start from that verdict + gaps. Skip the baseline gate.
- Else treat arg as idea text → **gate it once** for a baseline: `incubation-research <idea>` → slug + track, then `incubation-scorecard <slug> <track>` → writes `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/SUMMARY.md`. Read it.

Already READY at baseline → present it, stop (nothing to refine).

## Loop

`iteration = 0`, cap `3`. Hold each iteration's **decisive gap** (from `Decisive factor:` / `Fatal gap:`) in context — need it to detect non-convergence.

While verdict != `READY` and `iteration < 3`:
1. `iteration += 1`.
2. Read the current SUMMARY: `## Verdict` line, `## Gaps to close (to reach READY)`, the Q1 software-first hard-gate line, `Decisive factor:` / `Fatal gap:`.
3. **Pushback checks first — the un-fixable. Stop, don't grind:**
   - **Software-first hard gate FAIL** (Q1) → idea needs people / manual ops / physical presence to run. Not a wording fix. Pushback (reshape into software-only or park).
   - **Non-convergence** → this iteration's decisive gap equals the previous iteration's and refinement didn't move it. Pushback (the gap won't close, say what was tried).
4. Else `idea-refine-gaps` (pass current idea text, the SUMMARY gaps + Q1/Q2/scorecard context, track) → returns a refined one-liner + per-gap "what changed / evidence" + rolled-up sources, and flags any gap it found **unclosable** (no real evidence).
5. **Any gap flagged unclosable → pushback.** Never fabricate evidence to pass.
6. **Re-gate the refined idea** (idea text changed → new slug): `incubation-research <refined one-liner>` → slug + track, then `incubation-scorecard <slug> <track>` → new SUMMARY. Read the `## Verdict` line. Loop.

## Terminate

**READY** → present the win:
```
### Refined to READY — <refined one-liner>
**Track:** <Commercial | Internal>
**Iterations:** <n>
**What changed** (gap → fix, cited):
- <gap> → <the reframe/evidence that closed it> · <url>
**Before → after:** <baseline verdict> → READY
**Verdict:** docs/incubation/<slug>/SUMMARY.md
```

**Pushback / cap hit** (never present non-READY as a pass) → present the honest status:
```
### Can't reach READY — <current idea one-liner>
**Verdict:** <REFINE | RETHINK>  ·  Track: <...>
**Blocking gap:** <the one gap that won't close>
**Why it won't close:** <software-first fail | no real evidence for X | same gap two iterations>
**Tried:** <what each iteration attempted>
**Recommendation:** reshape (<how>) or park.
**Verdict:** docs/incubation/<slug>/SUMMARY.md
```

## Rules

- **No fake pass.** Only a re-gated `READY` from `incubation-scorecard` counts. Never call it passed from reading dossiers or wanting it to pass.
- **Cited or it didn't happen.** Every refinement rests on a fetched URL. A gap "closed" with no source is not closed — treat as unclosable.
- **Pushback over sycophancy.** If the idea can't pass, say so plainly and why. Don't keep reshaping a fundamentally broken idea to please the user.
- **Bounded.** Cap = 3 iterations. Stop early on software-first fail, an unclosable gap, or the same decisive gap twice. Don't loop forever.
- **Autonomous.** Don't ask the user mid-loop. Only surface a blocker if the gate itself can't run (missing plugin → handled in preflight).
