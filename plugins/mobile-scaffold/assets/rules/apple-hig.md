# Apple Human Interface Guidelines rules

Applies to all iOS-facing UI work, PWA or native — HIG-conformant UI is also what App Review's design bar (4.x) expects. Canonical: https://developer.apple.com/design/human-interface-guidelines

## Accessibility

- Hit targets ≥ 44×44 pt (28×28 absolute floor); ~12 pt padding around bezeled controls.
- Contrast (WCAG AA): text ≤17 pt → 4.5:1; ≥18 pt or bold → 3:1.
- Never convey information with color alone — pair with shape, icon, or text.
- Every element gets VoiceOver label (`accessibilityLabel`); support text enlargement to 200%.
- Reduce Motion on → replace movement with crossfades, no z-axis/blur animations.
- No timer-based auto-dismiss — require explicit action. Swipe gestures get onscreen button alternative.

## Layout

- Respect safe areas — Dynamic Island/notch top, home indicator bottom. Never hardcode insets or screen dimensions; flex layout + `SafeAreaView`/safe-area context.
- Inset buttons from screen edges (system layout margins); backgrounds full-bleed, scrollable content runs under edges.
- Important content top-leading; account for right-to-left languages.
- Hide status bar only for immersive experiences (games, media).

## Typography

- System font (SF Pro via system default). iOS text styles: Body 17 pt default, Footnote 13, Caption 11; Large Title 34. Minimum legible 11 pt.
- Support Dynamic Type — no fixed sizes that break at accessibility scales; custom fonts must scale too.
- Weights Regular–Bold; avoid Ultralight/Thin/Light (illegible small). Hierarchy via weight/size/color, not extra typefaces.

## Color + dark mode

- Semantic/system colors, never hardcoded hex for UI roles; custom colors ship light + dark + increased-contrast variants.
- Same color = same meaning app-wide; color never sole indicator of interactivity or state.
- Support both appearances, follow system setting — no app-only theme toggle. Test both modes with Increase Contrast on.
- Dark mode: elevated surfaces (sheets, popovers) brighter than base; darken white content images so they don't glow.

## App icon + launch

- Icon: 1024×1024, square, opaque — no transparency, no pre-rounded corners (system masks), no photos/screenshots/UI replicas/Apple hardware, no fine detail, avoid text. Provide Dark/Tinted variants.
- Launch screen ≈ first screen of app — never splash ad, logo moment, or text (won't localize). Branding wanted → start of onboarding, not launch screen.
- Launch fast, interactive within ~2 s; restore prior state (scroll, navigation, drafts) on relaunch.

## Permissions UX

- Request permission in context, at the moment feature needs it — never batch at launch (launch-time only if core function requires).
- Purpose strings: active voice, specific, state concrete user benefit ("Records during the night to detect snoring sounds.").
- Denied → degrade gracefully: app stays usable, no nagging, no blocking unrelated features.
- Pre-permission priming screen: single Continue button, never "Allow", no fake system-alert styling, no incentives — misleading designs rejected.
- Permission toggles live in system Settings — link there (`Linking.openSettings()`), don't duplicate.

## Navigation

- Tab bar = top-level sections only, never actions. Few tabs (≤5); labels single words; filled SF Symbols.
- Never disable or hide tabs — empty section explains why instead. Tab switch preserves each section's navigation state.
- Nav bar: standard Back (retrace) and Close (dismiss modal) symbols; concise title <15 chars, never app name; large title collapses on scroll.
- One prominent action per toolbar (Done/Submit), trailing side.

## Buttons, alerts, modality

- Every custom button: pressed state + ≥44 pt hit region. Text labels start with verb ("Add to Cart"). Max 1–2 accent-colored buttons per view.
- Non-instant action → activity indicator inside button + label swap ("Checking out…").
- Alerts only for critical, actionable info. Never at launch, never for undoable actions, never title "Error". ≤3 buttons; verb labels ("Delete", not "Yes"); Cancel always present with destructive option, never default; destructive never the primary/prominent button.
- Choices following user-initiated action → action sheet, not alert; destructive option top, Cancel bottom.
- Modals: narrow task, always obvious dismiss (top button + swipe down), confirm before dismissing unsaved user content, never stack modals, no app-within-app hierarchies.

## Data entry

- Never ask for what system provides (locale, permissions data). Prefer pickers/menus over typing; prefill sensible defaults; support paste.
- Right keyboard type per field (email, number, URL); label + placeholder both (placeholder disappears on type).
- Validate inline as user leaves each field — never dump all errors at submit. Required fields empty → keep Continue disabled.
- Passwords: `SecureField`-equivalent (`secureTextEntry`), never prepopulated — keychain/biometric instead.

## Feedback + loading

- Show something immediately — blank screen reads broken. Skeletons/placeholders, replace as content arrives.
- Operation >1 s → progress indicator: known duration → determinate bar; unknown → spinner. Long loads give estimate or tips.
- Feedback through multiple channels (visual + haptic + sound) — works silenced, works with VoiceOver.
- Confirm only significant completions (payment); expect success silently, report failures with why + what to do.

## Onboarding

- App understandable by using it — tutorial optional, skippable, never re-shown, findable later. Teach in context (tips near UI), not upfront slide decks.
- Sensible defaults so people start immediately; postpone nonessential setup. Never prompt ratings or purchases before user experienced value. No large blocking downloads at first use.

## Notifications

- Explicit permission first; content valuable to the user or channel dies (people silence apps).
- Interruption level honest: Time Sensitive only for now-relevant, never marketing. Marketing pushes need separate explicit opt-in + opt-out (App Review 4.5.4).
- Ship in-app notification settings screen; respect Focus.

## Ratings + settings

- System prompt only (`expo-store-review` → SKStoreReviewController; 3 prompts/365 days cap). Ask after demonstrated engagement, at natural breaks — never first launch, never mid-task, never gate features on rating.
- Settings minimal: sensible defaults, task-specific options live on the screen they affect, never duplicate system settings.
