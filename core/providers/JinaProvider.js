/**
 * core/providers/JinaProvider.js
 * Jina.ai implementation for headless URL reading.
 */

import { BrowserProvider } from './BrowserProvider.js';
import { fetchText } from '../exec.js';

export class JinaProvider extends BrowserProvider {
  async read(url, opts = {}) {
    // 1. Try Jina Reader
    if (opts.jina !== false) {
      try {
        const jinaUrl = `https://r.jina.ai/${url}`;
        const content = await fetchText(jinaUrl, {
          headers: {
            'Accept': 'text/plain',
            'X-Return-Format': 'markdown',
          },
        });
        return { content, method: 'jina' };
      } catch {
        // Fall back to direct fetch if Jina fails completely
      }
    }

    // 2. Fallback: direct fetch + HTML strip
    try {
      const raw = await fetchText(url);
      if (opts.raw) {
        return { content: raw, method: 'raw' };
      }
      
      const content = raw
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<head[\s\S]*?<\/head>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
        .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
        
      return { content, method: 'direct' };
    } catch (err) {
      throw new Error(`Could not fetch URL: ${err.message}`);
    }
  }
}
