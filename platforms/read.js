/**
 * platforms/read.js
 * Universal URL reader — fetches any webpage and returns clean readable text.
 * Uses r.jina.ai as primary (free, no auth) with a direct fetch fallback.
 * This is the single most useful command for AI agents — "go read this page".
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchText, fetchJSON } from '../core/exec.js';

export function readCommand() {
  const cmd = new Command('read').description('Fetch any URL as clean readable text');

  cmd
    .argument('<url>', 'URL to fetch and read')
    .description('Fetch any webpage as clean markdown text (no auth needed)')
    .option('--raw', 'Return raw HTML instead of clean text')
    .option('--no-jina', 'Skip Jina reader, use direct fetch')
    .action(withErrorHandling('read', async (url, opts) => {
      // Validate URL
      try { new URL(url); } catch {
        throw new Error(`Invalid URL: ${url}`);
      }

      let content = null;
      let method = null;

      // 1. Try Jina Reader (best quality, free, no auth)
      if (opts.jina !== false) {
        try {
          const jinaUrl = `https://r.jina.ai/${url}`;
          content = await fetchText(jinaUrl, {
            headers: {
              'Accept': 'text/plain',
              'X-Return-Format': 'markdown',
            },
          });
          method = 'jina';
        } catch {
          // fall through to direct fetch
        }
      }

      // 2. Fallback: direct fetch + basic HTML strip
      if (!content) {
        try {
          const raw = await fetchText(url);
          if (opts.raw) {
            content = raw;
            method = 'raw';
          } else {
            content = raw
              // Remove script/style/head blocks
              .replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<head[\s\S]*?<\/head>/gi, '')
              .replace(/<nav[\s\S]*?<\/nav>/gi, '')
              .replace(/<footer[\s\S]*?<\/footer>/gi, '')
              .replace(/<header[\s\S]*?<\/header>/gi, '')
              // Convert headings
              .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
              .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
              .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
              // Convert lists
              .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
              // Convert links
              .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
              // Convert paragraphs and divs to newlines
              .replace(/<\/p>/gi, '\n\n')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<\/div>/gi, '\n')
              // Strip remaining tags
              .replace(/<[^>]+>/g, '')
              // Decode entities
              .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
              .replace(/&[a-z]+;/gi, ' ')
              // Clean whitespace
              .replace(/[ \t]+/g, ' ')
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            method = 'direct';
          }
        } catch (err) {
          throw new Error(`Could not fetch URL: ${err.message}`);
        }
      }

      output(envelope('read', 'read', {
        url,
        method,
        word_count: content.split(/\s+/).length,
        char_count: content.length,
        content: content.slice(0, 100000), // 100k char cap
      }));
    }));

  return cmd;
}
