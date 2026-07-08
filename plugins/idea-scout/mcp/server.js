#!/usr/bin/env node
// Zero-dependency MCP server wrapping the CurrentsAPI news API.
// Speaks newline-delimited JSON-RPC 2.0 over stdio. Node >= 18 (global fetch).
// Token is saved at runtime via currentsapi_save_config and read lazily on every
// call — so it takes effect immediately, no restart/reconnect.

import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PROTOCOL_VERSION = '2025-06-18';
const DEFAULT_API_URL = 'https://api.currentsapi.services/v1';

// ---- config / auth (lazy) --------------------------------------------------

function configPath() {
  return (process.env.CURRENTSAPI_CONFIG_PATH || '').trim() || join(homedir(), '.currentsapi-scout.json');
}

function loadConfig() {
  try {
    const p = configPath();
    if (!existsSync(p)) return {};
    return JSON.parse(readFileSync(p, 'utf8')) || {};
  } catch {
    return {};
  }
}

function resolveToken() {
  const env = (process.env.CURRENTSAPI_TOKEN || '').trim();
  if (env) return env;
  const cfg = loadConfig();
  return typeof cfg.token === 'string' ? cfg.token.trim() : '';
}

function resolveApiUrl() {
  const env = (process.env.CURRENTSAPI_API_URL || '').trim();
  if (env) return env.replace(/\/$/, '');
  const cfg = loadConfig();
  const fromCfg = typeof cfg.apiUrl === 'string' ? cfg.apiUrl.trim() : '';
  return (fromCfg || DEFAULT_API_URL).replace(/\/$/, '');
}

function saveConfig({ token, apiUrl }) {
  if (typeof token !== 'string' || token.trim().length < 8) {
    const err = new Error('token must be a non-empty string ≥ 8 chars (paste the key from your CurrentsAPI dashboard)');
    err.code = 'BAD_TOKEN';
    throw err;
  }
  const merged = { ...loadConfig() };
  merged.token = token.trim();
  if (typeof apiUrl === 'string' && apiUrl.trim()) merged.apiUrl = apiUrl.trim().replace(/\/$/, '');
  const path = configPath();
  writeFileSync(path, JSON.stringify(merged, null, 2) + '\n', { mode: 0o600 });
  return { saved: true, path };
}

// ---- CurrentsAPI request ---------------------------------------------------

// Build the query string for a request: apiKey + only the provided params.
function buildQuery(token, params) {
  const q = new URLSearchParams();
  q.set('apiKey', token);
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === '') continue;
    q.set(k, String(v));
  }
  return q.toString();
}

async function api(path, params) {
  const token = resolveToken();
  if (!token) {
    const err = new Error(
      'NO_TOKEN: CurrentsAPI needs a one-time API key. Get a free key at https://currentsapi.services (dashboard), ' +
        'then run /init-mcp <your-key> (or call currentsapi_save_config). Free tier ~1,000 requests/day.'
    );
    err.code = 'NO_TOKEN';
    throw err;
  }
  const url = `${resolveApiUrl()}${path}?${buildQuery(token, params)}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`CurrentsAPI ${res.status}: ${typeof json?.message === 'string' ? json.message : text.slice(0, 300)}`);
    err.code = res.status === 401 || res.status === 403 ? 'UNAUTHORIZED' : `HTTP_${res.status}`;
    throw err;
  }
  return json;
}

// ---- tools -----------------------------------------------------------------

const LATEST_INPUT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    language: { type: 'string', description: 'ISO code, e.g. "en"' },
    category: { type: 'string', description: 'e.g. "business", "technology"' },
    country: { type: 'string', description: 'ISO country code' },
    page_number: { type: 'integer' },
    page_size: { type: 'integer', description: 'max 20 on free tier' },
  },
};

const SEARCH_INPUT = {
  type: 'object',
  additionalProperties: false,
  required: ['keywords'],
  properties: {
    keywords: { type: 'string', description: 'search terms' },
    language: { type: 'string' },
    category: { type: 'string' },
    country: { type: 'string' },
    start_date: { type: 'string', description: 'ISO 8601' },
    end_date: { type: 'string', description: 'ISO 8601' },
    page_number: { type: 'integer' },
    page_size: { type: 'integer' },
  },
};

const TOOLS = [
  {
    name: 'currentsapi_latest_news',
    description: 'Latest news headlines from CurrentsAPI. Filter by language/category/country. Use to ground "what is happening / selling right now".',
    inputSchema: LATEST_INPUT,
  },
  {
    name: 'currentsapi_search',
    description: 'Full-text news search on CurrentsAPI. Requires keywords; optional language/category/country/date window. Use to check demand or trend signal for a specific topic.',
    inputSchema: SEARCH_INPUT,
  },
  {
    name: 'currentsapi_save_config',
    description: 'Save the CurrentsAPI API key (and optional apiUrl) to ~/.currentsapi-scout.json (mode 0600). Read lazily on every call — takes effect immediately, no restart. Call this with the token from /init-mcp.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['token'],
      properties: {
        token: { type: 'string', description: 'CurrentsAPI API key from the dashboard' },
        apiUrl: { type: 'string', description: 'optional API base override' },
      },
    },
  },
];

async function callTool(name, args) {
  switch (name) {
    case 'currentsapi_latest_news':
      return api('/latest-news', args || {});
    case 'currentsapi_search':
      return api('/search', args || {});
    case 'currentsapi_save_config':
      return saveConfig(args || {});
    default: {
      const err = new Error(`unknown tool: ${name}`);
      err.code = 'UNKNOWN_TOOL';
      throw err;
    }
  }
}

// ---- JSON-RPC stdio transport ----------------------------------------------

const rpcResult = (id, result) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

async function handle(msg) {
  const { id, method, params } = msg;
  switch (method) {
    case 'initialize':
      return rpcResult(id, {
        protocolVersion: params?.protocolVersion || PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: 'currentsapi', version: '0.1.0' },
      });
    case 'notifications/initialized':
      return null; // notification — no reply
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });
    case 'tools/call': {
      const name = params?.name;
      const args = params?.arguments || {};
      try {
        const value = await callTool(name, args);
        return rpcResult(id, { content: [{ type: 'text', text: JSON.stringify(value) }] });
      } catch (e) {
        // Tool-level failure → surface as text so the model sees the guidance (NO_TOKEN etc.)
        const text = e && e.code ? `${e.code}: ${e.message}` : String(e && e.message ? e.message : e);
        return rpcResult(id, { content: [{ type: 'text', text }], isError: true });
      }
    }
    default:
      if (id === undefined) return null; // unknown notification
      return rpcError(id, -32601, `method not found: ${method}`);
  }
}

function serve() {
  const rl = createInterface({ input: process.stdin });
  const write = (obj) => process.stdout.write(JSON.stringify(obj) + '\n');
  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let msg;
    try { msg = JSON.parse(trimmed); } catch { return; }
    try {
      const out = await handle(msg);
      if (out) write(out);
    } catch (e) {
      if (msg && msg.id !== undefined) write(rpcError(msg.id, -32603, String(e && e.message ? e.message : e)));
    }
  });
}

// ---- self-test (no network) ------------------------------------------------

async function selftest() {
  const assert = (await import('node:assert')).default;
  const os = await import('node:os');
  const fs = await import('node:fs');
  const path = await import('node:path');

  // isolate config in a temp dir; clear env overrides
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'currentsapi-selftest-'));
  process.env.CURRENTSAPI_CONFIG_PATH = path.join(dir, 'cfg.json');
  delete process.env.CURRENTSAPI_TOKEN;
  delete process.env.CURRENTSAPI_API_URL;

  // no token yet → empty, and api() throws NO_TOKEN
  assert.strictEqual(resolveToken(), '', 'token should be empty before save');
  await assert.rejects(() => api('/latest-news', {}), (e) => e.code === 'NO_TOKEN', 'api must throw NO_TOKEN with no token');

  // bad token rejected
  assert.throws(() => saveConfig({ token: 'short' }), (e) => e.code === 'BAD_TOKEN', 'short token rejected');

  // save then read (file path)
  const r = saveConfig({ token: 'abcdef123456', apiUrl: 'https://example.test/v1/' });
  assert.strictEqual(r.saved, true);
  assert.strictEqual(resolveToken(), 'abcdef123456', 'token read back from file');
  assert.strictEqual(resolveApiUrl(), 'https://example.test/v1', 'apiUrl read back, trailing slash trimmed');

  // env overrides file
  process.env.CURRENTSAPI_TOKEN = 'envtoken12345';
  assert.strictEqual(resolveToken(), 'envtoken12345', 'env token wins over file');
  delete process.env.CURRENTSAPI_TOKEN;

  // query building: apiKey always present, empties skipped, values passed
  const q = new URLSearchParams(buildQuery('tok123456', { language: 'en', category: '', page_size: 5, missing: undefined }));
  assert.strictEqual(q.get('apiKey'), 'tok123456');
  assert.strictEqual(q.get('language'), 'en');
  assert.strictEqual(q.has('category'), false, 'empty param skipped');
  assert.strictEqual(q.get('page_size'), '5');
  assert.strictEqual(q.has('missing'), false, 'undefined param skipped');

  // tools/list shape
  const listed = await handle({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
  assert.strictEqual(listed.result.tools.length, 3, 'three tools');
  assert.deepStrictEqual(
    listed.result.tools.map((t) => t.name).sort(),
    ['currentsapi_latest_news', 'currentsapi_save_config', 'currentsapi_search']
  );

  // initialize + save_config via tools/call
  const init = await handle({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
  assert.strictEqual(init.result.serverInfo.name, 'currentsapi');
  const saved = await handle({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'currentsapi_save_config', arguments: { token: 'zzzzzzzz9999' } } });
  assert.ok(saved.result.content[0].text.includes('"saved":true'), 'save_config returns saved:true');

  console.log('selftest ok');
}

if (process.argv.includes('--selftest')) {
  selftest().catch((e) => { console.error(e); process.exit(1); });
} else {
  serve();
}
