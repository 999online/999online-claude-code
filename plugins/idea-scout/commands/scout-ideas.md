---
description: Generate 5 sellable software ideas grounded in real web evidence, each having passed the idea-incubation-review gate (READY). Fans out four market analysts, dedupes against a persistent ledger of past proposals, auto-refines a close idea once. Use to discover fresh market-validated ideas, not to judge one idea you already hold.
argument-hint: [optional focus — e.g. "b2b saas" or "for solo devs"]
allowed-tools: Skill, Read, Write, Glob, Task, Agent, AskUserQuestion
---

Run the sellable-idea scout.

Invoke skill `idea-scout-loop`. Pass `$ARGUMENTS` as optional focus (empty → sellable software broadly, today's market). Analysts run a standing Philippines-market lens alongside the global scan every run, regardless of focus.

`idea-scout-loop` owns the whole run: preflight (require `idea-incubation-review`, suggest CurrentsAPI MCP), generate → dedupe → gate through `/incubation-review` → loop until 5 ideas hit READY. Don't reimplement here.
