---
description: Bump a plugin's version (semver) and commit
argument-hint: <plugin-name> <major|minor|patch>
---

Bump plugin version and commit. Arguments: `$ARGUMENTS` — format `<plugin-name> <major|minor|patch>`.

Steps:

1. Parse `$ARGUMENTS` into two tokens: plugin name, bump type. If format wrong or bump type not `major`/`minor`/`patch`, stop and tell user.
2. Confirm `plugins/<plugin-name>/.claude-plugin/plugin.json` exists. If not, stop.
2a. Sync with `origin/master` before bump.
   - Run `git status --porcelain`. Non-empty (uncommitted changes) → stop, tell user commit/stash first then rerun.
   - `git fetch origin`. Fail → stop, show error.
   - `git rebase origin/master`. Conflict/fail → stop, show error, tell user resolve then rerun. Do not auto-abort.
3. Read baseline `version` from `origin/master`: `git show origin/master:plugins/<plugin-name>/.claude-plugin/plugin.json` → `version` field. Call it `V_master`. Must be semver `MAJOR.MINOR.PATCH`; missing/malformed → stop and ask user how to proceed.
4. Compute `target` = bump of `V_master`:
   - `major`: bump MAJOR, reset MINOR and PATCH to `0`.
   - `minor`: bump MINOR, reset PATCH to `0`.
   - `patch`: bump PATCH.
5. Read working-tree `version` from local `plugin.json`. Decide:
   - working-tree == `target` → already bumped. Report it, skip write, jump to step 11 (PR).
   - working-tree == `V_master` → write `target` to `plugin.json`, preserve all other fields and formatting.
   - otherwise (diverged) → warn user, ask how to proceed.
6. If `marketplace.json` has `version` field set for same plugin entry, warn user — `plugin.json` silently wins, both is footgun. Offer to remove marketplace-entry version.
7. Bump `metadata.version` in `.claude-plugin/marketplace.json` with same bump type. Baseline from `origin/master`: `git show origin/master:.claude-plugin/marketplace.json` → `metadata.version` (semver `MAJOR.MINOR.PATCH`; missing/malformed → stop and ask). Compute marketplace `target`. Compare working-tree `metadata.version`: == marketplace `target` → already bumped, skip write; == baseline → write `target`; diverged → warn, ask. Preserve other fields and formatting.
8. Run `claude plugin validate ./plugins/<plugin-name>` and `claude plugin validate .`. Stop if either errors.
8a. Confirm `README.md` reflects this plugin (listed, current usage/dependencies). If missing or stale, update `README.md` now in caveman lite (authoring Rule 7). Also run `git status` — uncommitted README edits belong in this release commit, not orphaned. README ships in same commit as plugin.
8b. Detect current branch: `git rev-parse --abbrev-ref HEAD`. If branch is `master`, `main`, `maint`, or starts with `rc_` — committing here is not allowed. Propose release branch `release-<plugin-name>-v<new-plugin-version>`, show it, ask user to confirm or supply alternate name. On confirm, create and switch: `git checkout -b <branch-name>` (carries uncommitted version-bump edits onto new branch). If user declines, stop without committing. Branch not protected → continue to step 9 as-is.
9. Stage: `git add plugins/<plugin-name>/ .claude-plugin/marketplace.json README.md`. Stages whole plugin dir — catches untracked commands/skills/agents/hooks/mcp on first release. README.md staged so plugin docs ship in same commit (Rule 7). Before commit, run `git diff --cached --stat` and show user. If staged set spans beyond version bump (new files, edits outside `plugin.json`/`README.md`), confirm with user before committing. Commit message: `<plugin-name>: bump to v<new-plugin-version> (marketplace v<new-marketplace-version>)`.
10. Report old and new versions for both files, and commit SHA.
11. Offer pull request creation. **Always ask** user: create pull request for this release? Never auto-create. If user declines → done, remind about PR requirement below.
    a. **Jira ticket:** extract `LMS-<digits>` from current branch name (`git rev-parse --abbrev-ref HEAD`). Found → show, ask user to confirm or override. Not found → ask user for Jira ticket number. Ticket required — PR title convention is `LMS-<ticket> <type>: <description>`.
    b. **Push:** confirm with user, then `git push -u origin <branch>`. Stop on push failure, show error.
    c. **Compose PR content:**
       - Title: `LMS-<ticket> release: bump <plugin-name> to v<new-plugin-version>`.
       - Description (must be non-empty): `/validate` output + release summary from step 10 (old→new versions for both files, commit SHA). Satisfies PR requirement below.
    d. **Destination:** always `master`. lm-claude-code merges to `master`. Do not ask.
    e. **Create:** destination is `master`, PR-create MCP hard-blocks `master` (no override). Skip MCP — produce URL fallback as normal flow. Derive workspace and repo slugs from `git remote get-url origin` — never hardcode. Print ready-to-open URL `https://bitbucket.org/<workspace>/<repo>/pull-requests/new?source=<branch>&dest=master` plus paste-ready title and description.
    f. Report outcome: PR URL (created or to-open) and any remaining manual step.

**PR requirement:** every PR touching `plugins/` or `marketplace.json` must paste `/validate` output and this `/release` summary (old→new versions for both files, commit SHA) in PR description, so reviewers confirm catalog validates. Step 11 assembles this content automatically.
