<!-- TEMPLATE — copy to each repo root as DEPLOY.md, fill {{...}} per repo/profile from deployment.md command shapes. -->
# Deploy — {{REPO_NAME}}

{{PROFILE}} — {{STACK}}. Full command shape: see repo README. Cloudflare-first.

## Prerequisites
- Node {{NODE_VERSION}}. Repo deps installed (`npm install`).
- Accounts (first deploy only): {{ACCOUNTS}} (e.g. Cloudflare free; Expo free; Apple $99/yr / Play $25 if native store; AWS if large).

## First-deploy setup (one-time)
{{FIRST_DEPLOY_SETUP}}
<!-- mobile native: npm i -g eas-cli && eas login && eas init
     mobile PWA / web (wrangler CLI): npx wrangler login
     mobile PWA / web (Pages Git integration): connect repo in Cloudflare dashboard (Workers & Pages -> Create -> Pages -> Connect to Git), build cmd `npx expo export -p web`, output dir `dist` -- auto-deploys on push, per-branch preview URLs; no wrangler/secret needed
     hono backend: npx wrangler login; npx wrangler d1 create <name>-db; wrangler secret put FIREBASE_SERVICE_ACCOUNT
     nestjs backend: provision AWS Postgres + container target; set DATABASE_URL, FIREBASE_SERVICE_ACCOUNT in secret store -->

## Deploy — validation
```
{{DEPLOY_PREVIEW_CMD}}
```

## Deploy — production / promotion
```
{{DEPLOY_PROD_CMD}}
```

## Logs / status
```
{{LOGS_CMD}}
```

## Rollback
{{ROLLBACK_STEPS}}
<!-- mobile native: eas update:republish (prior group) / disable channel
     PWA / web: re-deploy prior build to Cloudflare Pages
     hono: wrangler rollback
     nestjs/AWS: redeploy prior image; migration down only if safe -->

## Environment
- Local + validation channel/URL only until promotion. Production added at promote decision.

## Escalations
{{ESCALATIONS}}  <!-- e.g. trigger 9 (Apple/Play), trigger 7 (AWS) — cleared by decision owner before deploy -->
