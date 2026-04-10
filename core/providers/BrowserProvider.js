/**
 * core/providers/BrowserProvider.js
 * Base interface for headless document parsers.
 */

export class BrowserProvider {
  /**
   * Fetch a URL and return clean text/markdown content.
   * @param {string} url
   * @param {object} opts
   * @returns {Promise<{content: string, method: string}>}
   */
  async read(url, opts = {}) {
    throw new Error('Not implemented');
  }
}
