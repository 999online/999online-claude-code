#!/usr/bin/env node
// Parse `depends_on:` from feature-page frontmatter -> topological order, cycles, roots, leaves.
// Zero deps. Node >= 18.  Usage: node dep-graph.mjs <features-dir>   |   node dep-graph.mjs --selftest
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import assert from 'node:assert/strict';

const FM = /^---\r?\n([\s\S]*?)\r?\n---/;

/** Pull slug + depends_on out of one page's raw text. */
export function parsePage(text, fallbackSlug) {
  const m = FM.exec(text);
  const fm = m ? m[1] : '';
  const slug = (/^slug:[ \t]*(.+)$/m.exec(fm)?.[1] ?? fallbackSlug).trim().replace(/^["']|["']$/g, '');
  const line = /^depends_on:[ \t]*(.*)$/m.exec(fm);
  let deps = [];
  if (line) {
    const inline = line[1].trim();
    if (inline.startsWith('[')) {
      deps = inline.slice(1, inline.lastIndexOf(']')).split(',');
    } else if (inline === '') {
      // block form: subsequent "  - slug" lines
      const rest = fm.slice(line.index + line[0].length);
      for (const l of rest.split('\n').slice(1)) {
        const item = /^\s*-\s*(.+)$/.exec(l);
        if (!item) break;
        deps.push(item[1]);
      }
    }
  }
  deps = deps.map((d) => d.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  return { slug, deps: [...new Set(deps)] };
}

/** Kahn topological sort. Nodes left over after the queue drains are in (or downstream of) a cycle. */
export function analyze(pages) {
  const nodes = new Map(pages.map((p) => [p.slug, p]));
  // An edge to an unknown slug is a dangling reference, not a node.
  const dangling = [];
  const edges = new Map();
  for (const p of pages) {
    const kept = [];
    for (const d of p.deps) {
      if (nodes.has(d)) kept.push(d);
      else dangling.push({ from: p.slug, to: d });
    }
    edges.set(p.slug, kept);
  }
  const indeg = new Map([...nodes.keys()].map((s) => [s, 0]));
  for (const [, ds] of edges) for (const d of ds) indeg.set(d, indeg.get(d) + 1);

  // depends_on points at the prerequisite, so prerequisites must come first:
  // build the reverse adjacency (prereq -> dependents) and sort on that.
  const out = new Map([...nodes.keys()].map((s) => [s, []]));
  const rdeg = new Map([...nodes.keys()].map((s) => [s, 0]));
  for (const [s, ds] of edges) {
    for (const d of ds) {
      out.get(d).push(s);
      rdeg.set(s, rdeg.get(s) + 1);
    }
  }
  const queue = [...rdeg].filter(([, n]) => n === 0).map(([s]) => s).sort();
  const order = [];
  while (queue.length) {
    const s = queue.shift();
    order.push(s);
    for (const nxt of out.get(s).sort()) {
      rdeg.set(nxt, rdeg.get(nxt) - 1);
      if (rdeg.get(nxt) === 0) queue.push(nxt);
    }
  }
  const stuck = [...nodes.keys()].filter((s) => !order.includes(s));
  return {
    order,
    cycles: findCycles(stuck, edges),
    roots: [...nodes.keys()].filter((s) => edges.get(s).length === 0).sort(),   // nothing to wait for
    leaves: [...nodes.keys()].filter((s) => indeg.get(s) === 0).sort(),          // nothing waits on it
    orphans: [...nodes.keys()].filter((s) => edges.get(s).length === 0 && indeg.get(s) === 0).sort(),
    dangling,
    blocked: stuck.sort(),
  };
}

/** DFS over the stuck subgraph; report each distinct cycle once. */
function findCycles(stuck, edges) {
  const set = new Set(stuck);
  const cycles = [];
  const seen = new Set();
  const stack = [];
  const walk = (s) => {
    const at = stack.indexOf(s);
    if (at !== -1) {
      const cyc = stack.slice(at);
      const key = [...cyc].sort().join('>');
      if (!seen.has(key)) { seen.add(key); cycles.push(cyc); }
      return;
    }
    stack.push(s);
    for (const d of edges.get(s) ?? []) if (set.has(d)) walk(d);
    stack.pop();
  };
  for (const s of stuck) walk(s);
  return cycles;
}

function loadDir(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePage(readFileSync(join(dir, f), 'utf8'), basename(f, '.md')));
}

function selftest() {
  const page = (slug, deps) => `---\ntype: feature\nslug: ${slug}\ndepends_on: [${deps.join(', ')}]\n---\n# x`;
  assert.deepEqual(parsePage(page('b', ['a']), 'z'), { slug: 'b', deps: ['a'] });
  assert.deepEqual(parsePage('---\nslug: a\ndepends_on: []\n---\n', 'z').deps, []);
  assert.deepEqual(parsePage('# no frontmatter', 'fallback'), { slug: 'fallback', deps: [] });
  assert.deepEqual(parsePage('---\nslug: b\ndepends_on:\n  - a\n  - c\n---\n', 'z').deps, ['a', 'c']);

  // prerequisite before dependent
  const chain = analyze([parsePage(page('c', ['b']), 'c'), parsePage(page('b', ['a']), 'b'), parsePage(page('a', []), 'a')]);
  assert.deepEqual(chain.order, ['a', 'b', 'c']);
  assert.deepEqual(chain.cycles, []);
  assert.deepEqual(chain.roots, ['a']);
  assert.deepEqual(chain.leaves, ['c']);

  const cyc = analyze([parsePage(page('a', ['b']), 'a'), parsePage(page('b', ['a']), 'b')]);
  assert.equal(cyc.order.length, 0);
  assert.equal(cyc.cycles.length, 1);
  assert.deepEqual([...cyc.cycles[0]].sort(), ['a', 'b']);
  assert.deepEqual(cyc.blocked, ['a', 'b']);

  const dang = analyze([parsePage(page('a', ['ghost']), 'a')]);
  assert.deepEqual(dang.dangling, [{ from: 'a', to: 'ghost' }]);
  assert.deepEqual(dang.order, ['a']);

  assert.deepEqual(analyze([parsePage(page('solo', []), 'solo')]).orphans, ['solo']);
  console.log('dep-graph selftest: ok');
}

const arg = process.argv[2];
if (arg === '--selftest') selftest();
else if (!arg) { console.error('usage: dep-graph.mjs <features-dir> | --selftest'); process.exit(1); }
else console.log(JSON.stringify(analyze(loadDir(arg)), null, 2));
