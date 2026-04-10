/**
 * core/providers/TavilyProvider.js
 * Tavily Search engine stub requiring auth key.
 */

import { SearchProvider } from './SearchProvider.js';

export class TavilyProvider extends SearchProvider {
  async search(query, opts = {}) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      const err = new Error("TAVILY_API_KEY is required to use engine 'tavily'.");
      err.code = 'MISSING_API_KEY';
      throw err;
    }

    const { default: fetch } = await import('node-fetch');
    const limit = opts.limit ? parseInt(opts.limit) : 10;

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        max_results: limit
      })
    });

    if (!res.ok) {
      const err = new Error(`Tavily error: HTTP ${res.status}`);
      err.code = 'HTTP_ERROR';
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const results = (data?.results || []).map((item, index) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.content || '',
      source: 'tavily',
      rank: index + 1
    }));

    return {
      engine: 'tavily',
      query,
      results: results.slice(0, limit)
    };
  }
}
