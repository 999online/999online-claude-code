# Security rules

- No hardcoded secrets. Keys, tokens, connection strings → env vars. `.env.example` documents every required var with placeholder; real `.env` gitignored, never committed.
- No shared personal credentials for deployed services. Service accounts or per-person access.
- Never build custom authentication — managed auth only (Clerk/Firebase/Cloudflare Access/SSO). Exception: auth itself is the product hypothesis, recorded in ADR.
- Least privilege: users and builders get minimum access first audience needs. Access-removal path documented in README.
- Validate input at every trust boundary (API routes, webhooks, forms). Structured errors `{error: {code, message}}` — no stack traces to clients.
- No `eval`, no string-concatenated SQL, no `dangerouslySetInnerHTML`/`innerHTML` with user data.
- Synthetic, masked, or limited-scope data until validation justifies more. Sensitive production data needs explicit recorded approval.
- Dependency hygiene: review `npm audit` output when adding deps; no known-critical vulns shipped.
- AI outputs that materially affect people, money, compliance, operations → human review before action.
