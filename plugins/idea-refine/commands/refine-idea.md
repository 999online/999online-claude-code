---
description: Refine one existing idea until it passes the idea-incubation-review gate (READY) — bounded loop that gates the idea, researches the web to close the review's gaps, re-gates, and repeats; pushes back honestly if it can't pass. Use on an idea that failed review, not to brainstorm new ones.
argument-hint: [existing idea one-liner, or a reviewed slug]
allowed-tools: Skill, Read, Write, Glob, Task, Agent, AskUserQuestion
---

Refine the idea in `$ARGUMENTS` toward a READY verdict.

No `$ARGUMENTS` → ask which idea (one-liner) or reviewed slug to refine, then stop. Don't guess an idea.

Invoke skill `idea-refine-loop`, pass `$ARGUMENTS`. Arg that matches an existing `docs/incubation/<slug>/SUMMARY.md` → refine from that verdict; else treat as idea text.

`idea-refine-loop` owns the whole run: preflight (require `idea-incubation-review`), gate → read gaps → research + refine → re-gate, until READY or provable pushback. Don't reimplement here.
