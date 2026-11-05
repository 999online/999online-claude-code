#!/usr/bin/env node
// rn-store-readiness — fact scanner for React Native / Expo projects. No dependencies.
// Read-only: inspects the project and its node_modules and prints JSON facts plus preliminary
// findings whose IDs match references/checks.md. It never writes into the project.
//
//   node scan.mjs [--root <project dir>] [--out <file.json>] [--no-exec]
//
// --no-exec skips the local Expo CLI (`expo config`); git is the only other child process.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import zlib from "node:zlib";

import { abiOf, checkZipNativeLibs, elfLoadAlignment, needs16k, PAGE_16K, readFileHead } from "./lib/zip-elf.mjs";

const VERSION = "1.0.0";
// Store-policy thresholds. Keep in sync with references/policy-dates.md (verified 2026-10-29).
const POLICY = {
  verified: "2026-10-29",
  playMinTargetSdk: 36, // new apps + updates since 2026-08-31
  appleMinXcode: 26, // uploads since 2026-04-28
  appleMinDeploymentTarget: 13, // uploads since 2026-09-09
};

const opts = parseArgs(process.argv.slice(2));
const ROOT = path.resolve(opts.root ?? process.cwd());
const NM = path.join(ROOT, "node_modules");
const notes = [];
const findings = [];

// ---------------------------------------------------------------- project

const pkg = readJson(path.join(ROOT, "package.json"));
if (!pkg || pkg.__parseError) fatal(`No readable package.json in ${ROOT}`);
const deps = pkg.dependencies ?? {};
const devDeps = pkg.devDependencies ?? {};
const has = (name) => Object.hasOwn(deps, name);
const installed = isDir(NM);
const versionOf = (name) => readJson(path.join(NM, name, "package.json"))?.version ?? deps[name] ?? devDeps[name] ?? null;
if (!installed) {
  notes.push("node_modules is missing: Expo config plugins, library manifests, licenses and native libraries were NOT scanned. Install dependencies and re-run for a full scan.");
}

const git = (...a) => {
  const r = spawnSync("git", ["-C", ROOT, ...a], { encoding: "utf8", maxBuffer: 256 << 20 });
  return r.status === 0 ? r.stdout : null;
};
const inGit = git("rev-parse", "--is-inside-work-tree")?.trim() === "true";
const tracked = inGit ? (git("ls-files", "-z") ?? "").split("\0").filter(Boolean) : [];
const iosDir = isDir(path.join(ROOT, "ios"));
const androidDir = isDir(path.join(ROOT, "android"));
const iosTracked = inGit ? tracked.some((f) => f.startsWith("ios/")) : iosDir;
const androidTracked = inGit ? tracked.some((f) => f.startsWith("android/")) : androidDir;
const projectType = has("expo")
  ? iosTracked || androidTracked
    ? "expo-with-native-dirs"
    : "expo-cng"
  : has("react-native")
    ? "bare-react-native"
    : "unknown";
// Where native settings really come from: committed native projects win over app config.
const nativeTruth = {
  ios: iosTracked || (!has("expo") && iosDir),
  android: androidTracked || (!has("expo") && androidDir),
};
if (projectType === "expo-cng" && (iosDir || androidDir)) {
  notes.push("ios/ or android/ exist locally but are not committed (CNG): they are regenerated at build time, so app config is the source of truth.");
}

// ---------------------------------------------------------------- Expo config

let expo = null;
let configSource = null;
let modResults = null;
if (has("expo")) {
  const cli = path.join(NM, "expo", "bin", "cli");
  if (opts.exec && exists(cli)) {
    const pub = runExpoConfig(cli, "public");
    if (pub.config) {
      expo = pub.config;
      configSource = "expo config --type public (local env)";
    } else notes.push(`expo config --type public failed: ${pub.error}`);
    // Introspect = config plugins applied to template native files. Only plugin-added keys are
    // trustworthy: its base Info.plist/manifest template is generic (e.g. ATS, placeholder ids).
    const intro = runExpoConfig(cli, "introspect");
    if (intro.config) modResults = intro.config._internal?.modResults ?? null;
    else notes.push(`expo config --type introspect failed: ${intro.error}`);
  }
  if (!expo) {
    const appJson = readJson(path.join(ROOT, "app.json"));
    expo = appJson?.expo ?? (appJson && !appJson.__parseError ? appJson : {});
    const dynamic = ["app.config.ts", "app.config.js", "app.config.mjs", "app.config.cjs"].find((f) => exists(path.join(ROOT, f)));
    configSource = dynamic ? `app.json only — ${dynamic} NOT evaluated` : "app.json (static)";
  }
  notes.push("Expo config was evaluated with the LOCAL environment; EAS build environments (eas env) can differ — check values that come from env vars.");
}
const pluginOptions = (name) => {
  for (const p of expo?.plugins ?? []) {
    if (p === name) return {};
    if (Array.isArray(p) && p[0] === name) return p[1] ?? {};
  }
  return null;
};
const buildProps = pluginOptions("expo-build-properties") ?? {};

// ---------------------------------------------------------------- native projects

const rnDefaults = readRnGradleDefaults();
const androidNative = androidDir ? scanAndroidNative() : null;
const iosNative = iosDir ? scanIosNative() : null;

// ---------------------------------------------------------------- EAS

const easJson = readJsonLoose(path.join(ROOT, "eas.json"));
const buildProfiles = Object.keys(easJson?.build ?? {}).map((name) => summarizeProfile(name, resolveProfile(easJson.build, name)));
const storeProfiles = buildProfiles.filter((p) => p.isStore);
const submitProfiles = Object.entries(easJson?.submit ?? {}).map(([name, p]) => ({
  name,
  ios: p?.ios ? { ascAppId: p.ios.ascAppId ?? null, appleTeamId: p.ios.appleTeamId ?? null } : null,
  android: p?.android
    ? { track: p.android.track ?? null, releaseStatus: p.android.releaseStatus ?? null, serviceAccountKeyPath: p.android.serviceAccountKeyPath ?? null }
    : null,
}));
const easScripts = Object.entries(pkg.scripts ?? {})
  .filter(([, cmd]) => /\beas(-cli[^\s]*)?\s+(build|submit|update)/.test(cmd))
  .map(([name, cmd]) => `${name}: ${cmd}`);

// ---------------------------------------------------------------- identity + platform facts

const ios = {};
const android = {};
if (nativeTruth.ios && iosNative) {
  ios.source = "ios/ (native project)";
  ios.bundleIds = iosNative.bundleIds;
  ios.bundleId = iosNative.bundleIds.find((b) => !/tests?$/i.test(b)) ?? null;
  ios.version = iosNative.marketingVersions[0] ?? null;
  ios.buildNumber = iosNative.buildNumbers[0] ?? null;
  ios.deploymentTarget = iosNative.deploymentTargets[0] ?? null;
  ios.supportsTablet = iosNative.deviceFamilies.some((f) => f.split(",").includes("2"));
  ios.infoPlist = iosNative.infoPlist ?? {};
  ios.userInfoPlist = ios.infoPlist;
  ios.entitlements = Object.assign({}, ...iosNative.entitlements.map((e) => e.values));
  ios.privacyManifestFiles = iosNative.privacyManifests;
} else if (expo) {
  ios.source = configSource;
  ios.bundleId = expo.ios?.bundleIdentifier ?? null;
  ios.version = expo.ios?.version ?? expo.version ?? null;
  ios.buildNumber = expo.ios?.buildNumber ?? null;
  ios.deploymentTarget = buildProps.ios?.deploymentTarget ?? null;
  ios.supportsTablet = expo.ios?.supportsTablet ?? false;
  ios.infoPlist = modResults?.ios?.infoPlist ?? expo.ios?.infoPlist ?? {};
  ios.userInfoPlist = expo.ios?.infoPlist ?? {};
  ios.entitlements = modResults?.ios?.entitlements ?? expo.ios?.entitlements ?? {};
  ios.privacyManifests = expo.ios?.privacyManifests ?? null;
  ios.usesNonExemptEncryption = expo.ios?.config?.usesNonExemptEncryption;
  ios.associatedDomains = expo.ios?.associatedDomains ?? [];
  ios.usesAppleSignIn = expo.ios?.usesAppleSignIn ?? false;
  ios.googleServicesFile = expo.ios?.googleServicesFile ?? null;
  ios.sceneSupport = buildProps.ios?.enableSceneSupport ?? null;
}
ios.displayName = ios.infoPlist?.CFBundleDisplayName ?? expo?.name ?? pkg.name;

const blocked = new Set(expo?.android?.blockedPermissions ?? []);
if (nativeTruth.android && androidNative) {
  android.source = "android/ (native project)";
  android.package = androidNative.applicationId;
  android.versionCode = androidNative.versionCode;
  android.versionName = androidNative.versionName;
  android.targetSdk = androidNative.targetSdk;
  android.compileSdk = androidNative.compileSdk;
  android.minSdk = androidNative.minSdk;
  android.ndkVersion = androidNative.ndkVersion;
  android.architectures = androidNative.architectures;
  android.cleartextTraffic = androidNative.usesCleartextTraffic;
  android.screenOrientation = androidNative.screenOrientation;
} else if (expo) {
  android.source = configSource;
  android.package = expo.android?.package ?? null;
  android.versionCode = expo.android?.versionCode ?? null;
  android.versionName = expo.version ?? null;
  android.targetSdk = numberOr(buildProps.android?.targetSdkVersion, rnDefaults.targetSdk);
  android.targetSdkSource = buildProps.android?.targetSdkVersion ? "expo-build-properties" : rnDefaults.targetSdk ? "react-native default (gradle/libs.versions.toml)" : null;
  android.compileSdk = numberOr(buildProps.android?.compileSdkVersion, rnDefaults.compileSdk);
  android.minSdk = numberOr(buildProps.android?.minSdkVersion, rnDefaults.minSdk);
  android.ndkVersion = buildProps.android?.ndkVersion ?? rnDefaults.ndkVersion;
  android.architectures = buildProps.android?.buildArchs ?? null;
  android.cleartextTraffic = buildProps.android?.usesCleartextTraffic ?? null;
  android.screenOrientation = expo.android?.screenOrientation ?? expo.orientation ?? null;
  android.googleServicesFile = expo.android?.googleServicesFile ?? null;
  android.intentFilters = expo.android?.intentFilters ?? [];
}
android.blockedPermissions = [...blocked];

// ---------------------------------------------------------------- libraries (node_modules)

const closure = installed ? runtimeClosure() : new Map();
const libs = [];
for (const [name, info] of closure) {
  if (!info) continue;
  libs.push(scanLibrary(name, info));
}
const libNames = new Set(closure.keys());
const runtimeHas = (re) => [...libNames].filter((n) => re.test(n));

const LIB_GROUPS = {
  crash: /^(@sentry\/react-native|sentry-expo|@bugsnag\/(react-native|expo)|@react-native-firebase\/crashlytics|@datadog\/mobile-react-native|instabug-reactnative|@embrace-io\/react-native|newrelic-react-native-agent|@rollbar\/react-native|expo-insights)$/,
  analytics: /^(@react-native-firebase\/analytics|@segment\/analytics-react-native|mixpanel-react-native|@amplitude\/analytics-react-native|posthog-react-native|react-native-appsflyer|react-native-adjust|react-native-branch|@react-native-firebase\/in-app-messaging|@vexo-analytics\/.+|@aptabase\/react-native)$/,
  ads: /^(react-native-google-mobile-ads|react-native-applovin-max|react-native-fbads|react-native-admob-native-ads|@react-native-admob\/admob|react-native-ironsource-mediation)$/,
  att: /^(expo-tracking-transparency|react-native-tracking-transparency)$/,
  iap: /^(react-native-iap|expo-iap|react-native-purchases|react-native-purchases-ui|expo-in-app-purchases|react-native-adapty|react-native-qonversion|@superwall\/react-native-superwall)$/,
  externalPay: /^(@stripe\/stripe-react-native|react-native-braintree-dropin-ui|@adyen\/react-native|react-native-razorpay|react-native-paypal.*)$/,
  socialLogin: /^(@react-native-google-signin\/google-signin|react-native-fbsdk-next|@react-native-seoul\/(kakao|naver)-login|@xmartlabs\/react-native-line|react-native-line-sdk)$/,
  appleLogin: /^(expo-apple-authentication|@invertase\/react-native-apple-authentication)$/,
  oauth: /^(expo-auth-session|react-native-app-auth)$/,
  push: /^(expo-notifications|@react-native-firebase\/messaging|react-native-onesignal|@notifee\/react-native|react-native-push-notification)$/,
  ota: /^(expo-updates|react-native-code-push|@revopush\/react-native-code-push|@hot-updater\/react-native)$/,
  ai: /^(openai|@anthropic-ai\/sdk|@google\/generative-ai|@google\/genai|ai|@ai-sdk\/.+|@mistralai\/mistralai|groq-sdk|replicate|cohere-ai|@langchain\/.+|langchain|llama\.rn)$/,
  webview: /^react-native-webview$/,
  devOnly: /^(reactotron-react-native|react-native-flipper|@storybook\/react-native|react-native-performance-monitor)$/,
  secureStorage: /^(expo-secure-store|react-native-keychain|react-native-encrypted-storage|react-native-sensitive-info)$/,
};
// Direct dependencies decide intent (a transitive analytics SDK inside another SDK still counts for data-safety, so both are reported).
const groups = Object.fromEntries(
  Object.entries(LIB_GROUPS).map(([k, re]) => [k, { direct: Object.keys(deps).filter((d) => re.test(d)), transitive: runtimeHas(re).filter((d) => !has(d)) }]),
);

// ---------------------------------------------------------------- Android permissions (approximate merge)

const permissionMap = new Map();
const addPermission = (name, source, maxSdk) => {
  if (!name) return;
  const entry = permissionMap.get(name) ?? { name, sources: [], maxSdk: maxSdk ?? null };
  if (!entry.sources.includes(source)) entry.sources.push(source);
  if (maxSdk == null) entry.maxSdk = entry.maxSdk ?? null;
  permissionMap.set(name, entry);
};
if (nativeTruth.android && androidNative) {
  for (const p of androidNative.manifestPermissions) if (!p.remove) addPermission(p.name, "android/app/src/main/AndroidManifest.xml", p.maxSdk);
} else {
  for (const p of modResults?.android?.manifest?.manifest?.["uses-permission"] ?? []) {
    addPermission(p.$?.["android:name"], "app config (+ plugins, template)", p.$?.["android:maxSdkVersion"]);
  }
  for (const p of expo?.android?.permissions ?? []) addPermission(p.includes(".") ? p : `android.permission.${p}`, "app config android.permissions");
}
for (const lib of libs) for (const p of lib.androidPermissions) if (!p.remove) addPermission(p.name, lib.name, p.maxSdk);
for (const b of blocked) permissionMap.delete(b.includes(".") ? b : `android.permission.${b}`);
const PERMISSION_POLICY = {
  "android.permission.ACCESS_BACKGROUND_LOCATION": ["restricted", "Background location declaration + video + prominent disclosure"],
  "android.permission.READ_SMS": ["restricted", "SMS/Call Log policy: default handler only"],
  "android.permission.SEND_SMS": ["restricted", "SMS/Call Log policy: default handler only"],
  "android.permission.RECEIVE_SMS": ["restricted", "SMS/Call Log policy: default handler only"],
  "android.permission.RECEIVE_MMS": ["restricted", "SMS/Call Log policy: default handler only"],
  "android.permission.READ_CALL_LOG": ["restricted", "SMS/Call Log policy: default handler only"],
  "android.permission.WRITE_CALL_LOG": ["restricted", "SMS/Call Log policy: default handler only"],
  "android.permission.PROCESS_OUTGOING_CALLS": ["restricted", "SMS/Call Log policy"],
  "android.permission.QUERY_ALL_PACKAGES": ["restricted", "Package visibility declaration; use <queries> instead"],
  "android.permission.MANAGE_EXTERNAL_STORAGE": ["restricted", "All files access declaration; use SAF/MediaStore"],
  "android.permission.REQUEST_INSTALL_PACKAGES": ["restricted", "Declaration; core purpose only"],
  "android.permission.USE_EXACT_ALARM": ["restricted", "Alarm/calendar apps only"],
  "android.permission.SCHEDULE_EXACT_ALARM": ["special", "User-granted on API 33+; justify or use inexact alarms"],
  "android.permission.USE_FULL_SCREEN_INTENT": ["restricted", "Calling/alarm apps only"],
  "android.permission.READ_MEDIA_IMAGES": ["restricted", "Photo & video permissions policy: core use only, else photo picker"],
  "android.permission.READ_MEDIA_VIDEO": ["restricted", "Photo & video permissions policy: core use only, else photo picker"],
  "android.permission.BIND_ACCESSIBILITY_SERVICE": ["restricted", "Accessibility API policy"],
  "android.permission.SYSTEM_ALERT_WINDOW": ["special", "Overlay permission — usually a dev-only leftover; block it if unused"],
  "com.google.android.gms.permission.AD_ID": ["declaration", "Advertising ID declaration in Play Console; block it if no ads/analytics need it"],
};
const DANGEROUS = /\.(ACCESS_(FINE|COARSE)_LOCATION|CAMERA|RECORD_AUDIO|READ_CONTACTS|WRITE_CONTACTS|GET_ACCOUNTS|READ_CALENDAR|WRITE_CALENDAR|BODY_SENSORS.*|ACTIVITY_RECOGNITION|READ_PHONE_STATE|READ_PHONE_NUMBERS|CALL_PHONE|BLUETOOTH_(SCAN|CONNECT|ADVERTISE)|NEARBY_WIFI_DEVICES|POST_NOTIFICATIONS|READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|READ_MEDIA_AUDIO|READ_MEDIA_VISUAL_USER_SELECTED|UWB_RANGING)$/;
const permissions = [...permissionMap.values()]
  .map((p) => {
    const policy = PERMISSION_POLICY[p.name] ?? (/FOREGROUND_SERVICE_/.test(p.name) ? ["declaration", "Foreground service type declaration in Play Console"] : /\.health\./.test(p.name) ? ["restricted", "Health Connect declaration"] : null);
    return { ...p, class: policy?.[0] ?? (DANGEROUS.test(p.name) ? "runtime" : "normal"), note: policy?.[1] ?? null };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// ---------------------------------------------------------------- assets

const assets = scanAssets();

// ---------------------------------------------------------------- source code

const source = scanSource();

// ---------------------------------------------------------------- git hygiene

const SENSITIVE_TRACKED = [
  [/(^|\/)google-services\.json$/, "medium", "Firebase Android config (API keys restricted by package/SHA; provision per env)"],
  [/(^|\/)GoogleService-Info\.plist$/, "medium", "Firebase iOS config"],
  [/\.(jks|p8|p12|mobileprovision|pem|key)$/i, "blocker", "signing key / certificate / private key"],
  [/(^|\/)(?!debug\.)[^/]*\.keystore$/i, "blocker", "keystore"],
  [/(^|\/)credentials\.json$/, "blocker", "EAS local credentials file"],
  [/(^|\/)\.env(\.(?!example$|sample$|template$)[^/]+)?$/, "high", ".env file (may hold secrets)"],
  [/service[-_]?account[^/]*\.json$|play[-_]?(store|console)[^/]*\.json$|api[-_]?key[^/]*\.json$/i, "blocker", "service-account / API key JSON"],
];
const trackedSensitive = [];
for (const f of tracked) {
  for (const [re, severity, what] of SENSITIVE_TRACKED) if (re.test(f)) trackedSensitive.push({ file: f, severity, what });
}

// ---------------------------------------------------------------- findings

evaluate();

// ---------------------------------------------------------------- output

const summary = {};
for (const f of findings) summary[f.status] = (summary[f.status] ?? 0) + 1;
const out = {
  meta: {
    scanner: `rn-store-readiness/scan.mjs ${VERSION}`,
    scannedAt: new Date().toISOString(),
    policyVerified: POLICY.verified,
    root: ROOT,
    git: inGit ? { commit: git("rev-parse", "--short", "HEAD")?.trim() ?? null, branch: git("rev-parse", "--abbrev-ref", "HEAD")?.trim() ?? null, dirty: Boolean(git("status", "--porcelain")?.trim()) } : null,
    configSource,
    nodeModules: installed,
  },
  project: {
    name: pkg.name,
    type: projectType,
    expo: versionOf("expo"),
    reactNative: versionOf("react-native"),
    packageManager: ["bun.lock", "bun.lockb", "pnpm-lock.yaml", "yarn.lock", "package-lock.json"].find((f) => exists(path.join(ROOT, f))) ?? null,
    nativeDirs: { ios: iosDir, android: androidDir, iosTracked, androidTracked },
    docs: ["README.md", "CLAUDE.md", "AGENTS.md", "docs/ADR.md", "DEPLOY.md", "fastlane/Fastfile", "store.config.json"].filter((f) => exists(path.join(ROOT, f))),
    scripts: easScripts,
  },
  ios: { ...ios, infoPlist: undefined, usageDescriptions: usageDescriptions(ios.infoPlist), nativeDetails: iosNative ?? undefined },
  android: { ...android, nativeDetails: androidNative ?? undefined, permissions },
  eas: easJson
    ? { appVersionSource: easJson.cli?.appVersionSource ?? null, buildProfiles, storeProfiles: storeProfiles.map((p) => p.name), submitProfiles }
    : null,
  dependencies: { groups, rnDefaults },
  libraries: {
    nativeAndroid: libs.filter((l) => l.android).map((l) => ({ name: l.name, version: l.version, sourceNative: l.sourceNative, flexiblePageFlag: l.flexiblePageFlag, prebuilt: l.prebuiltLibs })),
    nativeIos: libs.filter((l) => l.ios).map((l) => ({ name: l.name, privacyManifest: l.iosPrivacyManifest })),
    licenses: {
      copyleft: libs.filter((l) => l.copyleft).map((l) => ({ name: l.name, version: l.version, license: l.license })),
      embeddedLicenseTexts: libs.flatMap((l) => l.embeddedLicenses.map((e) => ({ name: l.name, ...e }))),
      unknown: libs.filter((l) => !l.license).map((l) => l.name),
    },
  },
  assets,
  source,
  gitHygiene: { trackedSensitive },
  notes,
  findings,
  summary,
};
const json = JSON.stringify(out, null, 2);
if (opts.out) {
  fs.writeFileSync(opts.out, json);
  process.stderr.write(`Wrote ${opts.out} — findings: ${JSON.stringify(summary)}\n`);
} else process.stdout.write(json + "\n");

// ================================================================= evaluation

function add(id, platform, status, severity, title, evidence, fix) {
  findings.push({
    id,
    platform,
    status,
    severity: status === "pass" || status === "na" ? null : severity,
    title,
    evidence: [].concat(evidence ?? []).filter(Boolean).slice(0, 15),
    fix: fix ?? null,
  });
}

function evaluate() {
  const PLACEHOLDER_ID = /^(com|org)\.(example|reactjs\.native\.example|anonymous|placeholder|yourcompany)\b|\.example(\.|$)|\$\(/i;
  const isExpoConfig = (platform) => !nativeTruth[platform] && Boolean(expo);
  const hits = (signal) => source.signals[signal] ?? [];
  const fmt = (h) => `${h.file}:${h.line} ${h.text}`;
  const expoMajor = Number.parseInt(versionOf("expo") ?? "", 10) || null;

  // BLD-01 / BLD-02 — identifiers
  if (!ios.bundleId) add("BLD-01", "ios", "fail", "blocker", "No iOS bundle identifier", [`source: ${ios.source ?? "none"}`], isExpoConfig("ios") ? "Set ios.bundleIdentifier in app config (reverse-DNS you own). Immutable once the App Store Connect record exists." : "Set PRODUCT_BUNDLE_IDENTIFIER in the Xcode project.");
  else if (PLACEHOLDER_ID.test(ios.bundleId)) add("BLD-01", "ios", "fail", "blocker", `Placeholder iOS bundle identifier ${ios.bundleId}`, [], "Use a reverse-DNS id on a domain you own before creating the App Store Connect record.");
  else add("BLD-01", "ios", "pass", null, `iOS bundle identifier ${ios.bundleId}`, ios.bundleIds?.length > 1 ? [`all: ${ios.bundleIds.join(", ")}`] : []);
  if (!android.package) add("BLD-02", "android", "fail", "blocker", "No Android application id", [`source: ${android.source ?? "none"}`], isExpoConfig("android") ? "Set android.package in app config. Immutable after the first Play upload." : "Set applicationId in android/app/build.gradle.");
  else if (PLACEHOLDER_ID.test(android.package)) add("BLD-02", "android", "fail", "blocker", `Placeholder Android application id ${android.package}`, [], "Use a reverse-DNS id you own; it can't change after the first Play upload.");
  else add("BLD-02", "android", "pass", null, `Android application id ${android.package}`, [`source: ${android.source}`]);

  // BLD-03 — store build pipeline
  if (easJson) {
    const evidence = buildProfiles.map((p) => `profile ${p.name}: distribution=${p.distribution}${p.developmentClient ? ", developmentClient" : ""}, android=${p.android.buildType}${p.ios.simulator ? ", ios simulator" : ""}`).concat(easScripts.map((s) => `script ${s}`));
    if (!storeProfiles.length) add("BLD-03", "both", "fail", "blocker", "No store-distribution build profile in eas.json (every profile is internal/dev/simulator)", evidence, "Add a production profile (no distribution: internal, no developmentClient): it builds an AAB for Play and an App Store-signed IPA. Build with `eas build --profile production`.");
    else {
      const apk = storeProfiles.filter((p) => p.android.buildType === "apk");
      if (apk.length) add("BLD-03", "android", "fail", "blocker", `Store profile builds an APK (${apk.map((p) => p.name).join(", ")}) — Play requires an AAB for new apps`, evidence, "Remove android.buildType: apk from the store profile (default app-bundle).");
      else add("BLD-03", "both", "pass", null, `Store profile(s): ${storeProfiles.map((p) => p.name).join(", ")}`, evidence);
    }
  } else if (projectType === "expo-cng") add("BLD-03", "both", "fail", "high", "No eas.json — no store build configuration", [], "Run `eas build:configure` and add a production profile, or document the local prebuild + Gradle/Xcode release flow.");
  else add("BLD-03", "both", "verify", "blocker", "No eas.json — confirm the release pipeline (Gradle bundleRelease → AAB, Xcode archive → App Store export, or fastlane)", project0Docs(), null);

  // BLD-04 — build numbers
  if (easJson) {
    const src = easJson.cli?.appVersionSource ?? null;
    const missing = storeProfiles.flatMap((p) => ["android", "ios"].filter((pl) => !p[pl].autoIncrement).map((pl) => `${p.name}.${pl}`));
    if (src === "remote" && missing.length) add("BLD-04", "both", "fail", "high", `appVersionSource is remote but store profile(s) don't autoIncrement (${missing.join(", ")}) — repeated builds reuse the stored build number and the second upload is rejected as a duplicate`, [], 'Add "autoIncrement": true to the store profile (or run `eas build:version:set` before every store build).');
    else if (src === "remote") add("BLD-04", "both", "pass", null, "Remote app versioning with autoIncrement on store profiles");
    else if (src === null) add("BLD-04", "both", "warn", "medium", "eas.json cli.appVersionSource is unset", [], 'Set "appVersionSource": "remote" and "autoIncrement": true on store profiles so every upload gets a unique build number / versionCode.');
    else add("BLD-04", "both", "verify", "high", "Local app versioning: bump ios.buildNumber / android.versionCode before every upload", [`ios.buildNumber=${ios.buildNumber ?? "unset (1)"}`, `android.versionCode=${android.versionCode ?? "unset (1)"}`], null);
  } else add("BLD-04", "both", "verify", "high", "Confirm build numbers increase on every upload", [`iOS ${ios.version ?? "?"} (${ios.buildNumber ?? "?"})`, `Android ${android.versionName ?? "?"} (${android.versionCode ?? "?"})`], null);

  // BLD-05 — Android signing
  if (androidNative && nativeTruth.android && androidNative.releaseUsesDebugSigning) add("BLD-05", "android", "fail", "blocker", "Release build type is signed with the debug keystore", ["android/app/build.gradle buildTypes.release → signingConfigs.debug"], "Create an upload keystore (kept out of git), add a release signingConfig, and enroll in Play App Signing.");
  else if (storeProfiles.some((p) => p.credentialsSource === "local")) add("BLD-05", "android", "verify", "blocker", "Store profile uses local credentials (credentials.json) — confirm the keystore is backed up and not committed", trackedSensitive.filter((t) => /credentials\.json|keystore|jks/.test(t.file)).map((t) => `tracked: ${t.file}`), null);
  else add("BLD-05", "android", "verify", "blocker", "Signing: confirm upload keystore exists and is backed up (EAS-managed: `eas credentials`), and Play App Signing is enrolled", [], null);

  // BLD-06 — targetSdk
  if (android.targetSdk == null) add("BLD-06", "android", "verify", "blocker", `Android targetSdk unknown — must be ≥ ${POLICY.playMinTargetSdk}`, [], "Check the generated android/app/build.gradle or the AAB manifest.");
  else if (android.targetSdk < POLICY.playMinTargetSdk) add("BLD-06", "android", "fail", "blocker", `targetSdk ${android.targetSdk} < Play minimum ${POLICY.playMinTargetSdk} for new apps and updates`, [`source: ${android.targetSdkSource ?? android.source}`], isExpoConfig("android") ? "Upgrade the Expo SDK (or set expo-build-properties android.targetSdkVersion) and test Android 16 behavior changes." : "Raise targetSdkVersion/compileSdkVersion and test Android 16 behavior changes.");
  else add("BLD-06", "android", "pass", null, `targetSdk ${android.targetSdk} (≥ ${POLICY.playMinTargetSdk})`, [`source: ${android.targetSdkSource ?? android.source}`]);

  // BLD-07 — 16 KB page size
  const ndkMajor = Number.parseInt(String(android.ndkVersion ?? ""), 10) || null;
  const unaligned = libs.flatMap((l) => l.prebuiltLibs.filter((x) => x.status === "UNALIGNED").map((x) => `${l.name}: ${x.path} (align ${x.minAlign})`));
  const unflagged = libs.filter((l) => l.sourceNative && !l.flexiblePageFlag).map((l) => l.name);
  if (unaligned.length) add("BLD-07", "android", "fail", "blocker", "Prebuilt 64-bit native libraries are not 16 KB aligned", unaligned, "Upgrade or replace these libraries; Play rejects apps targeting Android 15+ whose 64-bit libs aren't 16 KB compatible.");
  else if (unflagged.length && ndkMajor && ndkMajor < 28) add("BLD-07", "android", "warn", "blocker", `Native code compiled with NDK r${ndkMajor} (4 KB pages by default) by libraries without 16 KB flags: ${unflagged.join(", ")}`, [`ndkVersion ${android.ndkVersion}`], "Confirm with the android-16kb-check skill (check-elf-alignment.mjs) on the release AAB/APK. Fix: add -DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON to the library's cmake arguments (patch-package), use NDK r28+, or upgrade the library.");
  else if (!installed) add("BLD-07", "android", "verify", "blocker", "16 KB page-size support not checked (node_modules missing)", [], "Install dependencies and re-run, or run the android-16kb-check skill (check-elf-alignment.mjs) on the release AAB/APK.");
  else add("BLD-07", "android", "verify", "blocker", "No unaligned prebuilt libs or unflagged native builds found — confirm on the built artifact", [`ndkVersion ${android.ndkVersion ?? "?"}`], "Run the android-16kb-check skill (check-elf-alignment.mjs) on the release AAB/APK (or Play Console → App bundle explorer).");

  // BLD-08 — iOS toolchain
  const images = storeProfiles.map((p) => p.ios.image).filter(Boolean);
  const xcodes = images.map((i) => Number(i.match(/xcode-(\d+)/i)?.[1])).filter(Boolean);
  if (xcodes.some((x) => x < POLICY.appleMinXcode)) add("BLD-08", "ios", "fail", "blocker", `EAS iOS image uses Xcode < ${POLICY.appleMinXcode}`, images, `Use an image with Xcode ≥ ${POLICY.appleMinXcode} (required for App Store Connect uploads).`);
  else if (ios.deploymentTarget && Number.parseFloat(ios.deploymentTarget) < POLICY.appleMinDeploymentTarget) add("BLD-08", "ios", "fail", "blocker", `iOS deployment target ${ios.deploymentTarget} < ${POLICY.appleMinDeploymentTarget}`, [], `Raise the deployment target to ≥ ${POLICY.appleMinDeploymentTarget}.`);
  else {
    // EAS "auto" (no image) picks the SDK's own image; "latest" can be a newer Xcode than the SDK supports.
    const sceneRisk = has("expo") && expoMajor && expoMajor <= 57 && ios.sceneSupport !== true && images.some((i) => /latest|xcode-2[7-9]/i.test(i));
    const ev8 = easJson ? [`ios.image: ${images.join(", ") || "unset → EAS auto image for the SDK"}`] : ["local Xcode: check `xcodebuild -version` on the release machine/CI"];
    if (has("expo")) ev8.push(`expo-build-properties ios.enableSceneSupport: ${ios.sceneSupport ?? "unset"}`);
    if (ios.deploymentTarget) ev8.push(`deployment target ${ios.deploymentTarget}`);
    if (sceneRisk) add("BLD-08", "ios", "warn", "high", `Expo SDK ${expoMajor} built on an Xcode 27 image: the iOS 27 SDK requires the UIScene lifecycle or the app won't launch correctly on iOS 27`, ev8, "Use the SDK's image (remove ios.image or set sdk-" + expoMajor + "), or set expo-build-properties ios.enableSceneSupport: true (expo ≥ 57.0.23) and test; SDK 58+ uses scenes by default.");
    else add("BLD-08", "ios", "verify", "medium", `Confirm the iOS build uses Xcode ≥ ${POLICY.appleMinXcode} ("Spin up build environment" / xcodebuild log)`, ev8, null);
  }

  // BLD-10 — release environment
  const localDefaults = hits("localhostDefault");
  const envProfiles = storeProfiles.map((p) => `${p.name}: environment=${p.environment ?? "unset"}, env keys=${p.envKeys.join("|") || "none"}`);
  if (localDefaults.length) add("BLD-10", "both", "warn", "blocker", "Code falls back to a localhost/LAN URL — a store build without the env var ships a broken backend URL", localDefaults.map(fmt).concat(envProfiles), "Fail the build (or throw at startup) when the production URL is missing instead of defaulting to localhost; set it in the EAS production environment (`eas env:list --environment production`).");
  else add("BLD-10", "both", "verify", "blocker", "Confirm release builds point at a live HTTPS backend that reviewers can reach", envProfiles.concat(source.publicEnvNames.map((n) => `uses ${n}`)), null);

  // BLD-11 — 64-bit ABIs
  const archs = android.architectures;
  if (archs && !archs.some((a) => /arm64-v8a/.test(a))) add("BLD-11", "android", "fail", "blocker", `arm64-v8a missing from build architectures (${archs.join(", ")})`, [], "Include arm64-v8a (Play requires 64-bit).");
  else add("BLD-11", "android", "pass", null, "64-bit ABI not excluded", archs ? [`architectures: ${archs.join(", ")}`] : ["default React Native architectures"]);

  // BLD-12 — signing-bound services (Play App Signing changes the SHA)
  const shaBound = [...groups.socialLogin.direct.filter((n) => /google-signin|fbsdk/.test(n)), ...(has("@react-native-firebase/app") ? ["@react-native-firebase/app"] : []), ...(has("react-native-maps") ? ["react-native-maps (API key restriction)"] : []), ...(android.intentFilters?.some((f) => f.autoVerify) ? ["Android App Links (assetlinks.json)"] : [])];
  if (shaBound.length) add("BLD-12", "android", "verify", "high", "Services bound to the signing certificate must include the Play App Signing key SHA-1/SHA-256 (Play-installed builds — internal testing included — are re-signed by Google)", shaBound, "Copy the app-signing key fingerprints from Play Console → App integrity into Google Cloud OAuth clients / Firebase / API-key restrictions / assetlinks.json. Otherwise Google sign-in fails with DEVELOPER_ERROR in Play builds.");

  // BLD-13 — size
  const bigLibs = libs.filter((l) => l.nativeAssetBytes > 20 * 1024 * 1024).map((l) => `${l.name}: ~${Math.round(l.nativeAssetBytes / 1048576)} MB of native assets`);
  if (bigLibs.length) add("BLD-13", "both", "verify", "medium", "Large native payloads — check per-device download size (Play base module ≤ 200 MB compressed; iOS > 200 MB prompts on cellular)", bigLibs, "Check Play Console → App bundle explorer and App Store Connect build sizes; consider Play Asset Delivery / on-demand resources.");

  // CFG-01 — export compliance
  const enc = ios.usesNonExemptEncryption ?? ios.infoPlist?.ITSAppUsesNonExemptEncryption;
  if (enc === undefined) add("CFG-01", "ios", "warn", "medium", "Export compliance not declared — every build waits in 'Missing Compliance' in App Store Connect until answered", [], isExpoConfig("ios") ? "Set ios.config.usesNonExemptEncryption: false (only if the app uses nothing beyond HTTPS/OS crypto)." : "Add ITSAppUsesNonExemptEncryption = NO to Info.plist (only if exempt).");
  else if (enc === true) add("CFG-01", "ios", "verify", "high", "Non-exempt encryption declared — export documentation required", [], "Upload export compliance documentation in App Store Connect.");
  else add("CFG-01", "ios", "pass", null, "Export compliance declared (exempt)");

  // CFG-02 — purpose strings
  const plist = ios.infoPlist ?? {};
  const IOS_PURPOSE = [
    [/^(expo-camera|react-native-vision-camera|react-native-camera)$/, ["NSCameraUsageDescription"]],
    [/^(expo-image-picker|expo-media-library|@react-native-camera-roll\/camera-roll|react-native-image-picker)$/, ["NSPhotoLibraryUsageDescription"]],
    [/^(expo-location|react-native-geolocation-service|@react-native-community\/geolocation)$/, ["NSLocationWhenInUseUsageDescription"]],
    [/^(expo-contacts|react-native-contacts)$/, ["NSContactsUsageDescription"]],
    [/^expo-calendar$/, ["NSCalendarsFullAccessUsageDescription"]],
    [/^(expo-local-authentication|react-native-biometrics|react-native-touch-id)$/, ["NSFaceIDUsageDescription"]],
    [/^(expo-tracking-transparency|react-native-tracking-transparency)$/, ["NSUserTrackingUsageDescription"]],
    [/^expo-sensors$/, ["NSMotionUsageDescription"]],
    [/^(react-native-ble-plx|react-native-ble-manager)$/, ["NSBluetoothAlwaysUsageDescription"]],
    [/^(@react-native-voice\/voice|expo-speech-recognition)$/, ["NSSpeechRecognitionUsageDescription", "NSMicrophoneUsageDescription"]],
    [/^(react-native-health|@kingstinct\/react-native-healthkit)$/, ["NSHealthShareUsageDescription"]],
    [/^react-native-nfc-manager$/, ["NFCReaderUsageDescription"]],
  ];
  const missingPurpose = [];
  for (const d of Object.keys(deps)) {
    for (const [re, keys] of IOS_PURPOSE) if (re.test(d)) for (const k of keys) if (!plist[k]) missingPurpose.push(`${d} → ${k}`);
  }
  const usage = usageDescriptions(plist);
  const generic = usage.filter((u) => u.generic).map((u) => `${u.key}: "${u.value}"`);
  if (missingPurpose.length) add("CFG-02", "ios", isExpoConfig("ios") && !modResults ? "warn" : "fail", "blocker", "Missing iOS purpose strings (upload rejected with ITMS-90683 / crash on access)", missingPurpose.concat(generic.map((g) => `generic: ${g}`)), "Add a specific purpose string per key (via the library's config plugin option or ios.infoPlist).");
  else if (generic.length) add("CFG-02", "ios", "warn", "medium", "Generic purpose strings — App Review rejects strings that don't explain the specific use (5.1.1)", generic, "Replace with a sentence naming the feature and benefit, e.g. via the plugin's permission option; disable the permission in the plugin if the feature isn't used.");
  else add("CFG-02", "ios", isExpoConfig("ios") && !modResults ? "verify" : "pass", "high", "iOS purpose strings present for detected libraries", usage.map((u) => u.key));

  // CFG-03 — privacy manifest
  const iosLibsWithoutManifest = libs.filter((l) => l.ios && !l.iosPrivacyManifest).map((l) => l.name);
  if (nativeTruth.ios) {
    if (!ios.privacyManifestFiles?.length) add("CFG-03", "ios", "fail", "high", "No PrivacyInfo.xcprivacy in the iOS project", iosLibsWithoutManifest.slice(0, 10).map((n) => `no manifest in ${n}`), "Add PrivacyInfo.xcprivacy declaring required-reason APIs (UserDefaults, file timestamps, boot time, disk space) the app and SDKs use.");
    else add("CFG-03", "ios", "verify", "high", "Privacy manifest present — confirm required-reason APIs and tracking domains are complete", ios.privacyManifestFiles.concat(iosLibsWithoutManifest.slice(0, 10).map((n) => `no manifest in ${n}`)), "After upload, check App Store Connect email for ITMS-91053/91061.");
  } else if (expo) {
    add("CFG-03", "ios", ios.privacyManifests ? "verify" : "warn", ios.privacyManifests ? "high" : "medium", ios.privacyManifests ? "ios.privacyManifests set — confirm it covers app + SDK required-reason APIs" : "No ios.privacyManifests in app config (React Native ≥0.76 aggregates pod manifests at build, but app-level and manifest-less SDK usage must still be declared)", iosLibsWithoutManifest.slice(0, 12).map((n) => `iOS native lib without PrivacyInfo.xcprivacy: ${n}`), "Declare NSPrivacyAccessedAPITypes in ios.privacyManifests; after the first upload, fix anything App Store Connect reports as ITMS-91053/91061.");
  }

  // CFG-04 — Android permissions
  const restricted = permissions.filter((p) => p.class === "restricted" || p.class === "declaration" || p.class === "special");
  const legacyStorage = permissions.filter((p) => /EXTERNAL_STORAGE$/.test(p.name) && !p.maxSdk);
  const adId = permissions.find((p) => p.name.endsWith(".AD_ID"));
  const ev = permissions.map((p) => `${p.name.replace("android.permission.", "")} [${p.class}${p.maxSdk ? `, maxSdk ${p.maxSdk}` : ""}] ← ${p.sources.slice(0, 3).join(", ")}`);
  if (restricted.length || legacyStorage.length) add("CFG-04", "android", "warn", restricted.some((p) => p.class === "restricted") ? "high" : "medium", `Permissions needing a Play declaration or removal: ${restricted.map((p) => p.name.split(".").pop()).concat(legacyStorage.map((p) => `${p.name.split(".").pop()} (no maxSdk)`)).join(", ")}`, ev, `Remove unused ones with ${isExpoConfig("android") ? "android.blockedPermissions" : 'tools:node="remove"'}; declare the rest in Play Console → App content.${adId && !groups.ads.direct.length && !groups.analytics.direct.length ? " AD_ID present without ads/analytics SDKs — block it." : ""}`);
  else add("CFG-04", "android", permissions.length ? "verify" : "na", "medium", `${permissions.length} permissions (approximate merge) — confirm against the release manifest`, ev, "Final list: `bundletool dump manifest --bundle app.aab` or Play Console → App bundle explorer.");

  // CFG-06 — iPad
  add("CFG-06", "ios", "verify", "medium", ios.supportsTablet ? "iPad supported — needs iPad layouts and 13-inch iPad screenshots" : "iPhone-only — still runs on iPad in compatibility mode; App Review may test on iPad", [`supportsTablet: ${ios.supportsTablet}`], null);

  // CFG-07 — large screens
  if (android.screenOrientation && /portrait|landscape/i.test(android.screenOrientation) && (android.targetSdk ?? 0) >= 36) add("CFG-07", "android", "warn", "medium", `Orientation locked (${android.screenOrientation}) but targetSdk ≥ 36: Android 16 ignores orientation/resizability locks on displays ≥ 600dp`, [], "Test tablets/foldables in landscape and multi-window; make layouts adapt.");

  // CFG-08 — network security
  const ats = ios.userInfoPlist?.NSAppTransportSecurity;
  const insecure = hits("insecureHttp");
  if (android.cleartextTraffic === true) add("CFG-08", "android", "fail", "high", "Cleartext HTTP enabled for release", [], "Disable usesCleartextTraffic for release; use HTTPS (or a network security config scoped to dev hosts).");
  if (ats?.NSAllowsArbitraryLoads === true) add("CFG-08", "ios", "warn", "high", "ATS disabled (NSAllowsArbitraryLoads) — App Review asks for justification", [], "Remove it or scope exceptions per domain.");
  if (insecure.length) add("CFG-08", "both", "warn", "medium", "Plain-http URLs in app code", insecure.map(fmt), "Use HTTPS.");
  if (android.cleartextTraffic !== true && ats?.NSAllowsArbitraryLoads !== true && !insecure.length) add("CFG-08", "both", "pass", null, "No cleartext/ATS overrides or non-local http URLs found");

  // CFG-09 — push
  if (groups.push.direct.length) {
    const ev9 = [`libs: ${groups.push.direct.join(", ")}`];
    const notif = pluginOptions("expo-notifications");
    const channelHits = hits("notificationChannel");
    if (expo && !nativeTruth.android) ev9.push(`android.googleServicesFile: ${android.googleServicesFile ?? "unset (locally)"}`);
    ev9.push(`iOS aps-environment entitlement: ${ios.entitlements?.["aps-environment"] ?? "absent"}`);
    ev9.push(channelHits.length ? `channels: ${channelHits.slice(0, 2).map(fmt).join(" | ")}` : "no setNotificationChannelAsync/createChannel call found");
    if (notif && !notif.icon && !expo?.notification?.icon) ev9.push("no Android notification icon (status bar shows a white square)");
    add("CFG-09", "both", "verify", "high", "Push: confirm FCM config per build env, APNs key/capability on iOS, purpose-specific Android channels and a monochrome notification icon", ev9, null);
  }

  // CFG-10 — deep links
  if (ios.associatedDomains?.length || android.intentFilters?.some((f) => f.autoVerify)) add("CFG-10", "both", "verify", "low", "Universal/App Links configured — host apple-app-site-association and assetlinks.json (with Play signing SHA-256)", ios.associatedDomains ?? [], null);

  // CFG-12 — appearance
  if (expo?.userInterfaceStyle && expo.userInterfaceStyle !== "automatic") add("CFG-12", "both", "warn", "low", `Appearance locked to ${expo.userInterfaceStyle} — acceptable for review; Android core quality and HIG expect both themes`, [], null);

  // ACC-01 — account deletion
  const signUp = hits("accountCreation");
  const deletion = hits("accountDeletion");
  if (signUp.length && !deletion.length) add("ACC-01", "both", "fail", "blocker", "Account creation exists but no in-app account deletion found (Apple 5.1.1(v); Play account-deletion policy also needs a web deletion URL)", signUp.slice(0, 5).map(fmt), "Add Settings → Delete account (deletes the account and its data server-side, re-auth if needed, revokes Sign in with Apple tokens) and publish a web deletion page for the Play Data safety form.");
  else if (signUp.length) add("ACC-01", "both", "verify", "blocker", "Account deletion signals found — confirm the flow deletes server-side data and a web deletion URL exists", deletion.slice(0, 5).map(fmt), null);

  // ACC-02 — login alternatives
  const social = [...groups.socialLogin.direct, ...groups.oauth.direct];
  const socialFiles = [...new Set(hits("socialLoginUse").map((h) => h.file))].map((f) => `${f} — ${/Platform\.(OS|select)/.test(readText(path.join(ROOT, f)) ?? "") ? "has a Platform check (confirm it hides the button on iOS)" : "no Platform check"}`);
  if (social.length && !groups.appleLogin.direct.length) add("ACC-02", "ios", "warn", "blocker", `Third-party login (${social.join(", ")}) without Sign in with Apple — required on iOS by 4.8 unless the third-party button is not offered on iOS`, socialFiles, "Either add Sign in with Apple on iOS (expo-apple-authentication + backend verification + token revocation on deletion) or hide the third-party login on iOS.");
  else if (social.length) add("ACC-02", "ios", "verify", "high", "Sign in with Apple present alongside third-party login — confirm it's offered wherever the others are", [], null);

  // ACC-05 — token storage
  const tokenInAsync = hits("asyncStorageSecret");
  if (tokenInAsync.length) add("ACC-05", "both", "fail", "high", "Tokens/secrets written to AsyncStorage (unencrypted)", tokenInAsync.map(fmt), "Use expo-secure-store / react-native-keychain.");
  else if (groups.secureStorage.direct.length) add("ACC-05", "both", "pass", null, `Secure storage library present (${groups.secureStorage.direct.join(", ")})`);

  // PRV-01 — privacy policy
  const privacy = hits("privacyPolicy");
  if (!privacy.length) add("PRV-01", "both", "fail", "blocker", "No privacy-policy link found in the app (required in-app by Apple 5.1.1(i) and Play User Data policy, plus URLs in both consoles)", [], "Add a Privacy policy link (Settings/About and sign-up) to a public, non-PDF URL; enter the same URL in App Store Connect and Play Console.");
  else add("PRV-01", "both", "verify", "blocker", "Privacy-policy link found — confirm it opens a live public page that matches actual data use", privacy.slice(0, 5).map(fmt), null);

  // PRV-04 — third-party AI
  const ai = hits("aiUsage");
  if (groups.ai.direct.length || ai.length) add("PRV-04", "both", "warn", "high", "App sends content to an AI service — Apple 5.1.2(i) needs disclosure + explicit permission before personal data reaches third-party AI; Play User Data policy covers AI integrations", groups.ai.direct.map((d) => `dependency ${d}`).concat(ai.slice(0, 8).map(fmt)), "Trace what user data reaches the model (directly or via your backend); add an in-context consent screen before first use, and declare it in the privacy policy, App Privacy and Data safety.");

  // PRV-05 — tracking / ads
  if (groups.ads.direct.length && !groups.att.direct.length) add("PRV-05", "ios", "fail", "high", "Ads SDK without App Tracking Transparency", groups.ads.direct, "Add expo-tracking-transparency and request ATT before any tracking; respect denial.");
  else if (groups.ads.direct.length || groups.analytics.direct.length) add("PRV-05", "both", "verify", "high", "Ads/analytics SDKs present — confirm ATT (iOS), Advertising ID declaration (Play) and consent before collection", groups.ads.direct.concat(groups.analytics.direct), null);

  // PRV-07 — secrets
  const secretHits = hits("secret");
  const secretEnv = source.publicEnvNames.filter((n) => /SECRET|PRIVATE|PASSWORD|SERVICE_ROLE|ADMIN|_KEY_ID$/i.test(n));
  if (secretHits.length || secretEnv.length || trackedSensitive.some((t) => t.severity === "blocker")) add("PRV-07", "both", "fail", "blocker", "Secrets in the app bundle or repository", secretHits.map(fmt).concat(secretEnv.map((n) => `public env var ${n}`), trackedSensitive.filter((t) => t.severity === "blocker").map((t) => `tracked ${t.file} (${t.what})`)), "Move secrets server-side, rotate any that were committed, and purge them from git history.");
  else if (trackedSensitive.length) add("PRV-07", "both", "warn", "medium", "Sensitive config files tracked in git", trackedSensitive.map((t) => `${t.file} (${t.what})`), "Provision per environment (EAS file secrets) instead of committing.");
  else add("PRV-07", "both", "pass", null, "No secret patterns, secret-like public env vars or sensitive tracked files found");

  // PAY — purchases
  if (groups.iap.direct.length) {
    const restore = hits("restorePurchases");
    add("PAY-02", "ios", restore.length ? "verify" : "warn", "high", restore.length ? "Restore purchases found — confirm it's reachable from the paywall/settings" : "In-app purchase library without a restore-purchases call", restore.slice(0, 3).map(fmt), "Add a visible Restore Purchases action (required for non-consumables and subscriptions).");
    add("PAY-03", "both", "verify", "high", "Paywall disclosures: price, period, auto-renew terms, Terms (EULA) + Privacy links, cancel instructions", groups.iap.direct, null);
  }
  if (groups.externalPay.direct.length || hits("externalPayment").length) add("PAY-01", "both", "verify", "blocker", "External payment SDK/links — allowed only for physical goods/services; digital goods need IAP / Play Billing", groups.externalPay.direct.concat(hits("externalPayment").slice(0, 4).map(fmt)), null);

  // LGL-01 — copyleft
  const copyleft = libs.filter((l) => l.copyleft).map((l) => `${l.name}@${l.version}: ${l.license}`);
  const embedded = libs.flatMap((l) => l.embeddedLicenses.filter((e) => e.kind !== "LGPL").map((e) => `${l.name}: ${e.file} (${e.kind})`));
  const lgpl = libs.flatMap((l) => l.embeddedLicenses.filter((e) => e.kind === "LGPL").map((e) => `${l.name}: ${e.file}`));
  if (copyleft.length || embedded.length) {
    add("LGL-01", "ios", "fail", "blocker", "GPL/AGPL-licensed code ships in the iOS binary — App Store terms are widely held incompatible with the GPL", copyleft.concat(embedded), "Legal decision before TestFlight external/App Store: replace the component, get a non-GPL license from all copyright holders, or move it server-side.");
    add("LGL-01", "android", "fail", "high", "GPL/AGPL-licensed code ships in the Android binary — GPL obligations apply to every build given to people outside the company", copyleft.concat(embedded), "Before closed testing: comply (publish the complete corresponding source of the app under the GPL, keep notices) or replace the component; get a legal sign-off either way.");
  }
  if (lgpl.length) add("LGL-01", "both", "warn", "medium", "LGPL code in the binary — static linking on iOS triggers relinking obligations", lgpl, null);

  // LGL-02 — OSS notices
  if (!hits("licenseNotices").length) add("LGL-02", "both", "warn", "low", "No open-source licenses / acknowledgements screen found (MIT/BSD/Apache/OFL require attribution)", [], "Add a Licenses screen (e.g. generated with license-checker) under Settings → About.");

  // AST-01 — icons and splash
  const iconAssets = assets.filter((a) => /icon/i.test(a.role) && !/notification|monochrome/i.test(a.role));
  const missing = iconAssets.filter((a) => a.path && !a.exists).map((a) => `${a.role}: ${a.path}`);
  const notSquare = iconAssets.filter((a) => a.width && (a.width !== a.height || a.width < 1024)).map((a) => `${a.role}: ${a.width}x${a.height}`);
  const marketingAlpha = assets.filter((a) => /marketingIcon/.test(a.role) && a.alphaChannel).map((a) => a.path);
  const iosTransparent = assets.filter((a) => /^ios\.icon/.test(a.role) && a.transparentPixels > 0).map((a) => `${a.role}: ${a.transparentPixels} transparent px`);
  const opaqueForeground = assets.filter((a) => /foregroundImage/.test(a.role) && a.transparentPixels === 0).map((a) => a.path);
  if (missing.length || marketingAlpha.length) add("AST-01", "both", "fail", "blocker", "App icon missing or invalid", missing.concat(marketingAlpha.map((p) => `${p} has an alpha channel (ITMS-90717)`)), "Provide 1024x1024 icons; the iOS marketing icon must have no alpha channel.");
  else if (notSquare.length || iosTransparent.length) add("AST-01", "both", "warn", "medium", "Icon size/transparency issues", notSquare.concat(iosTransparent.map((t) => `${t} — Expo flattens them onto white for iOS`)), "Use square 1024x1024 sources; give the iOS icon its own opaque background.");
  else if (iconAssets.length) add("AST-01", "both", "pass", null, "Icons present, square, 1024 px", iconAssets.map((a) => `${a.role}: ${a.path}`));
  if (opaqueForeground.length) add("AST-01", "android", "warn", "low", "Adaptive-icon foreground is fully opaque — launchers mask it to the centre ~66%, so edges get cropped and backgroundColor is unused", opaqueForeground, "Use a transparent foreground with the logo inside the safe zone.");
  if (expo && !expo.android?.adaptiveIcon?.monochromeImage) add("AST-01", "android", "warn", "low", "No monochrome adaptive icon (Android 13+ themed icons fall back to the full-colour icon)", [], "Add android.adaptiveIcon.monochromeImage.");

  // QLT-01 — dev routes / placeholder content
  const devRoutes = source.devRoutes;
  const ungated = devRoutes.filter((r) => !r.gated);
  if (ungated.length) add("QLT-01", "both", "fail", "high", "Dev/demo screens reachable in release builds", ungated.map((r) => r.file), "Gate with __DEV__ (redirect) or exclude from release; reviewers treat hidden or test screens as incomplete (2.1/2.3.1).");
  else if (devRoutes.length) add("QLT-01", "both", "warn", "low", "Dev/demo routes exist but are gated by __DEV__ — consider removing them from store builds", devRoutes.map((r) => r.file), null);
  const placeholder = hits("placeholder");
  if (placeholder.length) add("QLT-01", "both", "warn", "medium", "Placeholder text in app code", placeholder.map(fmt), "Remove before external testing (2.1 completeness).");

  // QLT-03 — crash reporting
  if (!groups.crash.direct.length) add("QLT-03", "both", "warn", "high", "No crash-reporting SDK — external testers' crashes will go unseen", [], "Add Sentry/Crashlytics/Bugsnag (declare it in App Privacy / Data safety) before external testing.");
  else add("QLT-03", "both", "pass", null, `Crash reporting: ${groups.crash.direct.join(", ")}`);

  // QLT-06 — logging
  if (source.consoleLogCount > 0) add("QLT-06", "both", "warn", "low", `${source.consoleLogCount} console.log/info/debug calls in app code`, hits("consoleLog").slice(0, 5).map(fmt), "Strip in production (babel-plugin-transform-remove-console) and never log tokens or personal data.");

  // OPS-01 — OTA updates
  const usesEasUpdate = easScripts.some((s) => /eas(-cli[^\s]*)?\s+update/.test(s)) || buildProfiles.some((p) => p.channel);
  if (groups.ota.direct.some((d) => /code-push/.test(d))) add("OPS-01", "both", "fail", "high", "CodePush via App Center — App Center was retired on 2025-03-31", groups.ota.direct, "Migrate to EAS Update or another maintained OTA service.");
  else if (usesEasUpdate && !has("expo-updates")) add("OPS-01", "both", "fail", "medium", "EAS Update channels/scripts configured but expo-updates is not installed — builds never receive OTA updates and channel rollbacks do nothing", buildProfiles.filter((p) => p.channel).map((p) => `profile ${p.name} channel=${p.channel}`).concat(easScripts), "Run `npx expo install expo-updates` + `eas update:configure` (runtimeVersion policy) before the next store build, or drop the OTA scripts/rollback docs.");
  else if (has("expo-updates") && !expo?.runtimeVersion) add("OPS-01", "both", "warn", "medium", "expo-updates without a runtimeVersion policy", [], 'Set runtimeVersion (e.g. { "policy": "fingerprint" }) so updates only reach compatible binaries.');
  else if (has("expo-updates")) add("OPS-01", "both", "verify", "medium", "OTA updates wired — keep them to fixes within the reviewed feature set (App Review 2.5.2 / Play device-abuse policy)", [`runtimeVersion: ${JSON.stringify(expo?.runtimeVersion)}`], null);

  // OPS-03 — submit automation
  if (easJson && !submitProfiles.length) add("OPS-03", "both", "warn", "low", "No eas submit profile", [], "Add submit.production (ios.ascAppId; android.serviceAccountKeyPath kept out of git, track: internal).");
  for (const s of submitProfiles) {
    const keyPath = s.android?.serviceAccountKeyPath;
    if (keyPath && tracked.includes(path.normalize(keyPath).replace(/^\.\//, ""))) add("PRV-07", "android", "fail", "blocker", `Play service-account key ${keyPath} is committed`, [], "Rotate the key, remove it from git history, store it as an EAS secret file.");
  }
}

// ================================================================= scanners

function scanAndroidNative() {
  const read = (...p) => readText(path.join(ROOT, "android", ...p));
  const appGradle = read("app", "build.gradle") ?? read("app", "build.gradle.kts") ?? "";
  const rootGradle = read("build.gradle") ?? read("build.gradle.kts") ?? "";
  const props = read("gradle.properties") ?? "";
  const manifest = read("app", "src", "main", "AndroidManifest.xml") ?? "";
  // SDK levels have 2+ digits; that skips `rootProject.ext.x` lines without matching unrelated digits.
  const num = (src, key, digits = "\\d{2,}") => {
    const m = src.match(new RegExp(`${key}[^\\n]*?(${digits})`));
    return m ? Number(m[1]) : null;
  };
  const str = (src, key) => src.match(new RegExp(`${key}\\s*=?\\s*["']([^"']+)["']`))?.[1] ?? null;
  const release = extractBlock(extractBlock(appGradle, /buildTypes\s*\{/) ?? "", /release\s*\{/) ?? "";
  return {
    applicationId: str(appGradle, "applicationId"),
    namespace: str(appGradle, "namespace"),
    versionCode: num(appGradle, "versionCode\\s*=?\\s*", "\\d+"),
    versionName: str(appGradle, "versionName"),
    targetSdk: num(appGradle, "targetSdk(?:Version)?\\s*[= (]") ?? num(rootGradle, "targetSdk(?:Version)?") ?? num(props, "targetSdk") ?? rnDefaults.targetSdk,
    compileSdk: num(appGradle, "compileSdk(?:Version)?\\s*[= (]") ?? num(rootGradle, "compileSdk(?:Version)?") ?? rnDefaults.compileSdk,
    minSdk: num(appGradle, "minSdk(?:Version)?\\s*[= (]") ?? num(rootGradle, "minSdk(?:Version)?") ?? rnDefaults.minSdk,
    ndkVersion: str(rootGradle, "ndkVersion") ?? str(appGradle, "ndkVersion") ?? rnDefaults.ndkVersion,
    releaseUsesDebugSigning: /signingConfig\s*=?\s*signingConfigs\.(?:getByName\(\s*["'])?debug/.test(release),
    minifyRelease: /minifyEnabled\s*=?\s*true|isMinifyEnabled\s*=\s*true|enableProguardInReleaseBuilds\s*=\s*true/.test(appGradle + release),
    architectures: props.match(/^reactNativeArchitectures\s*=\s*(.+)$/m)?.[1]?.split(",").map((s) => s.trim()) ?? null,
    manifestPermissions: parseManifestPermissions(manifest),
    usesCleartextTraffic: /android:usesCleartextTraffic\s*=\s*"true"/.test(manifest) ? true : null,
    screenOrientation: manifest.match(/android:screenOrientation\s*=\s*"([^"]+)"/)?.[1] ?? null,
    googleServicesJson: exists(path.join(ROOT, "android", "app", "google-services.json")),
  };
}

function scanIosNative() {
  const iosRoot = path.join(ROOT, "ios");
  const files = walkFiles(iosRoot, { skipDirs: new Set(["Pods", "build", "DerivedData", ".xcode.env", "vendor"]), maxDepth: 4 });
  const pbx = files.filter((f) => f.endsWith(".pbxproj")).map((f) => readText(f) ?? "").join("\n");
  const settings = (key) => [...new Set([...pbx.matchAll(new RegExp(`\\b${key} = ([^;]+);`, "g"))].map((m) => m[1].replace(/"/g, "").trim()))];
  const plists = files.filter((f) => path.basename(f) === "Info.plist" && !/Tests?\b|UITests|Extension/i.test(f));
  const mainPlist = plists.sort((a, b) => a.length - b.length)[0];
  const iconSet = files.find((f) => f.endsWith(path.join("AppIcon.appiconset", "Contents.json")));
  let marketingIcon = null;
  if (iconSet) {
    const contents = readJson(iconSet);
    const img = (contents?.images ?? []).find((i) => i.filename && (i.idiom === "ios-marketing" || i.size === "1024x1024"));
    if (img) marketingIcon = path.join(path.dirname(iconSet), img.filename);
  }
  return {
    bundleIds: settings("PRODUCT_BUNDLE_IDENTIFIER"),
    marketingVersions: settings("MARKETING_VERSION"),
    buildNumbers: settings("CURRENT_PROJECT_VERSION"),
    deploymentTargets: settings("IPHONEOS_DEPLOYMENT_TARGET"),
    deviceFamilies: settings("TARGETED_DEVICE_FAMILY"),
    teams: settings("DEVELOPMENT_TEAM"),
    infoPlistFile: mainPlist ? rel(mainPlist) : null,
    infoPlist: mainPlist ? parsePlist(readText(mainPlist)) : null,
    privacyManifests: files.filter((f) => f.endsWith("PrivacyInfo.xcprivacy")).map(rel),
    entitlements: files.filter((f) => f.endsWith(".entitlements")).map((f) => ({ file: rel(f), values: parsePlist(readText(f)) ?? {} })),
    marketingIcon: marketingIcon ? rel(marketingIcon) : null,
  };
}

function readRnGradleDefaults() {
  const toml = readText(path.join(NM, "react-native", "gradle", "libs.versions.toml")) ?? "";
  const val = (k) => toml.match(new RegExp(`^${k}\\s*=\\s*"([^"]+)"`, "m"))?.[1] ?? null;
  return { targetSdk: numberOr(val("targetSdk")), compileSdk: numberOr(val("compileSdk")), minSdk: numberOr(val("minSdk")), ndkVersion: val("ndkVersion") };
}

function resolveProfile(all, name, seen = new Set()) {
  const p = all?.[name];
  if (!p || seen.has(name)) return p ?? {};
  seen.add(name);
  return deepMerge(p.extends ? resolveProfile(all, p.extends, seen) : {}, p);
}

function summarizeProfile(name, p) {
  const isStore = (p.distribution ?? "store") !== "internal" && !p.developmentClient && !p.ios?.simulator;
  return {
    name,
    distribution: p.distribution ?? "store",
    developmentClient: Boolean(p.developmentClient),
    isStore,
    channel: p.channel ?? null,
    environment: p.environment ?? null,
    envKeys: Object.keys(p.env ?? {}),
    credentialsSource: p.credentialsSource ?? null,
    android: { buildType: p.android?.buildType ?? (isStore ? "app-bundle" : "apk"), autoIncrement: p.android?.autoIncrement ?? p.autoIncrement ?? false, image: p.android?.image ?? null },
    ios: { simulator: Boolean(p.ios?.simulator), autoIncrement: p.ios?.autoIncrement ?? p.autoIncrement ?? false, image: p.ios?.image ?? null },
  };
}

function runtimeClosure() {
  const seen = new Map();
  const queue = Object.keys(deps);
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    const dir = path.join(NM, name);
    const pj = readJson(path.join(dir, "package.json"));
    if (!pj || pj.__parseError) {
      seen.set(name, null);
      continue;
    }
    seen.set(name, { dir, pj });
    for (const d of Object.keys({ ...pj.dependencies, ...pj.optionalDependencies })) if (!seen.has(d)) queue.push(d);
  }
  return seen;
}

function scanLibrary(name, { dir, pj }) {
  const license = normalizeLicense(pj);
  const lib = {
    name,
    version: pj.version,
    license,
    copyleft: Boolean(license && /\b(A?GPL|SSPL|CC-BY-NC)/i.test(license) && !/\bLGPL/i.test(license) && !/\bOR\b.*\b(MIT|Apache|BSD|ISC)/i.test(license)),
    android: isDir(path.join(dir, "android")),
    ios: isDir(path.join(dir, "ios")) || fs.readdirSync(dir).some((f) => f.endsWith(".podspec")),
    androidPermissions: [],
    sourceNative: false,
    flexiblePageFlag: false,
    prebuiltLibs: [],
    iosPrivacyManifest: false,
    embeddedLicenses: [],
    nativeAssetBytes: 0,
  };
  if (lib.android) {
    const manifest = readText(path.join(dir, "android", "src", "main", "AndroidManifest.xml"));
    if (manifest) lib.androidPermissions = parseManifestPermissions(manifest);
    const gradle = (readText(path.join(dir, "android", "build.gradle")) ?? "") + (readText(path.join(dir, "android", "build.gradle.kts")) ?? "");
    const androidFiles = walkFiles(path.join(dir, "android"), { skipDirs: new Set(["build", ".cxx", ".gradle", "generated"]), maxDepth: 8 });
    const cmakeFiles = androidFiles.filter((f) => /CMakeLists\.txt$|\.cmake$|Android\.mk$|Application\.mk$/.test(f));
    // Only a library's OWN externalNativeBuild misses the 16 KB cmake flag React Native's Gradle
    // plugin gives the app; C++ TurboModule sources compiled inside the app's appmodules build get it.
    lib.sourceNative = /externalNativeBuild/.test(gradle);
    const flagText = gradle + cmakeFiles.map((f) => readText(f) ?? "").join("\n");
    const libNdk = Number.parseInt(gradle.match(/ndkVersion\s*[= ]\s*["'](\d+)/)?.[1] ?? "", 10);
    lib.flexiblePageFlag = /ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES\s*=?\s*ON|max-page-size[=,]\s*16384|APP_SUPPORT_FLEXIBLE_PAGE_SIZES/.test(flagText) || libNdk >= 28;
    for (const f of androidFiles) {
      try {
        if (f.endsWith(".so")) {
          const elf = elfLoadAlignment(readFileHead(f));
          const abi = abiOf(f.split(path.sep).join("/"));
          if (elf && needs16k(abi)) lib.prebuiltLibs.push({ path: path.relative(dir, f), abi, minAlign: elf.minAlign, status: elf.minAlign >= PAGE_16K ? "ALIGNED" : "UNALIGNED" });
        } else if (f.endsWith(".aar")) {
          for (const r of checkZipNativeLibs(f)) if (needs16k(r.abi) && r.elf) lib.prebuiltLibs.push({ path: `${path.relative(dir, f)}!${r.path}`, abi: r.abi, minAlign: r.minAlign, status: r.minAlign >= PAGE_16K ? "ALIGNED" : "UNALIGNED" });
        }
      } catch {
        // unreadable prebuilt: reported nowhere; the artifact check is the final word
      }
    }
  }
  if (lib.ios || lib.android) {
    const files = walkFiles(dir, { skipDirs: new Set(["node_modules", "build", ".cxx", ".gradle", "example", "examples", "__tests__", "docs"]), maxDepth: 6 });
    lib.iosPrivacyManifest = files.some((f) => f.endsWith("PrivacyInfo.xcprivacy"));
    for (const f of files) {
      const base = path.basename(f);
      if (/^(copying|licen[cs]e|copyright|notice)([._-].*)?$/i.test(base)) {
        const text = readText(f)?.slice(0, 4096) ?? "";
        const kind = /GNU AFFERO GENERAL PUBLIC LICENSE/i.test(text) ? "AGPL" : /GNU LESSER GENERAL PUBLIC LICENSE|GNU LIBRARY GENERAL PUBLIC/i.test(text) ? "LGPL" : /GNU GENERAL PUBLIC LICENSE/i.test(text) ? "GPL" : null;
        if (kind) lib.embeddedLicenses.push({ file: path.relative(dir, f), kind });
      }
      if (/\.(nnue|tflite|onnx|bin|model|mlmodel|pt)$/i.test(base)) {
        try {
          lib.nativeAssetBytes += fs.statSync(f).size;
        } catch {
          // ignore
        }
      }
    }
  }
  return lib;
}

function scanAssets() {
  const list = [];
  const addAsset = (role, rawPath, expect) => {
    if (!rawPath || typeof rawPath !== "string") return;
    const file = path.resolve(ROOT, rawPath);
    const entry = { role, path: rel(file), exists: exists(file), expect };
    if (entry.exists && /\.png$/i.test(file)) {
      try {
        Object.assign(entry, pngInfo(file));
      } catch (error) {
        entry.error = error.message;
      }
    }
    list.push(entry);
  };
  if (expo) {
    const iosIcon = expo.ios?.icon ?? expo.icon;
    if (iosIcon && typeof iosIcon === "object") for (const [k, v] of Object.entries(iosIcon)) addAsset(`ios.icon.${k}`, v, "1024x1024 PNG");
    else if (typeof iosIcon === "string" && iosIcon.endsWith(".icon")) list.push({ role: "ios.icon", path: iosIcon, exists: exists(path.resolve(ROOT, iosIcon)), expect: "Icon Composer .icon" });
    else addAsset("ios.icon", iosIcon, "1024x1024 PNG, no transparency (Expo flattens light icons onto white)");
    addAsset("android.icon", expo.android?.icon ?? expo.icon, "1024x1024 PNG");
    const ai = expo.android?.adaptiveIcon ?? {};
    addAsset("android.adaptiveIcon.foregroundImage", ai.foregroundImage, "1024x1024 PNG, transparent background, logo inside the 66% safe zone");
    addAsset("android.adaptiveIcon.backgroundImage", ai.backgroundImage, "1024x1024 PNG");
    addAsset("android.adaptiveIcon.monochromeImage", ai.monochromeImage, "1024x1024 single-color PNG (Android 13 themed icons)");
    if (!ai.monochromeImage) list.push({ role: "android.adaptiveIcon.monochromeImage", path: null, exists: false, expect: "optional: themed icon on Android 13+" });
    const splash = pluginOptions("expo-splash-screen");
    addAsset("splash", splash?.image ?? expo.splash?.image, "PNG");
    const notif = pluginOptions("expo-notifications");
    if (notif || has("expo-notifications")) addAsset("android.notificationIcon", notif?.icon ?? expo.notification?.icon, "96x96 white-on-transparent PNG");
    if (has("expo-notifications") && !notif?.icon && !expo.notification?.icon) list.push({ role: "android.notificationIcon", path: null, exists: false, expect: "96x96 white-on-transparent PNG — missing" });
  }
  if (iosNative?.marketingIcon) addAsset("ios.marketingIcon (asset catalog)", iosNative.marketingIcon, "1024x1024 PNG, NO alpha channel (ITMS-90717)");
  return list;
}

function scanSource() {
  const SIGNALS = {
    accountCreation: /\b(sign[-_ ]?up|registerUser|registerAccount|createAccount|create[-_ ]account|create an account)\b/i,
    accountDeletion: /delete\s*(my\s*|your\s*|the\s*)?account|deleteAccount|delete[-_]account|account\s*deletion|close\s*(my\s*|your\s*)?account|deactivateAccount/i,
    privacyPolicy: /privacy[-\s_]?policy|\/privacy\b|privacyUrl|PRIVACY_(POLICY_)?URL/i,
    termsLink: /terms\s+of\s+(service|use)|\/terms\b|termsUrl|TERMS_URL|\beula\b/i,
    licenseNotices: /open[-\s]?source\s+licen[cs]es|acknowledg(e)?ments|third[-\s]party\s+(notices|licen[cs]es)|OssLicenses/i,
    socialLoginUse: /\bGoogleSignin\b|GoogleSigninButton|LoginManager\.logIn|react-native-fbsdk-next|providers\/(google|facebook)|signInWithGoogle/,
    restorePurchases: /restorePurchases|restoreCompletedTransactions|getAvailablePurchases|restoreTransactions/,
    externalPayment: /checkout\.stripe\.com|buy\.stripe\.com|paypal\.com\/checkout|initPaymentSheet|presentPaymentSheet/i,
    permissionRequest: /request\w*Permissions?Async\(|PermissionsAndroid\.request|requestPermission\(|\brequest\(\s*PERMISSIONS\.|requestTrackingPermissionsAsync|requestNotifications\(/,
    aiUsage: /\b(openai|anthropic|claude|gpt-[0-9o]|gemini|chat\/completions|\/v1\/messages|llm|generative)\b|\/api\/(ai|llm|chat|explain|explanations?|coach|assistant|completions?)\b|\bAI[-\s](explanation|coach|generated|wording|feedback)/i,
    notificationChannel: /setNotificationChannelAsync|createChannel\(/,
    localhostDefault: /['"`]https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+)(:\d+)?/,
    insecureHttp: /['"`]http:\/\/(?!localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.|0\.0\.0\.0|schemas\.android\.com|www\.w3\.org)[a-z0-9.-]+\.[a-z]{2,}/i,
    asyncStorageSecret: /AsyncStorage\.setItem\([^)]*(token|password|secret|session|jwt)/i,
    placeholder: /lorem ipsum|coming soon|placeholder text|TODO:? replace|dummy (data|text)/i,
    consoleLog: /\bconsole\.(log|debug|info)\(/,
    secret: /AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|sk_live_[0-9a-zA-Z]{20,}|"private_key"\s*:|xox[baprs]-[0-9A-Za-z-]{10,}|ghp_[0-9A-Za-z]{36}|sk-ant-[A-Za-z0-9_-]{20,}|sk-(proj-)?[A-Za-z0-9]{32,}/,
  };
  const SKIP = new Set(["node_modules", "ios", "android", ".git", ".expo", "dist", "build", "web-build", "coverage", ".next", ".turbo", ".yarn", "Pods", "vendor", "docs", ".claude", "__tests__", "__mocks__", "e2e", "fastlane", ".vscode", ".idea", "patches"]);
  const files = walkFiles(ROOT, { skipDirs: SKIP, maxDepth: 12 }).filter(
    (f) => /\.(m?[jt]sx?|cjs)$/.test(f) && !/\.(test|spec|stories)\.[jt]sx?$|\.d\.ts$/.test(f) && !/(^|\/)(babel|metro|eslint|jest|prettier|tailwind|webpack)\.config\./.test(rel(f)),
  );
  const signals = Object.fromEntries(Object.keys(SIGNALS).map((k) => [k, []]));
  const publicEnv = new Set();
  let consoleLogCount = 0;
  const skipped = [];
  for (const file of files) {
    let size = 0;
    try {
      size = fs.statSync(file).size;
    } catch {
      continue;
    }
    if (size > 600 * 1024) {
      skipped.push(rel(file));
      continue;
    }
    const lines = (readText(file) ?? "").split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/\bEXPO_PUBLIC_[A-Z0-9_]+/g)) publicEnv.add(m[0]);
      for (const [k, re] of Object.entries(SIGNALS)) {
        // `.claude/` paths in comments are tooling, not an AI integration.
        if (!re.test(k === "aiUsage" ? line.replace(/\.claude\//g, "") : line)) continue;
        if (k === "consoleLog") consoleLogCount++;
        if (signals[k].length < 25) signals[k].push({ file: rel(file), line: i + 1, text: line.trim().slice(0, 140) });
      }
    });
  }
  for (const f of [".env.example", ".env.sample", ".env.template"]) {
    for (const m of (readText(path.join(ROOT, f)) ?? "").matchAll(/^\s*(EXPO_PUBLIC_[A-Z0-9_]+)/gm)) publicEnv.add(m[1]);
  }
  // Expo Router: route files that look like dev/demo harnesses, and whether they redirect outside __DEV__.
  const devRoutes = [];
  const routerDir = has("expo-router") ? [path.join(ROOT, "src", "app"), path.join(ROOT, "app")].find(isDir) : null;
  if (routerDir) {
    for (const f of walkFiles(routerDir, { maxDepth: 10 })) {
      const base = path.basename(f);
      if (/^_layout\./.test(base) || !/\.[jt]sx?$/.test(base)) continue;
      if (/(demo|debug|playground|sandbox|storybook|kitchen[-_]?sink|dev[-_]|[-_]dev\.|test[-_]?screen)/i.test(rel(f))) {
        devRoutes.push({ file: rel(f), gated: /__DEV__/.test(readText(f) ?? "") });
      }
    }
  }
  return { filesScanned: files.length, skippedLargeFiles: skipped, routerDir: routerDir ? rel(routerDir) : null, devRoutes, publicEnvNames: [...publicEnv].sort(), consoleLogCount, signals };
}

// ================================================================= helpers

function usageDescriptions(plist) {
  return Object.entries(plist ?? {})
    .filter(([k]) => /UsageDescription$/.test(k))
    .map(([key, value]) => ({
      key,
      value,
      generic: typeof value !== "string" || value.trim().length < 20 || /^Allow \$\(PRODUCT_NAME\) to (access|use)/i.test(value) || /\b(TODO|lorem|test)\b/i.test(value),
    }));
}

function parseManifestPermissions(xml) {
  const out = [];
  for (const m of (xml ?? "").matchAll(/<uses-permission(?:-sdk-23)?\b([^>]*)>/g)) {
    const attrs = m[1];
    const name = attrs.match(/android:name\s*=\s*"([^"]+)"/)?.[1];
    if (!name) continue;
    out.push({ name, maxSdk: attrs.match(/android:maxSdkVersion\s*=\s*"(\d+)"/)?.[1] ?? null, remove: /tools:node\s*=\s*"remove"/.test(attrs) });
  }
  return out;
}

function parsePlist(xml) {
  if (!xml) return null;
  const tokens = [];
  const re = /<(\/)?(dict|array|key|string|integer|real|true|false|date|data)\s*(\/)?>/g;
  let m;
  let last = 0;
  while ((m = re.exec(xml))) {
    if (m.index > last) tokens.push({ text: xml.slice(last, m.index) });
    tokens.push({ close: Boolean(m[1]), tag: m[2], self: Boolean(m[3]) });
    last = re.lastIndex;
  }
  const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
  let i = tokens.findIndex((t) => t.tag === "dict" && !t.close);
  if (i < 0) return null;
  const skipText = () => {
    while (i < tokens.length && tokens[i].text !== undefined) i++;
  };
  const value = () => {
    skipText();
    const t = tokens[i++];
    if (!t) return undefined;
    if (t.tag === "true" || t.tag === "false") {
      if (!t.self) i++;
      return t.tag === "true";
    }
    if (t.tag === "dict") {
      const obj = {};
      if (t.self) return obj;
      for (;;) {
        skipText();
        const k = tokens[i];
        if (!k || (k.close && k.tag === "dict")) {
          i++;
          return obj;
        }
        i++; // <key>
        const key = tokens[i]?.text !== undefined ? decode(tokens[i++].text) : "";
        i++; // </key>
        obj[key] = value();
      }
    }
    if (t.tag === "array") {
      const arr = [];
      if (t.self) return arr;
      for (;;) {
        skipText();
        const n = tokens[i];
        if (!n || (n.close && n.tag === "array")) {
          i++;
          return arr;
        }
        arr.push(value());
      }
    }
    if (t.self) return t.tag === "string" ? "" : null;
    const text = tokens[i]?.text !== undefined ? decode(tokens[i++].text) : "";
    i++; // closing tag
    return t.tag === "integer" ? Number.parseInt(text, 10) : t.tag === "real" ? Number.parseFloat(text) : text;
  };
  return value();
}

/** PNG size, color type and, for 8-bit non-interlaced RGBA/GA images, how many pixels are not fully opaque. */
function pngInfo(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 33 || buf.readUInt32BE(0) !== 0x89504e47) return { format: "not-png" };
  let off = 8;
  let ihdr = null;
  let trns = false;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") ihdr = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), bitDepth: data[8], colorType: data[9], interlace: data[12] };
    else if (type === "tRNS") trns = true;
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  if (!ihdr) return { format: "png", error: "no IHDR" };
  const alphaChannel = ihdr.colorType === 4 || ihdr.colorType === 6 || trns;
  let transparentPixels = null;
  if ((ihdr.colorType === 6 || ihdr.colorType === 4) && ihdr.bitDepth === 8 && ihdr.interlace === 0) {
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const bpp = ihdr.colorType === 6 ? 4 : 2;
    const stride = ihdr.width * bpp;
    let prev = Buffer.alloc(stride);
    let cur = Buffer.alloc(stride);
    let p = 0;
    transparentPixels = 0;
    for (let y = 0; y < ihdr.height; y++) {
      const filter = raw[p++];
      for (let x = 0; x < stride; x++) {
        const v = raw[p++];
        const a = x >= bpp ? cur[x - bpp] : 0;
        const b = prev[x];
        const c = x >= bpp ? prev[x - bpp] : 0;
        let out;
        if (filter === 0) out = v;
        else if (filter === 1) out = v + a;
        else if (filter === 2) out = v + b;
        else if (filter === 3) out = v + ((a + b) >> 1);
        else {
          const pa = Math.abs(b - c);
          const pb = Math.abs(a - c);
          const pc = Math.abs(a + b - 2 * c);
          out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        }
        cur[x] = out & 0xff;
      }
      for (let x = bpp - 1; x < stride; x += bpp) if (cur[x] < 255) transparentPixels++;
      [prev, cur] = [cur, prev];
    }
  }
  return { format: "png", width: ihdr.width, height: ihdr.height, colorType: ihdr.colorType, bitDepth: ihdr.bitDepth, alphaChannel, transparentPixels };
}

function runExpoConfig(cli, type) {
  const r = spawnSync(process.execPath, [cli, "config", "--json", "--type", type], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 180000,
    maxBuffer: 64 << 20,
    env: { ...process.env, CI: "1", EXPO_NO_TELEMETRY: "1" },
  });
  if (r.status !== 0) return { error: (r.stderr || r.stdout || `exit ${r.status}`).trim().split("\n").slice(-3).join(" | ") };
  const start = r.stdout.indexOf("{");
  try {
    return { config: JSON.parse(r.stdout.slice(start)) };
  } catch {
    return { error: "unparseable JSON output" };
  }
}

function normalizeLicense(pj) {
  const l = pj.license ?? pj.licenses;
  if (!l) return null;
  if (typeof l === "string") return l;
  if (Array.isArray(l)) return l.map((x) => (typeof x === "string" ? x : x.type)).join(" OR ");
  return l.type ?? null;
}

function extractBlock(src, startRe) {
  const m = startRe.exec(src);
  if (!m) return null;
  let depth = 0;
  for (let i = m.index + m[0].length - 1; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(m.index + m[0].length, i);
  }
  return src.slice(m.index + m[0].length);
}

function walkFiles(dir, { skipDirs = new Set(), maxDepth = 8 } = {}, depth = 0, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!skipDirs.has(e.name) && !e.name.startsWith(".") && depth < maxDepth) walkFiles(full, { skipDirs, maxDepth }, depth + 1, out);
    } else if (e.isFile()) out.push(full);
  }
  return out;
}

function deepMerge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b ?? {})) {
    out[k] = v && typeof v === "object" && !Array.isArray(v) && a?.[k] && typeof a[k] === "object" ? deepMerge(a[k], v) : v;
  }
  return out;
}

function project0Docs() {
  return ["fastlane/Fastfile", "android/fastlane/Fastfile", "ios/fastlane/Fastfile"].filter((f) => exists(path.join(ROOT, f))).map((f) => `found ${f}`);
}

function numberOr(...values) {
  for (const v of values) {
    const n = Number.parseInt(v, 10);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function readText(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function readJson(p) {
  const t = readText(p);
  if (t == null) return null;
  try {
    return JSON.parse(t);
  } catch {
    return { __parseError: true };
  }
}

function readJsonLoose(p) {
  const t = readText(p);
  if (t == null) return null;
  try {
    return JSON.parse(t);
  } catch {
    try {
      return JSON.parse(t.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/,(\s*[}\]])/g, "$1"));
    } catch {
      notes.push(`${rel(p)} is not valid JSON`);
      return null;
    }
  }
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/") || ".";
}

function parseArgs(argv) {
  const out = { exec: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") out.root = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--no-exec") out.exec = false;
    else if (a === "-h" || a === "--help") {
      console.log("Usage: node scan.mjs [--root <project dir>] [--out <file.json>] [--no-exec]");
      process.exit(0);
    } else fatal(`Unknown argument: ${a}`);
  }
  return out;
}

function fatal(message) {
  console.error(message);
  process.exit(2);
}
