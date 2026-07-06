<!-- TEMPLATE — copy to each repo root as PLUGINS-TO-INSTALL.md. Optional Claude Code tooling for building features in this repo. -->
# Plugins to install (optional)

Claude Code tooling that helps build features inside this repo. None required to run/deploy the scaffold.

## MCP servers
Bundled in `.mcp.json`:
- **context7** — current library/framework docs (Expo, Hono, Cloudflare, NestJS, Drizzle). Auto-available.

Add per need (developer supplies config — never commit secrets):
- **cloudflare docs / bindings** — Workers, D1, Pages reference (small profile).
- **playwright** — browser automation for web (`apps/web` / PWA) testing.

## Marketplace plugins (if using the 999online marketplace)
- `/mobile-scaffold` — this scaffolder (re-run for a sibling repo).
- Team review/QA plugins as adopted.

Install MCP by adding to `.mcp.json` `mcpServers`; restart Claude Code to load.
