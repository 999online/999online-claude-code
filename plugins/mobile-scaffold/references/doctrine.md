# Architecture doctrine — mobile

North star: **lightest credible architecture for the validation job.** Reduce distance between idea, on-device app, evidence, decision. First build may be temporary — rebuild after validation acceptable. Delaying validation weeks to design permanent system: not acceptable.

## Delivery targets

| Milestone | Target |
|---|---|
| App running in Expo Go on a real phone | Same day |
| First shareable artifact (PWA URL, EAS Update, or Android build) | 1–2 working days |
| First usable validation release | 5–15 working days |
| Basic observability + feedback loop | Before first user access |
| Hardening assessment | Before promote decision |

iOS installable build waits on Apple Developer account — escalation trigger 9, not a delivery failure. Proposed architecture can't meet targets → simplify scope, drop a platform, or escalate dependency.

## Complexity ladder — mobile

Climb bottom-up. Stop at first rung that tests hypothesis honestly. Later rung = more justification needed.

1. No app — form, spreadsheet, chat workflow
2. Responsive web app, desk use → `/web-scaffold`, not this plugin
3. PWA — Expo web output on a URL, no store, no install
4. Expo managed app, Expo Go-compatible (Expo SDK modules only, zero accounts)
5. Expo dev build / EAS internal distribution (custom native modules, installable builds)
6. TestFlight / Play internal testing (store accounts, review lag)
7. Bare workflow / custom native modules outside Expo SDK

Public app-store launch is never the first validation path (Path F standard).

## Default bias

- Managed workflow (Expo) wherever possible. No bare workflow, no `expo prebuild`, unless validation requires native depth Expo SDK can't give.
- One platform first when one platform tests the hypothesis.
- Managed platforms for backend. No custom infra.
- No dependency on org core systems unless explicitly required.
- Loosely coupled, API-first — app talks to backend over HTTP, never holds privileged access.
- Environments simple: local (Metro) + validation channel/URL. Nothing more without risk justification.
- Distribution automated or documented as repeatable command.
- Secrets never in the app bundle — backend env only.
- Data isolated per project where practical.
- Components disposable until validation justifies hardening.

## Allowed shortcuts

Manual back-office work behind product. Limited automation. Limited scale. Lightweight UI. One-platform polish. Narrow roles/permissions. Simplified data models. Temporary integrations. Disposable code. Mocked/imported/synthetic/limited-scope data. "Requires connectivity" instead of offline sync. Rebuild after promotion.

## Prohibited shortcuts

- Secrets in app code or `EXPO_PUBLIC_` vars — bundle is public.
- Uncontrolled access to sensitive data.
- Shared personal credentials for deployed services.
- Untracked production changes.
- No rollback, disable, or access-removal path.
- Hidden dependency on one person's laptop or phone.
- Irreversible writes to core systems without approval.
- Store submission before idea validation.
- `expo prebuild` / bare workflow without ADR-recorded justification.

## Escalation triggers

Escalate to decision owner BEFORE deployment/distribution when idea:

1. Writes to production system of record.
2. Uses customer, financial, regulated, or sensitive employee data.
3. Requires privileged credentials.
4. Could interrupt existing operations.
5. Sends external communications as org or on behalf of business unit.
6. Handles payments, contracts, compliance decisions, or legal commitments.
7. Requires new cloud accounts, private networking, VPN, VPC, or firewall changes.
8. Requires formal SLA, backup, disaster recovery, or production monitoring.
9. Requires paid developer accounts or store review — Apple Developer ($99/yr), Play Console ($25 one-time), TestFlight/Play internal testing. Cleared before purchase or submission.

Trigger applies → local scaffold + Expo Go still fine; distribution blocked until decision owner clears it. Record required escalations in ADR.
