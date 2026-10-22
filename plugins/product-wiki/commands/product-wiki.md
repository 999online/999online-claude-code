---
description: Set up a product wiki for this codebase and seed it from what already exists — repository, past Claude Code sessions, and existing tickets when a Jira/Confluence reader MCP is connected. Wiki lives outside the code repo. Never changes code. Run once per project; resume-safe after that.
argument-hint: [wiki directory — absolute path, outside this repo (optional)]
allowed-tools: Skill, Read, Write, Glob, Grep, Bash, Task, Agent, AskUserQuestion
---

Set up and seed the product wiki for this project. Wiki dir: `$ARGUMENTS` (empty → the skill asks).

1. Invoke skill `product-wiki-init`, pass `$ARGUMENTS`. It resolves the wiki root (refusing any path inside this repo), creates `WIKI.md` / `index.md` / `log.md` / `raw/` / `features/`, and registers the project → wiki mapping. Already initialized → it reports and stops.
2. Invoke skill `product-wiki-bootstrap`. It fans out `product-repo-analyst`, `product-history-analyst`, and `product-ticket-analyst` (last one only when a Jira/Confluence reader MCP is detected), then synthesizes their briefs into pages.

Each skill owns its own preflight and reporting. Don't reimplement here.

**Never edit code.** This repo is read-only input; every write lands under the wiki root. Never auto-commit.
