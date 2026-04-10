/**
 * core/providers/YahooFinanceProvider.js
 * Equity market data provider scraping undocumented v8 endpoints.
 */

import { FinanceProvider } from './FinanceProvider.js';
import { fetchJSON } from '../exec.js';

export class YahooFinanceProvider extends FinanceProvider {
  async quote(symbol, opts = {}) {
    // Utilize the fast v8 charts endpoint since it clusters required metadata beautifully
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    
    // Always force cache skip by default for price quotes
    const fetchOpts = { ...opts };
    if (fetchOpts.cache === undefined) fetchOpts.cache = false;
    
    let res;
    try {
      res = await fetchJSON(url, fetchOpts);
    } catch (err) {
      if (err.status === 404) {
         err.code = 'NOT_FOUND';
         err.message = `Symbol '${symbol}' not found on Yahoo Finance.`;
      }
      throw err;
    }
    
    if (!res || !res.chart || !res.chart.result || !res.chart.result[0]) {
      const err = new Error(`Symbol '${symbol}' not found or incorrectly structured in Yahoo JSON.`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    
    const data = res.chart.result[0].meta;
    const isCrypto = data.instrumentType === 'CRYPTOCURRENCY';

    return {
      type: "quote",
      symbol: data.symbol || symbol.toUpperCase(),
      name: data.shortName || data.longName || data.symbol,
      asset_type: isCrypto ? 'crypto' : 'equity',
      source: "yahoo",
      price: {
        value: data.regularMarketPrice,
        currency: data.currency || "USD",
        change: data.regularMarketPrice && data.previousClose 
           ? Number((data.regularMarketPrice - data.previousClose).toFixed(2)) 
           : null,
        change_percent: data.regularMarketPrice && data.previousClose 
           ? Number((((data.regularMarketPrice - data.previousClose) / data.previousClose) * 100).toFixed(2))
           : null
      },
      fundamentals: {
        market_cap: null, // Market cap omitted since v8 charts only returns trading metadata strictly
        pe_ratio: null,
        day_range: { 
          low: data.regularMarketDayLow || null, 
          high: data.regularMarketDayHigh || null 
        },
        fifty_two_week_range: {
          low: data.fiftyTwoWeekLow || null,
          high: data.fiftyTwoWeekHigh || null
        }
      },
      market: {
        exchange: data.exchangeName || "UNKNOWN",
        delayed: data.exchangeDataDelayedBy > 0,
        as_of: data.regularMarketTime ? new Date(data.regularMarketTime * 1000).toISOString() : new Date().toISOString()
      }
    };
  }
}
