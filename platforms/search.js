/**
 * platforms/search.js
 * Universal Web Search exposing DDG, Brave, and Tavily to AI agents.
 */

import { Command } from 'commander';
import { output, envelope } from '../core/output.js';
import { DuckDuckGoProvider } from '../core/providers/DuckDuckGoProvider.js';
import { BraveProvider } from '../core/providers/BraveProvider.js';
import { TavilyProvider } from '../core/providers/TavilyProvider.js';

export function searchCommand() {
  const cmd = new Command('search').description('Universal Web Search via multiple engines');

  cmd
    .argument('<query>', 'Search query')
    .option('-e, --engine <name>', 'Search engine to use (ddg|brave|tavily)', 'ddg')
    .option('-l, --limit <n>', 'Number of results to return', '10')
    .option('--delay <ms>', 'Throttling delay for DDG (default 1500, set 0 to disable)')
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
        const { engine, query: q, results } = await provider.search(query, opts);
        
        // Single JSON Payload blob output per stability rules
        output(envelope('search', 'search', results, { 
          ok: true, 
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
