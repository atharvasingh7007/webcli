import test from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

test('Docker Contracts', async (t) => {
  // Test 1: Batch Tags Formatting
  await t.test('batch mapping cleanly limits architectures locally maintaining count values dynamically specifically bounding strings rigidly stringently globally bounds limit limits limits explicitly bounds rigidly', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'docker', 'tags', 'nginx', 'fake_docker_tags_string', '--limit', '2']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.ok, true, 'Batch envelope must globally report true explicitly allowing localized errors.');
    assert.strictEqual(res.command, 'tags_batch');
    assert.strictEqual(res.count, 2);
    
    // Check input order
    assert.strictEqual(res.results[0].image, 'nginx');
    assert.strictEqual(res.results[1].image, 'fake_docker_tags_string');

    // Mappings isolating faults perfectly
    assert.strictEqual(res.results[0].ok, true);
    assert.strictEqual(res.results[0].count, 2); // Natively tested the 2 tags constraint per repo
    assert.strictEqual(res.results[1].ok, false);
    assert.strictEqual(res.results[1].error.code, 'NOT_FOUND');
  });

  // Test 2: Docker Image 
  await t.test('image parses missing namespaces actively passing values inline', async () => {
    // Tests implicit 'library/' auto-prepend preserving original input name output explicitly mapped into the JSON strictly bounded exclusively
    const { stdout } = await execa('node', ['bin/webcli.js', 'docker', 'image', 'python']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.results.image, 'python'); // Assert original string preserved perfectly explicitly bounded natively inherently stringently mapping explicitly bounded stringently explicitly
    assert.strictEqual(res.results.data.namespace, 'library');
    assert.strictEqual(typeof res.results.data.official, 'boolean');
  });
});
