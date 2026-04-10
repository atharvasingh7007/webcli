import test from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

test('Search Contracts', async (t) => {
  // Test 1: Single command search wrapper shape
  await t.test('search outputs default DDG format bounds dynamically correctly', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'search', 'react', '--limit', '3']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.source, 'search');
    assert.strictEqual(res.command, 'search');
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.mode, 'search');
    assert.strictEqual(res.engine, 'ddg');
    assert.strictEqual(res.query, 'react');
    assert.strictEqual(res.count, 3);
    assert.strictEqual(res.results.length, 3);
    
    // Per-item required fields
    const firstResult = res.results[0];
    assert.ok(firstResult.rank > 0);
    assert.strictEqual(typeof firstResult.title, 'string');
    assert.strictEqual(typeof firstResult.url, 'string');
    assert.strictEqual(typeof firstResult.snippet, 'string');
    assert.strictEqual(firstResult.source, 'duckduckgo');
  });

  // Test 2: Search Read Composition wrapper shape
  await t.test('search read composition natively merges objects successfully limiting bounds stringently explicitly bounds', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'search', 'react', '--limit', '4', '--read-top', '2']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.mode, 'search+read');
    assert.strictEqual(res.count, 2, 'Count correctly matches limit parameter stringently applied POST deduplication.');
    assert.strictEqual(res.results.length, 2);

    const firstResult = res.results[0];
    assert.ok(firstResult.read, 'Composition object must exist');
    assert.strictEqual(typeof firstResult.read.ok, 'boolean');
    assert.strictEqual(firstResult.read.provider, 'jina');
    assert.ok(firstResult.read.url.length > 0);
  });
});
