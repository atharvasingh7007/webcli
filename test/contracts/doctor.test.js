import test from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

test('Doctor Contracts', async (t) => {
  await t.test('doctor asserts dynamic total bounds dynamically strictly bounding integers naturally', async () => {
    const { stdout } = await execa('node', ['bin/webcli.js', 'doctor']);
    const res = JSON.parse(stdout);
    
    assert.strictEqual(res.source, 'webcli');
    assert.strictEqual(res.command, 'doctor');
    assert.strictEqual(typeof res.total_platforms, 'number');
    assert.ok(res.total_platforms > 0);
    assert.strictEqual(typeof res.overall, 'string');
    assert.ok(Array.isArray(res.dependencies));
    assert.ok(Array.isArray(res.auth));
    assert.ok(Array.isArray(res.no_auth_platforms));
  });
});
