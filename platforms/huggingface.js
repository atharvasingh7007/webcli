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
    .command('model <repo-id>')
    .description('Get structured metadata for a HuggingFace model repo')
    .action(async (repoId) => {
      try {
        const data = await provider.getModel(repoId);
        output(envelope('huggingface', 'model', data, { ok: true }));
      } catch (err) {
        output(envelope('huggingface', 'model', null, {
          ok: false,
          type: 'model',
          id: repoId,
          error: {
            code: err.code || 'UNKNOWN_ERROR',
            message: err.message
          }
        }));
      }
    });

  cmd
    .command('dataset <repo-id>')
    .description('Get structured metadata for a HuggingFace dataset repo')
    .action(async (repoId) => {
      try {
        const data = await provider.getDataset(repoId);
        output(envelope('huggingface', 'dataset', data, { ok: true }));
      } catch (err) {
        output(envelope('huggingface', 'dataset', null, {
          ok: false,
          type: 'dataset',
          id: repoId,
          error: {
            code: err.code || 'UNKNOWN_ERROR',
            message: err.message
          }
        }));
      }
    });

  return cmd;
}
