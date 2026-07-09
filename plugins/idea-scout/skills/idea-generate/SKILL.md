---
name: idea-generate
description: Generate 3–5 candidate sellable software ideas grounded in real web evidence — fan out four market analysts (trend, demand, whitespace, monetization) in parallel, synthesize their cited briefs into software-first candidates, dedupe against idea-ledger, attach source URLs to each. Use inside idea-scout-loop each round, or standalone to brainstorm market-validated ideas. Does not score ideas — that is idea-incubation-review.
---

# idea-generate

Produce grounded candidate ideas. Analysts do the digging in parallel, isolated contexts. Don't research inline.

Inputs from caller: optional `focus`, how many candidates needed (`need`), a `run` tag.

## Steps

1. **Dedup context** — invoke `idea-ledger` (read). Hold all past slugs + one-liners. Candidates must be fresh against this.

1.5. **Optional fresh-news snapshot.** CurrentsAPI MCP connected (tools present, e.g. latest-news / search)? Pull a short digest keyed to `focus` and write `${CLAUDE_PROJECT_DIR}/docs/proposed-ideas/runs/<run>/NEWS.md` (headline + URL per item). Not connected → skip, no NEWS.md. This is where the optional MCP earns its keep; the trend + demand analysts read NEWS.md when present.

2. **Fan out — one message, four agents in parallel** (mirror incubation-research). Pass each the `focus`, the run tag, and the NEWS.md path if it exists. Each writes ONE cited brief to `${CLAUDE_PROJECT_DIR}/docs/proposed-ideas/runs/<run>/BRIEF-<dimension>.md`:
   - `sellable-trend-analyst` → what's rising now (BRIEF-trend.md)
   - `sellable-demand-analyst` → real unmet need / pain (BRIEF-demand.md)
   - `sellable-whitespace-analyst` → competitive gaps (BRIEF-whitespace.md)
   - `sellable-monetization-analyst` → who pays + proven pricing (BRIEF-monetization.md)
   Any agent failed / empty → retry once, else note the gap and synthesize from what returned.

3. **Synthesize** the four briefs into `need + 2` candidate ideas (a couple extra so gate rejections don't starve the round). Each candidate:
   - **Software-first** — delivered + operated as software through profitability: no new headcount, no manual ops, no physical presence. (This is incubation-review's hard gate. An idea that can't clear it is wasted work — don't propose it.)
   - Sits at the intersection of the briefs: a rising trend + a real unmet need + a competitive gap + a buyer with budget. Weak on any of the four → drop it.
   - **Target market** — every candidate names its market: `global`, `Philippines`, or `both`. Briefs carry a standing PH lens (PH-specific trends/pains/gaps/monetization); mine at least one PH-targeted or PH-inclusive candidate per round when the PH slices show real signal. Don't force a weak PH idea — a `[PH]` tag still needs the four-way intersection.
   - **Cited** — a `## Sources` list of URLs backing *why we propose it*. No sources → not a candidate (requirement: no idea without a basis).
   - **Fresh** — run each past `idea-ledger` dedup-check. Duplicate → drop, generate another.

4. **Return** the candidate list. Per candidate: name, one-line pitch, target market (global/Philippines/both), why-it-sells (2–3 lines drawn from the briefs), source URLs, proposed kebab-case slug.

## Rules

- Cite everything load-bearing. Drop unverifiable claims — don't guess a trend.
- "Everyone" is not a buyer. Name one segment per idea.
- Philippines is a standing lens, not the only lens. Cover PH every run; keep global candidates too unless the caller's `focus` says PH-only.
- Prefer CurrentsAPI MCP for fresh news when connected (analysts handle this); WebSearch otherwise.
- Don't score, rank by confidence, or judge viability here — hand candidates to the gate.
