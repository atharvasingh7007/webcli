/**
 * test/run.js
 * Basic integration tests — runs each platform with no-auth commands and validates output shape.
 * Run with: node test/run.js
 */

import { execa } from 'execa';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '../bin/webcli.js');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

async function run(args) {
  const result = await execa('node', [CLI, ...args], { reject: false });
  if (result.exitCode !== 0) {
    throw new Error(`Exit code ${result.exitCode}: ${result.stderr}`);
  }
  const data = JSON.parse(result.stdout);
  return data;
}

function assertShape(data, requiredKeys) {
  for (const key of requiredKeys) {
    if (!(key in data)) throw new Error(`Missing key: ${key}`);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('\nwebcli tests\n');

// webcli list
console.log('System:');
await test('webcli list returns platform map', async () => {
  const data = await run(['list']);
  assertShape(data, ['source', 'version', 'platforms']);
  if (!data.platforms.github) throw new Error('Missing github in platforms');
  if (!data.platforms.hackernews) throw new Error('Missing hackernews in platforms');
});

// HackerNews (no auth, safe to test)
console.log('\nHackerNews (no auth):');
await test('hackernews top returns results', async () => {
  const data = await run(['hackernews', 'top', '--limit', '3']);
  assertShape(data, ['source', 'command', 'count', 'results']);
  if (data.source !== 'hackernews') throw new Error('Wrong source');
  if (!Array.isArray(data.results)) throw new Error('results not array');
  if (data.results.length === 0) throw new Error('No results');
  assertShape(data.results[0], ['id', 'title', 'score', 'by']);
});

await test('hackernews new returns results', async () => {
  const data = await run(['hackernews', 'new', '--limit', '3']);
  assertShape(data, ['source', 'command', 'results']);
  if (data.results.length === 0) throw new Error('No results');
});

await test('hackernews search returns results', async () => {
  const data = await run(['hackernews', 'search', 'llm agents', '--limit', '3']);
  assertShape(data, ['source', 'command', 'results', 'query']);
  if (data.query !== 'llm agents') throw new Error('Query mismatch');
});

await test('hackernews item fetches post + comments', async () => {
  // Use a known stable HN item
  const data = await run(['hackernews', 'item', '1', '--comments', '2']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('hackernews user fetches profile', async () => {
  const data = await run(['hackernews', 'user', 'pg']);
  assertShape(data, ['source', 'command', 'results']);
  const r = data.results;
  if (!r.username) throw new Error('Missing username');
  if (typeof r.karma !== 'number') throw new Error('Missing karma');
});

// Reddit (public API, no auth needed for basic reads)
console.log('\nReddit (public API):');
await test('reddit hot returns posts', async () => {
  const data = await run(['reddit', 'hot', '--subreddit', 'programming', '--limit', '3']);
  assertShape(data, ['source', 'command', 'results']);
  if (!Array.isArray(data.results)) throw new Error('Not array');
  if (data.results.length === 0) throw new Error('No results');
  assertShape(data.results[0], ['id', 'title', 'author', 'score']);
});

await test('reddit search returns results', async () => {
  const data = await run(['reddit', 'search', 'nextjs server actions', '--limit', '3']);
  assertShape(data, ['source', 'query', 'results']);
});

await test('reddit info returns subreddit metadata', async () => {
  const data = await run(['reddit', 'info', 'programming']);
  assertShape(data, ['source', 'command', 'results']);
  if (!data.results.subscribers) throw new Error('Missing subscribers');
});

// Doctor
console.log('\nSystem:');
await test('webcli doctor runs and returns status JSON', async () => {
  const result = await execa('node', [CLI, 'doctor'], { reject: false });
  const data = JSON.parse(result.stdout);
  assertShape(data, ['source', 'command', 'dependencies', 'auth']);
  if (!Array.isArray(data.dependencies)) throw new Error('dependencies not array');
});

// Additional no-auth platforms (Smoke tests)
console.log('\nSmoke testing remaining no-auth platforms:');

await test('wikipedia search returns results', async () => {
  const data = await run(['wikipedia', 'search', 'javascript', '--limit', '2']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('arxiv search returns results', async () => {
  const data = await run(['arxiv', 'search', 'llm', '--limit', '2']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('npm search returns results', async () => {
  const data = await run(['npm', 'search', 'express', '--limit', '2']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('pypi search returns results', async () => {
  const data = await run(['pypi', 'search', 'requests', '--limit', '2']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('stackoverflow search returns results', async () => {
  const data = await run(['stackoverflow', 'search', 'react hooks', '--limit', '2']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('devto search returns results', async () => {
  const data = await run(['devto', 'search', 'typescript', '--limit', '2']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('weather current returns results', async () => {
  const data = await run(['weather', 'current', 'london']);
  assertShape(data, ['source', 'command', 'results']);
});

await test('read URL returns results (valid)', async () => {
  const data = await run(['read', 'https://example.com']);
  assertShape(data, ['source', 'command', 'results']);
});

// ── Contract Suite Hooks ──────────────────────────────────────────────────────
console.log('\nRunning formal contract regression suite (test/contracts/*.test.js):');

const contractsDir = join(__dirname, 'contracts');
if (fs.existsSync(contractsDir)) {
  const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.test.js'));
  for (const f of files) {
    await test(`Contract suite: ${f}`, async () => {
      const result = await execa('node', ['--test', join(contractsDir, f)], { reject: false });
      if (result.exitCode !== 0) throw new Error(`Contract failed: ${f}\n${result.stderr || result.stdout}`);
    });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
