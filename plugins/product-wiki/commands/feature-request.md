---
description: File a stakeholder feature request into the product wiki — interrogate it into a problem, user, outcome and testable acceptance criteria, check for duplicates and contradictions first, write the feature page, then re-map dependencies. Never changes code, never creates Jira tickets.
argument-hint: <what the stakeholder wants, in their own words>
allowed-tools: Skill, Read, Write, Glob, Grep, Bash, AskUserQuestion
---

File the feature request in `$ARGUMENTS`.

No `$ARGUMENTS` → ask what the stakeholder wants, then stop. Don't invent a feature.

1. Invoke skill `feature-intake`, pass `$ARGUMENTS`. It checks the wiki for duplicates and conflicts, interrogates the gaps (max two rounds), and writes `features/<slug>.md` plus the raw request, index and log.
2. Invoke skill `feature-dependencies` to re-map the graph now a page was added.

Both skills own their preflight and reporting. Don't reimplement here.

Creating a Jira ticket from this is out of scope — that's the `idea-to-ticket` plugin.
