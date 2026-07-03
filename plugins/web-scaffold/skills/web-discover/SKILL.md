---
name: web-discover
description: Intake for new web project idea — capture hypothesis, audience, data sensitivity, persistence/auth/integration needs, then check escalation triggers. Use when starting /web-scaffold pipeline or when user wants to spec an idea before architecture decision. Not for existing projects — this shapes a build that doesn't exist yet.
---

# web-discover

Interrogate idea until intake complete. Output: structured intake summary in conversation, consumed by `web-decide`. No file writes.

Read `${CLAUDE_PLUGIN_ROOT}/references/doctrine.md` first — escalation triggers and complexity ladder come from there.

## What to capture

1. **Idea + hypothesis** — what deployment must prove, one sentence. Vague idea → push back, sharpen before proceeding.
2. **Audience** — public anonymous / internal team / invited external pilot / builder only.
3. **Persistence** — does anything need saving beyond form submission?
4. **Accounts/auth** — do users log in? Who exactly?
5. **Integrations** — external services or org systems touched? Read or write?
6. **UI** — screens needed, or service-only?
7. **Data sensitivity** — synthetic/public, internal non-sensitive, or sensitive/regulated?
8. **Escalation triggers** — which of the 8 from doctrine.md apply?

## How

- Info already given (arguments, conversation) → don't re-ask. Only ask gaps.
- Use AskUserQuestion, max 3 rounds, batch related questions:
  - Round 1: hypothesis (if missing) + audience.
  - Round 2: persistence + auth + integrations + UI.
  - Round 3: data sensitivity + escalation triggers as ONE multiSelect listing all 8 ("any apply?" — include none-apply option).
- Empty/unclear answer → ask once more in plain text. Still nothing → stop, tell user intake incomplete, list missing items.
- Infer triggers user missed: "syncs to billing" = production-system write; "emails customers" = external comms. State inference, confirm.

## Escalation gate

Any trigger applies → stop and state clearly:

> Escalation required. Trigger(s): <list>. Per architecture standard, decision owner must clear these BEFORE deploy. Options: (1) continue — scaffold local-only, escalations recorded in ADR, deploy blocked until cleared; (2) stop here.

User picks. Never proceed to deploy-ready framing with uncleared triggers.

## Output

End with intake summary block:

```
## Intake summary
- Hypothesis: ...
- Audience: ...
- Persistence: yes/no — what
- Auth: yes/no — who
- Integrations: none | list (read/write per item)
- UI: yes/no
- Data sensitivity: ...
- Escalation triggers: none | list + user decision (continue local-only / stopped)
```
