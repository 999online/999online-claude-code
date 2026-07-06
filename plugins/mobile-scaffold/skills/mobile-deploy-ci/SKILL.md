---
name: mobile-deploy-ci
description: Add opt-in GitHub Actions CI + Cloudflare deploy workflows to an already-scaffolded repo — Cloudflare Pages for a mobile PWA or web-be apps/web, Cloudflare Workers for a Hono backend. Copies bundled templates, wires the existing deploy npm script, documents repo secrets. Use when promoting a Cloudflare-targeted repo past laptop deploy, or user asks to add CI. Not during initial scaffold. NestJS/AWS + native EAS = documented, not templated (declines).
---

# mobile-deploy-ci

Input: an existing scaffolded repo (from `mobile-build` / `mobile-service-scaffold`). Output: `.github/workflows/ci.yml` + a Cloudflare deploy workflow, placeholders filled, repo-secret setup documented. **Cloudflare targets only** — NestJS/AWS deploy + native EAS CI are out of scope (skill documents, writes no workflow for them).

Opt-in — not part of default scaffold (doctrine: laptop → phone/URL first, `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`).

Read `${CLAUDE_PLUGIN_ROOT}/references/deployment.md` (validation ladder + CI/CD promotion).

## Ground rules

- **Templates are ground truth.** Copy bundled YAML, substitute `{{...}}` only. Never hand-write a workflow.
- **No secret values, ever** (Rule 2). Workflow references `${{ secrets.* }}`. Skill documents setting them — never prints/embeds a token.
- Workflow runs the repo's **existing** deploy npm script. Never re-encode `expo export`/`wrangler` logic in YAML.
- **Anchor every command** to the target dir.

## Steps

1. **Precondition.** Read `<target>/package.json`. Require a `check` script. Missing → stop: run `mobile-build`/`mobile-service-scaffold` first.

2. **Detect repo type + Cloudflare target** (inspect files + `scripts` bodies + `docs/ADR.md`):
   - **Hono backend** — `wrangler.jsonc`/`wrangler.toml` present, deploy script runs `wrangler deploy` → **Workers** (`deploy-worker.yml`). `{{DEPLOY_SCRIPT}}` = that script (`deploy`/`deploy:prod`).
   - **Mobile PWA** — `app.json` + a deploy script whose body runs `expo export`/`--platform web` + `wrangler pages` → **Pages** (`deploy-web.yml`). Candidates: PWA mode `deploy:prod`; both mode `deploy:web:prod`/`deploy:web`.
   - **web-be monorepo** — root `workspaces` + `apps/`: `apps/web` → Pages (`deploy-web.yml`, `deploy:web`); `apps/api` Hono → Workers (`deploy-worker.yml`, `deploy:api`). Emit both as needed.
   - **NestJS backend** (`nest-cli.json`) or **native-only mobile** (no web/wrangler deploy script) → **decline, write nothing.** Message: "NestJS/AWS + native EAS deploy are DevOps-coordinated / manual — not templated here (see DEPLOY.md). Cloudflare Pages/Workers targets only."

3. **Detect remaining placeholders:**
   - `{{DEFAULT_BRANCH}}` — `(cd <target> && git symbolic-ref --short HEAD)`; detached/no repo → `main`.
   - `{{NODE_VERSION}}` — `<target>/.nvmrc`, else `engines.node` (major), else `22`.

4. **Emit.** Copy `${CLAUDE_PLUGIN_ROOT}/assets/workflows/ci.yml` + the matched deploy workflow(s) (`deploy-web.yml` / `deploy-worker.yml`) → `<target>/.github/workflows/`. Substitute placeholders. Confirm no stray `{{`. Same-name workflow exists → show diff, ask before overwrite.

5. **Allowlist.** `<target>/.claude/allowed-paths.json` exists → add `.github/workflows/**` to `allowedGlobs` if absent (edit, preserve rest). No allowed-paths.json → skip.

6. **Document secrets** (print, run nothing):
   - Create GitHub Environment `production` — deploy job scoped to it.
   - Set `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (repo Settings → Secrets, or `gh secret set`). Never commit values.
   - Hono Worker runtime secrets (`FIREBASE_SERVICE_ACCOUNT`) stay Wrangler-managed (`wrangler secret put`), not GitHub.

7. **No auto-commit.** Announce files written + secret setup. Leave staging/commit to user.

## Output

Report: repo type detected, Cloudflare target(s) + workflow(s) written (or decline + why), placeholders filled (branch / node / deploy script), allowed-paths updated (y/n), required repo secrets + environment, reminder to commit.
