# Store-console tasks per stage

Things the repository can't prove. List them in the report's console checklist; tick one only when the user or the project docs confirm it. Paid accounts, store review and sending builds to outside testers are often escalation points — check the project's own rules (CLAUDE.md, ADR) and say which are still open.

## Apple — App Store Connect

### I1 · TestFlight internal
- [ ] Apple Developer Program membership (individual, or organization with D-U-N-S), latest agreements accepted
- [ ] App ID with the capabilities the entitlements need (EAS syncs them from the config)
- [ ] App Store Connect app record: name, primary language, bundle ID, SKU
- [ ] Distribution certificate + App Store provisioning profile (EAS-managed or manual); APNs key if push
- [ ] Build uploaded (`eas submit`, Transporter or Xcode), processed, export compliance answered
- [ ] Internal testers added (≤ 100 App Store Connect users)

### I2 · TestFlight external
- [ ] Test Information: beta description, feedback email, privacy policy URL, marketing URL (optional)
- [ ] Beta App Review information: contact, demo account (+ 2FA bypass), review notes
- [ ] External group or public link (≤ 10,000 testers); first build of the version submitted to Beta App Review
- [ ] "What to Test" notes per build

### I3 · App Store
- [ ] Product page: name (≤ 30), subtitle (≤ 30), description, keywords (≤ 100 bytes), promotional text, support URL, marketing URL (optional), copyright, categories
- [ ] Screenshots: 6.9-inch iPhone (required), 13-inch iPad if iPad is supported; previews optional
- [ ] App Privacy answers; privacy policy URL
- [ ] Age-rating questionnaire (current system); content rights (third-party content)
- [ ] Pricing and availability; Paid Apps agreement, tax and banking if paid/IAP; IAP products attached to the version
- [ ] EU trader status (DSA)
- [ ] App Review Information: contact, demo account, notes explaining non-obvious features (AI use, background modes, login requirements)
- [ ] Release method: manual, automatic or phased

## Google — Play Console

### A1 · Internal testing
- [ ] Developer account (one-time fee) and identity verification; personal accounts also verify a real Android device; organizations need D-U-N-S
- [ ] App created: name, default language, app or game, free or paid, policy declarations
- [ ] Play App Signing enrolled; upload key backed up
- [ ] First AAB uploaded by hand (the API can't create a new app's first release); internal testers list (≤ 100) and opt-in link shared
- [ ] Play app-signing SHA-1/SHA-256 registered with Google Sign-In, Firebase, API keys, App Links (BLD-12)

### A2 · Closed testing
- [ ] App content: privacy policy, app access (demo credentials), ads, content rating (IARC), target audience and content, Data safety (with account-deletion URL), news, government, financial features, health, advertising ID
- [ ] Store listing: title (≤ 30), short description (≤ 80), full description (≤ 4000), 512×512 icon, 1024×500 feature graphic, ≥ 2 phone screenshots (tablet screenshots recommended), category, contact email
- [ ] Countries/regions; closed track with tester lists or Google Groups; release passes review
- [ ] Personal accounts created after 2023-11-13: ≥ 12 testers opted in continuously for 14 days, then apply for production access (questions about the test)

### A3 · Open testing (optional)
- [ ] Production access granted first (new personal accounts); store listing complete because the test is public

### A4 · Production
- [ ] Production access granted
- [ ] Release notes per language; staged rollout percentage; countries
- [ ] Pre-launch report reviewed (crashes, accessibility, security)
- [ ] Android vitals watched after rollout; Data safety updated whenever SDKs change
