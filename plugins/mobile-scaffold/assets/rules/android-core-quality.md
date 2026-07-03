# Android core app quality rules

Applies to all Android-facing work. IDs = Google Core App Quality checklist items (current page uses named IDs, not old VX/PS codes). Canonical (checklist changes — verify before submission): https://developer.android.com/docs/quality-guidelines/core-app-quality

## UX + lifecycle

- Consistent experience across all form factors (`Consistent_UX`). Orientations and fold states expose same features, no letterboxing, clean transitions with zero state loss (`Display_State_Parity`, `Fullscreen_Display`, `Orientation_Transitions`).
- App backgrounds on focus switch, returns via Recents; pauses on sleep/lock, resumes on wake/unlock (`App_Switcher`, `Sleep_Resume`, `Lock_Resume`).
- State preservation (`State_Preservation`): survive backgrounding, config change, AND process kill — restore editable fields, scroll position, game progress, in-progress transactions. Resume from Recents → exact last state. Back navigation never loses user data.
- Standard back navigation: system back button + back gesture both work; no custom onscreen back prompts (`Back_Button_Nav`, `Back_Gesture_Nav`).

## Visual quality

- No blurred/pixelated/distorted assets; vectors where possible; quality assets for every targeted screen size (`Graphic_Quality`).
- Text lines 45–75 chars (`Line_Length`). App AND its web content support light + dark themes (`Theme_Support`).

## Accessibility

- Touch targets ≥ 48 dp (`Touch_Target_Size`) — note: stricter than iOS 44 pt; design to 48.
- Contrast: 4.5:1 small text, 3:1 large text/graphics (`Visual_Contrast`).
- Every non-text element gets `contentDescription` / `accessibilityLabel` (`Content_Description`).

## Notifications

- Relevant app info only — NO cross-promotion or ads in notifications (`Notification_Quality`). Channels per purpose (never one channel for everything), correct priority, group multiple notifications, timeouts where apt.
- Persistent notification ONLY for ongoing events (playback, active call).
- Messaging apps: `MessagingStyle`, direct reply, conversation shortcuts (`Conversation_Quality`).

## Media

- Audio starts <1 s of tap or shows preparing indicator (`Audio_Playback_Start`). Request audio focus on play, abandon on stop, duck for other apps' speech (`Audio_Focus_*`).
- Background audio → foreground service + `MediaStyle` notification, controllable from lock screen (`Audio_Playback_Background`, `Audio_Notification_Style`).
- Video: support picture-in-picture; HEVC when encoding (`Video_PiP`, `Video_Encoding`).
- Sharing → Android Sharesheet, not custom share UI (`System_Sharesheet`).

## Performance + stability

- No crashes, no ANRs (UI thread never blocked) (`Stability_ANR`). Use Play pre-launch report; monitor Android Vitals post-release.
- Launch fast; load >2 s → progress indicator (`App_Startup_Time`). Frames ≤16 ms → 60 fps scrolling/animations (`Rendering_Performance`).
- No long-running background services holding network/Bluetooth/GPS (`Background_Service_Optimization`). Support Doze + App Standby (`Power_Management`).
- Runs on latest public Android without breaking (`Android_Platform_Compatibility`). No debug libraries in production (`Production_Build_Quality`). No non-SDK (hidden) interfaces (`Non_SDK_Interfaces`).

## Privacy + security (Android-specific — general rules in security.md)

- Minimum permissions; coarse location over fine when it suffices (`Minimize_Permissions`). Runtime permissions in context, not at startup; explain why; degrade gracefully on deny — never block whole app (`Runtime_Permissions`, `Permission_Rationale`, `Graceful_Degradation`).
- Sensitive data → internal storage only; never in logs; no non-resettable hardware IDs (IMEI) for identification (`Sensitive_Data_Storage`, `Sensitive_Data_Logging`, `Hardware_IDs`).
- All traffic HTTPS; declare network security configuration (`Network_Security_Traffic`, `Network_Security_Configuration`).
- Autofill hints on credential/payment/address fields; Credential Manager for passkeys/passwords; biometric auth for financial/sensitive actions (`Autofill_Hints`, `Credential_Manager`, `Biometric_Authentication`).
- `android:exported` explicit on every component; export only what other apps need; explicit intents when destination known; immutable PendingIntents (`Component_Export`, `Component_Permissions`).
- WebView: never `setAllowUniversalAccessFromFileURLs()`; `WebViewAssetLoader` for local content; no `addJavaScriptInterface()` with untrusted content (`WebView_*`).
- No dynamic code loading from outside the app bundle (`App_Bundles`) — same line as Play Device Abuse policy; see android-play-policy.md for where OTA JS updates sit.
- Platform crypto + RNG only — never custom crypto (`Cryptographic_Algorithms`).

## Play distribution requirements

- Target API level: new apps + updates must target recent API level (Android 15 / API 35 as of Aug 2025 window; requirement ratchets yearly — verify current at https://developer.android.com/google/play/requirements/target-sdk). Expo SDK upgrades track this — stale Expo SDK = blocked submission.
- 64-bit support mandatory (arm64-v8a); Android App Bundle (AAB) format mandatory for new Play apps.
