/**
 * core/providers/BraveProvider.js
 * Brave Search engine stub requiring auth key.
 */

import { SearchProvider } from './SearchProvider.js';

export class BraveProvider extends SearchProvider {
  async search(query, opts = {}) {
    const apiKey = process.env.BRAVE_API_KEY;
    if (!apiKey) {
      const err = new Error("BRAVE_API_KEY is required to use engine 'brave'.");
      err.code = 'MISSING_API_KEY';
      throw err;
    }

    const { default: fetch } = await import('node-fetch');
    const limit = opts.limit ? parseInt(opts.limit) : 10;
    
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', Math.min(20, limit).toString());

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    if (!res.ok) {
      const err = new Error(`Brave Search error: HTTP ${res.status}`);
      err.code = 'HTTP_ERROR';
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const results = (data?.web?.results || []).map((item, index) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || '',
      source: 'brave',
      rank: index + 1
    }));

    return {
      engine: 'brave',
      query,
      results: results.slice(0, limit)
    };
  }
}
