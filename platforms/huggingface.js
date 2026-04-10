/**
 * platforms/huggingface.js
 * HuggingFace metadata toolset (`hf model`, `hf dataset`)
 */

import { Command } from 'commander';
import { output, envelope } from '../core/output.js';
import { HuggingFaceProvider } from '../core/providers/HuggingFaceProvider.js';

export function huggingfaceCommand() {
  const cmd = new Command('huggingface').alias('hf').description('HuggingFace metadata discovery layer');

  const provider = new HuggingFaceProvider();

  cmd
    .command('model <repo-ids...>')
    .description('Get structured metadata for HuggingFace model repos')
    .action(async (repoIds) => {
      if (repoIds.length === 1) {
        try {
          const data = await provider.getModel(repoIds[0]);
          output(envelope('huggingface', 'model', data, { ok: true }));
        } catch (err) {
          output(envelope('huggingface', 'model', null, {
            ok: false,
            type: 'model',
            id: repoIds[0],
            error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
          }));
        }
        return;
      }
      
      const { default: pLimit } = await import('p-limit');
      const limit = pLimit(5);
      const results = new Array(repoIds.length);
      
      await Promise.all(repoIds.map((id, i) => limit(async () => {
        try {
          const data = await provider.getModel(id);
          results[i] = { ok: true, ...data };
        } catch (err) {
          results[i] = { ok: false, id, error: { code: err.code || 'UNKNOWN_ERROR', message: err.message } };
        }
      })));
      
      output(envelope('huggingface', 'model_batch', results, { ok: true }));
    });

  cmd
    .command('dataset <repo-ids...>')
    .description('Get structured metadata for HuggingFace dataset repos')
    .action(async (repoIds) => {
      if (repoIds.length === 1) {
        try {
          const data = await provider.getDataset(repoIds[0]);
          output(envelope('huggingface', 'dataset', data, { ok: true }));
        } catch (err) {
          output(envelope('huggingface', 'dataset', null, {
            ok: false,
            type: 'dataset',
            id: repoIds[0],
            error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
          }));
        }
        return;
      }
      
      const { default: pLimit } = await import('p-limit');
      const limit = pLimit(5);
      const results = new Array(repoIds.length);
      
      await Promise.all(repoIds.map((id, i) => limit(async () => {
        try {
          const data = await provider.getDataset(id);
          results[i] = { ok: true, ...data };
        } catch (err) {
          results[i] = { ok: false, id, error: { code: err.code || 'UNKNOWN_ERROR', message: err.message } };
        }
      })));
      
      output(envelope('huggingface', 'dataset_batch', results, { ok: true }));
    });

  return cmd;
}
