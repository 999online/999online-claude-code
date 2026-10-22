---
name: feature-dependencies
description: >
  Map dependencies across every feature and system page in the wiki — classify each edge
  (technical, data, sequencing, shared-component, external, org), run the bundled dep-graph script
  for deterministic topological order and cycle detection, then write dependencies.md with a
  mermaid graph and sync depends_on/blocks frontmatter in both directions. Flags cycles, dangling
  references and unowned external dependencies as blockers. Use after intake or bootstrap adds
  pages. Not for scheduling — that is delivery-sequence.
---

# feature-dependencies

Work out what actually blocks what. **Deterministic where it can be, reasoned where it must be.**

Input: none. Operates on the whole wiki.

## Preflight

Resolve `<wiki-root>` from `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`; read `<wiki-root>/WIKI.md`. Missing → STOP:
> No wiki registered for this project. Run `/product-wiki` first.

No `features/*.md` → nothing to map. Say so, suggest `/feature-request`, stop.

## 1. Infer edges

Read every `features/*.md` and `systems/*.md`. For each pair, ask whether one truly needs the other, and **classify with the taxonomy in `${CLAUDE_PLUGIN_ROOT}/references/pm-playbook.md`** — technical · data · sequencing · shared-component · external · org.

- Name the **mechanism** for every edge ("B reads the export table A creates"). No mechanism → it's an assumption: mark it `assumed`, don't record it as fact.
- Challenge soft edges. Sequencing and shared-component edges are often preference, not physics — note when one can be broken and what it costs.
- A feature depending on a `systems/` page means the capability already exists — that's a *satisfied* dependency, not a blocker. Mark it.

## 2. Sync frontmatter, then compute

1. Write inferred edges into `depends_on:` on the dependent page and `blocks:` on the prerequisite — **both directions, or the graph lies**. Flat inline slug lists only, per `WIKI.md`.
2. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/dep-graph.mjs <wiki-root>/features` → JSON with `order`, `cycles`, `roots`, `leaves`, `orphans`, `dangling`, `blocked`.
3. Trust the script for ordering and cycles. Don't re-derive them by eye.

## 3. Write `dependencies.md`

- `## Ready now` — `roots`: nothing to wait for.
- `## Blocked` — each blocked feature, what it waits on, edge type, mechanism.
- `## Cycles` — **each cycle listed with the full loop and every edge's type.** Name the weakest edge and what breaking it costs. Never silently break one.
- `## Dangling` — `depends_on` pointing at a slug with no page. Either the page is missing or the slug is a typo — say which you think it is.
- `## Assumed edges` — edges with no named mechanism, for a human to confirm or kill.
- `## External` — third-party/vendor/approval dependencies, with an owner or `unowned` (unowned is a risk, flag it).
- `## Graph` — mermaid `flowchart LR`, cycles styled distinctly, in an inline code fence.

Then `log.md`: `## [<YYYY-MM-DD>] deps | <n> edges, <n> cycles, <n> blocked`.

## Report

```
Dependencies mapped — <n> features, <n> edges
Ready now: <slug>, <slug>
Blocked: <n>   ·   Cycles: <n>   ·   Dangling refs: <n>   ·   Assumed: <n>
Worst problem: <the one edge or cycle to resolve first>
Next — /product-plan (delivery-sequence) for waves
```

## Rules

- **Never edit code.** Writes land only under `<wiki-root>`. Never auto-commit.
- **Both directions or not at all.** Every `depends_on` gets its matching `blocks`.
- **Cycles are surfaced, never resolved silently.** A cycle is a modelling error or a real deadlock; both need a human.
- **Mechanism or `assumed`.** An unexplained edge is a guess wearing a fact's clothes.
- **Script owns ordering and cycle detection.** LLM eyeballing a 40-node graph gets it wrong.
- Hand-edit guard applies — `last_updated_by` not `product-wiki` → append, never rewrite prose. Frontmatter sync is still allowed; note it in `## History`.
