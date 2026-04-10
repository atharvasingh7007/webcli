/**
 * platforms/docker.js
 * Docker metadata discovery layer.
 */

import { Command } from 'commander';
import { output, envelope } from '../core/output.js';
import { DockerHubProvider } from '../core/providers/DockerHubProvider.js';

export function dockerCommand() {
  const cmd = new Command('docker').description('Docker Registry metadata query layer');
  const provider = new DockerHubProvider();

  cmd
    .command('image <images...>')
    .description('Get structured metadata for Docker images')
    .action(async (images) => {
      if (images.length === 1) {
        try {
          const data = await provider.getImage(images[0]);
          output(envelope('docker', 'image', data, { ok: true }));
        } catch (err) {
          output(envelope('docker', 'image', {
            type: 'image',
            image: images[0],
            error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
          }, { ok: false }));
        }
        return;
      }

      const { default: pLimit } = await import('p-limit');
      const limit = pLimit(5);
      const results = new Array(images.length);

      await Promise.all(images.map((img, i) => limit(async () => {
        try {
          const data = await provider.getImage(img);
          results[i] = { ok: true, ...data };
        } catch (err) {
          results[i] = { ok: false, image: img, error: { code: err.code || 'UNKNOWN_ERROR', message: err.message } };
        }
      })));

      output(envelope('docker', 'image_batch', results, { ok: true }));
    });

  cmd
    .command('tags <images...>')
    .description('List available published tags for Docker images')
    .option('-l, --limit <n>', 'Number of tags to return', '20')
    .action(async (images, opts) => {
      if (images.length === 1) {
        try {
          const data = await provider.getTags(images[0], opts);
          output(envelope('docker', 'tags', data, { ok: true }));
        } catch (err) {
          output(envelope('docker', 'tags', {
            type: 'tags',
            image: images[0],
            error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
          }, { ok: false }));
        }
        return;
      }

      const { default: pLimit } = await import('p-limit');
      const limit = pLimit(5);
      const results = new Array(images.length);

      await Promise.all(images.map((img, i) => limit(async () => {
        try {
          const data = await provider.getTags(img, opts);
          results[i] = { ok: true, ...data };
        } catch (err) {
          results[i] = { ok: false, image: img, error: { code: err.code || 'UNKNOWN_ERROR', message: err.message } };
        }
      })));

      output(envelope('docker', 'tags_batch', results, { ok: true }));
    });

  return cmd;
}
