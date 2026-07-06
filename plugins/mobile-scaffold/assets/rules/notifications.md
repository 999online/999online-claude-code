# Notification rules (Firebase Cloud Messaging)

- **Public config** (`EXPO_PUBLIC_FIREBASE_*`) safe in app bundle. **Service-account key = server only** (backend `.dev.vars`/`.env` + secret store). Never in mobile repo, never `EXPO_PUBLIC_`.
- Send from backend only (`src/services/notifications.ts` Hono / `src/common/notifications` Nest) via FCM HTTP v1 / `firebase-admin`. App registers + receives — never sends.
- Mobile register: `expo-notifications` (managed, default) — request permission + get device token. `@react-native-firebase/messaging` only with a dev build — record in ADR (breaks Expo Go).
- `google-services.json` / `GoogleService-Info.plist` gitignored; provisioned per env, documented in README.
- Request push permission only when the hypothesis needs it; record in ADR device permissions.
- Store device tokens server-side keyed to user/session; remove on logout / access-revoke.
