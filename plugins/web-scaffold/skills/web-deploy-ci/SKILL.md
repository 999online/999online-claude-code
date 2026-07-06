---
name: web-deploy-ci
description: Add opt-in GitHub Actions Cloudflare deploy + CI workflows to an already-scaffolded web project — copy bundled templates, wire existing npm deploy scripts, document repo secrets. Use when promoting a validated project past laptop deploy to automated deploy, or user asks to add CI/GitHub Actions. Not during initial scaffold (web-build stays laptop-deploy). Not for greenfield — needs a scaffolded repo with package.json + deploy scripts.
---

# web-deploy-ci

Input: existing scaffolded web project (from `web-build` or equivalent). Output: `.github/workflows/deploy-web.yml` + `ci.yml`, placeholders filled, repo-secret setup documented. Opt-in — CI is not part of default scaffold (doctrine: no CI/CD before first deploy, `${CLAUDE_PLUGIN_ROOT}/references/deployment.md`).

Read `${CLAUDE_PLUGIN_ROOT}/references/deployment.md` (deployment models + CI/CD promotion).

## Ground rules

- **Templates are ground truth.** Copy bundled YAML, substitute `{{...}}` placeholders only. Never hand-write workflow from memory.
- **No secret values, ever** (Rule 2). Workflow references `${{ secrets.* }}`. Skill documents setting them — never prints or embeds a real token/account ID.
- Workflow runs the project's **existing** npm scripts (`check`, deploy script). Never re-encode build/deploy logic in YAML.
- **Anchor every target-dir command.** cwd drifts across Bash calls — run in-project commands as `(cd <target> && cmd)` subshell or absolute paths.

## Steps

1. **Precondition.** Target repo must be an existing scaffold. Read `<target>/package.json`. Require a `check` script AND a prod deploy script. Missing package.json or scripts → stop, tell user: run `web-build` (or add the command-shape npm scripts) first. Never scaffold from scratch here.
2. **Detect placeholders** (defensive — no blind assumptions):
   - `{{DEFAULT_BRANCH}}` — `(cd <target> && git symbolic-ref --short HEAD)`; detached/no repo → `main`.
   - `{{NODE_VERSION}}` — `<target>/.nvmrc`, else `engines.node` in package.json (major only), else `22`.
   - `{{DEPLOY_SCRIPT}}` — prod web-deploy script from package.json `scripts`. Prefer `deploy:prod`. Absent → ask user which script deploys prod. Monorepo → root `deploy:prod` (fans out via turbo) or the specific `apps/*` script; confirm which app the workflow deploys.
3. **Emit.** Copy `${CLAUDE_PLUGIN_ROOT}/assets/workflows/deploy-web.yml` + `${CLAUDE_PLUGIN_ROOT}/assets/workflows/ci.yml` → `<target>/.github/workflows/`. Substitute placeholders. Confirm no stray `{{` remains. Workflow of same name already exists → show diff, ask before overwrite.
4. **Allowlist.** `<target>/.claude/allowed-paths.json` exists → add `.github/workflows/**` to `allowedGlobs` if absent (edit existing file, preserve rest). Keeps structure guard from re-prompting on later workflow edits. No allowed-paths.json → skip (no guard installed).
5. **Document secrets** (print to user, run nothing):
   - Create GitHub Environment `production` (repo Settings → Environments) — workflow deploy job is scoped to it.
   - Set two secrets (repo Settings → Secrets and variables → Actions, or `gh secret set NAME`): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Never commit values.
   - **Non-Cloudflare target?** Swap the `env:` secret names + deploy step: Vercel → `VERCEL_TOKEN` + `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID`; Netlify → `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`. Deploy script already wraps the right CLI.
   - **D1 / DB migrations?** B/C ship Drizzle + D1 in `packages/db` (schema stubbed empty). Once real migrations exist, insert a pre-deploy step: `wrangler d1 migrations apply <db-name> --remote` (via `cloudflare/wrangler-action@v3`). A/E ship no ORM — skip unless one is added.
6. **No auto-commit.** Write files, announce paths written + secret setup steps. Leave staging/commit to user.

## Output

Report: files written, placeholders filled (branch / node / deploy script), allowed-paths updated (y/n), required repo secrets + environment, any swap/D1 notes, reminder to commit.
