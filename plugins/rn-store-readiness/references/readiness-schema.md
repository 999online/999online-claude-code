# readiness.json

`rn-store-evaluate` writes `readiness.json` in the run's work dir from its evaluation — every check it reports, passing ones included. The bundled `build-dashboard-data.mjs` validates it, computes each stage's verdict, and turns it into the five data files `rn-store-dashboard` publishes. Same file, same verdicts, in the report and on the dashboard.

```jsonc
{
  "run": {                                   // all fields required, plain text
    "project": "MyApp",
    "evaluated": "2026-10-29",
    "commit": "ed058f1",
    "policies_verified": "2026-10-29",       // policy-dates.md "Last verified" (or today if you re-verified)
    "stack": "Expo 57.0.28 · React Native 0.86.3 · Expo CNG",
    "scope": "What the project docs say about platforms, current stage, open escalations — or 'None declared.'",
    "report": "docs/store-readiness.md"       // where the Markdown report lives, relative to the app root
  },
  "stages": { "A1": { "next_step": "one short action" } },   // optional, any of I1–I3, A1–A4
  "findings": [{
    "id": "BLD-07",                          // catalog ID; repeat it for per-platform rows
    "area": "Build & identity",
    "platform": "Android",                   // iOS | Android | Both
    "status": "LIKELY",                      // FAIL | LIKELY | RISK | VERIFY | PASS | N/A
    "severity": "blocker",                   // blocker | high | medium | low (omit for PASS/N/A)
    "gate_ios": "",                          // I1–I3, required unless platform is Android
    "gate_android": "A1",                    // A1–A4, required unless platform is iOS
    "title": "One-line finding",
    "evidence": "file:line, config key or command output",
    "fix": "What to do",
    "order": 1,                              // optional: rank in the fix order (unique)
    "effort": "S"                            // optional: S | M | L
  }],
  "watch": [{                                // dated rules, open decisions, what wasn't checked
    "kind": "Deadline",                      // Deadline | Upcoming | Policy | Decision | Not checked | Note
    "date": "2027-02-01",                    // YYYY, YYYY-MM, YYYY-MM-DD or ""
    "applies": "Android",                    // iOS | Android | Both
    "topic": "Short headline",
    "note": "Why it matters for this app",
    "source": "https://…"                    // optional, https only
  }],
  "console": [{ "stage": "A2", "task": "Data safety form with the deletion URL", "state": "Not confirmed" }]
  // state: Not confirmed | Done | Escalation | Not needed — tasks from console-tasks.md, adapted to the app
}
```

Status meanings: FAIL confirmed; LIKELY a heuristic not yet confirmed on a build; RISK a judgment that a reviewer may reject it; VERIFY can't be told from the repository; PASS met; N/A doesn't apply.

Scanner statuses map onto these: `fail` → FAIL, `warn` → LIKELY until confirmed (then FAIL, or PASS when the evidence shows it's wrong), `verify` → VERIFY, `pass` → PASS, `na` → N/A.

The script rejects (exit 2, every problem listed) a missing `run` field, an ID not shaped like `BLD-01`, a platform/gate mismatch (an iOS row with `gate_android`, a Both row without both gates), a severity on an open row that isn't one of the four, duplicate `order` values, a non-https `source`, and unknown `kind`/`state`/`stage` values.
