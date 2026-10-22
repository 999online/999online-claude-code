# Updating a plugin

How to get the latest version of a plugin installed from this marketplace, per surface.

> **Prerequisite (publishers):** the new version must be merged with a `version` bump in **both** `plugin.json` and `marketplace.json` (use `/release` — it bumps both). Without a version bump, Cowork auto-sync does not trigger and Claude Code may not see a new version.

---

## Claude Code (CLI)

1. Refresh the marketplace catalog:

   ```
   /plugin marketplace update 999online-claude-code
   ```

2. Reload plugins in the current session (or just restart Claude Code):

   ```
   /reload-plugins
   ```

![PLACEHOLDER — screenshot: /plugin marketplace update in terminal](images/update-claude-code.png)

**Auto-update:** off by default for third-party/local marketplaces. Turn on via `/plugin` → **Marketplaces** tab → select the marketplace → **Enable auto-update**. With auto-update on, new versions are fetched shortly after session start and load on the next launch (or after `/reload-plugins`).

**Local dev marketplace** (`/plugin marketplace add ~/Desktop/ideas/999online-claude-code`): same commands — `marketplace update` re-reads the local folder.

---

## Claude Desktop (Cowork)

No update button — plugins sync from the marketplace, then take effect on your **next session**.

**Personal marketplace:**

1. **Cowork** tab → **Customize** → **Plugins**.
2. Open the marketplace entry — it re-fetches the repo.
3. Start a new session; the updated plugin loads.

![PLACEHOLDER — screenshot: Cowork → Customize → Plugins](images/update-desktop.png)

**Org-managed marketplace (admin):**

- **Manual:** Organization settings → **Plugins** → select the marketplace → **Update**.
- **Automatic:** merging a PR with a `plugin.json` version bump to the default branch auto-syncs (can take up to ~30 min). Members pick it up on their next session.

![PLACEHOLDER — screenshot: Org settings → Plugins → Update](images/update-desktop-org.png)

---

## claude.ai (web)

Same model as Desktop — both are Cowork surfaces.

1. **Customize** → **Plugins**.
2. Marketplace re-syncs (or admin syncs it, org-managed).
3. New session picks up the new version.

![PLACEHOLDER — screenshot: claude.ai plugin settings](images/update-claude-ai.png)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Update not showing in Claude Code | `/plugin marketplace update <name>`, then `/reload-plugins` or restart |
| Update not showing in Desktop / claude.ai | Confirm version was bumped in both manifest files; start a fresh session; org: ask admin to hit **Update** |
| Auto-sync never fires (org) | Version bump missing in `plugin.json` — direct pushes without a bump don't trigger sync |
| Old behavior mid-session | Running sessions keep the version loaded at launch — start a new session |

Docs: [use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude) · [manage org plugins](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization) · [Claude Code plugins](https://code.claude.com/docs/en/discover-plugins)
