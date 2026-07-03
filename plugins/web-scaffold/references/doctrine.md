# Architecture doctrine

North star: **lightest credible architecture for the validation job.** Reduce distance between idea, deployment, evidence, decision. First build may be temporary — rebuild after validation acceptable. Delaying validation weeks to design permanent system: not acceptable.

## Delivery targets

| Milestone | Target |
|---|---|
| Local project running | Same day |
| First deployed URL | 1 working day |
| First usable validation release | 5–15 working days |
| Basic observability + feedback loop | Before first user access |
| Hardening assessment | Before promote decision |

Proposed architecture can't meet targets → simplify scope, pick lighter platform, or escalate dependency.

## Complexity ladder

Climb bottom-up. Stop at first rung that tests hypothesis honestly. Later rung = more justification needed.

1. No-code / form / spreadsheet / low-code workflow
2. Static or mostly-static web app
3. Hosted full-stack app with managed auth + data
4. Lightweight serverless API + simple frontend
5. Managed container, background job, custom runtime
6. Custom infrastructure
7. Core-system integration

## Default bias

- Managed platforms wherever possible. No custom infra unless validation requires it.
- No dependency on org core systems unless explicitly required.
- Loosely coupled, API-first.
- Environments simple: local + deployed validation. Nothing more without risk justification.
- Deployment automated or documented as repeatable command.
- Secrets in secure env management, never in code.
- Data isolated per project where practical.
- Components disposable until validation justifies hardening.

## Allowed shortcuts

Manual back-office work behind product. Limited automation. Limited scale. Lightweight UI. Narrow roles/permissions. Simplified data models. Temporary integrations. Disposable code. Mocked/imported/synthetic/limited-scope data. Rebuild after promotion.

## Prohibited shortcuts

- Hardcoded secrets.
- Uncontrolled access to sensitive data.
- Shared personal credentials for deployed services.
- Untracked production changes.
- No rollback, disable, or access-removal path.
- Hidden dependency on one person's laptop.
- Irreversible writes to core systems without approval.
- Broad platform build before idea validation.

## Escalation triggers

Escalate to decision owner BEFORE deployment when idea:

1. Writes to production system of record.
2. Uses customer, financial, regulated, or sensitive employee data.
3. Requires privileged credentials.
4. Could interrupt existing operations.
5. Sends external communications as org or on behalf of business unit.
6. Handles payments, contracts, compliance decisions, or legal commitments.
7. Requires new cloud accounts, private networking, VPN, VPC, or firewall changes.
8. Requires formal SLA, backup, disaster recovery, or production monitoring.

Trigger applies → local-only scaffold still fine; deploy blocked until decision owner clears it. Record required escalations in ADR.
