import test from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

test('HuggingFace Contracts', async (t) => {
  // Test 1: Batch Models Wrapper Formats
  await t.test('batch returns wrapper isolating individual errors successfully', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'hf', 'model', 'sentence-transformers/all-MiniLM-L6-v2', 'bad_fake_repo/random']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.ok, true, 'Batch envelope must globally report true explicitly allowing localized errors.');
    assert.strictEqual(res.command, 'model_batch');
    assert.strictEqual(res.count, 2, 'Count strictly equivalent to results.length');
    
    // Check input order
    assert.strictEqual(res.results[0].id, 'sentence-transformers/all-MiniLM-L6-v2');
    assert.strictEqual(res.results[1].id, 'bad_fake_repo/random');

    // Mappings isolating faults perfectly
    assert.strictEqual(res.results[0].ok, true);
    assert.strictEqual(res.results[1].ok, false);
    assert.strictEqual(res.results[1].error.code, 'NOT_FOUND'); 
  });
});
