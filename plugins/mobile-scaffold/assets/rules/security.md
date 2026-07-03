# Security rules

- **App bundle is public.** All app code, `EXPO_PUBLIC_*` env values, and assets are extractable by any user. Publishable/anon keys only in the app; privileged calls go through backend. App never holds admin/service-role keys.
- No hardcoded secrets. Backend keys, tokens, connection strings → `server/.dev.vars` locally (gitignored; `.dev.vars.example` committed) + wrangler secrets deployed. `.env.example` documents every `EXPO_PUBLIC_` var with placeholder; real `.env` gitignored, never committed.
- Session tokens on device → `expo-secure-store`. Never AsyncStorage, never `EXPO_PUBLIC_`.
- No shared personal credentials for deployed services. Service accounts or per-person access.
- Never build custom authentication — managed auth only (Supabase Auth/Firebase Auth/SSO). Exception: auth itself is the product hypothesis, recorded in ADR.
- Least privilege: users and builders get minimum access first audience needs. Access-removal path documented in README.
- Device permissions minimalism: request only permissions the hypothesis needs; each recorded in ADR.
- Validate input at every trust boundary (backend routes, webhooks, forms). Structured errors `{error: {code, message}}` — no stack traces to clients.
- No `eval`, no string-concatenated SQL, no WebView `injectJavaScript`/`dangerouslySetInnerHTML` with user data.
- Synthetic, masked, or limited-scope data until validation justifies more. Sensitive production data needs explicit recorded approval.
- Dependency hygiene: review `npm audit` output when adding deps; no known-critical vulns shipped.
- AI outputs that materially affect people, money, compliance, operations → human review before action.
