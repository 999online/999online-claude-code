---
name: idea-scout-loop
description: Orchestrate the sellable-idea scout — preflight (require idea-incubation-review, suggest optional CurrentsAPI MCP), then loop generate → dedupe → gate each candidate through incubation-review until 5 ideas reach READY, auto-refining one close candidate once. Presents the 5 with why-it-sells rationale, source URLs, and verdict. Use when the user runs /scout-ideas or asks for fresh sellable software ideas.
---

# idea-scout-loop

Drive to **5 sellable ideas that pass idea-incubation-review (READY)**, grounded in web evidence, none a duplicate of past runs. Autonomous — no pausing between rounds.

Input: optional `focus` from the caller.

## Preflight

1. **Require idea-incubation-review.** Probe for its skills `incubation-research` + `incubation-scorecard` (or command `/incubation-review`). Not available → STOP:
   > idea-scout needs the idea-incubation-review plugin (it's the gate every idea must pass). Install it, then re-run:
   > `/plugin install idea-incubation-review@999online`
2. **Suggest CurrentsAPI MCP (optional).** No `currentsapi` MCP tools connected → note once, don't block:
   > Tip: `/init-mcp <token>` adds fresh news grounding (what's selling *today*). Continuing with WebSearch.
3. **Set expectations.** Say once: each candidate runs a full incubation-review (3 analysts) — this is token-heavy by design; the software-first bias keeps rejections low.

## Loop

`winners = []`, `round = 0`, cap `round < 5`.

While `len(winners) < 5` and `round < 5`:
1. `round += 1`.
2. `idea-generate` (pass `focus`, `need = 5 - len(winners)`, `run = round`) → candidates (each: one-liner, why-it-sells, sources, slug).
3. For each candidate until `winners` hits 5 — **gate it**:
   - `incubation-research <one-liner>` → slug + track. Then `incubation-scorecard <slug> <track>` → writes `${CLAUDE_PROJECT_DIR}/docs/incubation/<slug>/SUMMARY.md`.
   - Read SUMMARY.md, parse the **Verdict** line:
     - **READY** → accept. `idea-ledger` append (verdict `ready`, sources). Add to `winners`.
     - **REFINE** → **auto-refine once**: read the SUMMARY's decisive gap / gaps-to-close → rewrite the one-liner to close it (new slug) → gate the rewrite once. READY → accept + ledger `ready`. Still not READY → `idea-ledger` append `refine-failed`, discard.
     - **RETHINK** → `idea-ledger` append `rethink`, discard.
4. Loop. Ledger grows each round, so the next `idea-generate` won't re-propose anything tried.

## Present

Once `winners` == 5 (or the cap trips), show:

For each idea:
```
### <n>. <Name> — <one-liner>
**Market:** <global | Philippines | both>
**Why it sells:** <2–3 lines, market-grounded>
**Sources:** <url> · <url> · <url>
**Incubation:** READY · <Commercial | Internal> track · docs/incubation/<slug>/SUMMARY.md
```

Then one line: ledger updated at `docs/proposed-ideas/LEDGER.md` (N total tried this run, M passed).

## Rules

- **Don't spin.** Round cap = 5. Cap hit with < 5 winners → present what passed, name why the rest failed (usually the software-first hard gate or thin demand), suggest a sharper `focus`, stop. Don't loop forever.
- **Every winner carries source URLs.** An idea with no basis is not presentable — refuse it (requirement).
- **No duplicates.** Trust `idea-ledger` dedup; never re-propose a ledger slug.
- **READY is the bar.** Never present a REFINE or RETHINK idea as a winner.
- **Philippines is a standing lens.** Analysts cover PH every run alongside the global market; aim for ≥1 PH-targeted or PH-inclusive winner when PH signal supports it — never force a weak one past the gate.
- Autonomous: don't ask the user between rounds. Only surface a blocker if the gate itself can't run (missing plugin → handled in preflight).
