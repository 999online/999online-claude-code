---
name: stakeholder-report
description: >
  Write a product status report from the wiki for a named audience — exec (outcomes, risk,
  decisions needed), team (unblocked, blocked and on whom, what changed), standup (three lines),
  or release-notes (user-visible changes, plain language). Built from feature statuses, roadmap.md
  and log.md since the last report. Names blockers and slippage plainly with no green-washing, and
  says when the wiki doesn't record something rather than guessing. Use for /product-status.
  Not a wiki health check — that is product-wiki-lint.
---

# stakeholder-report

Status from the wiki, for a specific reader. **No green-washing.**

Input: optional `audience` — `exec` | `team` | `standup` | `release-notes`. Empty → ask which, offering these four.

## Preflight

Resolve `<wiki-root>` from `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`; read `<wiki-root>/WIKI.md`. Missing → STOP:
> No wiki registered for this project. Run `/product-wiki` first.

## Gather

1. **Since when** — last `report` line in `log.md`. None → cover everything, and say the report covers all history.
2. `grep "^## \[" <wiki-root>/log.md` for activity in the window. That's what changed.
3. Every `features/*.md` — status, priority, owner, `## History` entries in the window.
4. `roadmap.md` — current wave, critical path. `dependencies.md` — blockers, unowned externals.
5. `recommendations.md` — open items needing a decision.

## Write, per audience

Read `${CLAUDE_PLUGIN_ROOT}/references/pm-playbook.md` § status reporting for the tone of each.

- **exec** — outcomes and risk. Shipped · slipped **with the reason** · top 3 risks · **decisions needed from them**, each with the cost of not deciding. No feature slugs, no internals.
- **team** — unblocked now · blocked and on whom (name the person or team) · what changed since last report · next wave.
- **standup** — exactly three lines: shipped / in flight / blocked.
- **release-notes** — user-visible changes only, plain language, grouped by user benefit. No internals, no refactors, no slugs.

Output to chat. File it as a wiki page **only if asked** — status reports are snapshots and clutter the wiki fast. Either way append `log.md`: `## [<YYYY-MM-DD>] report | <audience>, covering <since>–<today>`.

## Report shape

```
## <Audience> report — <YYYY-MM-DD>
Covering <since> → <today>

<the audience-shaped body>

---
Not recorded in the wiki: <what a reader will ask that the wiki can't answer>
```

## Rules

- **Never edit code.** Any write lands only under `<wiki-root>`. Never auto-commit.
- **Never green-wash.** Blocked is blocked. Slipped gets a reason, not a euphemism. At risk is not "on track".
- **Never invent progress, dates, or percentages.** The wiki records status, not velocity. No burndown, no ETA, no "80% done" unless a page literally says it.
- **Name owners for blockers.** "Blocked on integration" is useless; "blocked on <team> for API access" is a report.
- **Say what's missing.** Ending with the unanswerable question is a feature, not a failure.
- Audience shapes the whole report, not just the tone. An exec report full of slugs is the wrong report.
