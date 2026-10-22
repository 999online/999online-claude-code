---
name: product-wiki-ask
description: >
  Answer a question against the product wiki — read index.md to find the relevant pages, drill in,
  and synthesize an answer with page citations, then offer to file the answer back as a new wiki
  page so explorations compound instead of vanishing into chat. Says what the wiki does not record
  rather than filling gaps from guesswork or the codebase. Use for /product-ask or any question
  about features, dependencies, status or decisions. Not for adding new features — that is
  feature-intake.
---

# product-wiki-ask

Query the wiki. **Cited, or it doesn't count.**

Input: `question` from the caller.

## Preflight

1. Resolve `<wiki-root>` from `${CLAUDE_PLUGIN_DATA}/wiki-roots.json` keyed by `${CLAUDE_PROJECT_DIR}`; read `<wiki-root>/WIKI.md`. Missing → STOP:
   > No wiki registered for this project. Run `/product-wiki` first.
2. No question → ask what they want to know, stop.

## Answer

1. **Read `index.md` first.** It's the map; it's cheaper than globbing and it's what keeps this working as the wiki grows.
2. Drill into the pages it points at. Follow `[[wikilinks]]` one hop where the question needs it.
3. Index looks thin or stale for this topic → fall back to `grep` across the wiki, and note that the index needs a lint pass.
4. **Synthesize.** Cite every load-bearing claim as `[[page]]`. A claim you can't cite doesn't go in the answer.
5. **Name the gaps.** The wiki not recording something is a real, useful answer — often the most useful one. Say which page *should* hold it.
6. **Conflicting pages** → present both, note which is newer, don't arbitrate.

## Offer to file it back

The answer is worth keeping when it's a comparison, a synthesis across several pages, a rationale, or something you'd expect to be asked again. Then ask:

> File this as `<suggested-path>`? It'd survive this conversation.

Yes → write the page per the `WIKI.md` conventions (frontmatter, budget, links both ways), add an `index.md` line, append `log.md`: `## [<YYYY-MM-DD>] ask | <question> → <page>`.
No → append the log line without the page: `## [<YYYY-MM-DD>] ask | <question>`.

Trivial lookups ("what's the status of X") don't warrant a page. Don't offer.

## Report

```
<the answer, prose, with [[page]] citations inline>

Sources: [[page]] · [[page]]
Not in the wiki: <what's missing, and where it should live>
Filed: <path>   (omit when nothing was filed)
```

## Rules

- **Never edit code.** Writes land only under `<wiki-root>`. Never auto-commit.
- **Wiki is the only source.** Don't answer from the codebase, from memory, or from the web. Not in the wiki → say so, and suggest `product-wiki-bootstrap` or `/feature-request` to get it in there.
- **Every claim cited.** Uncited means unsupported means it doesn't ship in the answer.
- **Never resolve a contradiction on your own authority.**
- **Ask before filing.** The user owns what enters the wiki.
- Index first, grep second. Reading every page on every question doesn't scale and isn't needed.
