---
description: Rebuild the dependency graph and the delivery plan from the product wiki — classify every dependency, detect cycles, then order the work into waves with a critical path, parallel tracks, priority inversions and cut candidates. Writes dependencies.md and roadmap.md. Never changes code.
allowed-tools: Skill, Read, Write, Glob, Grep, Bash
---

Re-plan delivery from the wiki.

1. Invoke skill `feature-dependencies` — classifies edges, syncs `depends_on`/`blocks` both ways, runs the bundled dep-graph script for topological order and cycle detection, writes `dependencies.md`.
2. Invoke skill `delivery-sequence` — turns that graph plus priority and effort into waves in `roadmap.md`. It stops if cycles are unresolved; a cyclic graph can't be ordered honestly.

Both skills own their preflight and reporting. Don't reimplement here.
