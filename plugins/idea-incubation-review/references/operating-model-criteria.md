# Operating Model criteria — snapshot

Source: Confluence space **PIH** (Product Incubation Hub), "Idea Incubation Operating Model". Sole decision authority: Dmitry, at every gate.

**Snapshot v1 (2026-07-02).** Bundled distilled criteria. Authoritative for this plugin when no live source connected. If Confluence-reader MCP connected, fetch live pages and flag drift — see `confluence-mcp-setup.md`. Distilled structure + thresholds only; not verbatim internal prose.

---

## Two tracks

- **Commercial** — new business to spin off. Scored by page-09 scorecard (below). Must meet 5 hard requirements.
- **Internal Proving Ground (page 10)** — solves internal pain, usable in org, not yet commercial-ready. No spend cap, no fixed milestone clock. Success = target-user satisfaction + adoption. Ends Adopt / Promote / KIV / Terminate. Scored by internal scorecard variant (below).

Classify idea first. Commercial = outside customers pay. Internal = org staff use it. Promotion from internal to commercial re-proves all 5 commercial criteria from scratch.

---

## Hard gate (both tracks, outranks everything)

**Software-first only.** Delivered and operated as software through profitability — no new headcount, no manual process, no physical presence to run it. Idea needs people to deliver the service → does not enter pipeline. **Fail = auto RETHINK regardless of any score.**

---

## 5 hard business requirements — Commercial (page 00)

Idea must credibly meet ALL 5 or does not enter incubation. Rough numbers fine, must exist and add up.

1. **Software-first** (the hard gate above).
2. **3-year path to $2M–$20M ARR** — believable model, one named revenue driver.
3. **30-day viable MVP** — one small team launches on approved platform within 30 days of approval.
4. **Day-120: users + first revenue** — 20 SMB **or** 1,000 consumer users, plus initial paying customers.
5. **Day-180: cash-flow positive** — monthly cash flow ≥ 0 including labor costs.

## Spend caps (first 4 months)

- Labor (salaries + support): **max $10k**.
- Direct marketing: **max $5k**, requires Dmitry approval before commitment.
- Platform spend > $5k: requires Dmitry approval.
- Any cap breach: Dmitry-approved in writing before commitment.

## Spin-off thresholds (BOTH required, sustained)

- **$20k/month revenue AND $10k/month profit.** → own corporation.

## Milestone clock (page 02, all gates owned by Dmitry)

| Day | Gate | "Met" means |
|---|---|---|
| Weekly | Proposal review | Approved / Denied / Modification Requested |
| every 2 wk | Progress update | status, blockers, evidence |
| 30 | Launch | viable MVP live |
| 60 | Review | on track for PMF, CAC, Budget, Team |
| 90 | Review | same axes + sharpen path to 120 |
| 120 | Requirements | 20 SMB or 1,000 consumer users + initial paying revenue (may extend +30d) |
| 180 | Requirement | cash-flow positive incl. labor (may extend +30d) |
| when met | Spin-off | sustained $20k/mo rev AND $10k/mo profit |

Promote outcomes: **Spin-off** (both thresholds hit) · **KIV** (plausible, milestones not met — record reopen trigger) · **Terminate** (no credible path — capture learnings).

**Proposal must contain** (Venture Validation Lead verifies before/at Dmitry's weekly review): business plan · runnable prototype/demo · validation hypothesis · target audience · named Idea Owner (+ proposed Business Guru) · function owners (Build & Delivery, Validation & Insight, System Oversight) · selected platform + metrics/feedback channel · 30/120/180-day plans · spend plan within caps (marketing pre-approved by Dmitry) · bi-weekly Dmitry update schedule. MVP scoped **only** to validate the current hypothesis. 1st Pass (page 09) is advisory — Practice Leads score readiness, classify Commercial/Internal, add to the registry; **only Dmitry approves**.

---

## Page-09 1st-Pass scorecard (Commercial)

Score each line **0 / 1 / 2**. Line 1 = hard gate: **0 → RETHINK regardless of total.**

| # | Criterion | 2 = strong |
|---|---|---|
| 1 | Software-first fit (HARD GATE) | no headcount/manual/physical to operate through profitability |
| 2 | Revenue path | believable 3-yr model to $2–20M ARR, named driver |
| 3 | 30-day MVP | scoped, one small team, approved platform |
| 4 | Day-120 traction | concrete acquisition plan hitting 20 SMB / 1,000 consumer + revenue |
| 5 | Day-180 cash flow | clear line from revenue to covering labor |
| 6 | Demo | runnable, or credible plan to build fast |
| 7 | Owner + Business Guru | accountable owner + named/likely Guru |
| 8 | Hypothesis | falsifiable, clear "we will know it is true if" |
| 9 | Spend | fits caps, or exception named/justified |
| 10 | Risk | data/security/integration/brand identified and controllable |

**Bands (total /20):** `READY FOR DMITRY` = software-first 2, nothing scores 0, **total ≥15**. `REFINE & RE-PASS` = software-first ≥1, **total 9–14**, or a couple clear gaps. `RETHINK` = software-first 0, **total ≤8**, or no owner. (Rulebook self-check uses shorter `Ready/Refine/Rethink`; page-09 uses these exact labels.)

**One fatal gap outweighs a high total.** Thresholds are guidance, not arithmetic.

## Page-10 internal scorecard variant (Internal Track)

Same 0/1/2 format, software-first still only hard gate. Lines: 1 Software-first · 2 Internal pain or value (named dept) · 3 Usable build (under practice time, approved platform) · 4 Reach and adoption · 5 Measurable benefit (time saved / cost avoided / risk reduced) · 6 Demo or plan · 7 Owner and maintainer · 8 Hypothesis · 9 Fit with practice time · 10 Risk (esp. employee data / production systems).

**Bands:** `READY FOR PILOT` (software-first 2, no 0, ≥15) · `REFINE & RE-PASS` (9–14) · `RETHINK` (≤8 or no owner).

Internal success (replaces the 5 commercial): clear internal pain + people affected · target-group satisfaction (primary signal) · actual adoption · measurable benefit · a team willing to own/maintain · software-first.

**Internal Pilot gate (page 10).** After `READY FOR PILOT`, Dmitry authorizes the pilot — lighter than the commercial Proposal: no 5-criteria case, no spend request, **approves no budget** (runs on practice time). Internal outcomes **Adopt / Promote / KIV / Terminate** decided at the monthly working-level check-in; only **Promote** routes to Dmitry (fresh Proposal, re-proves all 5 commercial criteria). Adopt needs a named owning team + maintainer; Terminate stops work + releases resources + captures learnings.

---

## Architecture Decision Standard (page 03-a)

Buildable when ALL 8 answer **yes**. Any "no" → not deployable; fix or record blocker.

1. Runs locally without private verbal knowledge? (README documents install + run from fresh clone with only `.env.example` filled)
2. First deployed URL created quickly? (deploy script/command exists + documented)
3. Access control appropriate for first audience? (public: none + protected admin · internal: SSO/managed · external pilot: invite/magic-link/allowlist)
4. Secrets outside source code? (`.env.example` placeholders; `.env*` gitignored; no literal keys in tracked files)
5. Data source known and acceptable? (synthetic/limited-scope unless approval recorded)
6. Basic logs, errors, usage visible? (platform logs + analytics tied to hypothesis)
7. Rollback / disable / access-removal path exists?
8. Hardening or rebuild expectation explicit if promoted?

**Master guardrails:** Fast · Light · Controlled · Decidable.

**Delivery targets:** local running same day · first URL 1 working day · first usable validation release 5–15 working days · observability + feedback before first user access.

## Complexity / stack ladder

Climb bottom-up. Stop at first rung that tests hypothesis honestly. Lower rung preferred; later rung = more justification.

1. No-code / form / spreadsheet / low-code workflow
2. Static or mostly-static web app
3. Hosted full-stack app + managed auth/data
4. Lightweight serverless API + simple frontend
5. Managed container / background job / custom runtime
6. Custom infrastructure
7. Core-system integration

Prefer managed platforms + starter templates — pick simplest that tests hypothesis honestly; **no single mandated default**. Options across rungs: Cloudflare (Pages/Workers/D1/KV/R2/Queues), Vercel, Netlify, Supabase, Firebase, Railway, Render, Fly.io, Neon, Turso. Mobile → managed workflow: Expo/React Native, Flutter, PWA, or Ionic. Avoid custom infrastructure + org core-system dependency unless required — record the reason.

## Escalation triggers (deploy-blocking)

Escalate to Dmitry BEFORE deploy when idea:

1. Writes to production system of record.
2. Uses customer, financial, regulated, or sensitive employee data.
3. Requires privileged credentials.
4. Could interrupt existing operations.
5. Sends external communications as org / on behalf of business unit.
6. Handles payments, contracts, compliance, or legal commitments.
7. Requires new cloud accounts, private networking, VPN, VPC, firewall changes.
8. Requires formal SLA, backup, disaster recovery, or production monitoring.

Trigger fires → local-only scaffold still fine; deploy blocked until cleared. A trigger implying **mandatory manual ops / headcount** to run the service also breaches the software-first hard gate.

---

## Prohibited shortcuts (never)

Hardcoded secrets · uncontrolled access to sensitive data · shared personal creds for deployed services · untracked production changes · no rollback/disable path · hidden dependency on one person's laptop · irreversible writes to core systems without approval · broad platform build before validation.
