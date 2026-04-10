/**
 * platforms/read.js
 * Universal URL reader — fetches any webpage and returns clean readable text.
 * Uses r.jina.ai as primary (free, no auth) with a direct fetch fallback.
 * This is the single most useful command for AI agents — "go read this page".
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import pLimit from 'p-limit';
import { JinaProvider } from '../core/providers/JinaProvider.js';

export function readCommand() {
  const cmd = new Command('read').description('Fetch any URL as clean readable text');

  cmd
    .argument('<urls...>', 'URLs to fetch and read (supports multiple in parallel)')
    .description('Fetch any webpage as clean markdown text (no auth needed)')
    .option('--raw', 'Return raw HTML instead of clean text')
    .option('--no-jina', 'Skip Jina reader, use direct fetch')
    .option('--stream', 'Stream NDJSON output as lines instead of final JSON (advanced)')
    .action(withErrorHandling('read', async (urls, opts) => {
      const provider = new JinaProvider();
      const limit = pLimit(5); // Parallel concurrency maximum
      
      const results = [];
      const fetchOne = async (url) => {
        try {
          new URL(url); // validate structure
          const { content, method } = await provider.read(url, opts);
          const res = {
            url,
            method,
            ok: true,
            word_count: content.split(/\s+/).length,
            char_count: content.length,
            content: content.slice(0, 100000), // 100k cap
          };
          if (opts.stream) {
            process.stdout.write(JSON.stringify({ source: 'read', command: 'read', type: 'result', ...res }) + '\n');
          } else {
            results.push(res);
          }
        } catch (err) {
          const res = { url, ok: false, error: err.message };
          if (opts.stream) {
            process.stdout.write(JSON.stringify({ source: 'read', command: 'read', type: 'error', ...res }) + '\n');
          } else {
            results.push(res);
          }
        }
      };

      await Promise.all(urls.map(url => limit(() => fetchOne(url))));

      if (!opts.stream) {
        output(envelope('read', 'read', results));
      }
    }));

  return cmd;
}
