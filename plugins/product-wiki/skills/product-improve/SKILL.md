---
name: product-improve
description: >
  Review the wiki's features the way a product owner would and recommend improvements — missing
  success metrics, untestable acceptance criteria, scope creep, two features that are really one,
  a simpler path to the same outcome, sequencing that delays value, features with no user, and
  dependencies nobody owns. Recommends cuts as readily as additions. Writes recommendations.md
  with a dated open/accepted/rejected ledger and links each item from its feature page. Use for
  /product-review. Not a wiki health check — that is product-wiki-lint.
---

# product-improve

The PO value-add. **Only write a recommendation if it would change a decision.**

Input: optional `scope` — a feature slug or epic. Empty → whole wiki.

## Preflight

Resolve `<wiki-root>` from `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`; read `<wiki-root>/WIKI.md`. Missing → STOP:
> No wiki registered for this project. Run `/product-wiki` first.

## Review

Read `${CLAUDE_PLUGIN_ROOT}/references/pm-playbook.md` — "what makes a recommendation worth writing". Then read the in-scope `features/*.md`, plus `roadmap.md` and `dependencies.md` for context.

Look for, in rough order of how much damage they do:

1. **No user** — a feature nobody was named for. Strongest kill signal in the wiki.
2. **No success metric** — nothing will tell anyone whether shipping it worked.
3. **Untestable AC** — "fast", "intuitive", "seamless". Propose the observable version.
4. **Two features in one** — propose the split, with which half ships first.
5. **Duplicated effort** — two pages solving one problem. Propose the merge.
6. **Simpler path** — a cheaper way to the same outcome. Say what's given up.
7. **Scope creep** — page grew past intake without a decision recording why. Cite the `## History` lines.
8. **Value delayed** — the roadmap ships the valuable part in wave 4 when a slice of it could go in wave 1.
9. **Unowned dependency** — an external edge with no named owner. That is a schedule risk pretending to be a task.
10. **Stale status** — `in-progress` with no history entry for a long stretch. Ask if it's actually parked.

## Write `recommendations.md`

Dated ledger, append-only for the record — status moves, rows don't disappear.

```markdown
| # | Date | Feature | Recommendation | Why it matters | Cost | If ignored | Status |
```

`Status` — `open` · `accepted` · `rejected` (with the reason). Never delete a row; a rejected recommendation is the record that it was considered.

Then link each open item from its feature page under `## Open questions`, and append `log.md`: `## [<YYYY-MM-DD>] improve | <n> recommendations (<n> cuts)`.

## Report

```
Reviewed <n> features
Recommendations: <n> open (<n> cuts, <n> additions)
Top 3:
1. <feature> — <recommendation> — <if ignored>
2. …
Kill candidates: <slug — why>, or none
```

## Rules

- **Never edit code.** Writes land only under `<wiki-root>`. Never auto-commit.
- **Only if it changes a decision.** No wording nits, no restating the page, no generic best practice with no local cause.
- **Every item carries all four**: what, why it matters, what it costs, what happens if ignored. Missing one → it isn't ready to write.
- **Cuts count double.** A review that only adds scope is not doing the job. Name at least one thing to drop, or state plainly that nothing should be.
- **Recommend, don't apply.** Never change a feature's status, priority, or AC here — that's the human's call, and `feature-intake`'s job when they agree.
- **No sycophancy.** A feature with no user gets told so.
- Append-only ledger. Rejected rows stay.
