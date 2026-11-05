# Time-sensitive store requirements

**Last verified: 2026-10-29.** Store rules change several times a year. If this date is more than 90 days old, re-check every row against its source before relying on it, say so in the report, and tell the user which rows changed. `scripts/scan.mjs` hardcodes three of these values in its `POLICY` constant (Play target API, Apple minimum Xcode, Apple minimum deployment target) — update both together, in the plugin's source repository (an installed copy is replaced on every plugin update).

## Apple

| Requirement | Effective | Notes | Source |
| --- | --- | --- | --- |
| Built with Xcode 26+ and an iOS 26 SDK | 2026-04-28 | All App Store Connect uploads, TestFlight included | [Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/) |
| Minimum deployment target iOS 13 | 2026-09-09 | Uploads | same |
| New age-rating questionnaire | answers due 2026-01-31 | Ratings moved to the new system; unanswered apps can't submit updates | same |
| EU trader status (DSA) | 2025-02-17 | Apps without verified trader status are removed from the EU storefront | same |
| Required-reason APIs in privacy manifests | 2024-05-01 | App and third-party SDKs | same |
| In-app account deletion | 2022-06-30 | Any app with account creation | [Offering account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/) |
| 5.1.2(i) third-party AI | 2025-11-13 | Disclose + explicit permission before personal data reaches third-party AI | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [TechCrunch](https://techcrunch.com/2025/11/13/apples-new-app-review-guidelines-clamp-down-on-apps-sharing-personal-data-with-third-party-ai) |
| Guidelines revision (WWDC26) | 2026-06-08 | Low-quality/copycat apps, kid & teen safety, AI, Live Activities, developer identity | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) |
| Guidelines revision | 2026-10-16 | AI content-creation apps treated as UGC (filter/report/block); regulatory documentation at submission; accurate, all-ages marketing assets; specific update notes; checklist-style structure | [Change tracker](https://conductatlas.com/change/2026-10-17-apple-apple-app-store-review-guidelines-5687/) — confirm against Apple's text |
| iOS 27 SDK → UIScene lifecycle | when building with Xcode 27 | Apps built with the iOS 27 SDK must adopt scenes or won't launch correctly on iOS 27. Apple has historically required the new SDK each April — expect ~April 2027 (not announced as of verification) | [Expo SDK 57 changelog](https://expo.dev/changelog/sdk-57) |

TestFlight: internal testing ≤ 100 App Store Connect users, no review; external ≤ 10,000 testers, first build of each version goes through Beta App Review; builds expire after 90 days.

## Google Play

| Requirement | Effective | Notes | Source |
| --- | --- | --- | --- |
| Target API 36 (Android 16) for new apps and updates | 2026-08-31 | Extension to 2026-11-01 on request. Existing apps must target ≥ 35 to stay available to new users on newer Android versions. Wear OS/Automotive 35, TV/XR 34 | [Target API requirements](https://developer.android.com/google/play/requirements/target-sdk) |
| 16 KB page-size support | since 2025-11-01 (new apps/updates targeting 15+, extensions granted) | Android docs (checked 2026-10-29): updates without 16 KB support can't be released from 2027-02-01 | [Page sizes](https://developer.android.com/guide/practices/page-sizes), [Expo FYI](https://github.com/expo/fyi/blob/main/android-16kb-page-sizes.md) |
| Closed test: ≥ 12 opted-in testers for 14 days before production access | personal accounts created after 2023-11-13 | Per app; organization accounts exempt. Open testing also waits for production access | [Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465) |
| Account deletion: in-app path + web URL in Data safety | 2023-12 (extensions ended 2024-05-31) | Apps that let users create accounts | [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111) |
| User Data policy covers third-party AI integrations | clarified 2026-07 | Disclosure, consent, limited use, Data safety | [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311) |
| Android developer verification for apps installed outside Play | 2026-09-30 in Brazil, Indonesia, Singapore, Thailand; global in 2027 | Affects sideloaded internal APKs (e.g. EAS internal-distribution links) on certified devices; ADB and an "advanced flow" remain | [Android Authority](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/) |
| AAB for new apps | 2021-08 | APK uploads only for existing apps' legacy cases | Play Console Help |
| Play Billing Library 8+ for new apps and updates with IAP | 2026-08-31 (extension to 2026-11-01) | Two-year support window per version; Play Console warns on unsupported versions | [Billing deprecation](https://developer.android.com/google/play/billing/deprecation-faq) |

Testing tracks: internal ≤ 100 testers, available within minutes, can start before app setup is complete and may skip standard review; closed tests are reviewed and need the App content declarations; open testing is public and needs a complete store listing.

## Re-verification sources

- Apple: https://developer.apple.com/news/upcoming-requirements/ · https://developer.apple.com/app-store/review/guidelines/ · https://developer.apple.com/news/
- Google: https://developer.android.com/google/play/requirements/target-sdk · https://developer.android.com/guide/practices/page-sizes · https://support.google.com/googleplay/android-developer/answer/9845334 (test tracks) · Play Console policy status / inbox
- Expo/React Native: https://expo.dev/changelog · https://docs.expo.dev/versions/latest/ · React Native release notes
