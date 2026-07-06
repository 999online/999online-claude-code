# Security rules

- **App bundle is public.** All app code, `EXPO_PUBLIC_*` env values, `google-services` config, and assets are extractable by any user. Publishable/anon keys only in the app; privileged calls go through the backend repo. App never holds admin/service-role/Firebase service-account keys.
- No hardcoded secrets. Backend (separate repo) keys, tokens, connection strings, `FIREBASE_SERVICE_ACCOUNT` → `.dev.vars` (Hono, gitignored; `.dev.vars.example` committed) or `.env` (NestJS, gitignored; `.env.example` committed) + deployed secret store (wrangler secret / AWS). Mobile `.env.example` documents every `EXPO_PUBLIC_` var with placeholder; real `.env` gitignored. `google-services.json`/`GoogleService-Info.plist` gitignored.
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
