/**
 * core/providers/SearchProvider.js
 * Base interface for search engines.
 */

export class SearchProvider {
  /**
   * Search an engine and return structured results.
   * @param {string} query
   * @param {object} opts
   * @returns {Promise<{ engine: string, query: string, results: Array }>}
   */
  async search(query, opts = {}) {
    throw new Error('Not implemented');
  }
}
