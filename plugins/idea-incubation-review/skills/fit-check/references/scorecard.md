# Scorecard & framework facts

Single source of truth for the fit-check score. Everything here is drawn from PIH01, PIH05, PIH08, PIH09, PIH10.

## Framework facts (the numbers you score against)

**Five business requirements (Commercial):**
1. Software-first only — no significant labor or physical presence through profitability.
2. 3-year revenue path to **$2M–$20M ARR**.
3. Viable MVP launched within **30 days** of proposal approval.
4. By **day 120**: minimum **20 SMB** or **1,000 consumer** users **and** initial paying-customer revenue.
5. By **day 180**: cash-flow positive **including labor costs**.

**Spend caps (first 4 months):** $10k labor · $5k marketing (marketing needs Dmitry approval before commitment). Platform spend: prefer usage-based/cancellable; above $5k needs Dmitry.

**Milestone clock:** proposal (weekly) → 30-day launch → 60/90-day reviews → 120-day requirements → 180-day cash-flow → spin-off.

**Spin-off thresholds:** sustained **$20k/mo revenue AND $10k/mo profit**.

**Decision vocabulary:** READY / REFINE / RETHINK (1st pass) · CONTINUE / ITERATE / KIV / TERMINATE (internal monthly + milestone reviews) · Approve / Deny / Modify (Dmitry's proposal review).

## Classification — Commercial or Internal Track

All ideas enter through the 1st Pass, which also classifies them.

- **Commercial Venture** — targets an external customer and can credibly pursue the five business requirements. → commercial scorecard below → registry → Dmitry's weekly proposal review.
- **Internal Improvement / Service** — primarily serves an internal department or group, usable as a product inside the org, not yet ready for commercial criteria. → internal scorecard below → Internal Pilot gate (runs on practice time, no spend cap, no fixed clock; success = user satisfaction + adoption).

Many internal ideas are commercial ideas that aren't ready yet. When unsure, default Commercial and note that Internal Track is the lighter alternative. Reclassification later is fine.

## Commercial readiness scorecard (10 lines)

Score each line **0, 1, or 2**. Line 1 is the hard gate.

| # | Line | A "2" looks like |
|---|------|------------------|
| 1 | **Software-first fit (hard gate)** | Runs as software; no significant labor or physical presence to reach profit. |
| 2 | Revenue path | A believable 3-year model toward the $2M–$20M ARR target, with a named driver. |
| 3 | 30-day MVP | A scoped MVP one small team can launch in 30 days on an approved platform. |
| 4 | Day-120 traction | A concrete acquisition plan that could hit the day-120 user + revenue targets. |
| 5 | Day-180 cash flow | A clear line from revenue to covering labor. |
| 6 | Demo | A runnable demo, or a credible plan to build one fast. |
| 7 | Owner & Business Guru | A clear, accountable owner and a named or likely Business Guru. |
| 8 | Hypothesis | Falsifiable, with a clear "we will know it is true if…", **targeting the riskiest market assumption** — not a safe one. Assumptions stated as "obvious" get flagged, not a free pass. See `references/assumption-testing.md`. |
| 9 | Spend | Fits the published caps, or the exception is named and justified. |
| 10 | Risk | Data, security, integration, and brand risks identified and controllable. |

**Thresholds (guidance, not law — one fatal gap outweighs a high total):**
- **READY FOR DMITRY** — software-first = 2, nothing scores 0, total **≥ 15**. Add to registry, build the Proposal.
- **REFINE & RE-PASS** — software-first ≥ 1, total **9–14**, or a couple of clear gaps. Fix, pass again.
- **RETHINK** — software-first = **0**, total **≤ 8**, or no owner. Reshape or park. (Owner can still go to Dmitry; this is advice, not a block.)

## Internal Track readiness scorecard (10 lines)

Same format. Line 1 is the hard gate, reframed for internal.

| # | Line | A "2" looks like |
|---|------|------------------|
| 1 | **Software-first fit (hard gate)** | Delivered as software; no new headcount or manual process to operate it. |
| 2 | Internal pain or value | A real pain point or service gap, with the affected department/group named. |
| 3 | Usable build | A scoped tool one team can stand up under practice time (PRA) on an approved platform. |
| 4 | Reach & adoption | A concrete set of target users likely to actually use it. |
| 5 | Measurable benefit | A clear line to time saved, cost avoided, or risk reduced. Rough numbers fine. |
| 6 | Demo or plan | A runnable demo, or a credible plan to build one under practice time. |
| 7 | Owner & maintainer | An accountable owner now, and a likely team to own/maintain it if adopted. |
| 8 | Hypothesis | Falsifiable, with a clear "we will know it is useful if…", targeting the riskiest assumption about adoption — not a safe one. See `references/assumption-testing.md`. |
| 9 | Fit with PRA | Fits within practice time without derailing committed sprint work. |
| 10 | Risk | Data, security, integration, brand risks controllable — attention to employee data & production systems. |

**Thresholds:**
- **READY FOR PILOT** — software-first = 2, nothing scores 0, total **≥ 15**. Route to the Internal Pilot gate (Dmitry authorizes scope + risk; no spend, no five-criteria case).
- **REFINE & RE-PASS** — software-first ≥ 1, total **9–14**, or a couple of clear gaps.
- **RETHINK** — software-first = **0**, total **≤ 8**, or no owner.

Internal success is judged by **satisfaction + adoption**, not revenue. Promotion to the commercial cycle re-enters at Stage 1 (the Proposal) and must prove all five commercial criteria fresh — internal adoption proves the tool is useful, not that an external customer will pay.

### Internal maturity — the three phases (locate this before routing)

An internal idea sits at one of three phases. Locate it; it decides where the idea can go.

- **Phase 1 — useful to *you*.** The builder finds it useful. This is the **floor, not success** — most internal tools are stuck here.
- **Phase 2 — useful to your *department or the company*.** Adopted and valued beyond the builder. A few tools reach here. Getting from 1 → 2, and then past 2, is the hard part.
- **Phase 3 — evidence of a market *outside* the company.** Only here is it a studio / commercial candidate. Below Phase 3 it is *just an internal product built for internal use* — do not route it to the commercial path.

**The Phase 2 → 3 bar is "loved broadly," not "adopted."** Point the Sean Ellis test inward: run the "very disappointed" survey on broad internal users. Adoption counts can be inflated by a mandate; *love* (would be very disappointed to lose it) is what signals the tool has legs beyond the org. A tool nobody would miss is not Phase 3, whatever its usage numbers say.

Studio-readiness = **Phase 3**. That is the framework's *Promote*, and it still re-enters at Stage 1 and must prove the five commercial criteria fresh. Be demanding here — do not inflate a Phase-1 "useful to me" tool into a commercial candidate. If an internal idea is scored, report its phase (1 / 2 / 3) and, unless it is Phase 3 with an external-market signal, its honest outcome is "keep proving it internally," not "take it to the studio."
