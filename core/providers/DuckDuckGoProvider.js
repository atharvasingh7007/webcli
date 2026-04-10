/**
 * core/providers/DuckDuckGoProvider.js
 * 0-auth Web Search via DuckDuckGo HTML scraping.
 */

import { SearchProvider } from './SearchProvider.js';

export class DuckDuckGoProvider extends SearchProvider {
  /**
   * Search query and return structured results.
   */
  async search(query, opts = {}) {
    const html = await this._fetchSearchHtml(query, opts);
    let results = this._parseResultsFromHtml(html);
    results = this._dedupeResults(results);
    
    // Enforce limits
    const limit = opts.limit ? parseInt(opts.limit) : 10;
    return {
      engine: 'ddg',
      query,
      results: results.slice(0, limit)
    };
  }

  /**
   * Pre-fetches HTML with pacing and 429 backoff.
   */
  async _fetchSearchHtml(query, opts) {
    // 1. Configurable pacing delay
    const delayMs = opts.delay !== undefined ? parseInt(opts.delay) : 1500;
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }

    const { default: fetch } = await import('node-fetch');
    const url = new URL('https://html.duckduckgo.com/html/');
    url.searchParams.set('q', query);

    let retries = 3;
    let backoff = 1000;

    while (retries >= 0) {
      const res = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });

      if (res.status === 429 || res.status >= 500) {
        if (retries === 0) {
          const err = new Error(`DuckDuckGo blocked the request (HTTP ${res.status}). Try using --delay 3000`);
          err.code = res.status === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR';
          err.status = res.status;
          throw err;
        }

        const retryAfter = res.headers.get('retry-after');
        let waitTime = backoff + Math.random() * backoff;
        
        if (retryAfter) {
          const seconds = parseInt(retryAfter);
          if (!isNaN(seconds)) waitTime = seconds * 1000;
        }

        await new Promise(r => setTimeout(r, waitTime));
        backoff *= 2;
        retries--;
        continue;
      }

      if (!res.ok) {
        const err = new Error(`DuckDuckGo error: HTTP ${res.status}`);
        err.code = 'HTTP_ERROR';
        err.status = res.status;
        throw err;
      }

      return res.text();
    }
  }

  /**
   * Parse results exclusively from HTML strings.
   */
  _parseResultsFromHtml(html) {
    const results = [];
    
    // Split into result blocks: <div class="result ...">...</div>
    const blocks = html.split(/class="result[ "]|class="result__snippet/).slice(1);
    
    for (const block of blocks) {
      if (!block.includes('href=')) continue;

      // Extract raw URL
      const urlMatch = block.match(/href="([^"]+)"/);
      let url = urlMatch ? urlMatch[1] : null;
      
      // DuckDuckGo routinely proxies links
      if (url && (url.includes('/l/?uddg=') || url.includes('/l/?reu='))) {
        try {
          const rawParams = url.split('?')[1].replace(/&amp;/g, '&');
          const params = new URLSearchParams(rawParams);
          url = params.get('uddg') || params.get('reu') || url;
        } catch { } // Leave intact if decoding fails
      }

      // Enforce absolute paths safely
      if (url && url.startsWith('//')) {
        url = 'https:' + url;
      } else if (url && url.startsWith('/')) {
        url = 'https://duckduckgo.com' + url;
      }

      // Title
      const titleMatch = block.match(/class="result__title[^>]*>[\s\S]*?<a[^>]*>(.*?)<\/a>/);
      let title = titleMatch ? titleMatch[1] : '';

      // Snippet
      const snippetMatch = block.match(/class="result__snippet[^>]*>([\s\S]*?)<\/a>/);
      let snippet = snippetMatch ? snippetMatch[1] : '';

      // Clean HTML elements completely
      title = title.replace(/<[^>]+>/g, '').replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
      snippet = snippet.replace(/<[^>]+>/g, '').replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\n/g, ' ').trim();
      
      if (url && url !== '') {
        results.push({ title, url, snippet, source: 'duckduckgo' });
      }
    }

    return results;
  }

  /**
   * Deduplicate and assign sequential ranks.
   */
  _dedupeResults(results) {
    const seen = new Set();
    const clean = [];
    let rank = 1;

    for (const r of results) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        clean.push({ ...r, rank: rank++ });
      }
    }
    return clean;
  }
}
