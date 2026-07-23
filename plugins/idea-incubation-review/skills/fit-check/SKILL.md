---
name: fit-check
description: Run the 999 1st-Pass readiness review on a venture idea — classify Commercial vs Internal Track, score the 10-line readiness card, enforce the software-first hard gate, run the Sean Ellis product-market-fit lens, flag red-flag business shapes, and return a Ready/Refine/Rethink verdict plus a filled Proposal draft and a pre-filled cheat sheet. Use whenever someone wants to validate, pressure-test, score, sanity-check, or "1st-pass" a business or product idea against the 999 incubation framework — including phrasings like "is my idea software-first", "does this fit the framework", "is this ready for Dmitry", "will this pass the 1st pass", "assess my pitch", or "is this a good incubation idea", even if the word "validate" never appears. Advisory only — this sharpens and scores an idea, it never blocks. Dmitry owns every real gate.
---

# fit-check

Run the 999 1st-Pass readiness review on a venture idea. Input: an idea in any form (a pitch, a brief, an uploaded doc, or answers in conversation). Output — printed in conversation, plus two files: a **Ready / Refine / Rethink** verdict, a scored readiness card, shape do's & don'ts, a filled Proposal draft, and a pre-filled cheat sheet.

**This is advice, not a gate.** It gives the owner a stronger idea, a score, and a recommendation. It never rejects. If the verdict is negative, say plainly that the owner can still take it to Dmitry's weekly review — this is guidance, not a block.

Read `references/scorecard.md` first — classification, both scorecards, thresholds, and the framework facts (five criteria, caps, gates, vocabulary) all live there.

## 0. Intake — only if the idea is too thin to score

Need at minimum: idea name, owner, target user (SMB / consumer / internal dept), the problem, why it's software-first, the revenue idea, the MVP idea. Anything already stated → don't re-ask.

Gaps → ask (AskUserQuestion where available), max 3 rounds, batch related questions. One plain-text retry on empty answers; still nothing → stop, list what's missing. Don't invent facts to fill a score.

## 1. Classify — Commercial or Internal Track

Per `references/scorecard.md`. Targets an external paying customer and can credibly chase the five business requirements → **Commercial**. Primarily serves an internal department or group and isn't ready for the commercial criteria yet → **Internal Track**. Unsure → default Commercial, say so. Route to the matching scorecard — an idea can be reclassified later.

For **Internal Track**, also locate the maturity phase (per `references/scorecard.md`): Phase 1 useful-to-the-builder, Phase 2 useful-to-department-or-company, Phase 3 external-market signal. **Do not route an internal idea to the studio / commercial path until Phase 3** — below it, it's just an internal product. The Phase 2 → 3 bar is "loved broadly" internally (the Sean Ellis test pointed inward), not adoption counts. Be demanding; don't inflate a Phase-1 "useful to me" tool into a commercial candidate.

## 2. Score the readiness card

Score each of the 10 lines **0, 1, or 2**, each with a one-line reason grounded in what the owner actually said. Line 1 (software-first) is the **only** hard gate: a 0 there = RETHINK whatever the total. Apply the thresholds in the reference. One fatal gap outweighs a high total — say which gap if so.

## 3. Shape check — does it ride the clock or fight it?

Read `references/red-flag-shapes.md`. Name the idea's motion (B2B SMB / B2B enterprise / B2C / B2B2C / marketplace / community / PLG / sales-led) and market shape (red ocean / blue ocean / niche / network-effects / regulated). Sum the friction to a shape read: **rides / mixed / fights** the 999 clock. Pull the matching do's and don'ts — these are the concrete fixes.

## 4. Assumption ledger — test the "obvious" beliefs first

Read `references/assumption-testing.md`. Surface the market assumptions the idea rests on — especially the ones stated as self-evident (obviousness is a bias signal, not evidence). Rank by risk × how load-bearing they are, and name the one or two to test first (usually via New Venture Framework problem validation). The line-8 hypothesis should attack the riskiest assumption, not a safe one. An idea whose riskiest assumption is untested is a REFINE however high the rest of the card scores.

## 5. Fit lens — Sean Ellis (early-adopter PMF, re-tested at scale)

Read `references/sean-ellis-fit.md`. Pre-build → prescribe problem-then-solution validation *before* any code. Live with users → prescribe the survey and the **40% "very disappointed"** benchmark as the 60/90-day PMF axis, which the framework leaves undefined. Frame it as **early-adopter** PMF — necessary but not final; it must be re-tested on a broader cohort when the idea scales. Flag any plan that assumes early-adopter love will automatically carry to the mainstream. Note that sales & marketing belong to the *scaling* stage (post-PMF), not to reaching profitability.

## 6. Produce outputs — all of them

Print this block in conversation:

```
## Fit check — <idea name>
Track:    Commercial | Internal
Verdict:  READY | REFINE | RETHINK        (software-first hard gate: PASS/FAIL)
Why:      <one line>

Readiness card — <total>/20
| # | Line | Score | Note |
| 1 | Software-first (hard gate) | 0/1/2 | ... |
...through line 10...

Shape:         <motion + market> — rides | mixed | fights the 999 clock
Fit next step: <Sean Ellis action or validation action>
Test first:    <1–2 riskiest market assumptions — mark any stated as "obvious">
Phase (Internal only): 1 | 2 | 3 — studio-ready only at Phase 3 ("loved broadly" internally)
Top gaps:      <1–3 things to fix before Dmitry>
Flags:         <escalation triggers, if any — advisory>
```

Then write two files and present them (if a file-presenting tool is available; otherwise show inline and offer):

- `<idea>-proposal-draft.md` — fill `references/proposal-template.md`. Mark each of the five requirements **EVIDENCED** or **MUST-PROVE**. Blank is not allowed; "unknown — must prove" is a valid, honest entry.
- `<idea>-fit-check.html` — copy `assets/cheat-sheet.html` verbatim, then edit **only** the `PREFILL` config block near the top of its script (idea header, scored card rows, pre-selected tags, verdict). Change nothing else in the file.

## Guardrails

- **Software-first is the only hard gate.** Never add a new gate — "no new gates, only new names." If a criterion feels like a blocker, it's a REFINE note, not a rejection.
- **Escalation triggers** — sensitive/regulated data, core-system integration, or spend above the $10k labor / $5k marketing caps — are surfaced in `Flags`, not blocked. Note that Dmitry clears them before deploy.
- **Two vocabularies, don't mix:** READY / REFINE / RETHINK is this pass's outcome; CONTINUE / ITERATE / KIV / TERMINATE are downstream milestone decisions.
- **Never present the score as a decision.** The score routes the idea and sharpens it; Dmitry decides.
