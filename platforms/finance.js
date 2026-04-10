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
    .command('quote <symbol>')
    .description('Get structured price quotes for equities or crypto')
    .option('-t, --asset-type <type>', 'Force routing logic (equity | crypto)')
    .action(async (symbol, opts) => {
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

        const data = await provider.quote(symbol, opts);
        
        output(envelope('finance', 'quote', data, { ok: true }));
      } catch (err) {
        const failureData = {
          ok: false,
          type: 'quote',
          symbol: symbol.toUpperCase(),
          error: {
            code: err.code || 'UNKNOWN_ERROR',
            message: err.message
          }
        };
        output(envelope('finance', 'quote', null, failureData));
      }
    });

  return cmd;
}
