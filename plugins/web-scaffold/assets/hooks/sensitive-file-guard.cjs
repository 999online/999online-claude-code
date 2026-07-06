#!/usr/bin/env node
// sensitive-file-guard.cjs -- PreToolUse hook that blocks writes to sensitive files.
//
// Emits the house convention: exit 0 + hookSpecificOutput.permissionDecision="deny"
// (with legacy decision/reason mirror for older Claude Code). Fails open (exit 0)
// on any error -- the AI is never wedged by a broken guard.

'use strict';

const path = require('path');

// Sensitive file patterns -- writes to these are blocked.
const SENSITIVE_PATTERNS = [
  /\.env($|\.)/i,
  /\.pem$/i,
  /\.key$/i,
  /^credentials/i,
  /\.secret$/i,
  /serviceAccount.*\.json$/i
];

// Allowlist: env-template filenames that hold placeholders, not secrets.
// Meant to be committed and documented, so edits must pass.
const SAFE_ENV_BASENAMES = new Set([
  '.env.example', '.env.sample', '.env.template', '.env.defaults',
  '.dev.vars.example'
]);

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
    decision: 'block',
    reason
  }));
  process.exit(0);
}

// --- Stdin with 3s timeout (PreToolUse hooks must be fast) ---
let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input && data.tool_input.file_path;
    if (!filePath) process.exit(0);

    const baseName = path.basename(filePath);
    if (SAFE_ENV_BASENAMES.has(baseName.toLowerCase())) process.exit(0);

    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(baseName) || pattern.test(filePath)) {
        deny('BLOCKED: write to sensitive file ' + baseName +
          ' not allowed. Files matching ' + pattern.source +
          ' are protected. Put placeholders in .env.example instead.');
      }
    }
    process.exit(0);
  } catch (e) {
    process.exit(0); // fail-open
  }
});
