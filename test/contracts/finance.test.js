import test from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

test('Finance Contracts', async (t) => {
  // Test 1: Single item success shape
  await t.test('single-item returns correct wrapper and required fields', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'finance', 'quote', 'NVDA', '--asset-type', 'equity']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.source, 'finance');
    assert.strictEqual(res.command, 'quote');
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.results.type, 'quote');
    assert.strictEqual(res.results.symbol, 'NVDA');
    assert.strictEqual(res.results.source, 'yahoo');
    assert.ok(res.results.price.value > 0);
    assert.ok(res.results.price.currency === 'USD');
    assert.strictEqual(typeof res.results.market.delayed, 'boolean');
    assert.ok(res.results.market.as_of.length > 5);
    
    // Strict semantic rule check: never batch wrappers for 1-input
    assert.strictEqual(Array.isArray(res.results), false, 'Single URL inputs must NOT return batch arrays.');
  });

  // Test 2: Single item failure shape
  await t.test('single-item failure maps NOT_FOUND cleanly without disrupting JSON structure', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'finance', 'quote', 'BAD_SYMBOL_FAKE_XYZ', '--asset-type', 'equity']);
    const res = JSON.parse(stdout);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.results.symbol, 'BAD_SYMBOL_FAKE_XYZ');
    assert.strictEqual(res.results.error.code, 'NOT_FOUND');
  });

  // Test 3: Batch wrapper shape
  await t.test('batch returns wrapper dynamically bounding failed and successful objects inline cleanly', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'finance', 'quote', 'AAPL', 'BAD_FAKESTRING_XYZ', 'NVDA', '--asset-type', 'equity']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.ok, true, 'Batch envelope must globally report true explicitly allowing localized errors.');
    assert.strictEqual(res.command, 'quote_batch');
    assert.strictEqual(res.count, 3, 'Count strictly equivalent to results.length');
    assert.strictEqual(res.results.length, 3);
    
    // Check input order dynamically mapped correctly
    assert.strictEqual(res.results[0].symbol, 'AAPL');
    assert.strictEqual(res.results[1].symbol, 'BAD_FAKESTRING_XYZ');
    assert.strictEqual(res.results[2].symbol, 'NVDA');

    // Mappings isolating faults perfectly
    assert.strictEqual(res.results[0].ok, true);
    assert.strictEqual(res.results[1].ok, false);
    assert.strictEqual(res.results[1].error.code, 'NOT_FOUND');
    assert.strictEqual(res.results[2].ok, true);
  });

  // Test 4: Semantic global error for Ambiguous type bounds
  await t.test('throws AMBIGUOUS_ASSET_TYPE wrapping command errors explicitly', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'finance', 'quote', 'NVDA']);
    const res = JSON.parse(stdout);

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error.code, 'AMBIGUOUS_ASSET_TYPE');
  });
});
