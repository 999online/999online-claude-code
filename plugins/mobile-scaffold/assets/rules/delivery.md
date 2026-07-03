# Delivery rules

This project is a validation build: lightest credible architecture, evidence over polish. `docs/ADR.md` records the decision — read it before changing architecture.

## Command shape (keep working)

```
npm install         # deps
npm run dev         # Metro dev server + QR (Expo Go / dev build)
npm run check       # typecheck + lint
npm run doctor      # expo-doctor project health
npm run deploy      # native: EAS Update to preview channel | PWA: web export + Cloudflare deploy
npm run deploy:prod # native: EAS internal-distribution build | PWA: prod deploy
npm run logs        # native: eas update:list | PWA/backend: wrangler tail
```

Breaking any of these = breaking the deployment baseline. README documents what each does.

## Allowed shortcuts

Manual back-office work. Limited automation/scale. Lightweight UI. One-platform polish. Narrow permissions. Simplified data models. Temporary integrations. Disposable code. Synthetic/limited data. "Requires connectivity" instead of offline sync. Rebuild after promotion. Take them — record in ADR "Known shortcuts".

## Prohibited shortcuts

Secrets in app bundle or `EXPO_PUBLIC_` vars. Uncontrolled sensitive-data access. Shared personal credentials. Untracked production changes. No rollback/disable path. Hidden laptop/phone dependencies. Irreversible core-system writes without approval. Store submission before validation.

## Escalation triggers

Escalate to decision owner BEFORE distributing changes that: write to production system of record; use customer/financial/regulated/sensitive data; require privileged credentials; could interrupt operations; send external comms on org's behalf; handle payments/contracts/legal; need new cloud accounts/VPN/VPC; need formal SLA/backup/DR; need paid developer accounts or store review (Apple $99/yr, Play $25, TestFlight/Play internal).

## Scope discipline

- Environments: local (Metro) + validation channel/URL. No more without risk justification.
- No `expo prebuild`, no bare workflow, no store submission without ADR update + escalation clearance.
- Every feature must serve the hypothesis in ADR. Feature doesn't → don't build it.
- Rollback path stays current: README documents pull-update/disable/revoke per integration.
