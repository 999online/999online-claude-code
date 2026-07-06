# Commit and branch rules

- Conventional Commits: `type(scope): subject`. Types: feat, fix, chore, docs, refactor, test, perf, build, ci.
- Subject imperative, ≤72 chars. Body wraps at 100 columns.
- Branches: `feature/<slug>`, `fix/<slug>`, `chore/<slug>`.
- No direct commits to default branch. Open a PR.
- No amend or force-push on shared branches.
- One logical change per commit. Split unrelated work.
- Never commit secrets, credentials, `.env*`, or large binaries.
