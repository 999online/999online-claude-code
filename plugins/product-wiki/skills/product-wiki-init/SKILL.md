---
name: product-wiki-init
description: >
  Set up a product wiki for a codebase — pick a wiki directory outside the code repo, create it,
  git init it, write WIKI.md (the schema every later invocation reads first) plus empty index.md,
  log.md, raw/ and features/, and register the project-root -> wiki-root mapping so other
  product-wiki skills can find it. Idempotent: an existing wiki is reported, not overwritten.
  Use as the first step of /product-wiki, or standalone to point a new wiki at a repo.
  Not for seeding content — that is product-wiki-bootstrap.
---

# product-wiki-init

Create the wiki and register it. **Wiki lives outside the code repo** — the repo is read-only input, always.

Input: optional `wiki-dir` (absolute or `~`-relative) from the caller.

## Resolve the wiki root

1. `wiki-dir` given → use it. Else check `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` for `${CLAUDE_PROJECT_DIR}`. Found → already initialized, jump to **Already exists**.
2. Neither → `AskUserQuestion`: where should the wiki live? Offer a sensible sibling (`<parent-of-project>/<project-name>-wiki`) plus "somewhere else". Never guess silently.
3. **Refuse a path inside `${CLAUDE_PROJECT_DIR}`.** Say why (wiki is a separate repo by design), ask again.
4. Expand to an absolute path. No relative paths anywhere downstream.

## Already exists

`<wiki-root>/WIKI.md` present → don't touch it. Report root, page count, last `log.md` line. Suggest `product-wiki-bootstrap` if `index.md` has no entries. Stop.

## Create

1. `mkdir -p <wiki-root>/raw <wiki-root>/features`.
2. Not a git repo → `(cd <wiki-root> && git init)`. Already one → leave it.
3. Read `${CLAUDE_PLUGIN_ROOT}/references/wiki-schema.md`. Write the block between the START/END markers to `<wiki-root>/WIKI.md`, filling `<wiki-root>`, `<project-root>` (= `${CLAUDE_PROJECT_DIR}`), `<project-name>`, `<YYYY-MM-DD>`.
4. Write `<wiki-root>/index.md`:
   ```markdown
   # Index

   Catalog of every page. One line each.

   ## Features
   ## Epics
   ## Systems
   ## Personas
   ## Decisions
   ## Reference
   ```
5. Write `<wiki-root>/log.md`: `# Log` + `Append-only. One line per operation.` + a blank line.
6. Append the first log line: `## [<YYYY-MM-DD>] init | wiki created for <project-name>`.
7. Register the mapping in `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` — a JSON object keyed by absolute project root, value the absolute wiki root. File missing → create it. Key present with a different value → ask before rewriting.

## Report

```
Wiki ready — <wiki-root>
Project (read-only) — <project-root>
Schema — <wiki-root>/WIKI.md
Next — product-wiki-bootstrap to seed from the repo + past sessions
```

Say once: open `<wiki-root>` in Obsidian as a vault to browse it.

## Rules

- **Wiki root outside the project root.** Non-negotiable — refuse and re-ask.
- **Never write into `${CLAUDE_PROJECT_DIR}`.** The one exception is nothing. Registration lives in `${CLAUDE_PLUGIN_DATA}`.
- **Never auto-commit** the wiki repo. `git init` only.
- Idempotent — re-running on an initialized wiki reports and stops. Never clobber `WIKI.md`.
- Absolute paths only; anchor Bash as `(cd <dir> && cmd)` — cwd drifts across calls.
