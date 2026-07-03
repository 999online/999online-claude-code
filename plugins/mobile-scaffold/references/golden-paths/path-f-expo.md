# Path F — Mobile or field prototype (Expo)

## When

Users interact through app on their phone: native device features (camera, location, push, offline capture), field-worker context, or store distribution in hypothesis.

When NOT: pure desk workflow → `/web-scaffold` (path B or C). Demand/interest test → web-scaffold path A. No UI, service only → web-scaffold path E.

## Layers (first option = default)

| Layer | Preferred options |
|---|---|
| App framework | **Expo React Native** (managed workflow, Expo Router, TypeScript); Flutter, Ionic — allowed by incubation standards, not scaffolded by this plugin |
| Distribution | PWA via Expo web output on Cloudflare; EAS Update + internal distribution; TestFlight/Play internal only when required |
| Backend (only when persistence/auth/API needed) | **Hono + Cloudflare Workers** (`server/` subdir); Confluence-listed alternatives: Supabase, Firebase |
| Data | Cloudflare D1 via backend; Supabase Postgres; Firebase |
| Local/offline data | expo-sqlite; AsyncStorage (non-sensitive); expo-secure-store (tokens) |
| Auth (only when audience requires) | Supabase Auth, Firebase Auth, managed SSO — never custom; token verified in Hono middleware when backend present |
| Analytics | PostHog RN, Amplitude, backend-side events |

Default combo: Expo managed + EAS Update; add Hono on Workers + D1 when persistence needed. One codebase covers native AND web — distribution mode (from ADR) decides which outputs ship.

## Avoid

- Native iOS/Android from scratch — managed workflow only.
- App-store launch as first validation path.
- `expo prebuild` / bare workflow before validation — `ios/`/`android/` dirs are an architecture change, through ADR first.
- Custom native module when an Expo SDK module exists.
- Polishing both platforms when one platform tests the hypothesis.
- Complex offline sync — offline stays simple and explicit ("requires connectivity" is valid).

## Scaffolder commands (non-interactive)

Default (Expo Router + TypeScript):
```bash
npx create-expo-app@latest <dir> --template default --yes
```

Then lean baseline via template's own script (run inside `<dir>`):
```bash
npm run reset-project   # don't keep example files; delete app-example/ after
```
`reset-project` script absent (template version drift) → move example screens out manually, keep clean `app/` with one index route.

Dependencies:
- Expo/RN-coupled packages (`expo-*`, `react-native-*`): `npx expo install <pkg>` — resolves SDK-compatible version. Never `npm install <pkg>@latest` for these.
- Pure-JS packages: `npm install <pkg>@latest`.

Backend (when needed, same command as web-scaffold path E):
```bash
npm create hono@latest server -- --template cloudflare-workers --install --pm npm
```

PWA output: `npx expo export --platform web` → static `dist/`; deploy to Cloudflare via wrangler (exact assets wiring from current docs at build time — context7/WebSearch).

Flags rejected → scaffolder `--help` first, never interactive.

## Structure contract (default template post-reset)

| Location | Contains | Never contains |
|---|---|---|
| `app/` | Routes/screens only (Expo Router) | Components, business logic |
| `components/` | UI components | Data access, routes |
| `hooks/` | Reusable hooks | Components |
| `constants/` | Theme, static config | Runtime logic, secrets |
| `lib/` | API clients, services, shared logic | Components |
| `assets/` | Images, fonts | Source code |
| `scripts/` | Template maintenance scripts | App logic |
| `server/` | Optional Hono Workers backend | UI imports |
| `docs/` | ADR, all other .md | — |

Starter `allowed-paths.json` (reconcile against actual tree; drop `server/**` when no backend):

```json
{
  "allowedGlobs": [
    "app/**", "components/**", "hooks/**", "constants/**", "lib/**",
    "assets/**", "scripts/**", "server/**", "docs/**", ".claude/**",
    "*.json", "*.js", "*.mjs", "*.cjs", "*.ts", "*.tsx",
    ".gitignore", ".env.example", ".nvmrc", "expo-env.d.ts"
  ],
  "forbiddenGlobs": [
    "{utils,helpers,common,shared,misc}/**",
    "ios/**", "android/**",
    "src/**", "pages/**", "public/**"
  ],
  "rootOnlyFiles": [".gitignore", ".env.example", ".nvmrc", "app.json", "eas.json", "expo-env.d.ts"],
  "exemptRootMd": ["README.md", "CLAUDE.md"]
}
```

Rationale: `ios/**` + `android/**` forbidden = managed-workflow contract — those dirs appearing means someone ran `prebuild`/`run:ios`, an architecture change that goes through ADR first. `src/**`/`pages/**`/`public/**` = web-project drift. Junk-drawer dirs forbidden = shared code goes in `lib/`.

## Feature slice (minimum build proves)

1. One screen proving the hypothesis flow.
2. Native-feature stub only if core to hypothesis (e.g. `expo-camera` capture wired into the slice) — else none.
3. Backend present → health route (`GET /health`) + one read/CRUD endpoint, input validated, structured errors `{error: {code, message}}`; app calls it via client in `lib/`.
4. Auth only when audience requires — managed provider, session persisted in expo-secure-store, unauthenticated screens redirect.
5. Explicit offline statement in README — even "requires connectivity; shows offline notice".
6. `.env.example` complete: every `EXPO_PUBLIC_` var with placeholder + public-bundle comment.

## Verify notes

- `npm run check` passes; `npx expo export --platform ios --platform android` bundles clean (add `--platform web` in PWA mode).
- `npx expo-doctor` clean.
- No non-`EXPO_PUBLIC_` secrets in tracked files; tokens via expo-secure-store, not AsyncStorage.
- `ios/`/`android/` dirs absent.
- Offline behavior documented in README.
- App boots in Expo Go (manual QR step — mark pending if no device available).
- Backend present → health + main endpoint respond locally (`server:dev`, curl both).
