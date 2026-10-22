---
name: product-wiki-bootstrap
description: >
  Seed a product wiki from what already exists — fan out three analysts in parallel over the
  codebase, past Claude Code session transcripts, and (when a Jira/Confluence reader MCP is
  connected) existing tickets, then synthesize their briefs into systems/, features/, decisions/
  and glossary pages with index and log updates. Resume-safe: a brief already on disk is reused,
  not re-run. Use after product-wiki-init on an existing project, or standalone to re-seed after
  adding a source. Not for new feature requests — that is feature-intake.
---

# product-wiki-bootstrap

Turn an existing project into a populated wiki. **Reads the repo, writes only the wiki.**

Input: none. Resolve `<wiki-root>` first.

## Preflight

1. **Resolve `<wiki-root>`** — `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`. Missing → STOP:
   > No wiki registered for this project. Run `/product-wiki` first.
2. **Read `<wiki-root>/WIKI.md`.** Absent → same STOP. It defines every convention below.
3. **Ticket MCP check** — scan loaded tool descriptions for one that reads Jira issues or Confluence pages (**by description, not name**). Absent → note once, don't block:
   > No Jira/Confluence reader MCP connected — bootstrapping from repo + session history only.
4. **Set expectations.** Say once: three analysts run in parallel; a large repo or long session history makes this slow.

## Fan out

`mkdir -p <wiki-root>/raw/bootstrap`. Spawn in **one message, in parallel** — pass each `project_root` = `${CLAUDE_PROJECT_DIR}` and `wiki_root`:

| Agent | Brief | Spawn when |
|---|---|---|
| `product-repo-analyst` | `raw/bootstrap/BRIEF-repo.md` | always |
| `product-history-analyst` | `raw/bootstrap/BRIEF-history.md` | always |
| `product-ticket-analyst` | `raw/bootstrap/BRIEF-tickets.md` | reader MCP detected |

**Resume-safe** — a brief already on disk → don't re-spawn that analyst, read the file.

## Synthesize

Read every brief. Then, obeying the templates and length budgets in `WIKI.md`:

1. **`systems/<slug>.md`** — one per confirmed existing capability, from the repo brief. This is what the product *has*.
2. **`features/<slug>.md`** — one per candidate future feature: in-flight work, abandoned work worth reviving, recurring pain, open tickets. `status: proposed` unless a brief proves otherwise. Unknown fields → `unknown — not supplied`, never invented.
3. **`decisions/<YYYY-MM-DD>-<slug>.md`** — one per decision recovered from history or tickets. Reason not stated → say so.
4. **`glossary.md`** — domain terms that appear across briefs without definition.
5. **Cross-link both directions** — every feature naming a system links it, every system lists its dependents.
6. **Contradictions** — briefs disagree (repo says shipped, tickets say open) → record both with the conflict-handling note from `WIKI.md`. Never silently pick one.
7. **`index.md`** — one line per new page, filed under its category heading.
8. **`log.md`** — append `## [<YYYY-MM-DD>] bootstrap | <N> systems, <M> features, <K> decisions from <sources>`.

## Report

```
Bootstrapped — <wiki-root>
Sources: repo · session history (<n> sessions) · tickets (<n> items | not connected)
Created: <N> systems · <M> features · <K> decisions
Contradictions flagged: <n>
Biggest gap: <the one thing the wiki still can't answer>
Next — /product-plan to map dependencies, or /feature-request to add one
```

## Rules

- **Never edit the code repo.** Read-only, always. Every write lands under `<wiki-root>`.
- **Never auto-commit.**
- **Evidence or it doesn't go in.** Every page cites a brief line, path, session, or ticket key. No page from inference alone.
- **Candidate, not truth.** Bootstrap output is `status: proposed` and stays that way until a human confirms it.
- **Resume-safe.** Existing brief → reuse. Existing wiki page → apply the `WIKI.md` hand-edit guard (`last_updated_by` not `product-wiki` → append, never rewrite).
- Length budgets are hard caps. Cut, don't append.
- Autonomous — don't ask between analysts. Only surface a blocker if `<wiki-root>` can't be resolved.
