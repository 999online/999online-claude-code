---
name: "source-command-plugin-authoring"
description: "Load the plugin-authoring rules and apply them to subsequent plugin work in this session"
---

# source-command-plugin-authoring

Use this skill when the user asks to run the migrated source command `plugin-authoring`.

## Command Template

Load `.Codex/rules/plugin-authoring.md` and apply its 9 rules to all subsequent work under `plugins/` in this session.

Steps:

1. Read `.Codex/rules/plugin-authoring.md`. If missing, tell the user and stop.
2. Print the rule titles only (one line each, numbered) so the user sees what's now in force.
3. Acknowledge in one sentence: "Plugin-authoring rules loaded. These apply to anything I write or edit under `plugins/` for the rest of this session."
4. From this point on, when creating or editing any file under `plugins/`, conform to all 9 rules. If a request would violate a rule, surface the conflict before acting.
