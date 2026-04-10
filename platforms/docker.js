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
    .command('image <image-name>')
    .description('Get structured metadata for a Docker image repo/container definition')
    .action(async (image) => {
      try {
        const data = await provider.getImage(image);
        output(envelope('docker', 'image', data, { ok: true }));
      } catch (err) {
        output(envelope('docker', 'image', null, {
          ok: false,
          type: 'image',
          image,
          error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
        }));
      }
    });

  cmd
    .command('tags <image-name>')
    .description('List available published tags for a Docker image')
    .option('-l, --limit <n>', 'Number of tags to return', '20')
    .action(async (image, opts) => {
      try {
        const data = await provider.getTags(image, opts);
        output(envelope('docker', 'tags', data, { ok: true }));
      } catch (err) {
        output(envelope('docker', 'tags', null, {
          ok: false,
          type: 'tags',
          image,
          error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
        }));
      }
    });

  return cmd;
}
