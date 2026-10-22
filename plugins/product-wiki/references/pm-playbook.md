# PM/PO playbook

Craft reference for `feature-intake`, `product-improve`, `delivery-sequence`, `stakeholder-report`.
Read the section you need, not the whole file.

## Intake question set

Ask what's missing, not what's answered. Batch via `AskUserQuestion` where options are real choices.
Max two rounds — then write the page with gaps marked `unknown — not supplied`.

1. **Problem** — what breaks today, for whom, how often. Reject "users want X" with no pain behind it.
2. **User** — which segment/role. "Everyone" = not answered.
3. **Outcome** — what's observably different after ship. Not "add a button".
4. **Success metric** — how you'd know it worked. No metric → say so on the page, don't invent one.
5. **Scope boundary** — what this explicitly does NOT do.
6. **Constraints** — deadline, compliance, existing system it must fit.
7. **Priority** — p0 blocks launch · p1 this cycle · p2 next · p3 someday.

## Pushback triggers

Say it plainly, once, then proceed with the gap recorded:

- Solution stated as requirement ("add a dropdown") → ask what problem the dropdown solves.
- No user named.
- AC that can't be tested ("fast", "intuitive", "seamless").
- Two features in one request → propose a split.
- Duplicates an existing page → surface the page, ask merge or distinct.
- Contradicts a shipped feature or a recorded decision → surface it before writing.

## Acceptance criteria

INVEST as a filter, not a ceremony. Each criterion: observable, testable, one assertion.

- Good — `Export of 10k rows completes and downloads as CSV within 30s.`
- Bad — `Export is performant.`

Never invent AC the stakeholder didn't imply. Missing → `## Acceptance criteria` holds
`- [ ] unknown — not supplied` and the gap lands in `recommendations.md`.

## Dependency taxonomy

Classify every edge; the type drives whether it's real or negotiable.

| Type | Means | Negotiable? |
|---|---|---|
| Technical | B calls code/API that A creates | No |
| Data | B needs a schema/field A adds | No |
| Sequencing | B is pointless before A ships | Often — challenge it |
| Shared component | A and B touch the same surface; order avoids rework | Yes — can parallelize with cost |
| External | Third-party API, vendor, contract, approval | No, but track separately |
| Org | One person/team can only do one at a time | Yes — a resourcing problem, not a product one |

A dependency with no named mechanism is an assumption. Mark it, don't record it as fact.
Cycles are always a modelling error or a real deadlock — surface both, never quietly break one.

## Prioritization

Order by: unblocks-the-most × user pain × confidence, ÷ effort. Tie → ship the one that
learns something. Explicit rule: **a p0 blocked by a p3 makes the p3 a p0** — say so.

## What makes a recommendation worth writing

Only write one if it changes a decision. Each carries: what, why it matters, what it costs,
what happens if ignored.

Worth writing: missing success metric · scope creep since intake · two features that are one ·
a simpler path to the same outcome · sequencing that delays value · an AC nobody can test ·
a dependency nobody owns · a feature with no user.

Not worth writing: wording nits · restating the page · generic best practice with no local cause.

Cut recommendations count double. A PO who only ever adds scope is not doing the job.

## Status reporting

By audience:

- **exec** — outcomes and risk. What shipped, what slipped and why, what decision is needed from them.
- **team** — what's unblocked now, what's blocked and on whom, what changed since last report.
- **standup** — three lines: shipped / in flight / blocked.
- **release-notes** — user-visible changes only, plain language, no internals.

Never green-wash. A blocked item is blocked. Slippage gets a reason, not a euphemism.
No data for a claim → say the wiki doesn't record it.
