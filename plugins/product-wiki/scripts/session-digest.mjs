#!/usr/bin/env node
// Digest past Claude Code session transcripts for a project into compact markdown.
// Raw JSONL is unreadable and huge; this keeps only human/assistant prose.
// Zero deps. Node >= 18.
//   node session-digest.mjs <project-dir> [--since YYYY-MM-DD] [--max-chars N] [--sessions N]
//   node session-digest.mjs --selftest
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import assert from 'node:assert/strict';

/** Claude Code stores transcripts at ~/.claude/projects/<abs-path with / and . as ->/<uuid>.jsonl */
export function projectSlug(dir) {
  return resolve(dir).replace(/[/.]/g, '-');
}

const NOISE = /^(Caveat: |<system-reminder>|<command-name>|<local-command|<user-prompt-submit-hook)/;

/** Flatten one transcript record to { role, text } or null when it carries no prose. */
export function extract(rec) {
  if (rec?.type !== 'user' && rec?.type !== 'assistant') return null;
  if (rec.isSidechain) return null;               // subagent chatter, not the user's thread
  const c = rec.message?.content;
  let text = '';
  if (typeof c === 'string') text = c;
  else if (Array.isArray(c)) text = c.filter((b) => b?.type === 'text').map((b) => b.text).join('\n');
  text = text.trim();
  if (!text || NOISE.test(text)) return null;
  return { role: rec.type, text };
}

export function trim(text, cap) {
  return text.length <= cap ? text : `${text.slice(0, cap)} …[truncated]`;
}

export function digestFile(path, { maxChars = 1500 } = {}) {
  const turns = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line) continue;
    let rec;
    try { rec = JSON.parse(line); } catch { continue; }   // partial write at tail of a live session
    const t = extract(rec);
    if (t) turns.push(t);
  }
  return turns.map((t) => ({ ...t, text: trim(t.text, maxChars) }));
}

function main(dir, opts) {
  const base = join(homedir(), '.claude', 'projects', projectSlug(dir));
  if (!existsSync(base)) {
    console.log(`No session transcripts found for ${resolve(dir)} (looked in ${base}).`);
    return;
  }
  let files = readdirSync(base)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => ({ f, path: join(base, f), mtime: statSync(join(base, f)).mtime }))
    .filter((x) => !opts.since || x.mtime.toISOString().slice(0, 10) >= opts.since)
    .sort((a, b) => b.mtime - a.mtime);
  if (opts.sessions) files = files.slice(0, opts.sessions);

  console.log(`# Session digest — ${resolve(dir)}\n`);
  console.log(`${files.length} session(s), newest first. Source: ${base}\n`);
  for (const { f, path, mtime } of files) {
    const turns = digestFile(path, opts);
    if (!turns.length) continue;
    console.log(`## [${mtime.toISOString().slice(0, 10)}] session ${f.replace('.jsonl', '').slice(0, 8)} — ${turns.length} turns\n`);
    for (const t of turns) console.log(`**${t.role === 'user' ? 'User' : 'Claude'}:** ${t.text}\n`);
  }
}

function selftest() {
  assert.equal(projectSlug('/w/desk/ideas/repo'), '-w-desk-ideas-repo');
  assert.equal(projectSlug('/a/b.c'), '-a-b-c');
  assert.deepEqual(extract({ type: 'user', message: { content: 'hello' } }), { role: 'user', text: 'hello' });
  assert.deepEqual(
    extract({ type: 'assistant', message: { content: [{ type: 'text', text: 'hi' }, { type: 'tool_use', name: 'Bash' }] } }),
    { role: 'assistant', text: 'hi' },
  );
  assert.equal(extract({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Bash' }] } }), null);
  assert.equal(extract({ type: 'attachment', content: 'hook output' }), null);
  assert.equal(extract({ type: 'user', isSidechain: true, message: { content: 'subagent' } }), null);
  assert.equal(extract({ type: 'user', message: { content: '<system-reminder>x</system-reminder>' } }), null);
  assert.equal(extract({ type: 'user', message: { content: '   ' } }), null);
  assert.equal(trim('abcdef', 3), 'abc …[truncated]');
  assert.equal(trim('abc', 3), 'abc');
  console.log('session-digest selftest: ok');
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') selftest();
else if (!args[0] || args[0].startsWith('--')) {
  console.error('usage: session-digest.mjs <project-dir> [--since YYYY-MM-DD] [--max-chars N] [--sessions N] | --selftest');
  process.exit(1);
} else {
  const flag = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1]; };
  main(args[0], {
    since: flag('--since'),
    maxChars: Number(flag('--max-chars')) || 1500,
    sessions: Number(flag('--sessions')) || 0,
  });
}
