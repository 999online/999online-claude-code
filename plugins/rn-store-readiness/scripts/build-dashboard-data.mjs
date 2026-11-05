#!/usr/bin/env node
// Turns readiness.json (the evaluation, schema in references/readiness-schema.md) into the overview
// dashboard's data files and computes each stage's verdict with the verdict rules in skills/rn-store-evaluate/SKILL.md. No dependencies.
//
//   node build-dashboard-data.mjs <readiness.json> --out <dir>
//   node build-dashboard-data.mjs <readiness.json> --out <dir> --blobs run=/_blob/…,stages=/_blob/…,findings=/_blob/…,watch=/_blob/…,console=/_blob/…
//
// First form: writes run.json, stages.json, findings.json, watch.json and console.json (JSON arrays of
// rows) to <dir> and prints the stage table as Markdown for the written report.
// Second form (after uploading those five files to the dashboard): also writes the dashboard's store
// documents to <dir>/store/ and prints the `writes` array for one ArtifactData batch.
// Exit code 2 on invalid input.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATASETS = {
  run: ["Evaluation run", "Project, commit, evaluation date and declared scope from the rn-store-readiness run."],
  stages: ["Release stage verdicts", "One row per store stage: its verdict and the checks blocking it, computed from the checks by build-dashboard-data.mjs."],
  findings: ["Readiness checks", "Every check from the rn-store-readiness catalog with its status, severity, gate, evidence and fix: scanner output reviewed against the code."],
  watch: ["Watch-outs", "Dated store rules that affect the app, open decisions, and what the run couldn't check."],
  console: ["Store console tasks", "App Store Connect and Play Console work per stage, and whether the team confirmed it."],
};

const STAGES = [
  { stage: "I1", platform: "iOS", order: 1, name: "TestFlight internal" },
  { stage: "I2", platform: "iOS", order: 2, name: "TestFlight external" },
  { stage: "I3", platform: "iOS", order: 3, name: "App Store" },
  { stage: "A1", platform: "Android", order: 1, name: "Internal testing" },
  { stage: "A2", platform: "Android", order: 2, name: "Closed testing" },
  { stage: "A3", platform: "Android", order: 3, name: "Open testing" },
  { stage: "A4", platform: "Android", order: 4, name: "Production" },
];
const PLATFORMS = ["iOS", "Android", "Both"];
const STATUSES = ["FAIL", "LIKELY", "RISK", "VERIFY", "PASS", "N/A"];
const SEVERITIES = ["blocker", "high", "medium", "low"];
const EFFORTS = ["S", "M", "L"];
const WATCH_KINDS = ["Deadline", "Upcoming", "Policy", "Decision", "Not checked", "Note"];
const TASK_STATES = ["Not confirmed", "Done", "Escalation", "Not needed"];
const RUN_FIELDS = ["project", "evaluated", "commit", "policies_verified", "stack", "scope", "report"];

const argv = process.argv.slice(2);
const flag = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : null);
const outDir = flag("--out");
const blobArg = flag("--blobs");
const input = argv.find((a, i) => !a.startsWith("--") && !["--out", "--blobs"].includes(argv[i - 1]));
if (!input || !outDir) {
  console.error("Usage: node build-dashboard-data.mjs <readiness.json> --out <dir> [--blobs run=/_blob/…,stages=…,findings=…,watch=…,console=…]");
  process.exit(2);
}

const errors = [];
let data;
try {
  data = JSON.parse(fs.readFileSync(input, "utf8"));
} catch (error) {
  console.error(`Can't read ${input}: ${error.message}`);
  process.exit(2);
}

// ---------------------------------------------------------------- validate + normalize

const run = data.run ?? {};
for (const f of RUN_FIELDS) if (typeof run[f] !== "string" || !run[f].trim()) errors.push(`run.${f}: required text`);

const seen = new Map();
const findings = (data.findings ?? []).map((f, i) => {
  const where = `findings[${i}] ${f.id ?? ""}`.trim();
  if (!/^[A-Z]{3}-\d{2}$/.test(f.id ?? "")) errors.push(`${where}: id like BLD-01`);
  if (!PLATFORMS.includes(f.platform)) errors.push(`${where}: platform one of ${PLATFORMS.join(", ")}`);
  if (!STATUSES.includes(f.status)) errors.push(`${where}: status one of ${STATUSES.join(", ")}`);
  const passing = f.status === "PASS" || f.status === "N/A";
  const severity = passing ? "" : f.severity;
  if (!passing && !SEVERITIES.includes(severity)) errors.push(`${where}: severity one of ${SEVERITIES.join(", ")}`);
  const gateIos = f.gate_ios || "";
  const gateAndroid = f.gate_android || "";
  if (gateIos && !/^I[1-3]$/.test(gateIos)) errors.push(`${where}: gate_ios I1–I3 or empty`);
  if (gateAndroid && !/^A[1-4]$/.test(gateAndroid)) errors.push(`${where}: gate_android A1–A4 or empty`);
  if (f.platform !== "Android" && !gateIos) errors.push(`${where}: gate_ios required for ${f.platform}`);
  if (f.platform !== "iOS" && !gateAndroid) errors.push(`${where}: gate_android required for ${f.platform}`);
  if (f.platform === "iOS" && gateAndroid) errors.push(`${where}: iOS check has gate_android`);
  if (f.platform === "Android" && gateIos) errors.push(`${where}: Android check has gate_ios`);
  if (typeof f.title !== "string" || !f.title.trim()) errors.push(`${where}: title required`);
  const order = f.order === undefined || f.order === null || f.order === "" ? null : Number(f.order);
  if (order !== null && !(Number.isInteger(order) && order > 0)) errors.push(`${where}: order must be a positive integer`);
  if (f.effort && !EFFORTS.includes(f.effort)) errors.push(`${where}: effort S, M or L`);
  const n = (seen.get(f.id) ?? 0) + 1;
  seen.set(f.id, n);
  return {
    key: n === 1 ? f.id : `${f.id}-${n}`,
    id: f.id,
    area: f.area ?? "",
    platform: f.platform,
    status: f.status,
    severity,
    gate: [gateIos, gateAndroid].filter(Boolean).join(" · "),
    gate_ios: gateIos,
    gate_android: gateAndroid,
    title: f.title ?? "",
    evidence: f.evidence ?? "",
    fix: f.fix ?? "",
    order,
    effort: f.effort ?? "",
  };
});
const orders = findings.filter((f) => f.order !== null).map((f) => f.order);
if (new Set(orders).size !== orders.length) errors.push("findings: order values must be unique");

const watch = (data.watch ?? []).map((w, i) => {
  const where = `watch[${i}]`;
  if (!WATCH_KINDS.includes(w.kind)) errors.push(`${where}: kind one of ${WATCH_KINDS.join(", ")}`);
  if (!PLATFORMS.includes(w.applies)) errors.push(`${where}: applies one of ${PLATFORMS.join(", ")}`);
  if (w.date && !/^\d{4}(-\d{2}){0,2}$/.test(w.date)) errors.push(`${where}: date YYYY, YYYY-MM or YYYY-MM-DD`);
  if (w.source && !/^https:\/\//.test(w.source)) errors.push(`${where}: source must be an https URL`);
  if (typeof w.topic !== "string" || !w.topic.trim()) errors.push(`${where}: topic required`);
  return { key: `w${i + 1}`, date: w.date ?? "", kind: w.kind, applies: w.applies, topic: w.topic ?? "", note: w.note ?? "", source: w.source ?? "" };
});

const stageByCode = Object.fromEntries(STAGES.map((s) => [s.stage, s]));
const tasks = (data.console ?? []).map((t, i) => {
  const where = `console[${i}]`;
  const stage = stageByCode[t.stage];
  if (!stage) errors.push(`${where}: stage I1–I3 or A1–A4`);
  if (!TASK_STATES.includes(t.state)) errors.push(`${where}: state one of ${TASK_STATES.join(", ")}`);
  if (typeof t.task !== "string" || !t.task.trim()) errors.push(`${where}: task required`);
  return { key: `c${i + 1}`, platform: stage?.platform ?? "", stage: t.stage, stage_name: stage?.name ?? "", rank: stage?.order ?? 0, task: t.task ?? "", state: t.state };
});

if (errors.length) {
  console.error(`readiness.json has ${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
  process.exit(2);
}

// ---------------------------------------------------------------- stage verdicts

const notes = data.stages ?? {};
const stages = STAGES.map((s) => {
  const applies = findings.filter((f) => {
    if (f.platform !== "Both" && f.platform !== s.platform) return false;
    const gate = s.platform === "iOS" ? f.gate_ios : f.gate_android;
    return gate && Number(gate.slice(1)) <= s.order;
  });
  const blockers = applies.filter((f) => (f.status === "FAIL" || f.status === "LIKELY") && f.severity === "blocker");
  const high = applies.filter((f) => ["FAIL", "LIKELY", "RISK"].includes(f.status) && (f.severity === "high" || (f.status === "RISK" && f.severity === "blocker")));
  const unconfirmed = applies.filter((f) => f.status === "VERIFY" && (f.severity === "blocker" || f.severity === "high"));
  const verdict = blockers.length ? "BLOCKED" : high.length || unconfirmed.length ? "AT RISK" : "READY";
  const ids = (list) => [...new Set(list.map((f) => f.id))].join(", ");
  const fallback = verdict === "BLOCKED" ? `Fix ${blockers[0].id} first` : verdict === "AT RISK" ? `Resolve ${(high[0] ?? unconfirmed[0]).id}` : "Ready to submit";
  return {
    stage: s.stage,
    platform: s.platform,
    order: s.order,
    name: s.name,
    verdict,
    blockers: blockers.length,
    high: high.length,
    unconfirmed: unconfirmed.length,
    blocking: ids(blockers),
    risks: ids([...high, ...unconfirmed]),
    next_step: notes[s.stage]?.next_step || fallback,
  };
});

// ---------------------------------------------------------------- write

fs.mkdirSync(outDir, { recursive: true });
const write = (name, rows) => fs.writeFileSync(path.join(outDir, name), JSON.stringify(rows, null, 2) + "\n");
write("run.json", [Object.fromEntries(RUN_FIELDS.map((f) => [f, run[f]]))]);
write("stages.json", stages);
write("findings.json", findings);
write("watch.json", watch);
write("console.json", tasks);

const label = { iOS: "iOS", Android: "Android" };
console.log("| Stage | Verdict | Blocking checks | Next step |\n| --- | --- | --- | --- |");
for (const s of stages) {
  console.log(`| ${label[s.platform]} · ${s.name} (${s.stage}) | **${s.verdict}** | ${s.blocking || (s.risks ? `risks: ${s.risks}` : "—")} | ${s.next_step} |`);
}
const count = (fn) => findings.filter(fn).length;
console.log(
  `\nChecks: ${findings.length} · open ${count((f) => ["FAIL", "LIKELY", "RISK"].includes(f.status))} · to confirm ${count((f) => f.status === "VERIFY")} · passing ${count((f) => f.status === "PASS" || f.status === "N/A")}` +
    `\nWrote run.json, stages.json, findings.json, watch.json, console.json to ${outDir}`,
);

// ---------------------------------------------------------------- store documents (second form)

if (blobArg) {
  const blobs = Object.fromEntries(blobArg.split(",").map((pair) => pair.split("=").map((s) => s.trim())));
  const missing = Object.keys(DATASETS).filter((id) => !/^\/_blob\/[0-9a-f]+$/.test(blobs[id] ?? ""));
  if (missing.length) {
    console.error(`--blobs needs a /_blob/<id> url for: ${missing.join(", ")}`);
    process.exit(2);
  }
  const storeDir = path.join(outDir, "store");
  fs.mkdirSync(storeDir, { recursive: true });
  const at = new Date().toISOString();
  const docs = [
    ["dash", "meta", { title: `${run.project} Store Readiness` }],
    ["dash", "params", { platform: "all", show: "open", stage: null }],
    ...Object.entries(DATASETS).map(([id, [title, description]]) => [
      "datasets",
      id,
      { title, description, source: { kind: "file", url: blobs[id], name: `${id}.json`, format: "json" }, updated: { at, by: "Claude (rn-store-readiness)" }, fixed: true },
    ]),
    ["files", "index.html", { text: fs.readFileSync(path.join(PLUGIN_ROOT, "assets", "dashboard", "index.html"), "utf8") }],
  ];
  const writes = docs.map(([collection, docId, doc]) => {
    const file = path.join(storeDir, `${collection}-${docId}.json`);
    fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
    return { op: "set", collection, doc_id: docId, file_path: path.resolve(file) };
  });
  console.log(`\nStore documents in ${storeDir}. ArtifactData batch writes (add if_version to entries whose document already exists):\n${JSON.stringify(writes, null, 2)}`);
}
