# Store-readiness check catalog

Each check: **ID · title — Gate · severity · how verified**, then what "pass" means, then the fix.

- **Gate** = earliest stage where the check must pass. iOS: `I1` TestFlight internal, `I2` TestFlight external (Beta App Review), `I3` App Store. Android: `A1` Play internal testing, `A2` closed testing, `A3` open testing, `A4` production. A check gated at `I2` also applies to `I3`.
- **Severity** = impact when it fails: `blocker` (upload/review rejected, or build unusable), `high` (likely rejection, policy strike, or serious defect), `medium`, `low`.
- **How**: `auto` (scan.mjs finding), `artifact` (needs the built AAB/APK/IPA), `code` (read the code — recipe given), `manual` (store console / people; mark `verify` unless confirmed).

Dated thresholds (target API, Xcode, deadlines) live in `policy-dates.md`.

## Contents
- Build & identity: BLD-01 … BLD-13
- Native configuration: CFG-01 … CFG-12
- Accounts & sign-in: ACC-01 … ACC-05
- Privacy & data: PRV-01 … PRV-08
- Payments: PAY-01 … PAY-04
- Legal & content: LGL-01 … LGL-07
- Assets: AST-01
- Quality: QLT-01 … QLT-06
- Release operations: OPS-01 … OPS-04

## Build & identity

**BLD-01 · iOS bundle identifier — I1 · blocker · auto**
Set, reverse-DNS on a domain you control, not a template placeholder (`org.reactjs.native.example.*`, `com.example`, `com.anonymous`). Immutable once the App Store Connect record exists. Fix: `ios.bundleIdentifier` (Expo) / `PRODUCT_BUNDLE_IDENTIFIER`.

**BLD-02 · Android application ID — A1 · blocker · auto**
Set, owned namespace. Immutable after the first Play upload (a new id is a new app). Fix: `android.package` / `applicationId`.

**BLD-03 · Store build pipeline — I1/A1 · blocker · auto**
A build that produces store-signed artifacts: EAS profile without `distribution: internal`, `developmentClient` or `ios.simulator`; Android output is an AAB (APKs are not accepted for new apps). Bare: `./gradlew bundleRelease`, Xcode Archive → App Store Connect, or fastlane lanes. Internal-distribution builds (ad hoc IPA, APK links) can't go to TestFlight or Play. Watch for scripts named "prod" that build internal profiles.

**BLD-04 · Build numbers — I1/A1 · high · auto**
Every upload needs a new `CFBundleVersion` (unique per version) and a higher `versionCode` (integer ≤ 2100000000). EAS: `cli.appVersionSource: "remote"` + `autoIncrement: true` on store profiles; with `local`, bump `ios.buildNumber` / `android.versionCode` yourself (EAS can't write back into a dynamic `app.config.*`). Each App Store release also needs a higher marketing `version`.

**BLD-05 · Android signing — A1 · blocker · auto + manual**
Release build not signed with the debug keystore (RN template default). Upload key out of git and backed up (EAS-managed: `eas credentials` → download). New apps use Play App Signing (Google holds the app-signing key; a lost upload key can be reset through Play support).

**BLD-06 · Android targetSdk — A1 · blocker · auto**
≥ Play's current minimum (`policy-dates.md`). Expo: SDK default (React Native `gradle/libs.versions.toml`) unless `expo-build-properties` overrides it. Moving to API 36 brings Android 16 behavior: forced edge-to-edge, predictive back by default, orientation/resizability ignored on large screens.

**BLD-07 · 16 KB page size — A1 · blocker · auto (heuristic) + artifact**
Apps targeting Android 15+ must ship 64-bit native libraries whose LOAD segments are aligned ≥ 16 KB (uncompressed libs in APKs also zip-aligned at 16 KB). React Native ≥ 0.77 / Expo ≥ 53.0.14 cover core libs. At risk: libraries with their own `externalNativeBuild` compiled with NDK < r28 without `-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON` (React Native's Gradle plugin adds that flag only to the app's own CMake build), and prebuilt `.so`/`.aar`. Confirm on the artifact: the `android-16kb-check` skill (bundled `check-elf-alignment.mjs`) on the release AAB/APK, or Play Console → App bundle explorer. Fix: upgrade the library, patch its cmake arguments (`patch-package`), or build with NDK r28+.

**BLD-08 · iOS toolchain — I1 · blocker · auto + artifact**
Uploads built with the minimum Xcode/SDK and deployment target in `policy-dates.md`. EAS: no `ios.image` = `auto`, the SDK's own image (e.g. `sdk-57` → Xcode 26.6); `latest` can be a newer Xcode than the SDK supports — confirm in the "Spin up build environment" log. Building with the iOS 27 SDK (Xcode 27) requires the UIScene lifecycle: Expo SDK ≤ 57 opts in with `expo-build-properties` `ios.enableSceneSupport: true` (expo ≥ 57.0.23); SDK 58+ does it by default. When Apple raises the minimum to Xcode 27, SDK ≤ 57 projects must upgrade or opt in.

**BLD-09 · Project health — I1/A1 · high · run**
`npx expo-doctor` (Expo, needs network), typecheck, lint, unit tests, and a release build compiles. Quote failures verbatim; never call a failing gate passed.

**BLD-10 · Release environment — I2/A2 · blocker · auto + manual**
Store builds point at a live HTTPS backend reachable from Apple/Google review networks (no VPN, IP allow-list or LAN address) with review data. No `localhost`/LAN fallbacks in code. EAS: variables in the profile's `environment` (`eas env:list --environment production`); `EXPO_PUBLIC_*` are inlined at build time and again at `eas update` publish.

**BLD-11 · 64-bit ABIs — A1 · blocker · auto**
`arm64-v8a` included (`reactNativeArchitectures` / `expo-build-properties` `buildArchs`). iOS is arm64-only already.

**BLD-12 · Signing-bound services — A1 · high · auto + manual**
Play re-signs every Play-delivered build, internal testing included, with the app-signing key. Register its SHA-1/SHA-256 (Play Console → Test and release → App integrity) wherever the signing certificate matters: Google Sign-In Android OAuth client (else `DEVELOPER_ERROR`), Firebase Android app, API-key restrictions, `assetlinks.json`, Facebook key hashes.

**BLD-13 · Download size — I3/A4 · medium · auto + artifact**
Play: base module ≤ 200 MB compressed download (more → Play Asset Delivery); check App bundle explorer. iOS: > 200 MB asks before cellular download; see App Store Connect build sizes. Usual cause: bundled ML models or engine weights.

## Native configuration

**CFG-01 · Export compliance — I1 · medium · auto**
`ios.config.usesNonExemptEncryption: false` / `ITSAppUsesNonExemptEncryption = NO` when the app only uses HTTPS and OS crypto; otherwise upload documentation in App Store Connect. Undeclared → every build waits in "Missing Compliance" and testers can't install it until someone answers.

**CFG-02 · iOS purpose strings — I1 · blocker (missing) / medium (generic) · auto**
Each protected resource the binary uses needs its `NS…UsageDescription` (missing → ITMS-90683 at upload or a crash on access). Strings say what and why ("Scan a receipt to fill in an expense"), not defaults like "Allow $(PRODUCT_NAME) to access…" (5.1.1). Config plugins add strings by default (e.g. `expo-secure-store` `faceIDPermission`, `expo-audio` `microphonePermission`, `expo-image-picker`): disable those for unused capabilities, customize the rest.

**CFG-03 · Privacy manifest — I1 · high · auto + artifact**
Required-reason APIs (UserDefaults, file timestamps, system boot time, disk space, active keyboards) declared with approved reasons for the app and every SDK; tracking domains listed if the app tracks. Expo: `ios.privacyManifests`; React Native ≥ 0.76 aggregates pod manifests during `pod install`. App Store Connect emails ITMS-91053/91061 after upload — treat them as blockers.

**CFG-04 · Android permissions — A2 · high · auto + artifact**
The merged release manifest holds only what shipped features use. Restricted or declared permissions — SMS/Call Log, background location, all-files access, `QUERY_ALL_PACKAGES`, `READ_MEDIA_IMAGES/VIDEO`, exact alarms, full-screen intent, accessibility, foreground-service types, `AD_ID` — need a Play Console declaration or removal (`android.blockedPermissions` / `tools:node="remove"`). `SYSTEM_ALERT_WINDOW` is usually a dev leftover. Final list: `bundletool dump manifest --bundle app.aab`.

**CFG-05 · Permission request UX — I2/A2 · high · code**
Recipe: open each call site in the scanner's `permissionRequest` signal and trace what triggers it. Pass: requested in context when the feature is used, never at launch; a short explanation first; denial keeps the app usable with a path to Settings; iOS priming screens use a neutral "Continue", never "Allow"; Android 13+ requests `POST_NOTIFICATIONS`.

**CFG-06 · iPad — I3 · medium · manual**
`supportsTablet: true` → iPad layouts and 13-inch iPad screenshots. `false` → the app runs on iPad in iPhone compatibility mode and reviewers may test there (2.4.1), so it must not break.

**CFG-07 · Android large screens — A4 · medium · auto**
With targetSdk ≥ 36 the system ignores orientation, aspect-ratio and resizability limits on displays ≥ 600dp. Test tablets and foldables in landscape and multi-window.

**CFG-08 · Network security — I2/A2 · high · auto**
HTTPS only: no release `usesCleartextTraffic="true"`, no blanket `NSAllowsArbitraryLoads` (needs justification), no `http://` endpoints. Works on IPv6-only networks (Apple 2.5.5) — no hard-coded IPv4 literals.

**CFG-09 · Push notifications — I1/A1 when push is used · high · auto + manual**
iOS: `aps-environment` entitlement, Push capability on the App ID, APNs key in the credentials. Android: FCM config present in the store build's environment, one channel per purpose with honest importance, monochrome small icon. Permission requested in context; no marketing pushes without opt-in (Apple 4.5.4); no sensitive data in payloads; a feature that's unavailable on one platform must not show dead UI there.

**CFG-10 · Deep links — I3/A4 · low · auto + manual**
Universal links: `associatedDomains` + `apple-app-site-association`. App Links: `autoVerify` filters + `assetlinks.json` carrying the Play app-signing SHA-256.

**CFG-11 · Edge-to-edge & back navigation — A2 · medium · code + device**
targetSdk ≥ 35 forces edge-to-edge (no opt-out at 36): content respects insets. System back button and gesture work on every screen; state survives backgrounding and process death (Android core quality).

**CFG-12 · Appearance — I3/A4 · low · auto**
A locked light or dark theme passes review; Android core quality and the HIG expect both. Note it, don't block on it.

## Accounts & sign-in

**ACC-01 · Account deletion — I3 (blocker), I2 (high) · A2 (blocker) · auto + code**
If users can create an account, they can start deletion inside the app, easy to find (Settings/Account), and it deletes the account and its data, not just deactivates it. Re-authentication is fine; requiring a call or email is not (outside highly regulated apps). Apple: revoke Sign in with Apple tokens on deletion. Play: also a web deletion URL that works without the app, declared in Data safety. Recipe: scanner `accountDeletion` signal → find the UI entry point → the API call → confirm the backend endpoint exists and deletes data.

**ACC-02 · Login alternatives (Apple 4.8) — I3 (I2 when the iOS button doesn't work) · blocker · auto + code**
If the iOS app offers a third-party or social login (Google, Facebook, LINE…) for the primary account, it must also offer an equivalent login that limits data to name and email, lets users hide their email, and doesn't track without consent — Sign in with Apple qualifies. Exempt: only the company's own account system; education/enterprise accounts; government or industry ID; clients for a specific third-party service. Recipe: find where the social button renders and whether it's hidden on iOS — a button that shows on iOS without an iOS client configuration also fails 2.1.

**ACC-03 · Reviewer access — I2/A2 · blocker · manual**
Login-gated apps give reviewers a working demo account (plus any 2FA/OTP bypass) in App Review Information, TestFlight Beta App Review info, and Play Console → App content → App access. Backend live, demo data populated, no region or feature-flag lock-outs.

**ACC-04 · Login wall — I3 · high · code**
5.1.1(v): features that don't need an account should work without one. Recipe: list what's behind the sign-in gate; bundled or offline content (lessons, tools, puzzles) behind a mandatory login is a rejection risk — offer guest access or justify it in review notes.

**ACC-05 · Credential storage — I2/A2 · high · auto**
Tokens in Keychain/Keystore (`expo-secure-store`, `react-native-keychain`), never AsyncStorage or plain MMKV; never logged; cleared on sign-out.

## Privacy & data

**PRV-01 · Privacy policy — I2/A2 · blocker · auto + manual**
A public, live, non-PDF, non-geofenced URL, entered in App Store Connect (and TestFlight Test Information) and Play Console, and linked inside the app (Settings/About, sign-up). It covers what is collected, how, why, third parties (SDKs and AI providers included), retention and deletion, consent withdrawal, contact.

**PRV-02 · App Privacy labels (Apple) — I3 · blocker · manual**
App Store Connect → App Privacy lists every data type, whether it's linked to the user and used for tracking — SDK collection included (crash reporting, analytics, push tokens). Consistent with the privacy policy and privacy manifest.

**PRV-03 · Data safety (Play) — A2 · blocker · manual**
Play Console → App content → Data safety: collected/shared data, purposes, encryption in transit, deletion options and the account-deletion URL, SDK behavior included. Inaccurate answers are policy violations.

**PRV-04 · Third-party AI — I2/A2 · high · auto + code**
Apple 5.1.2(i): disclose where personal data goes to a third-party AI and get explicit permission before sending it — a privacy-policy line alone isn't enough. Play's User Data policy covers third-party AI integrations: disclosure, consent, limited use, Data safety. Recipe: list endpoints that reach a model (directly or through your backend), what user data each sends (free text, voice, images, usernames, game or document content), and where the user is told and agrees. AI output shown to users → also LGL-04.

**PRV-05 · Tracking & ad IDs — I3/A4 · high · auto**
iOS: any tracking (IDFA, cross-app profiling, attribution or ad SDKs, data brokers) → ATT prompt before tracking, `NSUserTrackingUsageDescription`, `NSPrivacyTracking` + domains. Play: Advertising ID declaration; keep `AD_ID` only if used; never for children.

**PRV-06 · Consent & prominent disclosure — A2/I3 · high · code**
In-app disclosure with an affirmative choice before collecting data the feature doesn't make obvious (background location, contacts, usage analytics). Analytics consent where the law requires it (GDPR/CCPA).

**PRV-07 · Secrets — I1/A1 · blocker · auto**
Nothing secret in the bundle — all JS, `EXPO_PUBLIC_*` values and config files are extractable: no service-account keys, private API keys, signing keys. Nothing secret in git (rotate and purge history if it was). Publishable keys are fine, restricted by package/SHA/bundle id.

**PRV-08 · Children — A2/I3 · high · manual**
Target audience including children → Play Families policy (certified ad SDKs, no AAID), Apple Kids Category rules (no third-party analytics/ads, parental gates), COPPA/GDPR-K. Declare the audience honestly.

## Payments

**PAY-01 · Digital goods through IAP — I3/A4 · blocker · auto + code**
Unlocks, subscriptions and credits used in the app → StoreKit / Play Billing. Physical goods and real-world services → another processor (never IAP). External purchase links only where a regional program allows them — check the current rules.

**PAY-02 · Restore purchases — I3 · blocker for non-consumables/subscriptions · auto**
A visible Restore Purchases action.

**PAY-03 · Paywall disclosures — I3/A4 · high · code**
Before purchase: price, billing period, what's included, auto-renewal and how to cancel, trial length and post-trial price, links to Terms (EULA) and Privacy. No dark patterns.

**PAY-04 · Agreements & products — I3/A4 · blocker if paid · manual**
Apple Paid Apps agreement, tax and banking; Play payments profile; products created and submitted with the version.

## Legal & content

**LGL-01 · Copyleft code — iOS I2 (blocker) · Android A2 (high) · auto**
GPL/AGPL code linked into the binary obliges you to offer the complete corresponding source of the combined app to everyone who gets a build — external testers included. App Store terms are widely considered incompatible with the GPL (the FSF's position; VLC was pulled in 2011) unless every copyright holder permits it. Detection: package `license` fields plus GPL texts embedded in native folders (an MIT wrapper can carry GPL code). Needs a legal decision: replace, relicense, or move the component server-side.

**LGL-02 · Open-source notices — I3/A4 · low · auto**
MIT/BSD/Apache/OFL require attribution: a Licenses screen or Settings bundle.

**LGL-03 · Trademarks & IP — I3/A4 · high · manual**
No other brands, Apple/Google marks or unlicensed images in the app name, subtitle, keywords, icon or screenshots. Accurate nominative mentions in descriptions are fine.

**LGL-04 · UGC & AI-generated content — I3/A4 · high · code**
UGC: terms acceptance, filtering, report and block, timely moderation, published contact (Apple 1.2, Play UGC policy). Apple treats AI content-creation apps as UGC platforms; Play's AI-Generated Content policy asks for safeguards and in-app reporting of offensive AI output. Even narrow AI text (explanations, coaching) should have guardrails and a "report" path.

**LGL-05 · Regulated domains — I3/A4 · blocker if applicable · manual**
Health/medical, lending, gambling, crypto, VPN, government: licenses and documentation at submission; Play declarations (Health apps, Financial features).

**LGL-06 · Age rating — A2/I3 · blocker · manual**
Apple's age-rating questionnaire (current system, see `policy-dates.md`) including AI chat, UGC and web-access capabilities; Play IARC content rating before closed testing.

**LGL-07 · EU trader status (DSA) — I3 · blocker for EU · manual**
App Store Connect → Business: declare trader or non-trader; traders publish verified contact details. Missing → no EU availability.

## Assets

**AST-01 · Icons & splash — I1/A1 (missing/invalid) · blocker / low · auto**
1024×1024 square sources. iOS marketing icon without an alpha channel (ITMS-90717); Expo flattens transparent iOS icons onto white. Android adaptive icon: transparent foreground with the logo inside the central ~66% + background; monochrome layer for themed icons. Store-listing icons (Play 512×512) are uploaded separately.

## Quality

**QLT-01 · No dev, test or placeholder content — I2/A2 · high · auto**
No reachable demo/debug screens, test data, "lorem ipsum", "coming soon" features or dead links in release builds (Apple 2.1 completeness and 2.3.1 hidden features; Play minimum functionality).

**QLT-02 · Release build works on devices — I1/A1 · blocker · manual**
Install the store-signed build on real devices: cold start, sign-up/sign-in, core flows, offline and slow network, background/resume, process death, IPv6 (Apple), latest OS versions, a low-end Android. A crash at launch is an instant rejection.

**QLT-03 · Crash reporting — I2/A2 · high · auto**
Crash/ANR reporting with symbols (source maps, dSYMs, R8 mapping) before external testers. Android vitals bad-behavior thresholds: user-perceived crash rate 1.09%, ANR rate 0.47%, and 8% on any single device model.

**QLT-04 · Accessibility — I3/A4 · medium · code**
Labels on interactive and non-text elements; touch targets ≥ 44 pt (iOS) / 48 dp (Android); text scaling; contrast 4.5:1; no color-only meaning; Reduce Motion honored.

**QLT-05 · Performance — I3/A4 · medium · manual**
Interactive within ~2 s (progress indicator beyond); no heavy JS work blocking launch; no background CPU/battery drain; clean Play pre-launch report.

**QLT-06 · Logging — I3/A4 · low · auto**
`console.*` stripped in production; tokens and personal data never logged.

## Release operations

**OPS-01 · OTA updates — I2/A2 · medium · auto**
With EAS Update: `expo-updates` installed, a `runtimeVersion` policy, channel ↔ profile mapping, rollback rehearsed. OTA changes stay fixes and tweaks within the reviewed feature set (Apple 2.5.2, Play Device and Network Abuse). App Center CodePush is retired.

**OPS-02 · Rollout & rollback — I3/A4 · medium · manual**
Play staged rollout (start small, watch vitals, halt if needed), Apple phased release or manual release, the previous build retained, server-side kill switches for risky features.

**OPS-03 · Submission tooling — I1/A1 · low · auto**
`eas submit` profiles (`ascAppId`; Play service-account JSON kept out of git; `track: internal`) or fastlane. Play's first upload of a new app is done by hand in Play Console.

**OPS-04 · Release notes & metadata — I3/A4 · low · manual**
Specific "What's New" text, screenshots that match the build, optional metadata as code (EAS Metadata, fastlane deliver/supply).
