/**
 * core/providers/TavilyProvider.js
 * Tavily Search engine stub requiring auth key.
 */

import { SearchProvider } from './SearchProvider.js';

export class TavilyProvider extends SearchProvider {
  async search(query, opts = {}) {
    if (!process.env.TAVILY_API_KEY) {
      const err = new Error("TAVILY_API_KEY is required to use engine 'tavily'.");
      err.code = 'MISSING_API_KEY';
      throw err;
    }
    // Stub implementation placeholder
    throw new Error('Tavily Search implementation pending.');
  }
}
