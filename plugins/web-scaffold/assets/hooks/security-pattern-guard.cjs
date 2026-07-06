#!/usr/bin/env node
// security-pattern-guard.cjs -- PreToolUse hook that scans written CONTENT for
// dangerous security anti-patterns (distinct from sensitive-file-guard, which
// checks WHICH file is written).
//
// House convention: exit 0 always. deny hard-blocks; ask prompts the user.
// Fails open (exit 0) on any error.

'use strict';

// Hard-block: never legitimate in source.
const BLOCK_PATTERNS = [
  { regex: /AKIA[0-9A-Z]{16}/, reason: 'Hardcoded AWS access key. Use env vars or a secrets manager.' },
  { regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY/, reason: 'Embedded private key. Never commit private keys to source.' }
];

// Ask: review needed, user can approve.
const ASK_PATTERNS = [
  { regex: /\beval\s*\(\s*[^'")\s]/, reason: 'eval() with a non-literal argument — code injection risk unless input strictly controlled.' },
  { regex: /\.innerHTML\s*=\s*[^'"]/, reason: 'innerHTML assignment with a variable. Use textContent or sanitize (DOMPurify) to prevent XSS.' },
  { regex: /dangerouslySetInnerHTML\s*=\s*\{/, reason: 'dangerouslySetInnerHTML — ensure the value is sanitized (DOMPurify or equivalent).' },
  { regex: /["'`]\s*SELECT\s+[\s\S]{0,40}\+\s*(?!['"])/m, reason: 'SQL string concatenation. Use parameterized queries / Drizzle query builder.' },
  { regex: /`\s*(?:SELECT|INSERT|UPDATE|DELETE)\s+[\s\S]{0,60}\$\{/m, reason: 'SQL template literal with interpolation. Use parameterized queries instead.' },
  { regex: /console\.log\s*\([\s\S]{0,80}(?:password|secret|token|apiKey|api_key|credential|private_key)/i, reason: 'Logging a potentially sensitive variable. Remove before committing.' },
  { regex: /chmod\s+777/, reason: 'chmod 777 grants world-writable permissions. Use minimum permissions needed.' }
];

function checkCorsCredentials(content) {
  const hasWildcardOrigin = /Access-Control-Allow-Origin['":\s]*\*/.test(content) ||
    /cors\(\s*\{[^}]*origin\s*:\s*['"]?\*['"]?/s.test(content) ||
    /allowedOrigins?\s*[\(=]\s*['"]?\*['"]?/.test(content);
  const hasCredentials = /Access-Control-Allow-Credentials['":\s]*true/.test(content) ||
    /credentials\s*:\s*true/.test(content);
  if (hasWildcardOrigin && hasCredentials) {
    return 'CORS wildcard origin (*) with credentials enabled is a security misconfiguration. Allowlist specific origins.';
  }
  return null;
}

function emit(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason },
    ...(decision === 'deny' ? { decision: 'block', reason } : {})
  }));
  process.exit(0);
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolInput = data.tool_input;
    if (!toolInput) process.exit(0);

    // Write uses .content, Edit uses .new_string.
    const content = toolInput.content || toolInput.new_string || '';
    if (!content) process.exit(0);

    const filePath = toolInput.file_path || '';
    if (/\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|lock)$/i.test(filePath)) process.exit(0);

    for (const { regex, reason } of BLOCK_PATTERNS) {
      if (regex.test(content)) emit('deny', 'BLOCKED: ' + reason);
    }
    const corsIssue = checkCorsCredentials(content);
    if (corsIssue) emit('deny', 'BLOCKED: ' + corsIssue);

    for (const { regex, reason } of ASK_PATTERNS) {
      if (regex.test(content)) emit('ask', 'Security review: ' + reason);
    }
    process.exit(0);
  } catch (e) {
    process.exit(0); // fail-open
  }
});
