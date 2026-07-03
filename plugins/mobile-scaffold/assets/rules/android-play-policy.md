# Google Play policy rules

Applies when ADR targets native/store distribution on Android. delivery.md gates store *submission* behind escalation — this rule is about coding so eventual Play review passes. Canonical (policies change — verify before submission): https://play.google/developer-content-policy/ · Policy Center: https://support.google.com/googleplay/android-developer

Developer responsible for whole app including every third-party SDK — SDK misbehavior (data collection, code loading) = your violation.

## User data

- Privacy policy mandatory for ALL apps: active public non-PDF URL in Play Console field AND linked inside app.
- Data safety form must accurately match actual collection/sharing — including what SDKs collect. Misreported SDK collection = your violation. Keep form updated.
- Prominent disclosure + consent when collection/use not obvious from core feature: in-app (not description/website), during normal usage (not buried in settings), NOT inside privacy policy/ToS; describes data + use; consent needs affirmative action (tap/checkbox) BEFORE collection starts — navigating away never counts as consent.
- Account creation → readily discoverable in-app deletion path AND web deletion path (usable without reinstalling); web URL declared in Play Console. Deleting account deletes its data.
- Data minimization: access/collect/share only what user-expected functionality needs. Never sell personal/sensitive data. Encrypt in transit (HTTPS) — see security.md.

## Permissions

- Minimum permissions for features actually shipped and listed — none for undisclosed/future features. Request in context at time of use.
- SMS + Call Log permission groups: default-handler apps only (+ narrow declared exceptions). Effectively off-limits for normal apps.
- `ACCESS_BACKGROUND_LOCATION`: only when core to primary purpose ("broken without it"), declaration form + demo video + prominent disclosure ("collects location to enable [feature] even when app is closed") + runtime prompt. Background location for ads = denied. Prefer foreground service tied to user-initiated action, terminated when done.
- `QUERY_ALL_PACKAGES`: restricted; use targeted `<queries>` entries instead. Installed-app inventory never sold/shared for analytics/ads.
- `MANAGE_EXTERNAL_STORAGE` (All Files Access): restricted review; use Storage Access Framework / MediaStore.
- AccessibilityService: only for accessibility purposes unless disclosed + consented; `IsAccessibilityTool` only when genuinely assistive.
- Exact alarms: `USE_EXACT_ALARM` only for alarm/calendar-core apps; else `SCHEDULE_EXACT_ALARM`.

## Device + network abuse

- No downloading executable code (dex/JAR/.so) from outside Play. Interpreted-code exception: JS in webview/runtime OK if it does NOT change app away from its Play-described purpose — this is the line EAS Update OTA must stay inside (bug fixes/tweaks yes, new-purpose smuggling no).
- No self-updating outside Play mechanism. No interfering with other apps/ads. Proxy functionality only as disclosed primary purpose. No ad fraud.

## Deception + identity

- App behaves exactly as metadata describes; no impossible-functionality claims (even joke apps); no geo/device-varying core behavior unless advertised.
- No mimicking system notifications/warnings or other apps' UI. Extra downloads → prompt + size disclosure first.
- Manipulated/AI media tools: visible watermark or disclaimer on generated/manipulated output; no apps built for deception.
- Generative AI apps: block Restricted-Content generation (CSAE, deception material, non-consensual sexual deepfakes); ship in-app reporting/flagging of offensive AI output; use reports to tune moderation.
- Transparent developer identity; no hidden functionality — backdoors, spyware, stalkerware, credential theft = malware policy, app AND SDKs.

## Payments — Play Billing

- Digital goods/services (premium features, currency, ad-free, subscriptions, digital content, cloud services) → Google Play Billing. No steering to other payment methods for digital goods — prohibition covers in-app text, buttons, links, webviews, ads, sign-up flows.
- Physical goods + real-world services consumed outside app (delivery, tickets, gym, rides) → must NOT use Play Billing.
- Alternative billing (user-choice billing, EEA/South Korea etc) exists only via program enrollment + declaration — never default.
- Displayed price must match Play billing price. Loot boxes/randomized items: disclose odds before purchase. Virtual currency locked to the app that sold it.

## Subscriptions

- Before purchase disclose: what subscriber gets, full billing-period cost, frequency, auto-renew terms, trial duration + post-trial price + auto-conversion. Localized.
- No dark patterns: hidden dismiss buttons, intro price without real price, "Free Trial" SKU that auto-recurs, decaying benefits (1000 gems month one, 1 later).
- Easy cancellation: in-app manage/cancel path (Play Subscription Center link OK); instructions visible pre-purchase.

## Ads

- Ads only inside own app; never overlay system UI/other apps; never on lockscreen or via system notifications.
- Interstitials: never unexpected (mid-gameplay, before splash, blocking user action), closable ≤15 s (opt-in rewarded ads exempt), no interstitial after every user action ("made for ads" = ban).
- Ads never mimic app UI or system warnings; source obvious; ad content matches app's age rating.
- Advertising ID: ads/analytics only; respect opt-out on every access; never link to hardware IDs or PII without consent.

## Store listing

- Title ≤30 chars; no emoji/ALL CAPS/repeated symbols in title/icon/dev name; no ranking claims ("#1", "Best"), no price/promo text in metadata; icon without fake notification dots.
- Description: no keyword stuffing, no unattributed testimonials. Screenshots show actual app.
- No incentivized ratings/reviews/installs; no rating-gating (pre-filtering who sees review prompt by sentiment); review responses never solicit higher rating.
- Message features: user reviews content + recipients before app sends anything on their behalf.

## Spam + minimum functionality

- App must install, launch, respond, not crash. Broken = rejected.
- Webview wrapper of website = rejected — even own site needs unique value beyond browser. Mirrors Apple 4.2; feeds PWA-vs-native decision: thin wrapper belongs in PWA mode, not store.
- No affiliate-traffic shells, no primarily-ads apps, no repetitive near-duplicate apps — consolidate.

## Restricted content (check when domain touches these)

- UGC apps must ship: pre-upload terms acceptance, ongoing moderation, in-app reporting (+ user blocking where users interact); monetization must not incentivize objectionable behavior.
- Health: no claims contradicting medical consensus; Health apps declaration form; non-medical-device disclaimer; Health Connect data = sensitive (prominent disclosure + consent); telehealth transactions NOT via Play Billing.
- Real-money gambling/betting: license per territory + Play application + geo-restriction + free download + 18+ block. Simulated gambling = age-restricted.
- Crypto/blockchain: no on-device mining; exchanges/wallets need regulated certification + Financial features declaration; NFTs must enhance functionality, no undisclosed-value bundles, no wagering.
- No facilitating sale: illegal drugs, marijuana/THC (regardless of local law), tobacco/nicotine, firearms/ammo/mods.
- News apps: source attribution, fresh content, contact info, News self-declaration.

## Families (target audience includes children)

- Every app declares target age groups in Play Console; child-appealing look can override declaration — Google reviews independently.
- Children in audience → ads only via Play Families Self-Certified Ads SDKs; no interest-based ads/remarketing; no interstitial at launch; ads closable ≤5 s; no mature ad content.
- Never transmit from children: AAID, device IDs (IMEI/MAC/SSID/serial); no AD_ID permission on API 33+; child-only apps: no location permission at all.
- Unapproved SDKs in mixed-audience app → gate behind neutral age screen (asks age without encouraging falsification).
- Social features for kids: safety reminders, adult-verification gate (no child-falsifiable PIN prompt) before personal-info exchange, parental controls. COPPA/GDPR — see compliance dossier when flagged.
