# Deployment standard

Standard is NOT one platform for everyone. Standard is: selected platform has simple, repeatable laptop → deployed URL path.

## Command shape

Every custom-code project exposes this shape (npm scripts, or documented equivalents for non-Node stacks):

```
Install:        npm install
Run local:      npm run dev
Check:          npm run check        # typecheck + lint + tests, whatever applies
Deploy preview: npm run deploy
Deploy prod:    npm run deploy:prod
Logs:           npm run logs
```

Stack can't be represented by similarly short sequence → confirm extra complexity is required for validation.

## Minimum repository documentation (README)

1. What the app does.
2. Required runtime version.
3. Required local tools.
4. Required environment variables.
5. How to install dependencies.
6. How to run locally.
7. How to run tests or smoke checks.
8. How to deploy.
9. How to view logs.
10. How to roll back, disable, or remove access.

## Deployment models

Lightest model that fits risk:

| Model | Use when | Standard |
|---|---|---|
| CLI deploy from laptop | Early validation, small team, low risk | Commands documented, repeatable by another builder |
| Git-based preview deploy | Multiple builders, web apps | Branch/PR produces preview URL |
| Platform dashboard deploy | No-code/low-code tools | Ownership, access, rollback documented |
| Container deploy | Custom runtime, background jobs | Dockerfile/platform config committed |
| CI/CD pipeline | Promotion candidate, higher risk | Build/test/deploy/rollback automated |

No CI/CD required before first deployment when platform CLI or Git deploy safely produces validation environment.

## Environment model

Minimum: **local** (builder) + **deployed validation** (users). "Production" may simply mean live validation URL. Staging only for higher-risk or promoted products. No environment complexity without risk justification.

## Deployment baseline

Each project must have: source-controlled code; repeatable build+deploy; separate local and deployed envs; env vars for secrets/config; basic logging or error visibility; rollback/disable/access-removal path; named deployment owner; known first-user audience; feedback + usage measurement path.

## Operations minimum

Every deployed project answers: is it used? by whom? where failing? what feedback? what evidence for next decision?

Minimum observability:
- Platform logs or error visibility (Cloudflare/Vercel/Railway/Render/Fly/Firebase native).
- Basic usage analytics tied to validation hypothesis (Plausible, PostHog, GA, Vercel Analytics, Cloudflare Web Analytics).
- Feedback channel (form or in-product prompt).
- Deployment date + URL recorded (in README or ADR).
- Named owner for user issues.

Sentry or platform-native error tracking only for meaningful runtime risk.
