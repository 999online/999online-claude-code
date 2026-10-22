---
name: feature-intake
description: >
  Take a stakeholder's feature request and turn it into a real feature page — interrogate vague
  input into a named problem, user, outcome, testable acceptance criteria and a scope boundary,
  check the wiki for duplicates and contradictions first, then write features/<slug>.md, file the
  raw request under raw/, and update index and log. Pushes back on solutions-stated-as-requirements
  and untestable criteria; records gaps instead of inventing answers. Use when a stakeholder
  describes something they want. Not for creating Jira tickets — that is idea-to-ticket.
---

# feature-intake

Stakeholder input → one well-formed feature page. **The PO interrogation, not a transcription service.**

Input: `request` — free-text feature description from the caller.

## Preflight

1. **Resolve `<wiki-root>`** from `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`; read `<wiki-root>/WIKI.md`. Either missing → STOP:
   > No wiki registered for this project. Run `/product-wiki` first.
2. **No request text** → ask what they want, stop. Don't guess a feature.

## Check the wiki before asking anything

Read `index.md`, then the pages it points at. Look for:

- **Duplicate** — an existing feature covers this. Surface it, ask: merge into it, or genuinely distinct?
- **Contradiction** — this conflicts with a shipped feature, a `systems/` page, or a recorded decision. Surface it **before** interrogating. Don't let them spec something already ruled out.
- **Related** — an epic it belongs to, features it obviously touches. These become links, and dependency candidates.

## Interrogate

Read `${CLAUDE_PLUGIN_ROOT}/references/pm-playbook.md` — question set and pushback triggers.

Ask only what the request doesn't answer. Batch into one `AskUserQuestion` where the choices are real (priority, which user segment, in/out of scope). **Max two rounds** — then write the page with the gaps marked.

Fire the playbook's pushback triggers when they hit. Say it once, plainly, then proceed:

- Solution stated as requirement → ask what problem it solves.
- No user named. No testable outcome. Two features in one → propose the split.

## Write

Per the `WIKI.md` feature template and length budget:

1. `raw/requests/<YYYY-MM-DD>-<slug>.md` — the request verbatim, plus answers given. Immutable once written.
2. `features/<slug>.md` — full frontmatter (`status: proposed`, priority, owner, epic, `depends_on`/`blocks` from the related pages you found, `sources` pointing at the raw file). Unanswered fields → `unknown — not supplied`.
3. Link both directions — related features, epic, personas, systems it touches.
4. `index.md` — one line under `## Features`.
5. `log.md` — `## [<YYYY-MM-DD>] intake | <slug> — <one-line intent>`.

Existing page for this slug → apply the `WIKI.md` hand-edit guard: `last_updated_by` not `product-wiki` → append under a dated heading, never rewrite.

## Report

```
Filed — features/<slug>.md
Problem: <one line>   ·   Priority: <p?>   ·   Status: proposed
Acceptance criteria: <n> testable | none supplied
Gaps recorded: <field, field>
Related: [[<page>]] · [[<page>]]
Duplicate/conflict: <what you found, or none>
Next — /product-plan to re-map dependencies
```

## Rules

- **Never edit code.** Writes land only under `<wiki-root>`. Never auto-commit.
- **Never invent acceptance criteria, owners, metrics, or estimates.** Missing → `unknown — not supplied`, and the gap goes to `recommendations.md` on the next `/product-review`.
- **Push back once, then proceed.** Record the disagreement on the page; don't stall the intake or relitigate.
- **Duplicate check before interrogation.** Wasting a stakeholder's time on a spec that already exists is the failure mode.
- Slug kebab-case, stable, derived from the outcome not the solution.
- Two rounds of questions maximum. A page with honest gaps beats an interrogation nobody finishes.
