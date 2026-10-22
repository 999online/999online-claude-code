---
description: Product-owner review of the wiki — recommend improvements and cuts (missing metrics, untestable criteria, scope creep, features with no user, simpler paths), then health-check the wiki for contradictions, orphans, broken links and stale pages. Writes recommendations.md. Never changes code.
argument-hint: [feature slug or epic to scope the review (optional)]
allowed-tools: Skill, Read, Write, Glob, Grep, Bash
---

Review the product wiki. Scope: `$ARGUMENTS` (empty → whole wiki).

1. Invoke skill `product-improve`, pass `$ARGUMENTS`. It reviews features the way a PO would and appends to the `recommendations.md` ledger — cuts as readily as additions.
2. Invoke skill `product-wiki-lint`. It fixes bookkeeping (index drift, broken links, frontmatter) and reports judgement calls (contradictions, orphans, cycles, stale pages) for a human.

Both skills own their preflight and reporting. Don't reimplement here.

`product-improve` recommends only — it never changes a feature's status, priority, or acceptance criteria.
