# Apple App Review rules

Applies when ADR targets native/store distribution. delivery.md gates store *submission* behind escalation — this rule is about coding so eventual review passes instead of rebuilding. Numbers = App Review Guidelines sections. Canonical (guidelines change — verify before submission): https://developer.apple.com/app-store/review/guidelines/ · umbrella: https://developer.apple.com/app-store/guidelines/

Developer responsible for everything in app — including ad networks, analytics SDKs, third-party code. Tricking review, stealing user data, copying apps, manipulating ratings → removal + Developer Program expulsion.

## Before submit

- Test on device — crashes or obviously broken = rejection (2.1). No placeholder text, empty views, temporary content.
- Login-gated app → provide demo account or built-in demo mode for review; backend must be live during review (2.1).
- No beta/demo/trial builds in store — beta via TestFlight only (2.2).
- Explain non-obvious features + IAP in App Review notes.

## 1 Safety

- No objectionable content: defamatory/discriminatory targeting, realistic violence, overtly sexual material, inflammatory religious content (1.1).
- No false features: no fake device data, prank calls/SMS, phony functionality — "for entertainment purposes" disclaimer does not save it (1.1.6).
- UGC/social app MUST ship: filter for objectionable content, report mechanism with timely response, user blocking, published developer contact info (1.2). Creator-content apps also flag age-inappropriate content (1.2.1).
- Kids Category: no out-links, no purchases, no distractions outside parental gate; no third-party ads/analytics; no PII or device info to third parties (1.3).
- Medical: accuracy claims need disclosed data + methodology; no sensor-only vitals (blood pressure, glucose, temperature, blood oxygen) (1.4.1). Dosage calculators only from approved entities (1.4.2). No facilitating drug/tobacco sales (1.4.3).
- Support URL + easy in-app way to contact developer (1.5). Secure user data per security.md (1.6).

## 2 Performance

- Metadata honest: no hidden/undocumented features (2.3.1); disclose when featured items need extra purchase (2.3.2); screenshots show app in use — not splash/login/title art (2.3.3); name unique ≤30 chars, no trademarked/irrelevant keywords (2.3.7); icons/screenshots fit 4+ audience regardless of rating (2.3.8).
- iPhone app should run on iPad whenever possible (2.4.1).
- Power efficient: no battery drain, no unrelated background processes, crypto mining banned (2.4.2). Never require device restart or unrelated settings changes (2.4.4).
- Public APIs only, current OS, frameworks for intended purpose (HealthKit → health, HomeKit → home) + disclosed in description (2.5.1).
- Self-contained bundle: no downloading/installing/executing code that adds or changes features (2.5.2). OTA JS updates (EAS Update) OK only within this line — bug fixes/tweaks to existing feature set, never new-feature smuggling past review.
- Background modes only for intended purpose: VoIP, audio, location, task completion, local notifications (2.5.4).
- Must work on IPv6-only networks (2.5.5). In-app browsing → WebKit (2.5.6).
- Never alter/disable native UI behaviors, volume/silent switch, expected link-outs (2.5.9).
- Facial recognition for auth → LocalAuthentication, alternate method for under-13 (2.5.13).
- Recording camera/mic/screen/user activity → explicit consent + clear visible or audible indicator (2.5.14).
- Widgets/extensions/notifications relate to app function; App Clips no ads (2.5.16). Ads: main binary only, match age rating, labeled interstitials with easy close, reportable, no targeting from sensitive data (2.5.18).

## 3 Business — payments

- Digital features/content/subscriptions/currencies/unlocks → Apple IAP. No external payment mechanisms, license keys, QR unlocks for digital goods (3.1.1). Purchased credits never expire; restore mechanism required; loot boxes disclose odds; NFT sales via IAP.
- External purchase links → only via StoreKit External Purchase Link Entitlement in entitled regions; US storefront exempt from prohibition (3.1.1(a)). Verify current state before relying on it.
- Subscriptions: period ≥7 days, work on all user's devices, ongoing value, clearly state what user gets for price before purchase (3.1.2). No forcing social posts/contact upload for paid content; switching to subscription model must not strip features existing users paid for.
- Multiplatform: content bought on web/other platforms may unlock in app IF also purchasable as IAP in app (3.1.3(b)).
- Real-time person-to-person services (1-on-1 tutoring, consults) may use non-IAP; one-to-many → IAP (3.1.3(d)).
- Physical goods/services consumed outside app → MUST use non-IAP payment (Apple Pay, card entry) (3.1.3(e)).
- Crypto: wallets need org enrollment, no on-device mining, exchanges licensed per region (3.1.5).
- Never force users to rate, review, or download other apps to access functionality (3.2.2(x)). No artificial ad-impression inflation (3.2.2(iii)). Personal loans: full terms disclosed, APR ≤36%, no repayment demanded ≤60 days (3.2.2(ix)).

## 4 Design

- No copycats: no other developer's name/icon/brand/UI (4.1).
- Minimum functionality: features/content/UI beyond repackaged website; lasting value (4.2). Not primarily marketing material, ads, web clippings, or link collections (4.2.2). Works standalone — no requiring another app; initial big resource download → disclose size + prompt first (4.2.3).
- No spam variants: one app, vary content via IAP — not per-city/per-brand bundle IDs (4.3(a)). Saturated-category clones rejected (4.3(b)).
- No spam/phishing via Push, Game Center, Live Activities (4.5.3).
- Push notifications: never required for app function; no sensitive personal info in payload; marketing pushes need explicit opt-in in UI AND opt-out method (4.5.4).
- Mini-apps/HTML5/streaming content inside app: developer responsible for ALL of it complying — privacy rules, content filter + reporting + blocking, IAP for its digital goods, index with universal links, age-rating mechanism (4.7).
- Third-party/social login (Google, Facebook) as primary auth → must also offer login that limits data to name+email, allows hiding email, no ad-tracking without consent — Sign in with Apple satisfies (4.8). Exempt: app uses ONLY own account system, or education/enterprise/citizen-ID logins.
- Apple Pay: all material purchase info before sale; recurring → disclose term, per-period charges, cancel path (4.9).
- Don't monetize built-in capabilities: no charging for push, camera, gyroscope access (4.10).

## 5 Legal — privacy

- Privacy policy: linked in App Store Connect AND easily accessible in app; states what collected, how, all uses, third-party access, retention/deletion, consent revocation (5.1.1(i)).
- Consent before collecting user/usage data — even anonymous; purpose strings clear + complete; paid functionality never conditional on data access; withdrawal path required (5.1.1(ii)).
- Data minimization: only what core functionality needs; prefer out-of-process picker/share sheet over full Photos/Contacts access (5.1.1(iii)).
- Respect denial: no tricking/forcing consent; unrelated permission never gates feature (photo post must not need mic); denied permission → offer alternative (manual address vs Location) (5.1.1(iv)).
- No significant account features → app works without login. Account creation → in-app account deletion mandatory. Social credentials/tokens never stored off device (5.1.1(v)).
- No compiling personal info from sources other than the user without explicit consent — public databases included (5.1.1(viii)).
- Regulated fields (banking, healthcare, gambling, cannabis, crypto exchange) → submit as legal entity (5.1.1(ix)). Name/email requests optional, never gate features (5.1.1(x)).
- Sharing data with third parties — third-party AI explicitly included — needs disclosure + explicit permission first (5.1.2(i)). Tracking across apps/sites → App Tracking Transparency. May not require enabling push/location/tracking for content or rewards.
- No repurposing collected data without new consent (5.1.2(ii)); no re-identifying anonymized data (5.1.2(iii)); no contact-DB building or installed-apps harvesting (5.1.2(iv)); no auto-messaging user's contacts — user initiates individually, sees exact message + sender first (5.1.2(v)).
- HealthKit/HomeKit/ARKit-face/ClassKit data: never for marketing, advertising, data mining (5.1.2(vi)). Never write false data into HealthKit; no personal health info in iCloud (5.1.3).
- Kids: COPPA/GDPR compliance; parental gate ≠ parental consent; "For Kids" naming reserved for Kids Category (5.1.4).
- Location: only when feature needs it, consent BEFORE collect/transmit, purpose explained in app (5.1.5).
- IP: no third-party trademarks/content without rights (5.2.1); no downloading/converting media from Apple Music/YouTube/SoundCloud (5.2.3); no mimicking Apple apps/UI, no Apple emoji in binary (5.2.5).
- Ratings: system review prompt API only (`SKStoreReviewController` / `expo-store-review`) — custom prompts disallowed (5.6.1). No manipulating charts, search, reviews, referrals (5.6.3). No dark patterns: unwanted-purchase tricks, forced data sharing, hidden price raises (5.6).

## Store marketing assets

- Screenshots/previews: app as it actually runs — no fabricated UI, no blank screens; fictional account data, never real people (2.3.9).
- App Store badge: Apple artwork only, unmodified, one per layout, "App Store" exact wording (never "Apple App Store").
- Device images: Apple-provided bezels, latest devices, no tilting/cropping/3D; product names exact (iPhone, iPad — never pluralized). Ref: https://developer.apple.com/app-store/marketing/guidelines/
