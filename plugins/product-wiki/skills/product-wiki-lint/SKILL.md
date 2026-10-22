---
name: product-wiki-lint
description: >
  Health-check the product wiki — contradictions between pages, claims superseded by newer sources,
  orphan pages, concepts referenced with no page, index drift, broken wikilinks, dependency cycles,
  and features stuck in one status. Fixes bookkeeping only (index entries, link targets, frontmatter
  dates); never rewrites human-edited prose. Reports everything else for a human. Use periodically
  or in /product-review. Not a product critique — that is product-improve.
---

# product-wiki-lint

Keep the wiki honest as it grows. **Fix bookkeeping, report judgement.**

Input: none.

## Preflight

Resolve `<wiki-root>` from `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`; read `<wiki-root>/WIKI.md`. Missing → STOP:
> No wiki registered for this project. Run `/product-wiki` first.

## Checks

**Structural — fix these directly:**

- **Index drift** — page on disk missing from `index.md`, or an index line pointing at a deleted page. Fix the index.
- **Broken `[[wikilinks]]`** — target doesn't exist. Obvious slug typo with one near match → fix. Ambiguous or genuinely missing page → report, don't guess.
- **Frontmatter** — missing required field per the `WIKI.md` contract, `last_updated` older than the newest `## History` line, `depends_on` without its matching `blocks`. Fix.
- **Budget** — page over its `WIKI.md` length cap. Report with the overage; don't cut someone's prose yourself.

**Judgement — report only:**

- **Contradictions** — two pages asserting incompatible things. Quote both, name which is newer.
- **Superseded claims** — a page contradicted by a later source it doesn't acknowledge. Propose the `WIKI.md` conflict note.
- **Orphans** — no inbound links. Either it needs linking or it shouldn't exist.
- **Missing pages** — a concept referenced across several pages with none of its own.
- **Dependency cycles** — re-run `node ${CLAUDE_PLUGIN_ROOT}/scripts/dep-graph.mjs <wiki-root>/features` and report `cycles` + `dangling`.
- **Stale status** — `in-progress` or `proposed` with no history entry for a long stretch.
- **Empty scaffolding** — a page that is only headings. Fill it or delete it.

## Write

Structural fixes applied in place. Then `log.md`: `## [<YYYY-MM-DD>] lint | <n> fixed, <n> reported`.

Report only, no findings file — lint output is a conversation, not another page to maintain. Recurring findings that need tracking belong in `recommendations.md` via `product-improve`.

## Report

```
Lint — <n> pages checked
Fixed (<n>): <index entries, broken links, frontmatter>
Report (<n>):
  Contradictions — <page> vs <page>: <the conflict>
  Orphans — <page>
  Missing pages — <concept>, referenced by <n> pages
  Cycles — <loop>
  Stale — <page>, <status> since <date>
Health: <one honest line>
```

Clean → `0 issues — wiki healthy.`

## Rules

- **Never edit code.** Writes land only under `<wiki-root>`. Never auto-commit.
- **Never rewrite human-edited prose.** `last_updated_by` not `product-wiki` → structural fixes only (index, links, frontmatter), and say you touched it.
- **Never delete a page.** Recommend deletion; the human deletes.
- **Never resolve a contradiction by picking a side.** Report both, note which is newer, let the human call it.
- **Fix the unambiguous, report the rest.** A guessed link target is worse than a reported broken one.
- Report counts honestly. Nothing wrong → say so; don't manufacture findings to look useful.
