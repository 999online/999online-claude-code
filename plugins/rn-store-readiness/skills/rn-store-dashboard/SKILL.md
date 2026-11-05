---
name: rn-store-dashboard
description: Publish or refresh the shareable claude.ai overview dashboard for a store-readiness evaluation — stage verdicts, blockers in fix order, watch-outs, every check and the store-console tasks — built from readiness.json with the bundled data builder and fixed page template, then linked at the top of the readiness report. Needs the Artifact and ArtifactData tools (claude.ai artifacts); without them it skips cleanly. Use as step 3 of /rn-store-readiness, or standalone to republish after readiness.json changes. Not for evaluating the app — that is rn-store-evaluate.
---

# rn-store-dashboard

Same page every run, every project: fixed template `${CLAUDE_PLUGIN_ROOT}/assets/dashboard/index.html`; every value comes from five data files built from `readiness.json`. **Never change template per project** — project data belongs in datasets; layout change goes into template, for every project.

Input: `$ARGUMENTS` = path to `readiness.json` (optional). Default `<work>/readiness.json` from this session's `rn-store-evaluate` run.

## Preflight

1. No `Artifact` tool in session (e.g. Claude Code without claude.ai artifacts) → say once: "Dashboard skipped — no Artifact tool in this session; Markdown report is the deliverable." STOP. `ArtifactData` listed only as deferred tool → load it first.
2. `readiness.json` missing → STOP: "No readiness.json — run /rn-store-readiness (or rn-store-evaluate) first." `<work>` = its folder.
3. Report = `run.report` resolved against app root. Missing → still publish; skip link step, say so.

## Steps

1. **Build data.**

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/scripts/build-dashboard-data.mjs <work>/readiness.json --out <work>/dash
   ```

   Validates file (exit 2 → fix what it lists), computes stage verdicts, writes `run.json`, `stages.json`, `findings.json`, `watch.json`, `console.json`, prints stage table.
2. **Find or create dashboard.**
   - Report names one (`Overview dashboard: <url>`) → read it (`Artifact` action `read`), refresh in place.
   - Else create: `Artifact` action `quickstart`, intent `other`, names Dashboard type; publish with its `type_url`, `title` "<run.project> Store Readiness" and `auto_open: "after_first_write"`, nothing else. Result carries type's own instructions — follow them where they differ from these steps.
3. **Upload five data files**, one `Artifact` publish each: `url` = dashboard, `asset: true`, `file_path` = file. Note each result's `/_blob/<id>` url.
4. **Make store documents.** Re-run step 1 command with `--blobs run=/_blob/…,stages=/_blob/…,findings=/_blob/…,watch=/_blob/…,console=/_blob/…`. Writes `dash/meta`, `dash/params`, five `datasets/<id>` records and `files/index.html` (template, unchanged) as JSON under `<work>/dash/store/`, prints `writes` array.
5. **Write** with one `ArtifactData` `batch` using that array.
   - Refreshing existing dashboard: `get` each document first, add its `version` as `if_version`; leave `files/index.html` out when stored `text` equals template. After batch, delete data files old dataset records pointed at (`Artifact` action `delete`, `path` = old asset id) — earlier run uploaded them, nothing references them now.
6. **Check.** `ArtifactData` `get`, collection `data/users/me`, doc `check`. `checking` → read again (≤ 5 reads); no document on first read → read once more; `failed` → fix only what template's code confirms, write, check again (≤ 2 fixes), then say so if still failing. Don't render, screenshot or browse dashboard.
7. **Hand over.** Put `Overview dashboard: <url>` at top of report (replace existing line). Tell user, one line each:
   - Dashboard private until shared from page's Share menu.
   - Anyone who can open it can read its attached data files.
   - Any source's rows download as CSV from Sources.
   - Running /rn-store-readiness again refreshes same page.
