/**
 * platforms/search.js
 * Universal Web Search exposing DDG, Brave, and Tavily to AI agents.
 */

import { Command } from 'commander';
import { output, envelope } from '../core/output.js';
import pLimit from 'p-limit';
import { DuckDuckGoProvider } from '../core/providers/DuckDuckGoProvider.js';
import { BraveProvider } from '../core/providers/BraveProvider.js';
import { TavilyProvider } from '../core/providers/TavilyProvider.js';
import { JinaProvider } from '../core/providers/JinaProvider.js';

export function searchCommand() {
  const cmd = new Command('search').description('Universal Web Search via multiple engines');

  cmd
    .argument('<query>', 'Search query')
    .option('-e, --engine <name>', 'Search engine to use (ddg|brave|tavily)', 'ddg')
    .option('-l, --limit <n>', 'Number of results to return', '10')
    .option('--delay <ms>', 'Throttling delay for DDG (default 1500, set 0 to disable)')
    .option('--read-top <n>', 'Read the content of the top N results natively (composition layer)')
    .action(async (query, opts) => {
      let provider;

      // Safe engine matching
      switch (opts.engine?.toLowerCase()) {
        case 'brave':
          provider = new BraveProvider();
          break;
        case 'tavily':
          provider = new TavilyProvider();
          break;
        case 'ddg':
        default:
          provider = new DuckDuckGoProvider();
          break;
      }

      try {
        let { engine, query: q, results } = await provider.search(query, opts);
        
        let mode = 'search';

        // Apply composition reading
        if (opts.readTop) {
           mode = 'search+read';
           const topN = parseInt(opts.readTop);
           // Force hard truncation directly to N elements as specified by slice boundaries
           results = results.slice(0, topN);

           const limit = pLimit(5);
           const jina = new JinaProvider();

           const readTasks = results.map((result) => limit(async () => {
             try {
               const { content } = await jina.read(result.url, { cache: true }); // Default caching ok
               result.read = {
                 ok: true,
                 url: result.url,
                 content: content.slice(0, 100000), // 100k cap matching read logic safely
                 provider: 'jina',
                 fromCache: false, // Jina caches are internal to exec but effectively stateless here
                 error: null
               };
             } catch (readErr) {
               result.read = {
                 ok: false,
                 url: result.url,
                 provider: 'jina',
                 error: {
                   code: readErr.code || 'HTTP_ERROR',
                   message: readErr.message
                 }
               };
             }
           }));
           
           await Promise.all(readTasks);
        }

        // Single JSON Payload blob output per stability rules
        output(envelope('search', 'search', results, { 
          ok: true, 
          mode,
          engine, 
          query: q 
        }));

      } catch (err) {
        // Enforce structured missing-key boundaries / HTTP failures visually to agent pipelines natively
        const failureData = {
          ok: false,
          engine: opts.engine || 'ddg',
          query,
          error: {
            code: err.code || 'UNKNOWN_ERROR',
            message: err.message,
            status: err.status || null
          }
        };

        output(envelope('search', 'search', null, failureData));
      }
    });

  return cmd;
}
