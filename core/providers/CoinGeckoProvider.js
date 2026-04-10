/**
 * core/providers/CoinGeckoProvider.js
 * Crypto market data utilizing CoinGecko's free tier.
 */

import { FinanceProvider } from './FinanceProvider.js';
import { fetchJSON } from '../exec.js';

export class CoinGeckoProvider extends FinanceProvider {
  async quote(symbol, opts = {}) {
    // 1. Resolve Symbol to ID natively.
    // fetchJSON relies on core/cache.js (60s TTL), so multiple requests for 'BTC' will not spam mapping API natively.
    const searchRes = await fetchJSON(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`);
    const match = searchRes?.coins?.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    
    if (!match) {
      const err = new Error(`Symbol '${symbol}' not found on CoinGecko search.`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    const id = match.id;

    // 2. Fetch Deep Coin Data
    // We enforce 0 caching for deep quote payloads to preserve price integrity unless cache flag passed explicitly
    const fetchOpts = { ...opts };
    if (fetchOpts.cache === undefined) fetchOpts.cache = false;

    const coinUrl = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const coinRes = await fetchJSON(coinUrl, fetchOpts);
    
    const market = coinRes.market_data || {};
    
    return {
      type: "quote",
      symbol: symbol.toUpperCase(),
      name: coinRes.name || match.name,
      asset_type: "crypto",
      source: "coingecko",
      price: {
        value: market.current_price?.usd || null,
        currency: "USD",
        change: market.price_change_24h || null,
        change_percent: market.price_change_percentage_24h || null
      },
      fundamentals: {
        market_cap: market.market_cap?.usd || null,
        pe_ratio: null,
        day_range: { 
          low: market.low_24h?.usd || null, 
          high: market.high_24h?.usd || null 
        },
        fifty_two_week_range: null // Not cleanly shipped in standard CG coin response without history graphs
      },
      market: {
        exchange: null,
        delayed: false, // CG free tier is near real-time averages globally
        as_of: market.last_updated ? new Date(market.last_updated).toISOString() : new Date().toISOString()
      }
    };
  }
}
