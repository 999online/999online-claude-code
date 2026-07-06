# Golden path — mobile repo (Expo)

The `<name>-mobile` repo. Phone app, all profiles. Backend + web = separate repos (`profiles.md`).

## When

Users interact through app on their phone: native device features (camera, location, push, offline capture), field-worker context, or store distribution in hypothesis.

When NOT: pure desk workflow → `/web-scaffold` (path B or C). Demand/interest test → web-scaffold path A. No UI, service only → backend repo alone.

## Stack (per profile)

| Layer | Value |
|---|---|
| App framework | **Expo React Native** (managed workflow, Expo Router, TypeScript) — always |
| State | **zustand** (small) \| **Redux Toolkit** (large) — from profile |
| Notifications | **Firebase Cloud Messaging** via `expo-notifications` (managed). Alternative: `@react-native-firebase/messaging` (needs dev build) — record in ADR |
| Backend link | HTTP to separate backend repo via `EXPO_PUBLIC_API_URL` |
| Distribution | MOBILE-ONLY: PWA (Expo web → Cloudflare Pages) / native (EAS) / both. MOBILE+WEB: native default (web = separate `-web-be` repo) |

One Expo codebase covers native AND web. Distribution mode (ADR) decides which outputs ship.

## Avoid

- Native iOS/Android from scratch — managed workflow only.
- App-store launch as first validation path.
- `expo prebuild` / bare workflow before validation — `ios/`/`android/` dirs = architecture change, ADR first.
- Custom native module when an Expo SDK module exists.
- Polishing both platforms when one platform tests the hypothesis.
- Complex offline sync — offline stays simple and explicit ("requires connectivity" valid).
- Firebase admin/service-account keys in app — server-side only.
- Two web builds — MOBILE+WEB uses the `-web-be` RN-web app, not also mobile PWA (unless ADR deviates).

## Scaffolder commands (non-interactive)

Default (Expo Router + TypeScript):
```bash
npx create-expo-app@latest <name>-mobile --template default --yes
```

Lean baseline via template script (inside dir):
```bash
npm run reset-project   # don't keep example files; delete app-example/ after
```
`reset-project` absent (template drift) → move example screens out manually, keep clean `app/` with one index route.

Dependencies:
- Expo/RN-coupled (`expo-*`, `react-native-*`, `expo-notifications`): `npx expo install <pkg>` — SDK-matched version. Never `npm install <pkg>@latest` for these.
- Pure-JS (`zustand`, `@reduxjs/toolkit`, `react-redux`): `npm install <pkg>@latest`.

State:
- small → `npm install zustand`
- large → `npm install @reduxjs/toolkit react-redux`

Notifications → `npx expo install expo-notifications` (+ `expo-device`).

PWA output (when distribution mode PWA/both): `npx expo export --platform web` → static `dist/`; deploy Cloudflare Pages/Workers via wrangler (exact assets wiring from current docs — context7/WebSearch), or Cloudflare Pages dashboard Git integration (auto-deploy on push, per-branch preview URLs) — see `deployment.md`.

Flags rejected → scaffolder `--help` first, never interactive.

## Structure contract (default template post-reset)

| Location | Contains | Never contains |
|---|---|---|
| `app/` | Routes/screens only (Expo Router) | Components, business logic |
| `components/` | UI components | Data access, routes |
| `hooks/` | Reusable hooks | Components |
| `constants/` | Theme, static config | Runtime logic, secrets |
| `lib/` | API client, services, shared logic | Components |
| `store/` | State — zustand slices (small) or RTK store + slices (large) | UI, screens |
| `assets/` | Images, fonts | Source code |
| `scripts/` | Template maintenance scripts | App logic |
| `docs/` | ADR, all other .md | — |

Backend is NOT a subdir here — it is the separate `<name>-backend` (or `<name>-web-be`) repo.

Starter `allowed-paths.json` (reconcile against actual tree):

```json
{
  "allowedGlobs": [
    "app/**", "components/**", "hooks/**", "constants/**", "lib/**",
    "store/**", "assets/**", "scripts/**", "docs/**", ".claude/**",
    "*.json", "*.js", "*.mjs", "*.cjs", "*.ts", "*.tsx",
    ".gitignore", ".env.example", ".nvmrc", "expo-env.d.ts"
  ],
  "forbiddenGlobs": [
    "{utils,helpers,common,shared,misc}/**",
    "ios/**", "android/**",
    "src/**", "pages/**", "public/**", "server/**"
  ],
  "rootOnlyFiles": [".gitignore", ".env.example", ".nvmrc", "app.json", "eas.json", "expo-env.d.ts", ".mcp.json"],
  "exemptRootMd": ["README.md", "CLAUDE.md", "STANDARDS.md", "DEPLOY.md", "PLUGINS-TO-INSTALL.md"]
}
```

Rationale: `ios/**`+`android/**` forbidden = managed-workflow contract (prebuild/run = architecture change → ADR). `src/**`/`pages/**`/`public/**` = web-project drift. `server/**` forbidden = backend is a separate repo, never nested here. Junk-drawer dirs forbidden = shared code in `lib/`, state in `store/`.

## Scaffold output (stubs only)

1. `app/index.tsx` stub screen: app name + one-line hypothesis from ADR.
2. `.gitkeep` for empty contract dirs — create `lib/`, `store/` (post-reset template lacks them); `components/`, `hooks/`, `constants/` as needed.
3. `store/` stub — infra only, NO feature state:
   - small: `store/app-store.ts` — one zustand store, single placeholder field + setter.
   - large: `store/index.ts` (`configureStore`) + `store/app-slice.ts` (one slice, placeholder field); `<Provider>` wired in `app/_layout.tsx`.
4. `lib/api.ts` stub — base HTTP client reading `EXPO_PUBLIC_API_URL`; one `apiFetch(path)` wrapper + `health()` ping. NO domain endpoints (glue, not feature).
5. `lib/notifications.ts` stub — `expo-notifications` register + get-token + log; permission-gated. NO send logic, NO topic wiring. Send happens server-side (backend repo).
6. `.env.example` complete: `EXPO_PUBLIC_API_URL` (backend base URL) + public Firebase config (`EXPO_PUBLIC_FIREBASE_*`) with placeholders + public-bundle comment.
7. `google-services.json` / `GoogleService-Info.plist` — gitignored; README documents provisioning per env. Never committed.
8. Explicit offline statement in README — even "requires connectivity; shows offline notice".
9. README "Next steps": native feature per ADR, auth provider, real API endpoints in `lib/`, FCM send integration — from ADR.

Planned features → README Next steps, never code. NO auth/secure-store beyond stub, NO native-feature code, NO domain API endpoints.

## Verify notes

- `npm run check` passes; `npx expo export --platform ios --platform android` bundles clean (add `--platform web` in PWA/both mode).
- `npx expo-doctor` clean.
- Stub index screen present; `store/` has infra-only stub; `lib/api.ts` has no domain endpoints; `lib/notifications.ts` has no send logic — feature code = scope-creep fail.
- No non-`EXPO_PUBLIC_` secrets in tracked files; no Firebase admin key; `google-services.*` not committed.
- `ios/`/`android/` dirs absent.
- Offline behavior documented in README; README Next steps documents ADR's planned integrations.
- `EXPO_PUBLIC_API_URL` present in `.env.example` (points at backend repo's dev/validation URL).
- App boots in Expo Go (manual QR step — mark pending if no device available).
