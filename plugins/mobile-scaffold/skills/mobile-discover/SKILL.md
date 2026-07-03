---
name: mobile-discover
description: Intake for new mobile app idea — capture hypothesis, audience, native device features, platforms, store-distribution hypothesis, offline needs, data sensitivity, then check escalation triggers. Use when starting /mobile-scaffold pipeline or when user wants to spec a mobile idea before architecture decision. Not for existing projects — this shapes a build that doesn't exist yet.
---

# mobile-discover

Interrogate idea until intake complete. Output: structured intake summary in conversation, consumed by `mobile-decide`. No file writes.

Read `${CLAUDE_PLUGIN_ROOT}/references/doctrine.md` first — escalation triggers and complexity ladder come from there.

## What to capture

1. **Idea + hypothesis** — what app must prove, one sentence. Vague idea → push back, sharpen before proceeding.
2. **Audience** — field workers / internal team / invited external pilot / public / builder only.
3. **Native device features** — camera, location/GPS, push notifications, offline data capture, background tasks, biometrics, sensors/BLE — or none. Drives distribution-mode decision.
4. **Platforms** — iOS / Android / both (default both; one platform fine when it tests hypothesis).
5. **Store distribution in hypothesis?** — does the learning require users installing from a store, or is "uses it on their phone" enough?
6. **Offline requirement** — will users be offline or on poor connectivity? What exactly must work offline? Keep simple + explicit.
7. **Persistence / auth / integrations** — anything saved beyond the device? Do users log in — who exactly? External services or org systems touched, read or write?
8. **Data sensitivity** — synthetic/public, internal non-sensitive, or sensitive/regulated?
9. **Escalation triggers** — which of the 9 from doctrine.md apply?

## How

- Info already given (arguments, conversation) → don't re-ask. Only ask gaps.
- Use AskUserQuestion, max 3 rounds, batch related questions:
  - Round 1: hypothesis (if missing) + audience + platforms.
  - Round 2: native features (multiSelect incl. "none") + store-distribution + offline.
  - Round 3: persistence/auth/integrations + data sensitivity + escalation triggers as ONE multiSelect listing all 9 ("any apply?" — include none-apply option).
- Empty/unclear answer → ask once more in plain text. Still nothing → stop, tell user intake incomplete, list missing items.
- Infer answers user missed, state inference, confirm: "takes photos of documents" = camera; "works in warehouses/on site" = offline; "syncs to billing" = production-system write; "notifies customers" = external comms + push.

## Escalation gate

Any trigger applies → stop and state clearly:

> Escalation required. Trigger(s): <list>. Per architecture standard, decision owner must clear these BEFORE distribution. Options: (1) continue — scaffold local-only (Expo Go still works), escalations recorded in ADR, distribution blocked until cleared; (2) stop here.

User picks. Never proceed to distribution-ready framing with uncleared triggers.

## Output

End with intake summary block:

```
## Intake summary
- Hypothesis: ...
- Audience: ...
- Platforms: iOS/Android/both
- Native features: none | list
- Store distribution in hypothesis: yes/no
- Offline: none | what must work offline
- Persistence: yes/no — what
- Auth: yes/no — who
- Integrations: none | list (read/write per item)
- Data sensitivity: ...
- Escalation triggers: none | list + user decision (continue local-only / stopped)
```
