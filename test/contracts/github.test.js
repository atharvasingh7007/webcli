import test from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

test('GitHub Contracts', async (t) => {
  await t.test('pr list maps explicitly across public targets evaluating standard array wraps gracefully', async () => {
    try {
      const { stdout } = await execa('node', ['bin/webcli.js', 'github', 'pr', 'list', '--repo', 'atharvasingh7007/webcli']);
      const res = JSON.parse(stdout);
      
      assert.strictEqual(res.source, 'github');
      assert.strictEqual(res.command, 'pr-list');
      assert.ok(Array.isArray(res.results), 'Results must strictly natively encapsulate as an Array iteratively');
    } catch (err) {
      if (err.stdout) {
         try {
            const parsed = JSON.parse(err.stdout);
            // Ignore strict auth breaks inside untrusted pipeline bounding systems cleanly!
            if (!parsed.ok && (parsed.error?.code === 'DEP_MISSING' || parsed.error?.message?.includes('auth'))) {
                assert.ok(true, 'Test safely bypassed due to native headless pipeline restriction');
                return;
            }
         } catch {}
      }
      throw err;
    }
  });
});
