---
name: delivery-sequence
description: >
  Turn the dependency graph plus priority and effort into an ordered delivery plan — waves that
  respect prerequisites, the critical path, what can run in parallel, what is blocked and on whom,
  and what to cut or defer to unblock value. Writes roadmap.md. Escalates the case where a p0 sits
  behind a low-priority prerequisite. Use after feature-dependencies. Not for inferring
  dependencies, and not a date-based schedule — it orders work, it does not promise delivery dates.
---

# delivery-sequence

Order the work. **Sequence, not dates** — the wiki records no velocity, so promising dates would be fiction.

Input: none. Reads the wiki.

## Preflight

Resolve `<wiki-root>` from `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`; read `<wiki-root>/WIKI.md`. Missing → STOP:
> No wiki registered for this project. Run `/product-wiki` first.

No `dependencies.md`, or it predates the newest feature page → run `feature-dependencies` first, then return. A stale graph produces a wrong plan.

**Unresolved cycles in `dependencies.md`** → say so and stop. Nothing downstream of a cycle can be ordered honestly.

## Build the plan

1. Read `dependencies.md` and every `features/*.md` (priority, status, effort if recorded).
2. **Waves** — wave 1 is everything ready now; wave N+1 is everything whose prerequisites all land in waves ≤ N. Take the order from `dependencies.md`, not from re-derivation.
3. **Within a wave**, order by the playbook's rule in `${CLAUDE_PLUGIN_ROOT}/references/pm-playbook.md`: unblocks-most × pain × confidence ÷ effort. Tie → whichever teaches something.
4. **Critical path** — the longest prerequisite chain. This is the floor on total duration; everything else has slack.
5. **Parallelizable** — items in the same wave with no shared component and no shared owner.
6. **Priority inversion** — a p0 behind a lower-priority prerequisite. Apply the playbook rule: **the prerequisite inherits p0**. Call it out explicitly; this is the finding people most often miss.
7. **Cuts** — what could be dropped or deferred to shorten the critical path, and what is lost by doing it. Always propose at least one if the path is longer than three waves.
8. **Shipped and dropped features** are excluded from waves but listed, so nobody re-plans them.

## Write `roadmap.md`

- `## Critical path` — the chain, why each link is real.
- `## Wave 1 … N` — per wave: features, one line each on why here; what unblocks when the wave lands.
- `## Parallel tracks` — what can run at the same time, and the constraint that would break that (shared owner, shared surface).
- `## Priority inversions` — p0 blocked by lower priority, with the escalation.
- `## Blocked, no path` — waiting on an external or unowned dependency. Name who must act.
- `## Cut candidates` — what to drop/defer, what it saves, what it costs.
- `## Excluded` — shipped, parked, dropped.

Then `log.md`: `## [<YYYY-MM-DD>] sequence | <n> waves, critical path <n> deep`.

## Report

```
Roadmap — <n> waves, critical path <n> features deep
Wave 1 (start now): <slug>, <slug>
Critical path: <slug> → <slug> → <slug>
Priority inversions: <n>   ·   Blocked with no path: <n>
Biggest lever: <the one cut or unblock that shortens the path most>
```

## Rules

- **Never edit code.** Writes land only under `<wiki-root>`. Never auto-commit.
- **No dates, no estimates the wiki doesn't record.** Order and dependency only. Effort absent → say `effort unknown`, don't guess.
- **A stale or cyclic graph stops the run.** Better no plan than a confidently wrong one.
- **Always name the cut.** A sequence with no cut option is a wish list.
- **Priority inversions get escalated, not quietly reordered.**
- Hand-edit guard applies to `roadmap.md` — human-edited → append a dated section, don't rewrite.
