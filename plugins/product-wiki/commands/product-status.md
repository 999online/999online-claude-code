---
description: Write a product status report from the wiki for a named audience — exec, team, standup, or release-notes. Built from feature statuses, roadmap and the log since the last report. Names blockers and slippage plainly, no green-washing. Never changes code.
argument-hint: [exec | team | standup | release-notes]
allowed-tools: Skill, Read, Write, Glob, Grep, Bash, AskUserQuestion
---

Report product status. Audience: `$ARGUMENTS` (empty → the skill asks which of the four).

Invoke skill `stakeholder-report`, pass `$ARGUMENTS`. It determines the window from the last `report` line in `log.md`, gathers feature statuses, roadmap and blockers, and shapes the whole report to the audience.

It owns preflight and reporting. Don't reimplement here.

Report goes to chat. It's filed as a wiki page only if you ask — status snapshots clutter a wiki fast.
