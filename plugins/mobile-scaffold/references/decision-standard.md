# Decision standard — mobile

Architecture acceptable when ALL eight answer yes. `mobile-decide` designs to pass all eight. `mobile-verify` audits each against repo evidence.

| # | Question | Repo evidence that satisfies it |
|---|---|---|
| 1 | Can builder run it locally without private verbal knowledge? | README documents install + run; `npm run dev` + Expo Go QR (or documented equivalent) works from fresh clone with only `.env.example` values filled |
| 2 | Can first shareable artifact be created quickly? | `npm run deploy` script exists (EAS Update channel, or PWA export + Cloudflare deploy per distribution mode); README deploy section names steps + account setup |
| 3 | Is access control appropriate for first audience? | Auth approach in ADR matches audience (internal: SSO/managed auth; external pilot: invite/magic link; field testers, no sensitive data: none + internal-distribution link documented as the access control) |
| 4 | Are secrets outside the app bundle? | `.env.example` has only `EXPO_PUBLIC_` publishable values; `.env*` gitignored; grep finds no non-public keys/tokens in tracked files; backend secrets in `server/.dev.vars.example` + wrangler secrets |
| 5 | Is data source known and acceptable? | ADR "Data used" field filled; synthetic/limited-scope unless approval recorded |
| 6 | Can team see basic logs, errors, usage? | ADR observability field names EAS dashboard / wrangler tail + analytics + feedback channel; `npm run logs` exists |
| 7 | Is there rollback, disable, or access-removal path? | README rollback section: `eas update:republish` prior group / disable channel / PWA re-deploy / revoke install access; covers each integration |
| 8 | Is hardening or rebuild expectation explicit? | ADR "Hardening or rebuild expectation if promoted" field filled |

Any "no" → not distributable. Fix or record blocker honestly.
