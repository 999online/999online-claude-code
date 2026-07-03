# Delivery rules

This project is a validation build: lightest credible architecture, evidence over polish. `docs/ADR.md` records the decision — read it before changing architecture.

## Command shape (keep working)

```
npm install         # deps
npm run dev         # local
npm run check       # typecheck + lint + tests
npm run deploy      # preview/validation deploy
npm run deploy:prod # production deploy
npm run logs        # platform logs
```

Breaking any of these = breaking the deployment baseline. README documents what each does.

## Allowed shortcuts

Manual back-office work. Limited automation/scale. Lightweight UI. Narrow permissions. Simplified data models. Temporary integrations. Disposable code. Synthetic/limited data. Rebuild after promotion. Take them — record in ADR "Known shortcuts".

## Prohibited shortcuts

Hardcoded secrets. Uncontrolled sensitive-data access. Shared personal credentials. Untracked production changes. No rollback/disable path. Hidden laptop dependencies. Irreversible core-system writes without approval. Broad platform build before validation.

## Escalation triggers

Escalate to decision owner BEFORE deploying changes that: write to production system of record; use customer/financial/regulated/sensitive data; require privileged credentials; could interrupt operations; send external comms on org's behalf; handle payments/contracts/legal; need new cloud accounts/VPN/VPC; need formal SLA/backup/DR.

## Scope discipline

- Environments: local + deployed validation. No staging without risk justification.
- No CI/CD before first deploy when CLI/Git deploy suffices.
- Every feature must serve the hypothesis in ADR. Feature doesn't → don't build it.
- Rollback path stays current: README documents disable/remove/rollback per integration.
