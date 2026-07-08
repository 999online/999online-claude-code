---
name: idea-ledger
description: Read, append to, and dedupe the proposed-ideas ledger at docs/proposed-ideas/LEDGER.md — the persistent list of every software idea idea-scout has proposed, with slug, one-liner, round, incubation verdict, and source URLs. Scaffolds docs/proposed-ideas/ on first use. Use to load past ideas before generating (dedup context), to check a candidate is not a duplicate, and to append an idea's gate result. Never deletes rows.
---

# idea-ledger

Owns the persistent proposed-ideas ledger. One ledger per workspace. Prevents duplicate ideas across runs (requirement: no idea proposed twice).

## Location + format

`${CLAUDE_PROJECT_DIR}/docs/proposed-ideas/LEDGER.md`

```markdown
# Proposed ideas ledger

Verdicts: `ready` (passed incubation-review) · `refine-failed` (REFINE, refine pass didn't reach READY) · `rethink` (failed the review)

| ID | Slug | One-liner | Round | Verdict | Sources |
|----|------|-----------|-------|---------|---------|
```

- `ID` — next integer.
- `Slug` — kebab-case, unique, stable. Join key to `docs/incubation/<slug>/`.
- `Sources` — the URLs that justified proposing it (space-separated).

## Operations

**Scaffold** — no ledger file → create `docs/proposed-ideas/` + write the header above. First use only.

**Read** — return every row. This is the dedup context handed to `idea-generate`.

**Dedup-check** (candidate one-liner + slug) → `duplicate | fresh`:
- Same slug as any row → duplicate.
- Same product for the same buyer/segment, even worded differently → duplicate. (Semantic, not string match. "AI invoice reminders for freelancers" == "automated overdue-invoice nudges for solo contractors".)
- A genuinely different angle, buyer, or wedge on a broad space → fresh.

**Append** (after a gate result) — add one row: slug, one-liner, round, verdict, source URLs.

## Rules

- Never delete or reopen a row. Terminal verdicts stay as the "already tried" record.
- Slug unique + stable once written.
- Every row needs Sources — an idea with no basis does not enter the ledger.
- Append is write-ahead: log the verdict the moment the gate returns, before moving on.
