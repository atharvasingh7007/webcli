/**
 * core/providers/BraveProvider.js
 * Brave Search engine stub requiring auth key.
 */

import { SearchProvider } from './SearchProvider.js';

export class BraveProvider extends SearchProvider {
  async search(query, opts = {}) {
    if (!process.env.BRAVE_API_KEY) {
      const err = new Error("BRAVE_API_KEY is required to use engine 'brave'.");
      err.code = 'MISSING_API_KEY';
      throw err;
    }
    // Stub implementation placeholder
    throw new Error('Brave Search implementation pending.');
  }
}
