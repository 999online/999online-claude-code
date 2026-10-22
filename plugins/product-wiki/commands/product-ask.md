---
description: Ask a question against the product wiki — features, dependencies, status, decisions, history. Answers with page citations, says what the wiki doesn't record rather than guessing, and offers to file a good answer back as a new page so explorations compound. Never changes code.
argument-hint: <question about the product>
allowed-tools: Skill, Read, Write, Glob, Grep, Bash, AskUserQuestion
---

Answer from the product wiki: `$ARGUMENTS`

No `$ARGUMENTS` → ask what they want to know, then stop.

Invoke skill `product-wiki-ask`, pass `$ARGUMENTS`. It reads `index.md` first to find relevant pages, drills in, answers with `[[page]]` citations, names what the wiki doesn't record, and offers to file the answer back when it's worth keeping.

It owns preflight and reporting. Don't reimplement here.

The wiki is the only source — it won't answer from the codebase, memory, or the web.
