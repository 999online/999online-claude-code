# Decision standard

Architecture acceptable when ALL eight answer yes. `web-decide` designs to pass all eight. `web-verify` audits each against repo evidence.

| # | Question | Repo evidence that satisfies it |
|---|---|---|
| 1 | Can builder run it locally without private verbal knowledge? | README documents install + run; `npm run dev` (or documented equivalent) works from fresh clone with only `.env.example` values filled |
| 2 | Can first deployed URL be created quickly? | `npm run deploy` script (or documented platform command) exists; README deploy section names platform + steps |
| 3 | Is access control appropriate for first audience? | Auth approach in ADR matches audience (public page: none + protected admin; internal: SSO/managed auth; external pilot: invite/magic link/allowlist) |
| 4 | Are secrets outside source code? | `.env.example` exists with placeholder values; `.env*` gitignored; grep finds no literal keys/tokens in tracked files |
| 5 | Is data source known and acceptable? | ADR "Data used" field filled; synthetic/limited-scope unless approval recorded |
| 6 | Can team see basic logs, errors, usage? | ADR observability field names platform logs + analytics; README logs section exists |
| 7 | Is there rollback, disable, or access-removal path? | README rollback section documents how to disable/remove/rollback |
| 8 | Is hardening or rebuild expectation explicit? | ADR "Hardening or rebuild expectation if promoted" field filled |

Any "no" → not deployable. Fix or record blocker honestly.
