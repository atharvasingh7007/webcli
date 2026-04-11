/**
 * platforms/rss.js
 * Fetches and cleanly parses standard XML feeds (RSS) into structured payloads.
 */
import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import pLimit from 'p-limit';

export function rssCommand() {
  const cmd = new Command('rss').description('Fetch any standard XML feed cleanly structured');
  
  cmd
    .argument('<urls...>', 'URLs of RSS feeds')
    .action(withErrorHandling('rss', async (urls) => {
      const { default: fetch } = await import('node-fetch');
      const limit = pLimit(5);
      
      const results = await Promise.all(urls.map(url => limit(async () => {
        try {
          const res = await fetch(url, { headers: { 'User-Agent': 'webcli-rss/1.0' } });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const xml = await res.text();
          
          // Natively decouple blocks securely avoiding dependency injections
          const itemsRaw = xml.split(/<item>|<entry>/i).slice(1);
          const items = itemsRaw.map(raw => {
             const titleMatch = raw.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/is);
             const linkMatch = raw.match(/<link[^>]*href=["']([^"']+)["'][^>]*>|<link(?:[^>]*)?>(.*?)<\/link>/is);
             const descMatch = raw.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>|<summary[^>]*><!\[CDATA\[(.*?)\]\]><\/summary>|<summary[^>]*>(.*?)<\/summary>/is);
             const pubMatch = raw.match(/<pubDate[^>]*>(.*?)<\/pubDate>|<published[^>]*>(.*?)<\/published>|<updated[^>]*>(.*?)<\/updated>/is);
             
             return {
                title: titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '',
                link: linkMatch ? (linkMatch[1] || linkMatch[2] || '').trim() : '',
                description: descMatch ? (descMatch[1] || descMatch[2] || descMatch[3] || descMatch[4] || '').replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 800) : '',
                pubDate: pubMatch ? (pubMatch[1] || pubMatch[2] || pubMatch[3] || '').trim() : ''
             };
          });

          return { url, ok: true, count: items.length, items };
        } catch (err) {
          return { url, ok: false, error: { code: 'HTTP_ERROR', message: err.message } };
        }
      })));

      output(envelope('rss', 'rss_batch', results, { ok: true }));
    }));

  return cmd;
}
