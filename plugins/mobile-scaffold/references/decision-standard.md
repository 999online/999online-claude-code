# Decision standard — mobile

Architecture acceptable when ALL eight answer yes **for each emitted repo** (`<name>-mobile`, `<name>-backend` or `<name>-web-be`), plus the two profile checks. `mobile-decide` designs to pass; `mobile-verify` audits each against repo evidence.

## Profile checks (once)

| # | Question | Evidence |
|---|---|---|
| P1 | Is profile the lightest credible? | Target (mobile-only / +web) + size (small/large) match intake; small (Cloudflare) chosen unless ADR "Cloudflare-vs-alternative justification" filled for large |
| P2 | Is repo separation coherent? | Mobile repo `EXPO_PUBLIC_API_URL` ↔ backend base URL; no shared privileged creds; each repo own `git` + `.claude/` + root docs |

## Eight questions (per repo)

| # | Question | Repo evidence that satisfies it |
|---|---|---|
| 1 | Can builder run it locally without private verbal knowledge? | README documents install + run from fresh clone with only `.env.example`/`.dev.vars.example` filled. Mobile: `npm run dev` + Expo Go QR. Backend: `npm run dev` (`wrangler dev` / `nest start:dev`) + `/health` responds |
| 2 | Can first shareable artifact be created quickly? | Deploy script exists + README names steps + account setup. Mobile: EAS Update / PWA export→Cloudflare. Hono: `wrangler deploy`. NestJS: documented AWS. Web: `expo export -p web`→Cloudflare Pages |
| 3 | Is access control appropriate for first audience? | Auth approach in ADR matches audience (internal SSO/managed; external invite/magic link; field testers none + internal-distribution link as access control). Backend: token verified server-side |
| 4 | Are secrets outside the app bundle? | Mobile `.env.example` only `EXPO_PUBLIC_` publishable values; `.env*` gitignored; grep finds no non-public keys/tokens; no Firebase admin key or `google-services.*` committed. Backend secrets in `.dev.vars.example`/`.env.example` + deployed secret store (wrangler secret / AWS) |
| 5 | Is data source known and acceptable? | ADR "Data used" filled; synthetic/limited-scope unless approval recorded. DB chosen per size (D1 small / Postgres large) with migrations tracked |
| 6 | Can team see basic logs, errors, usage? | ADR observability names EAS dashboard / `wrangler tail` / AWS CloudWatch + analytics + feedback channel; `npm run logs` exists (or documented for AWS) |
| 7 | Is there rollback, disable, or access-removal path? | README rollback section: `eas update:republish` / disable channel / PWA re-deploy / `wrangler rollback` / revoke access; per integration |
| 8 | Is hardening or rebuild expectation explicit? | ADR "Hardening or rebuild expectation if promoted" filled |

Any "no" → not distributable. Fix or record blocker honestly. For MOBILE+WEB, `apps/api` and `apps/web` in the `-web-be` monorepo each satisfy the relevant rows.
