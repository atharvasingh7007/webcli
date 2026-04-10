/**
 * platforms/finance.js
 * Universal finance search proxying explicitly between Yahoo Finance (Equities) and CoinGecko (Crypto)
 */

import { Command } from 'commander';
import { output, envelope } from '../core/output.js';
import { YahooFinanceProvider } from '../core/providers/YahooFinanceProvider.js';
import { CoinGeckoProvider } from '../core/providers/CoinGeckoProvider.js';

export function financeCommand() {
  const cmd = new Command('finance').alias('fin').description('Financial and Capital Market Data');

  cmd
    .command('quote <symbols...>')
    .description('Get structured price quotes for equities or crypto')
    .option('-t, --asset-type <type>', 'Force routing logic (equity | crypto)')
    .action(async (symbols, opts) => {
      try {
        let provider;
        const typeStr = opts.assetType?.toLowerCase();

        if (typeStr === 'equity' || typeStr === 'stock') {
          provider = new YahooFinanceProvider();
        } else if (typeStr === 'crypto' || typeStr === 'coin') {
          provider = new CoinGeckoProvider();
        } else {
          // Rigid bounds to avoid magic heuristic failures
          const err = new Error('Please explicitly provide --asset-type equity or --asset-type crypto to safely resolve the quoting provider.');
          err.code = 'AMBIGUOUS_ASSET_TYPE';
          throw err;
        }

        if (symbols.length === 1) {
          try {
            const data = await provider.quote(symbols[0], opts);
            output(envelope('finance', 'quote', data, { ok: true }));
          } catch (err) {
            output(envelope('finance', 'quote', null, {
              ok: false,
              type: 'quote',
              symbol: symbols[0].toUpperCase(),
              error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
            }));
          }
          return;
        }

        // Batch routing
        const { default: pLimit } = await import('p-limit');
        const limit = pLimit(5);
        const results = new Array(symbols.length);

        await Promise.all(symbols.map((sym, i) => limit(async () => {
          try {
             const data = await provider.quote(sym, opts);
             results[i] = { ok: true, ...data };
          } catch (err) {
             results[i] = {
               symbol: sym.toUpperCase(),
               ok: false,
               error: { code: err.code || 'UNKNOWN_ERROR', message: err.message }
             };
          }
        })));

        output(envelope('finance', 'quote_batch', results, { 
          ok: true,
          asset_type: typeStr === 'stock' ? 'equity' : (typeStr === 'coin' ? 'crypto' : typeStr)
        }));
      } catch (err) {
        output(envelope('finance', 'quote', null, {
          ok: false,
          error: {
            code: err.code || 'UNKNOWN_ERROR',
            message: err.message
          }
        }));
      }
    });

  return cmd;
}
