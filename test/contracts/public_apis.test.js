import test from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

test('Public Zero-Auth Platform Contracts', async (t) => {
  await t.test('rss fetches and uniformly parses RSS XML without external parsers', async () => {
     const { stdout } = await execa('node', ['bin/webcli.js', 'rss', 'https://news.ycombinator.com/rss']);
     const res = JSON.parse(stdout);
     assert.strictEqual(res.source, 'rss');
     assert.strictEqual(res.command, 'rss_batch');
     assert.strictEqual(res.results[0].ok, true);
     assert.ok(res.results[0].items.length > 0, 'Must extract items successfully');
  });

  await t.test('cache clear explicitly binds wipe output envelope strictly', async () => {
     const { stdout } = await execa('node', ['bin/webcli.js', 'cache', 'clear']);
     const res = JSON.parse(stdout);
     assert.strictEqual(res.source, 'webcli');
     assert.strictEqual(res.command, 'cache clear');
     assert.strictEqual(res.ok, true);
  });
  
  await t.test('npm info extracts single boundary object perfectly', async () => {
     const { stdout } = await execa('node', ['bin/webcli.js', 'npm', 'info', 'express']);
     const res = JSON.parse(stdout);
     assert.strictEqual(res.source, 'npm');
     assert.strictEqual(res.results.name, 'express');
  });

  await t.test('arxiv search evaluates explicit constraints cleanly', async () => {
     const { stdout } = await execa('node', ['bin/webcli.js', 'arxiv', 'search', 'llm', '--limit', '2']);
     const res = JSON.parse(stdout);
     assert.strictEqual(res.source, 'arxiv');
     assert.strictEqual(res.results.length, 2, 'Strictly respects limits internally');
     assert.ok(res.results[0].id, 'Must isolate arxiv ids directly');
  });

  await t.test('wikipedia search tracks titles flawlessly', async () => {
     const { stdout } = await execa('node', ['bin/webcli.js', 'wikipedia', 'summary', 'JavaScript']);
     const res = JSON.parse(stdout);
     assert.strictEqual(res.source, 'wikipedia');
     assert.ok(res.results.extract.includes('programming language'), 'Core summary must be retrieved cleanly');
  });
});
