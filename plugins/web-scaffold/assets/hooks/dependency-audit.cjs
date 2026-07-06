#!/usr/bin/env node
// dependency-audit.cjs -- PostToolUse hook that runs npm audit after package.json
// changes. Emits warnings via additionalContext; cannot block (PostToolUse).
// Fails open on all errors (missing npm, no node_modules, network issues).

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 10000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input && data.tool_input.file_path;
    if (!filePath) process.exit(0);
    if (path.basename(filePath) !== 'package.json') process.exit(0);

    const pkgDir = path.dirname(filePath);
    if (!fs.existsSync(path.join(pkgDir, 'node_modules'))) process.exit(0);

    try {
      execSync('which npm', { stdio: 'ignore' });
    } catch (e) {
      process.exit(0);
    }

    let auditJson;
    try {
      const result = execSync('npm audit --json 2>/dev/null', {
        cwd: pkgDir, encoding: 'utf8', timeout: 12000, stdio: ['pipe', 'pipe', 'pipe']
      });
      auditJson = JSON.parse(result);
    } catch (e) {
      // npm audit exits non-zero when vulns found -- parse stdout
      if (e.stdout) {
        try { auditJson = JSON.parse(e.stdout); } catch (parseErr) { process.exit(0); }
      } else {
        process.exit(0);
      }
    }

    if (!auditJson || !auditJson.metadata || !auditJson.metadata.vulnerabilities) process.exit(0);

    const vuln = auditJson.metadata.vulnerabilities;
    const critical = vuln.critical || 0;
    const high = vuln.high || 0;
    const moderate = vuln.moderate || 0;
    if (critical === 0 && high === 0) process.exit(0);

    const parts = [];
    if (critical > 0) parts.push(critical + ' critical');
    if (high > 0) parts.push(high + ' high');
    if (moderate > 0) parts.push(moderate + ' moderate');

    const message = 'npm audit found ' + parts.join(', ') +
      ' severity vulnerabilit' + ((critical + high + moderate) === 1 ? 'y' : 'ies') +
      ' in ' + path.basename(pkgDir) + '/package.json. ' +
      'Run `npm audit` for details and `npm audit fix` where possible.';

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: message }
    }));
    process.exit(0);
  } catch (e) {
    process.exit(0); // fail-open
  }
});
