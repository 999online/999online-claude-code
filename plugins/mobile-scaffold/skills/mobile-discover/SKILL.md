---
name: mobile-discover
description: Intake for new mobile app idea — capture hypothesis, audience, native features, platforms, offline needs, data sensitivity, plus the profile axes (target mobile-only/+web, size small/large), then check escalation triggers. Use when starting /mobile-scaffold pipeline or when user wants to spec a mobile idea before architecture decision. Not for existing projects.
---

# mobile-discover

Interrogate idea until intake complete. Output: structured intake summary in conversation, consumed by `mobile-decide`. No file writes.

Read `${CLAUDE_PLUGIN_ROOT}/references/doctrine.md` (escalation triggers, ladders) and `${CLAUDE_PLUGIN_ROOT}/references/profiles.md` (the 2-axis profile matrix) first.

## What to capture

1. **Idea + hypothesis** — what app must prove, one sentence. Vague → push back, sharpen first.
2. **Audience** — field workers / internal team / invited external pilot / public / builder only.
3. **Target axis** — MOBILE-ONLY or MOBILE+WEB? Does the hypothesis need a companion web app (browser reach, desk users of same data), or is phone enough?
4. **Native device features** — camera, location/GPS, push notifications, offline capture, background, biometrics, sensors/BLE — or none. (Push ⇒ Firebase FCM, all profiles.)
5. **Platforms** — iOS / Android / both (default both; one fine when it tests hypothesis). Web too if MOBILE+WEB.
6. **Store distribution in hypothesis?** — must users install from a store, or is "uses it on their phone" enough?
7. **Offline requirement** — offline / poor connectivity? What exactly must work offline. Keep simple + explicit.
8. **Persistence / auth / integrations** — anything saved beyond device? Users log in — who? External services or org systems, read/write?
9. **Size axis** — small or large backend? Default **small (Cloudflare: Hono + D1)**. Large (NestJS + Postgres/AWS) only when relational integrity across many entities, complex transactions, existing Postgres/AWS mandate, or scale beyond Workers/D1. Infer from persistence answer, confirm.
10. **Data sensitivity** — synthetic/public, internal non-sensitive, or sensitive/regulated?
11. **Escalation triggers** — which of the 9 from doctrine.md apply? (AWS for large = trigger 7.)

## How

- Info already given (arguments, conversation) → don't re-ask. Only ask gaps.
- Use AskUserQuestion, max 3 rounds, batch related:
  - Round 1: hypothesis (if missing) + audience + **target axis** (mobile-only / +web) + platforms.
  - Round 2: native features (multiSelect incl. "none") + store-distribution + offline.
  - Round 3: persistence/auth/integrations + **size axis** (small default / large + why) + data sensitivity + escalation triggers as ONE multiSelect listing all 9.
- Empty/unclear → ask once more in plain text. Still nothing → stop, tell user intake incomplete, list missing.
- Infer + confirm: "takes photos" = camera; "works on site" = offline; "notifies customers" = push (FCM) + external comms; "many linked records / reporting" = leans large; "simple sync" = small.
- **Bias defaults:** Expo (only mobile framework), Cloudflare small (pure Cloudflare). Large needs a reason. Push = Firebase.

## Escalation gate

Any trigger applies → stop and state:

> Escalation required. Trigger(s): <list>. Per architecture standard, decision owner must clear these BEFORE distribution. Options: (1) continue — scaffold local-only (Expo Go + `wrangler dev` still work), escalations recorded in ADR, distribution blocked until cleared; (2) stop here.

User picks. Never proceed to distribution-ready framing with uncleared triggers.

## Output

End with intake summary block:

```
## Intake summary
- Hypothesis: ...
- Audience: ...
- Target: MOBILE-ONLY | MOBILE+WEB
- Size (proposed): small (Cloudflare) | large (NestJS+Postgres/AWS) — reason if large
- Platforms: iOS/Android/both (+web if MOBILE+WEB)
- Native features: none | list (push ⇒ FCM)
- Store distribution in hypothesis: yes/no
- Offline: none | what must work offline
- Persistence: yes/no — what
- Auth: yes/no — who
- Integrations: none | list (read/write per item)
- Data sensitivity: ...
- Escalation triggers: none | list + user decision (continue local-only / stopped)
```
