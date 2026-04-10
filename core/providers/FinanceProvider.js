/**
 * core/providers/FinanceProvider.js
 * Base interface for resolving capital market tickers.
 */

export class FinanceProvider {
  /**
   * Quote a ticker symbol.
   * @param {string} symbol
   * @param {object} opts
   * @returns {Promise<{ type: string, symbol: string, price: object, fundamentals: object, market: object }>}
   */
  async quote(symbol, opts = {}) {
    throw new Error('Not implemented');
  }
}
