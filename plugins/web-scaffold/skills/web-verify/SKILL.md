---
name: web-verify
description: Audit web project against architecture decision standard and deployment baseline — build must pass, 8 decision questions answered with repo evidence, structure guard functional. Use after web-build, or standalone to audit any existing project against the standard. Read-heavy; only writes fixes for failures it finds.
---

# web-verify

Input: project directory (freshly built or existing). Output: pass/fail checklist report with evidence per item.

Read `${CLAUDE_PLUGIN_ROOT}/references/decision-standard.md`, `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`, and project's golden-path doc `${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-<X>.md` (`<X>` recorded in `docs/ADR.md`; no ADR → audit against decision standard only, flag missing ADR as failure).

## 1. Build gate

- `npm install` then `npm run check` (fall back: `build`, or per-README check command).
- Failure → fix, re-run. **Cap 3 fix attempts.** Still failing → stop fixing, report exact errors honestly. Never claim pass.
- Non-Node stack → README's documented check command.

## 2. Decision standard — 8 questions

Audit each against repo evidence per decision-standard.md evidence column. Concrete checks:

- Secrets: `.env.example` exists; `.env*` in `.gitignore`; grep tracked files for key/token/secret literals — hits = fail.
- Run/deploy/logs: npm scripts exist AND README documents them.
- Auth vs audience: compare ADR audience against implemented auth.
- Rollback: README section exists, covers each integration.

## 3. Deployment baseline

- All 10 README minimum-documentation items present.
- Command shape scripts present (`dev`, `check`, `deploy`, `deploy:prod`, `logs`).
- Observability: ADR names logs + analytics + feedback channel.

## 4. Structure contract

- `.claude/allowed-paths.json` + `.claude/settings.json` parse as JSON.
- Guard functional — feed forbidden path via stdin, expect exit 0 + stdout JSON with `"permissionDecision":"deny"`:
  ```bash
  echo '{"tool_input":{"file_path":"<repo>/[first forbiddenGlob match]"},"cwd":"<repo>"}' | node "<repo>/.claude/hooks/folder-structure-guard.cjs"
  ```
- Actual tree matches CLAUDE.md structure table — no dirs outside contract, no forbidden dirs present.

## 5. Path-specific checks

Run "Verify notes" from project's golden-path doc `${CLAUDE_PLUGIN_ROOT}/references/golden-paths/path-<X>.md` (A: form reaches destination, no auth/DB; B: CRUD slice works, no custom auth code; C: no unauthenticated route; E: endpoints respond locally, idempotency present).

Checks needing external accounts (real deploy, live form destination) → don't fake: mark "pending — needs <account>", list as user follow-up.

## Report

```
## Verify report — <project>
Build gate: PASS/FAIL (evidence)
Decision standard: 8 rows — PASS/FAIL + evidence each
Deployment baseline: PASS/FAIL per item
Structure contract: PASS/FAIL
Path checks: PASS/FAIL/PENDING per item
Verdict: READY FOR DEPLOY / NOT READY (blockers listed) / READY WITH PENDING ITEMS
```

Escalation triggers recorded in ADR → verdict caps at "NOT READY — escalation pending decision owner".
