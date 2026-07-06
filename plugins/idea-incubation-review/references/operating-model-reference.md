# Operating Model reference — companion detail

Companion detail reference distilled from PIH (Product Incubation Hub) "Idea Incubation Operating Model" Confluence pages. **Complements** `operating-model-criteria.md` (5 hard requirements, spend caps, milestone clock, spin-off thresholds, page-09/10 scorecards, 8-Q Architecture Decision Standard, complexity ladder, escalation triggers, prohibited shortcuts) and `pre-presentation-rulebook.md` (20-item self-check, validation ladder, presenter deliverables). Those two are not repeated here; this file carries the material facts they don't fully cover.

**Snapshot 2026-07-03.** Authoritative for this plugin when no live Confluence connected. If Confluence-reader MCP connected, freshen against live PIH pages and flag drift. Sole decision authority: **Dmitry**, at every named gate. Values redacted at source (e.g. phone) shown `[redacted]`.

---

## 00 Root / 00 Guideline — map + framing

**Mission.** Internally build new businesses **quickly and in volume** that are **software-first, low burn, high margin**, through **rapid validation** and with **strong accountability**.

**Two tracks share this model.** Commercial track builds new businesses against the 5 requirements. Ideas serving an internal department/service and not yet ready for those criteria run on the 10 Internal Track (Proving Ground) until adopted internally or promoted into the commercial cycle. The 5 requirements, caps, and spin-off thresholds apply to the commercial track only.

**Entry-point map (topic → document):**

| Topic | Document |
|---|---|
| Single-page entry point | 00 Guideline |
| Pre-proposal readiness (1st Pass) | 09 1st Pass |
| Lifecycle, definitions, decision model | 01 Core Model |
| Stage-by-stage execution + milestone gates | 02 Execution Playbook |
| Architecture bird's-eye | 03 Architectural Standards |
| Roles, Gurus, decision authority | 04 Team Responsibility Model |
| Funding caps and controls | 05 Funding and Control Model |
| Cadence and escalation | 06 Governance and Cadence |
| Metrics and milestone reporting | 07 Metrics and Reporting |
| Templates | 08 Templates |
| Internal proving ground + promotion path | 10 Internal Track (Proving Ground) |

**How to use.** Start with Proposal (Plan + Demo) template in 08. Submit to Dmitry's weekly proposal review. Once approved, run stages in 02. Other docs are guardrails, not sequential paperwork. **Default behavior: move forward** unless clear risk, missing owner, missing deployment path, spending-cap breach, or material milestone gap requires escalation to Dmitry.

**Provided resources.** Labor (salaries + support): max $10k first 4 months. Direct marketing: max $5k first 4 months, subject to Dmitry approval. Business Guru actively works with team throughout. Other Gurus (Operations, Tech, Marketing, Growth) available on request.

**Required artifacts (commercial, in order):** Proposal (Plan + Demo) → Kickoff Checklist → Deployment Readiness Checklist → Bi-weekly Progress Update → 30-day Launch Milestone Review → 60- and 90-day Reviews → 120-day Requirements Review → 180-day Requirements Review → Spin-off Readiness Record (or KIV / Terminate Decision Record). Use templates in 08. **Do not invent additional documents.**

**Duplicate ideas.** Two teams may pursue similar ideas if they test different assumptions, audiences, or execution. Block duplication only when it causes user confusion, data risk, or operational conflict.

**What this model is NOT.** Not a stage-gate approval process with months of paperwork. Not a long intake queue. Not a guarantee work continues because it started. Termination with captured learning is a valid outcome. Model funds **learning speed and milestone delivery**, not feature volume. Not a replacement for formal delivery governance once a project spins off.

---

## 01 Core Model — lifecycle, definitions, principles

**North Star.** Fast delivery of validated working businesses that meet the milestone clock: approved proposal → 30-day MVP launch → 120-day user/revenue → cash-flow positive by day 180 → spin-off thresholds, without bureaucratic delay.

**Operating principles.** Software-first only · execution over discussion (Plan + Demo, not slide marathons) · speed over perfection (30-day MVP non-negotiable for entry) · real usage over theoretical debate · clear ownership (Dmitry decides every named gate) · minimum viable guardrails, spend within caps · evidence-based decisions over opinion-based continuation · spin-off, KIV, or terminate cleanly.

**Definitions (exact terms):**
- **Idea** — software-first new-venture concept worth testing through real build + deployment.
- **Proposal** — Plan (1–2 page business plan OR ≤10-slide presentation covering all 5 requirements) + Demo (working prototype).
- **Idea Owner** — accountable for problem, target user, hypothesis, product direction, scope tradeoffs, milestone delivery.
- **Business Guru** — named partner actively working with team on business model, validation, milestone strategy.
- **Other Gurus** — Operations, Tech, Marketing, Growth. Available on request.
- **Incubation** — the 180-day (plus extensions) cycle from proposal approval to spin-off / KIV / terminate.
- **30-day Launch Milestone** — MVP is live. Met or not met.
- **60- and 90-day Reviews** — mid-cycle checks on PMF, Customer Acquisition, Budget, Team. May trigger pivot or stop.
- **120-day Requirements** — min 20 SMB / 1,000 consumer users + initial paying-customer revenue.
- **180-day Requirement** — cash-flow positive including labor costs.
- **Spin-off** — project becomes its own corporation. Only after both thresholds met.
- **KIV** — Keep In View. Plausible idea, milestones not met after available extensions. Pause active build with reopen trigger + operating mode.
- **Terminate** — stop active work, preserve learnings, release people/budget/attention for better opportunities.

**Lifecycle (linear):** Proposal (Plan + Demo) → [weekly Dmitry review] → Approved → Build to 30-day MVP → 30-day Launch Milestone → 60-day Review → 90-day Review → 120-day Requirements Gate → 180-day Cash-flow-positive Gate → Spin-off thresholds? → Spin-off / KIV / Terminate. Every gate owned by Dmitry; 120- and 180-day gates may extend +30 days at Dmitry's discretion.

**Default-flow blockers (escalate to Dmitry for Approve/Deny/Modify when any exist).** Not software-first / needs significant labor or physical presence through profitability · 3-year ARR path not credibly $2M–$20M · no feasible path to viable MVP within 30 days · no accountable Idea Owner · material legal/security/data/financial/brand risk that cannot be controlled · required spend exceeds published caps with no acceptable cancellation path. Ideas do not sit in undefined discussion.

**Non-goals.** Not intended to: build large products with significant labor/physical presence · approve large production investments without milestone evidence · create another long intake queue · force every idea into the same tech stack · keep ideas alive only because work started · replace formal delivery governance once a project spins off.

---

## 02 Execution Playbook — stage-by-stage

Gate "met" meanings + owners are in `operating-model-criteria.md` milestone clock. Below = the 4 stages, their inputs/actions/exit criteria, and promotion + extension rules.

**Promotion note.** A Proposal may originate fresh OR arrive by **promotion** from the 10 Internal Track. A promoted idea brings a working product + internal usage evidence — a head start on demo and product. It still must make the full 5-criteria case from scratch: **internal adoption is not market validation.**

**Extensions.** Granted only by Dmitry, in writing, with a new decision date and the additional evidence the extension will produce.

### Stage 1 — Proposal (Plan + Demo)
Intent: get to a Dmitry decision (Approve / Deny / Modify) in the next weekly review.
- **Required inputs:** idea name · Idea Owner · target user/customer (SMB or consumer — affects 120-day count) · problem/opportunity · expected outcome · fastest useful test · known constraints/risks/dependencies.
- **Plan:** 1–2 page business plan OR ≤10-slide presentation covering how idea meets all 5 requirements.
- **Demo:** working prototype (runnable artifact, not a wireframe deck).
- **Required actions:** complete Proposal · confirm software-first · identify similar ideas · pre-assign core functions (incl. Business Guru) · define first validation hypothesis + first deployment audience.
- **Outcome:** Approved / Denied / Modification Requested. Denied or modification-requested may be resubmitted in a future weekly review.
- **Exit criteria:** Idea Owner named · Plan covers 5 requirements credibly · Demo runnable · first validation hypothesis written · 30-day MVP launch path feasible on approved platforms (or documented exception) · Business Guru assigned.

### Stage 2 — Build to 30-day MVP Launch
Intent: launch viable MVP within 30 days of approval.
- **Scope rule:** build only what's required to put a software-first MVP in front of target user. Defer polish, advanced permissions, complex integrations, deep reporting, automation, scale features unless required for first validation.
- **MVP must include:** usable core workflow · identity/access control appropriate to risk · minimal data persistence if needed · deployment automation or repeatable deploy command · basic instrumentation for usage + feedback · owner-accessible environment + credentials management.
- **Acceptable shortcuts:** manual behind-the-scenes ops when automation isn't the hypothesis · managed services instead of custom infra · lightweight UI · mocked/imported data where live integration not required · limited-audience access instead of broad rollout.
- **Bi-weekly update to Dmitry** every 2 weeks, throughout.
- **Exit criteria (= 30-day Launch Milestone):** MVP live + usable enough to test hypothesis · deployment URL accessible to target audience · metrics + feedback collection active · Idea Owner accepts MVP for validation · 30-day review with Dmitry (met / not met). **If launch missed:** Dmitry decides narrow-scope-and-continue, KIV, or terminate.

### Stage 3 — Validate, Iterate, Hit Milestones
Intent: generate evidence against 60/90/120/180-day milestones.
- **Validation loop (6 steps):** 1 observe usage · 2 collect qualitative feedback · 3 compare evidence vs milestones (users, revenue, cash flow) · 4 make smallest useful change · 5 redeploy · 6 bi-weekly update to Dmitry.
- **Required evidence by milestone:** 60-day → PMF signal, CAC + acquisition channels, spend vs caps, team composition. 90-day → same + credible path to 120-day counts + first paying customers. 120-day → actual users vs 20 SMB / 1,000 consumer + actual paying-customer revenue. 180-day → monthly cash flow incl. labor.
- A 60- or 90-day review **may decide to change direction or stop the project.**
- **Iteration rules:** iterations small + deployable · new feature requests tied to a milestone or explicitly deferred · if evidence invalidates idea, move to decision instead of expanding scope · if validation needs a bigger build, escalate to Dmitry before extending time-box.
- **Marketing spend rule:** any marketing spend (within $5k cap or above) requires Dmitry approval **before** commitment.
- **Exit criteria:** evidence supports Spin-off/KIV/Terminate recommendation · remaining uncertainty documented · cost + delivery effort visible.

### Stage 4 — Decide
Intent: decide Spin-off / KIV / Terminate on milestone evidence. Produces a decision record.
- **Required decision record:** decision · decision owner (Dmitry) · date · evidence summary vs milestones · Spin-off → next owner, corporate structure, hand-over plan · KIV → reduced-resource operating mode, reopen trigger, review date · Terminate → archive location, reusable learnings · follow-up action + due date if any.

---

## 04 Team Responsibility Model — functions + who decides

**Principle.** Accountability must be clear even when responsibilities are flexible. Idea Owner has product-direction privilege within guardrails. Dmitry owns every named gate. Business Guru actively co-pilots.

**Required functions (function → accountable for):**

| Function | Accountable for |
|---|---|
| **Idea Ownership** | Problem definition, target user, hypothesis, product direction, scope tradeoffs, Proposal (Plan + Demo), milestone delivery, bi-weekly update to Dmitry |
| **Build & Delivery** | Technical implementation, deployment, release quality, 30-day MVP launch, ongoing iteration |
| **Validation & Insight** | Metrics, feedback collection, evidence summary vs milestones, milestone readiness recommendation |
| **System Oversight** | Architecture guardrails, security baseline, integration risk, data handling, platform fit |
| **Business Guru** | Actively co-pilots on business model, validation strategy, milestone strategy, decision framing |
| **Operations / Tech / Marketing / Growth Gurus** | Available on request to unblock specific milestones |

One person may hold >1 function. Every function needs a named accountable person before build starts.

**Function detail:**
- **Idea Owner** leads product direction within guardrails: what's in/out of MVP, validation audience, whether ready for first user access. **Not guaranteed to remain owner after spin-off.** Must not override material risk, budget caps, or data controls without escalating to Dmitry.
- **Build & Delivery** moves approved Plan + Demo to 30-day MVP, then iterates against 60/90/120/180-day milestones. Should challenge scope that slows the clock; recommend fastest safe route.
- **Validation & Insight** ensures each incubation produces evidence, not just output. Defines measurement plan before deployment, prepares each milestone review pack, prepares Spin-off/KIV/Terminate recommendation.
- **System Oversight** keeps build inside lightweight guardrails; avoids enterprise architecture review but must intervene on security, data, integration, cost, operational risk.
- **Business Guru** is **assigned to and actively works with** each incubation — not a reviewer on a panel; part of team's working rhythm. Pressure-tests the 5 requirements at proposal stage · helps shape validation hypothesis · attends bi-weekly updates · pre-reads milestone review packs · advises on spin-off path when thresholds near.
- **Other Gurus** pulled in on request: Growth (120-day user count at risk) · Marketing (before any marketing spend submission) · Tech (integration/scaling concern) · Operations (handover/back-office). Engaging a Guru does **not** transfer Idea Owner accountability and does **not** create another approval gate.

**Decision authority (decision → authority):**

| Decision | Authority |
|---|---|
| Proposal review (Approve/Deny/Modify), weekly | **Dmitry** |
| MVP scope | Idea Owner, with Build & Delivery input |
| Technical approach | Build & Delivery, with System Oversight guardrails |
| First deployment readiness | Idea Owner + Build & Delivery jointly |
| 30-day Launch (met/not met) | **Dmitry** |
| 60- + 90-day Reviews (continue/pivot/stop) | **Dmitry** |
| 120-day Requirements + 30-day extension | **Dmitry** |
| 180-day Requirement + 30-day extension | **Dmitry** |
| Spin-off / KIV / Terminate | **Dmitry** |
| Marketing spend within $5k cap | **Dmitry approval** |
| Any spend above $10k labor / $5k marketing caps | **Dmitry approval** |
| Time-box extensions | **Dmitry, in writing** |

Idea Owner, Build & Delivery, Validation & Insight, Business Guru jointly prepare the evidence pack for each Dmitry decision. They do **not** make the call.

**Team escalation triggers → Dmitry:** 30-day MVP launch at risk · a milestone (60/90/120/180) unlikely with current resources · spend approaching/exceeding caps · marketing spend approval needed before commitment · sensitive/regulated data or high-risk integration required · team can't deploy to users or realistic conditions · Idea Owner role at risk or absent · team disagrees on whether evidence supports spin-off.
**Escalate to a Guru** when a specific functional skill blocks a milestone (Growth = acquisition, Marketing = campaign approval prep, Tech = architecture/integration call, Operations = handover/back-office).

### Venture Validation Lead (dedicated role page)
Governs the pipeline across both tracks.

**Commercial responsibilities:**
- *Govern the Venture Pipeline* — track ventures Proposal → Spin-off/KIV/Terminate · ensure required artifacts complete before each gate · monitor milestone timelines (Proposal, 30/60/90/120/180-day) · coordinate bi-weekly updates · surface blockers + escalation needs before reviews · maintain portfolio-wide venture-status visibility.
- *Ensure Validation Quality* — verify proposals include business plan, runnable prototype, validation hypothesis, target audience, Idea Owner · confirm MVP scoped only to validate current hypothesis · ensure usage + feedback instrumentation in place · validate documentation/assumptions/deployment plans complete · confirm exit criteria satisfied before advancing.
- *Drive Evidence Gathering* — monitor product usage + customer adoption · collect qualitative feedback · measure PMF signals · track CAC + acquisition channels · monitor user growth, paying customers, revenue, spend, cash flow · compare actuals vs milestone targets · encourage small evidence-driven iterations over feature requests.
- *Facilitate Venture Progression* — coordinate stakeholders · help remove blockers · keep scope to smallest useful validation increment · recommend pivots when evidence invalidates assumptions · prepare evidence summaries for reviews · support Spin-off/KIV/Terminate decision records · ensure remaining risks/costs/follow-ups documented for leadership.

**Internal-track responsibilities:** govern the pipeline (proposals move through explicit stages proposal→MVP→validation→iteration→progression, not an unstructured backlog) · ensure validation quality (clear problem, testable assumptions, MVP designed to answer critical questions) · drive continuous evidence gathering during pilots (deploy usable MVPs, collect feedback, measure satisfaction + adoption, iterate) · facilitate evidence-based progression (ideas continue/improve/pivot/advance on evidence, not feature completion).

### Practice Leads (from 09 1st Pass)
Run the 1st Pass, refine the idea, score readiness, classify Commercial/Internal, add to registry. **Do not approve or reject ideas — only Dmitry does.** One lead joins by what idea needs most (Build & Delivery = feasibility, Growth/Marketing = acquisition, System Oversight = data/security). Also run or join the internal monthly check-ins.

### Dmitry
Owner + sole decision authority at every named gate (Proposal, 30/60/90/120/180-day, extensions, Spin-off/KIV/Terminate). Approves marketing spend, spend above caps, deployment risk acceptance, time-box extensions (in writing). Authorizes the light Internal Pilot gate; runs a separate weekly check-in to surface internal ideas/adopted tools worth incubation; owns the Promote decision via the commercial Proposal.

---

## 05 Funding and Control — controls + kill-switch

Caps, cap-breach approval, and spin-off thresholds are in `operating-model-criteria.md`. Below adds the platform/external rules, extension rights, and kill-switch.

**Funding principles.** Fund learning speed + milestone delivery, not feature volume · stay inside caps first 4 months · track spend at incubation level · marketing spend requires Dmitry approval before commitment · stop funding when evidence no longer justifies continuation.

**Spending items (beyond labor/marketing caps):**
- **Platform spend** (hosting, tools, infra) — prefer monthly/usage-based/easily cancellable; tracked separately; should not approach labor cap; **above $5k requires Dmitry approval.**
- **External spend** (contractors, data, design) — requires named owner, amount, purpose, cancellation date; above labor/marketing cap requires Dmitry approval.
- Any spend breaching a cap must be Dmitry-approved **in writing before commitment.**

**Time-box extension rights (milestone → extension):**

| Milestone | Extension |
|---|---|
| 30-day Launch | Dmitry may direct scope-narrowing; **no automatic extension** |
| 60-day Review | Review may change direction or stop the project |
| 90-day Review | Same as 60-day |
| 120-day Requirements | **+30 days at Dmitry's discretion** |
| 180-day Requirement | **+30 days at Dmitry's discretion** |

**Funding escalation triggers → Dmitry before continuing:** spend will exceed $10k labor / $5k marketing cap in first 4 months · any marketing spend proposed (under or over cap) · 30-day MVP launch at risk · 60/90-day evidence suggests change-direction-or-stop · 120/180-day requirements won't be met without extension · sensitive/regulated data or high-risk external exposure required · core-system integration becomes necessary · team continuing without new evidence between bi-weekly updates.

**Kill-switch rules — stop or pause when:** 30-day MVP launch missed and Dmitry directs stop · 60/90-day review concludes change-direction-or-stop and pivot not viable · 120-day Requirements missed after available 30-day extension · 180-day Requirement missed after available 30-day extension · Idea Owner role vacant and not promptly refilled · spend continues without a decision path · risk becomes disproportionate to expected learning.

No additional approval document unless required by material risk, spend above caps, or Dmitry.

---

## 06 Governance and Cadence — cadence, SLA, escalation flow

Governance accelerates milestone delivery + forces clear Dmitry decisions. **Not** a forum for broad redesign or prolonged viability debate. Milestone reviews themselves are in 02; this covers the surrounding cadence, SLA, escalation.

**Non-milestone cadence (cadence · timing · purpose · required output · owner):**

| Cadence | Timing | Purpose | Required output | Owner |
|---|---|---|---|---|
| **Weekly Proposal Review** | Every week | Dmitry reviews submitted Proposals (Plan + Demo) | Approved / Denied / Modification Requested per proposal | **Dmitry** |
| **Bi-weekly Progress Update** | Every 2 weeks | Team reports build progress, deploy status, evidence, blockers, spend vs caps, next-milestone confidence | Continue / escalate / narrow scope / pivot / move to milestone decision | **Dmitry** (Idea Owner prepares) |
| Kickoff | After proposal approval | Confirm Business Guru, functions, hypothesis, scope, audience, platform, risks | Approved kickoff checklist | Idea Owner |
| Deployment Checkpoint | Before first user access | Confirm minimum deployment readiness | Deployment readiness approval | Idea Owner + Build & Delivery |

**Governance rules.** Keep reviews short + evidence-based · discuss blockers before status detail · don't add scope unless it improves a milestone · record decisions immediately · assign every action a named owner + due date · move to a milestone decision when evidence is sufficient, even early · Dmitry's decision captured in writing for every gate incl. extensions.

**Decision SLA — Dmitry responds within 1 working day for:** marketing spend approval · spend-above-cap approval · deployment risk acceptance · time-box extension requests (120-day, 180-day) · Spin-off/KIV/Terminate decisions. Weekly Proposal Reviews + scheduled milestone reviews happen on their stated cadence. **If a decision is not made within SLA:** Idea Owner escalates via the Business Guru, or narrows scope to continue safely within published caps.

**Escalation flow (in order):** 1 incubation team resolves locally → 2 Business Guru unblocks/reframes → 3 Other Guru (Ops/Tech/Marketing/Growth) for functional skills → 4 **Dmitry** for any gate decision, cap exception, marketing approval, or extension.

---

## 07 Metrics and Reporting — every named metric

Model reinforces mission: build businesses quickly + in volume, software-first, low burn, high margin. **Does not reward activity without milestone evidence.**

**Milestone metrics (metric · measurement):** Proposal approval rate (% approved at first weekly review) · 30-day Launch met (Yes/No viable MVP live by day 30) · 60-/90-day on-track (PMF, CAC, Budget, Team health) · 120-day user count (actual vs 20 SMB / 1,000 consumer) · 120-day initial revenue (whether initial paying-customer revenue exists) · 180-day cash-flow positive (monthly cash flow ≥ 0 incl. labor) · Spin-off revenue threshold (monthly revenue vs $20,000) · Spin-off profit threshold (monthly profit vs $10,000) · 3-year ARR path (modeled trajectory vs $2M–$20M ARR) · Labor spend vs cap ($ vs $10k 4-month cap) · Marketing spend vs cap ($ vs $5k 4-month cap) · Time on milestone clock (day count since approval; flag extensions).

**Process metrics (metric · definition · why it matters):**

| Metric | Definition | Why |
|---|---|---|
| Time to first deployment | Working days from approval to first accessible deployment | Delivery speed vs 30-day Launch |
| Time to first paying customer | Working days from approval to first paying customer | Leading indicator for 120-day revenue |
| Time to outcome decision | Working days from approval to Spin-off/KIV/Terminate | Prevents endless incubation |
| Active incubations | Count of ideas currently in lifecycle | Portfolio load |
| Deployment rate | % of approved proposals hitting 30-day Launch | MVP delivery discipline |
| Spin-off rate | % of incubations spun off after milestone evidence | Real conversion |
| KIV rate | % paused with explicit reopen trigger | Deferred potential |
| Termination rate | % stopped after learning | Discipline + resource release |
| Cost per validated idea | Spend (labor + marketing + platform) ÷ ideas reaching a milestone-based decision | Efficiency vs $10k/$5k caps |

**Validation metrics per incubation** (≥1 per relevant category): **Usage** (active users, completed workflows, repeat usage, conversion, task completion) · **Feedback** (qualitative rating, pain-point confirmation, user quotes, support requests) · **Business** (paying customers, MRR, ARPU, cost avoided, partner interest) · **Delivery** (build days, deployment frequency, defects, integration effort, support load) · **Risk** (data exposure, security findings, manual workarounds, compliance concerns).

**Portfolio dashboard (min fields):** idea name · Idea Owner · Business Guru · current milestone (next gate due) · day count vs clock · last bi-weekly update date · 30/60/90/120/180-day milestone status · spend vs $10k labor cap · spend vs $5k marketing cap (+ Dmitry approval status) · running monthly revenue + monthly profit (spin-off readiness) · current status (On Track / At Risk / Blocked / Decision Needed) · outcome (Spin-off / KIV / Terminate / Active).

**Reporting rules.** Report evidence vs milestones before opinions · show day count on the clock · highlight any blocked Dmitry decision · separate delivery progress (launched) from validation strength (users, revenue, profit) · **do not classify an idea successful because it shipped — success requires milestones met** · treat termination with captured learning as useful.

---

## 08 Templates (commercial) — names + required fields

Templates 4 (Deployment Readiness) and the scorecards are in the criteria file / covered elsewhere; below = field lists.

1. **Proposal (Plan + Demo)** — Basic: idea name, Idea Owner, proposed Business Guru, date submitted, segment (SMB/Consumer), target user/customer, requested start date. Plan (1–2pp OR ≤10 slides) covering all 5 requirements: software-first nature · 3-year $2M–$20M ARR model + drivers · 30-day MVP launch plan · 120-day user + revenue plan · 180-day cash-flow-positive plan incl. labor. Demo: URL/file/how-to-run + notes. Validation hypothesis: "we believe / for this user / this product will / we'll know it's true if". First useful version (MVP): smallest useful product, in scope, out of scope, first deployment audience, fastest deployment path. Spend plan (first 4 months): labor (≤$10k), marketing (≤$5k, requires Dmitry approval), other platform/external. Constraints + risks: data needed, integrations needed, security/compliance concern, known dependency. Dmitry's decision: Approved/Denied/Modification Requested + date + notes.
2. **Incubation Kickoff Checklist** — Idea Owner confirmed · Build & Delivery owner · Validation & Insight owner · System Oversight owner · Business Guru confirmed + engaged · validation hypothesis written · first useful MVP agreed · deployment audience identified · platform selected · metrics + feedback channel selected · 30-day MVP launch plan locked · 120-day user/revenue plan documented · 180-day cash-flow plan documented · spend plan within caps (marketing pre-approved if planned) · risks + escalation needs documented · bi-weekly update schedule with Dmitry set.
3. **Bi-weekly Progress Update (to Dmitry)** — idea name, update period, current stage/next milestone, status (On Track/At Risk/Blocked/Decision Needed). Since last update: built/changed, deployed, evidence (users/feedback/revenue), spend (labor $__/$10k, marketing $__/$5k). Current blockers: blocker, owner, needed Dmitry decision, due date. Asks of Dmitry: marketing spend approval, spend-above-cap approval, extension request, other. Next step: next deployment/validation action, expected evidence, next milestone + date.
4. **Deployment Readiness Checklist (pre-launch)** — single canonical pre-launch checklist (14 items): smallest useful workflow deployed · live URL/accessible env ready · deployment owner named · owner can redeploy without special intervention · access control appropriate · secrets stored securely · no sensitive production data exposed without approval · data source + retention known · basic logging/error visibility exists · usage tracking ready · feedback channel ready · rollback/disable/access-removal path known · cost owner + expected cost documented · Idea Owner accepts release for validation.
5. **30-day Launch Milestone Review** — idea name, day count since approval, MVP launched Yes/No, deployment URL, first-user access date, evidence of usability. Dmitry decision: continue as planned / narrow scope + continue / KIV / Terminate / notes.
6. **60-day / 90-day Review** — idea name, day count, stage. Four axes: PMF (evidence + signal), Customer Acquisition (channels, CAC, conversion), Budget (spend vs $10k/$5k caps), Team (composition, engagement, gaps). Dmitry decision: continue / change direction (describe) / stop / notes.
7. **120-day Requirements Review** — idea name, day count, user count vs (20 SMB OR 1,000 consumer), initial paying-customer revenue Yes/No + amount, 3-year ARR trajectory update. Dmitry decision: requirements met (continue to 180) / extend 30 days (new decision date) / KIV / Terminate / notes.
8. **180-day Requirement Review** — idea name, day count, monthly cash flow incl. labor $__, cash-flow positive Yes/No, monthly revenue $__, monthly profit $__. Dmitry decision: met (continue to spin-off thresholds) / extend 30 days / KIV / Terminate / notes.
9. **Spin-off Readiness Record** — idea name, sustained monthly revenue $__ (threshold $20,000), sustained monthly profit $__ (threshold $10,000), months at/above both thresholds, proposed corporate structure, proposed destination owner, hand-over plan. Dmitry decision: spin off (effective date) / not yet (continue with note).
10. **Promote (Spin-off) / KIV / Terminate Decision Record** — idea name, decision date, decision (Spin-off/KIV/Terminate), decision owner (Dmitry). Evidence summary vs milestones: 30/60/90/120/180-day + monthly revenue/profit + total spend (labor/marketing/platform). Decision rationale: why + alternatives considered. Follow-up: Spin-off → destination owner, corporate structure, hand-over plan, effective date; KIV → reduced-resource operating mode, reopen trigger, review date; Terminate → archive location, reusable learnings.

---

## 08-a Internal Track Templates — names + fields

Deliberately short; support 10 Internal Track only; do not replace commercial templates.

1. **Internal Pilot Authorization** (light gate input; filled by Idea Owner, decided by Dmitry) — idea name · Idea Owner · target department/user group · what it does (1–2 sentences) · systems + data it touches · guardrail check (production system of record? employee data? privileged credentials? external comms?) · named accountable owner · Dmitry decision (Authorize / Authorize with conditions / Send back) · date.
2. **Weekly Satisfaction Pulse** (recurring signal, not a decision) — week of · respondents (target users) · satisfaction (1–5) · used it this week? (rough count) · one thing that worked · one thing to fix.
3. **Monthly Check-in and Decision Record** (forcing function; decided by team, Practice Leads, or target users) — idea name · month · satisfaction trend · adoption + usage trend · benefit observed (time saved/cost avoided/risk reduced) · decision (Continue / Iterate / KIV / Terminate) · decided by · notes + next step.
4. **Adopt Handoff Note** (when idea becomes permanent internal product) — tool name · owning team · where it lives (repo + hosting) · support + maintenance expectation · service level · named maintainer · moved into normal sprint capacity on · put forward as incubation candidate? (yes/no).
5. **Promotion Handoff Note** (what carries into commercial Proposal) — tool name · why now (market-leg signals) · what carries over (product, demo, internal usage evidence) · what must be proven fresh (the 5 commercial criteria) · proposed Idea Owner + Business Guru · date submitted to Dmitry's weekly review.

---

## 03-b Golden Paths and Stack Patterns

Preferred starting points, **not mandatory**. A team may choose another stack when it cuts delivery time or fits better, as long as deployment/security/data/ownership rules met.

### Path A — Landing Page, Waitlist, or Demand Test
When hypothesis is about market interest, messaging, commitment, willingness to engage.

| Layer | Preferred options |
|---|---|
| Frontend | Astro, Next.js, SvelteKit, Nuxt, Vite |
| Deployment | Vercel, Cloudflare Pages, Netlify |
| Forms | Tally, Typeform, Google Forms, Airtable Forms, Supabase table form, simple API route |
| Analytics | Plausible, PostHog, Google Analytics, Vercel Analytics, Cloudflare Web Analytics |
| Email capture | ConvertKit, Mailchimp, Resend, Supabase, Airtable |

Avoid: account systems before interest proven · admin panels before data to administer · full workflows when a fake-door/concierge test suffices.

### Path B — Lightweight Full-Stack Web App
When idea needs user interaction, persisted state, auth, usable workflow.

| Layer | Preferred options |
|---|---|
| Full-stack framework | Next.js, SvelteKit, Nuxt, Remix, Laravel, Django |
| Deployment | Vercel, Cloudflare Pages/Workers, Netlify, Railway, Render, Fly.io |
| Database | Supabase Postgres, Neon Postgres, Turso, PlanetScale, Firebase Firestore, Cloudflare D1 |
| Auth | Supabase Auth, Firebase Auth, Clerk, Auth0, platform SSO where available |
| File storage | Supabase Storage, Cloudflare R2, Firebase Storage, S3-compatible managed storage |
| Background jobs | Inngest, Trigger.dev, Supabase Edge Functions, Cloudflare Queues, managed cron |

Avoid: separate frontend/backend/API-gateway/job-worker/admin app unless required · custom Kubernetes/VM/service-mesh/enterprise CI-CD before validation · premature microservices.

### Path C — Internal Workflow Tool
When idea improves an internal process, review flow, ops workflow, decision-support task.

| Layer | Preferred options |
|---|---|
| No-code / low-code | Retool, Appsmith, Airtable, Google AppSheet, Glide |
| Lightweight custom | Next.js, SvelteKit, Streamlit, Gradio, FastAPI + simple UI |
| Data | Google Sheets, Airtable, Supabase, Postgres, CSV import, limited API pull |
| Auth | Tool-native access controls, Google/Microsoft SSO, Supabase Auth |
| Deployment | Tool-native hosting, Vercel, Streamlit hosting, Railway, Render |

Avoid: rebuilding a full ERP/CRM/workflow platform · deep write-integration into core systems before workflow validated · treating internal tools as permanent systems before Promote.

### Path D — Data, AI, or Automation Prototype
When idea depends on analysis, AI-assisted work, automation, summarization, classification, prediction, data transformation.

| Layer | Preferred options |
|---|---|
| Notebook / exploration | Jupyter, Google Colab, Observable, local Python |
| App interface | Streamlit, Gradio, Next.js, FastAPI, lightweight CLI |
| Data processing | Python, DuckDB, Polars, Pandas, dbt only if already useful |
| Storage | Local files for exploration, Supabase, Postgres, object storage, managed vector store if needed |
| AI orchestration | Simple provider SDK, Vercel AI SDK, LangChain or LlamaIndex only when orchestration complexity justifies it |
| Deployment | Streamlit hosting, Hugging Face Spaces, Vercel, Railway, Render, Fly.io |

Avoid: complex agent frameworks before a simple scripted workflow fails · production-sensitive data without approval · fully automated decisions without review · over-investing in vector DBs/pipelines/fine-tuning before proving the workflow.

### Path E — API, Integration, or Backend Service
When product needs a lightweight API, webhook receiver, scheduled task, data sync, integration adapter.

| Layer | Preferred options |
|---|---|
| API framework | Hono, FastAPI, Express, NestJS (only for larger services), Laravel, Django REST |
| Runtime | Cloudflare Workers, Vercel Functions, Supabase Edge Functions, AWS Lambda, Railway, Render, Fly.io |
| Data | Supabase Postgres, Neon, Firebase, D1, managed Redis/queue where needed |
| Jobs / queues | Inngest, Trigger.dev, Cloudflare Queues, Upstash QStash, platform cron |
| Secrets | Platform environment variables or approved secret manager |

Avoid: shared infra dependencies for a one-off validation · reusable integration platforms before validating the single use case · direct production DB writes without approval.

### Path F — Mobile or Field Prototype
When validation needs phone, tablet, camera, location, offline capture, field-worker experience.

| Layer | Preferred options |
|---|---|
| App framework | Expo React Native, Flutter, PWA, Ionic |
| Backend | Supabase, Firebase, simple API routes |
| Auth | Firebase Auth, Supabase Auth, managed SSO where available |
| Deployment | Expo updates/internal distribution, TestFlight/Play internal testing when required, PWA on Vercel/Cloudflare |

Avoid: native iOS + Android from scratch unless hypothesis needs native depth · app-store launch as first validation when a PWA/internal build is enough.

### Platform options (platform · best use · why it helps speed)

| Platform | Best use | Why it helps speed |
|---|---|---|
| Vercel | Next.js, frontend apps, serverless APIs, preview deploys | CLI + Git deploys, preview URLs, managed hosting, low setup |
| Cloudflare Pages/Workers | Static apps, edge APIs, simple globally-distributed services | Fast deploys, local Workers dev, edge runtime, integrated DNS/caching |
| Netlify | Static sites, Jamstack apps, forms, frontend-heavy prototypes | Simple Git deploys, forms, serverless functions |
| Supabase | Postgres, auth, storage, realtime, local DB dev | Managed backend with local CLI stack + SQL migrations |
| Firebase | Realtime apps, mobile prototypes, auth, Firestore, simple hosting | Strong mobile/web SDKs + managed backend services |
| Railway | Full-stack apps, containers, Postgres, quick services | Simple app/service deploy with managed databases |
| Render | Web services, cron jobs, workers, managed databases | Straightforward Git-backed deploy for apps + services |
| Fly.io | Containerized apps, regional deployment, lightweight services | Local project config + deployable containers, no server management |
| Neon | Serverless Postgres | Fast managed Postgres provisioning + branching-friendly |
| Turso | SQLite-compatible distributed DB | Lightweight DB for small/edge-friendly apps |
| Cloudflare D1 / R2 / KV | Edge data, object storage, lightweight key-value | Integrated with Cloudflare deploy + simple ops model |
| Retool / Appsmith / Airtable | Internal tools + ops workflows | Usable interfaces with minimal custom code |
| Streamlit / Gradio | Data apps, AI demos, internal analysis tools | Very fast script-to-interface path |

---

## 03-c Local Dev-to-Live Deployment

Standard: not one platform for everyone — the selected platform has a **simple, repeatable path from laptop to deployed URL.**

**Minimum repository documentation (every custom-code incubation):** what the app does · required runtime version · required local tools · required env vars · how to install deps · how to run locally · how to run tests/smoke checks · how to deploy · how to view logs · how to roll back/disable/remove access.

**Recommended command shape:** `Install: npm install` · `Run local: npm run dev` · `Check: npm run check` · `Deploy preview: npm run deploy` · `Deploy prod: npm run deploy:prod` · `Logs: npm run logs`. (Examples per platform exist — Vercel, Cloudflare Wrangler, Supabase, Railway, Fly.io, generic Docker — showing desired simplicity, not mandatory. If the stack can't be represented by a similarly short run+deploy sequence, confirm the extra complexity is required for validation.)

**Deployment models (model · use when):** Standard CLI deploy from laptop → early validation, small team, low risk (commands documented + repeatable) · Git-based preview deploy → multiple builders, frequent review, web apps (every branch/PR → preview URL) · Managed platform dashboard deploy → low/no-code or simple hosted tools (ownership, access, rollback documented) · Container deploy → custom runtime, background jobs, non-standard app (Dockerfile/platform config committed) · CI/CD pipeline → promotion candidate or higher-risk product (build/test/deploy/rollback automated). **Do not require CI/CD before first deployment** if a CLI or Git deploy safely produces a validation environment.

**Environment model (environment · purpose · required for):** Local → builder dev + smoke checks → all custom-code incubations · Preview/Validation → first controlled user access → all deployed incubations · Production → broader real use or promoted product → only when validation expands beyond controlled release · Staging → formal pre-production checks → only higher-risk or promoted products. Additional staging optional unless risk/external-users/payments/sensitive-data/integration-complexity/promotion-readiness require it. For incubation, "production" may simply mean the live validation URL.

**Deployment baseline (each incubation must have):** source-controlled code or documented artifact ownership · repeatable build + deploy process · separate local + deployed environments · env vars for secrets + config · basic logging/error visibility · rollback/disable/access-removal path · named deployment owner · known first-user audience · feedback + usage measurement path.

**Starter templates catalog (template · includes):** Static validation page (landing page, form capture, analytics, deploy command) · Full-stack web app (auth, DB, basic CRUD, env config, deploy command) · Internal tool (login, role-limited views, table workflow, audit notes, export) · AI/data app (file upload/dataset input, prompt/config file, evaluation examples, basic UI) · API/webhook service (health check, request validation, logging, idempotency helper, deploy command) · Mobile/PWA prototype (device-ready app shell, auth, backend connection, internal release notes). Each template ships: local setup, deploy instructions, example env vars, basic security notes, a smoke test, rollback instructions.

---

## 03-d Data, Integration, and Security

Lightweight but firm controls. Escalation triggers + prohibited shortcuts are in the criteria file; below adds the tables + baselines.

**Data rules.** Don't use sensitive production data unless explicitly approved · prefer synthetic/anonymized/masked/limited-scope · keep incubation data separate from core systems where practical · define who can access data before deployment · define what happens to data after Promote/KIV/Terminate · use managed databases unless a local file/no-code datastore is enough · keep schema narrow + validation-focused · capture migrations/setup steps when structure matters · don't rely on manual DB changes that can't be reproduced.

**Data store selection (need · recommended starting point):** No persistence → static app, form submission, analytics only · Simple list/workflow state → Airtable, Google Sheets, Supabase table, Firebase collection · Relational app data → Supabase Postgres, Neon Postgres, managed Postgres on Railway/Render/Fly · Realtime collaboration → Firebase, Supabase Realtime · Edge/local-first small data → SQLite, Turso, Cloudflare D1 · Files/uploads → Supabase Storage, Firebase Storage, Cloudflare R2, S3-compatible · Search/vector retrieval → managed search/vector service only after retrieval necessary to validate.

**Integration rules.** Integrate with LM core systems only when validation depends on it · prefer API-based over direct DB access · read-only unless write required · prefer batch import/export, CSV, webhook, or limited API for first validation · document integration owner, credential, endpoint, rate limit, rollback path · no irreversible side effects in core systems without approval · use feature flags/allowlists/limited scopes for write integrations.

**Security baseline.** No hardcoded secrets · no shared personal credentials for deployed services · least-privilege access for builders + users · authentication for non-public tools or sensitive workflows · secure storage of env vars · explicit approval before external exposure of sensitive/customer/financial/regulated data · access-removal path when a user leaves the validation group · basic dependency hygiene for custom-code apps · human review for AI outputs that materially affect people, money, compliance, or operations.

**Authentication guidance (product type · acceptable first auth):** Public landing page → no auth; protect admin/data views · Private internal tool → Google/Microsoft SSO, tool-native access, Supabase/Firebase/Clerk auth · External pilot → managed auth, invite-only, magic link, or allowlisted accounts · Sensitive workflow → SSO or approved managed auth with explicit access owner · Prototype demo with no sensitive data → password protection or restricted preview URL may be enough. **Don't build custom authentication unless authentication itself is the idea.**

**Cost control.** Prefer stack starting on free/team/startup/low-cost tiers. Before deployment document: expected monthly platform cost · any usage-based cost driver · who owns spend monitoring · what threshold triggers review · how to shut the service down. Avoid: long-term contracts for unvalidated ideas · enterprise-tier services before validation · always-on compute when serverless/managed is enough · unbounded AI/email/SMS/scraping/data-processing usage.

---

## 03-e Operations and Promotion

**Observability + feedback.** Every deployed incubation answers: is it being used? who uses it? where does it fail? what feedback? what evidence supports the next decision? **Minimum:** platform logs/error visibility · basic usage analytics tied to hypothesis · feedback channel · deployment date + URL recorded · known owner for user issues. Recommended tools: platform logs (Vercel/Cloudflare/Railway/Render/Fly.io/Supabase/Firebase) · PostHog/Plausible/GA/Vercel Analytics/Cloudflare Web Analytics · Sentry or platform-native error tracking for meaningful runtime risk · simple feedback form or in-product prompt.

**TechOps / DevOps interaction model.** Default incubation path should **not** require heavy TechOps/DevOps intervention. They provide reusable enablement + guardrails, not a gate for every idea.
- *Builders should be able to:* create a local project from an approved template · run locally · configure local env vars · deploy a preview/validation URL · view logs + basic errors · add/remove validation users · roll back/disable/pause · document the deployment path.
- *TechOps/DevOps should provide:* pre-approved platform accounts/workspaces · starter templates for common stacks · standard env-var + secret-handling guidance · shared domains / preview-domain pattern · lightweight access-control pattern · budget limits/alerts · basic security checklist · deployment runbook examples · promotion hardening checklist.
- *TechOps/DevOps must be involved for:* new cloud account/VPC/network/VPN/private connectivity · production system write integration · sensitive/regulated/customer data exposure · public launch with material brand/legal/security/reliability risk · payments or financial transactions · high-volume email/SMS/scraping/AI usage · need for formal SLA/backup/DR/monitoring.

**Before expanding the audience (post-launch checklist):** user feedback from first release reviewed · known defects have owner or accepted workaround · data + access risks still acceptable · support path clear · spend within threshold · next deployment remains small + validation-focused.

**Promotion readiness — Harden when:** stack already maintainable · data model close to expected future shape · security gaps minor + fixable · operational burden acceptable · platform can support expected next-stage usage.
**Rebuild when:** used no-code/disposable code that can't support next stage · data model intentionally temporary · security/access patterns too weak for expanded use · integration shortcuts would create operational risk · product needs reliability/scale/compliance beyond incubation stack.
**Terminate cleanly when:** idea not validated · user access removed · paid services shut down or ownership transferred · data archived/exported/deleted per decision record · reusable learnings/prompts/code/templates captured.

**Architecture Decision Record (lightweight, one page) — minimum fields:** selected stack · reason this is fastest credible path · local run command · deployment command/platform · data used · integrations · authentication approach · observability approach · known shortcuts · known risks · escalations required · hardening or rebuild expectation if promoted.

---

## 10 Internal Track (Proving Ground) — added detail

Scorecard variant, internal success criteria, and Internal Pilot gate are in the criteria file. Below adds cadence, outcomes-decider detail, promotion path, roles deltas.

**Purpose.** Proving ground for ideas that solve internal pain or introduce a new internal service — usable inside the org, not yet ready for the commercial cycle. Deliberately light: work runs under each person's **practice time (PRA)**, **no spend cap**, **no fixed milestone clock**. Success judged by target-user satisfaction, not revenue. Internal validation is a genuine head start toward commercial, but **not a substitute for market validation.**

**Fit.** Front door is the shared 09 1st Pass (classifies + routes). Guardrails/escalation (00), architecture (03), roles (04) apply unchanged. Promotion re-enters 02 at Stage 1 (Proposal). Commercial pipeline ends in Spin-off; Internal Track ends in Adopt or Promote (Promote feeds back into commercial).

**Build + internal stress test.** Build a usable internal version — no hard 30-day limit, work under PRA. Run with target department/user group. Evidence loop: track satisfaction + usage, collect feedback, smallest useful change, redeploy. Progress judged by satisfaction + adoption, not elapsed days.

**Cadence (replaces commercial milestone clock):**

| Cadence | Who | What |
|---|---|---|
| Weekly | Owner + target users | Light satisfaction pulse (short survey). A signal, not a decision |
| Each sprint | SM or PO | Practice time on the idea logged in the sprint, so PRA effort is visible |
| Monthly | Team, Practice Leads, or target users | Decide: continue / iterate / park (KIV) / stop (Terminate) |

Monthly check-in is the **forcing function** — an idea not earning satisfaction/adoption doesn't run on practice time indefinitely; it's parked or stopped.

**Outcomes + who decides:**
- **Adopt** — roll out + hand to a named owning team for maintenance. Legitimate success. **Decided at working level** (team, Practice Leads, target department). Record names owning team, where it lives (repo + hosting), support/maintenance expectation, service level. Once adopted, tool leaves PRA and enters owning team's normal sprint capacity. **Must have a named maintainer or it's parked, not adopted.** May also be put forward as an incubation candidate.
- **Promote** — enters commercial cycle via a fresh Proposal. **Owned by Dmitry** (Proposal is his gate).
- **KIV** — plausible but not yet; record reopen trigger. **Working-level decision** at monthly check-in.
- **Terminate** — capture learnings. **Working-level decision** at monthly check-in.

Produce a short decision record for whichever outcome. **Only Promote routes to Dmitry.**

**Promotion path.**
- *What carries over:* the working product, the demo, internal usage + satisfaction evidence (as supporting context).
- *What must be proven fresh:* all 5 commercial requirements, including external willingness to pay. Internal adoption proves useful inside the org; it does **not** prove an external customer will pay — different claims.
- *Re-entry point:* Stage 1 Proposal of 02. Internal build buys speed on product + demo, **not a pass on the criteria.**
- *Market-leg signals worth considering for promotion:* people outside the org ask to use it or buy it · pain clearly exists beyond the org (not a LegalMatch-specific quirk) · internal adoption + satisfaction high and sustained · plausible willingness-to-pay story + credible path to the 5 criteria.
- *Surfacing candidates:* a **separate weekly check-in with Dmitry** reviews which internal ideas + adopted tools could go through incubation — the funnel toward the commercial Proposal. Clean split: monthly working-level check-in decides whether an idea continues; weekly Dmitry check-in decides which are worth taking toward incubation.

**Guardrails specific to internal.** Escalation triggers from 00 not relaxed; ones internal tools hit most: uses sensitive employee data · writes to production system of record · requires privileged credentials/new cloud accounts/private networking · sends communications on behalf of the org. Before the pilot gate, prefer synthetic/anonymized/limited-scope data.

**Roles deltas (this track):** Idea Owner raises + stays accountable throughout · SM/PO = first sounding board, sponsors into 1st Pass, logs PRA effort in sprint · Practice Leads run 1st Pass, classify, run/join monthly check-ins · target department/user group provide satisfaction signal + take part in continue/adopt decisions · **Business Guru assigned only on Promote, not during the internal pilot** (during pilot, idea carried by Idea Owner + relevant Practice Lead) · owning team named at Adopt, maintains long-term · Dmitry authorizes the light pilot gate, runs the weekly incubation-candidate check-in, owns Promote.

**What this track is NOT.** Not a way to skip market validation · not ungoverned (light gate, named owner, monthly continue/stop) · not permanent parking for tools nobody will maintain (adoption requires a named maintainer).

**Decisions confirmed.** Software-first is the **only** hard gate — no other criterion is a hard gate. Internal Track has its own simple templates page (08-a), separate from 08. Once permanently adopted, a tool leaves PRA for the owning team's normal sprint capacity (may also be an incubation candidate). Monthly check-in stays flexible among team/Practice Leads/target users; a separate weekly Dmitry check-in decides incubation candidates.

---

## 09 1st Pass — process detail

Advisory pre-proposal review where Practice Leads help an owner sharpen an idea before Dmitry's weekly review. Refines pitch + features/use cases, scores readiness, adds idea to the registry, classifies **Commercial or Internal** and routes it. Practice Leads **do not approve or reject — only Dmitry does.** (The scorecards themselves are in the criteria file.)

**Flow:** owner has idea → tell Scrum Master / Product Owner → discuss within squad → SM/PO asks Practice Leads to schedule a 1st pass → 1st pass (refine pitch + use cases, score readiness) → classify Commercial/Internal → Commercial: outcome (Ready → add to registry, build Proposal, present at Dmitry weekly review · Refine → fix gaps, re-pass · Rethink → reshape/park) · Internal: route to Internal Track (pilot gate, then stress test).

**Session norms.** One 30–45 minute session. Share material 24h ahead. Write the recommendation the same day. One Practice Lead joins by what the idea needs most (Build & Delivery = feasibility, Growth/Marketing = acquisition, System Oversight = data/security). Business Guru may join, assigned once the idea becomes an incubation.

**Before the session (owner).** Draft the idea using the 08 Proposal template (demo need not be built — a plan for it is enough at this stage). Have a clear answer for each of the 5 criteria; keep spend within caps. Ensure one accountable Idea Owner + a likely Business Guru.

**Preparing for Dmitry (owner).**
- *Do:* lead with the demo · put real numbers down · name the fastest way to test the main assumption · say what's left out of the MVP · have an answer for "what would make you kill this?"
- *Don't:* open with a long market-size pitch · promise a big "phase 1" build · skip the revenue/acquisition math · hide labor/ops cost · ask for spend above caps without saying so.

**The registry.** Refined ideas recorded on "Current Projects: Candidates/Prospect for Incubation" (the registry). Ideas wait there until funnelled to Dmitry's weekly review. No separate tracker. This sits **before** Stage 1 of 02; after Dmitry approves, the existing playbook + templates take over unchanged.

---

## Validation Metrics (Internal Track) — best practices

Source: ChatGPT Go (complementary best practices, lightweight). 12 practices:
1. Start with explicit hypotheses — state what's tested before deployment (e.g. "legal staff will reduce document review time by 30%") so success is measurable, not subjective.
2. Deploy the smallest usable version — release only enough to solve the target problem; don't polish before proving value.
3. Measure behavior, not just opinions — pair surveys with actual usage (active users, frequency, completion, repeat usage). Users may say they like a tool but never use it.
4. Define success metrics before launch — decide in advance (e.g. adoption >70%, satisfaction ≥4.5/5, 20% time saved); don't change criteria after seeing results.
5. Gather feedback frequently — short weekly check-ins surface issues while cheap to fix (aligns with the weekly satisfaction pulse).
6. Ask "Why?" not only "What?" — follow scores with interviews/open-ended questions.
7. Prioritize improvements by evidence — fix the biggest pain points first, not the loudest voice or newest idea.
8. Keep iterations small — one/few meaningful changes per release so improvements are attributable.
9. Record decisions + learning — after each iteration document what was tested, evidence, what changed, next hypothesis.
10. Know when to stop — validation must lead to a decision; if adoption/satisfaction stay low after evidence-driven iterations, park or terminate (aligns with monthly Continue/KIV/Terminate).
11. Validate with representative users — pilot with the actual department/user group that owns the problem, not tech-curious volunteers.
12. Distinguish validation from verification — verification = "did we build it correctly?"; validation = "did we build something users actually need?" Internal Track is primarily validation.

**Suggested validation cycle:** define hypothesis + success metrics → build smallest usable version → deploy to target users → measure adoption/satisfaction/business outcomes → collect qualitative feedback → prioritize highest-impact improvements → release updated version → repeat until evidence supports **Adopt / Promote / KIV / Terminate.**
