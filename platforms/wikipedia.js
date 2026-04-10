/**
 * platforms/wikipedia.js
 * Wikipedia — uses the public MediaWiki REST API. Zero auth needed.
 * Great for agents needing instant factual grounding.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON } from '../core/exec.js';

const API = 'https://en.wikipedia.org/api/rest_v1';
const SEARCH_API = 'https://en.wikipedia.org/w/api.php';

export function wikipediaCommand() {
  const cmd = new Command('wikipedia').alias('wiki').description('Wikipedia commands');

  // search
  cmd
    .command('search <query>')
    .description('Search Wikipedia articles')
    .option('-l, --limit <n>', 'Number of results', '5')
    .action(withErrorHandling('wikipedia', async (query, opts) => {
      const url = new URL(SEARCH_API);
      url.searchParams.set('action', 'query');
      url.searchParams.set('list', 'search');
      url.searchParams.set('srsearch', query);
      url.searchParams.set('srlimit', opts.limit);
      url.searchParams.set('format', 'json');
      url.searchParams.set('origin', '*');

      const data = await fetchJSON(url.toString());
      const results = data.query.search.map(r => ({
        title: r.title,
        snippet: r.snippet.replace(/<[^>]+>/g, ''),
        page_id: r.pageid,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`,
        timestamp: r.timestamp,
        word_count: r.wordcount,
      }));

      output(envelope('wikipedia', 'search', results, { query }));
    }));

  // summary — most useful for agents: get the TL;DR of any topic
  cmd
    .command('summary <title>')
    .description('Get a summary of a Wikipedia article')
    .action(withErrorHandling('wikipedia', async (title) => {
      const encoded = encodeURIComponent(title.replace(/ /g, '_'));
      const data = await fetchJSON(`${API}/page/summary/${encoded}`);

      output(envelope('wikipedia', 'summary', {
        title: data.title,
        description: data.description,
        extract: data.extract,
        url: data.content_urls?.desktop?.page,
        thumbnail: data.thumbnail?.source || null,
        coordinates: data.coordinates || null,
        last_modified: data.timestamp,
      }));
    }));

  // full — get the full article as plain text (agents can then Q&A over it)
  cmd
    .command('full <title>')
    .description('Get the full plain text of a Wikipedia article')
    .option('--sections', 'Include section breakdown')
    .action(withErrorHandling('wikipedia', async (title, opts) => {
      const encoded = encodeURIComponent(title.replace(/ /g, '_'));

      // Get sections
      const url = new URL(SEARCH_API);
      url.searchParams.set('action', 'parse');
      url.searchParams.set('page', title);
      url.searchParams.set('prop', 'sections|wikitext');
      url.searchParams.set('format', 'json');
      url.searchParams.set('origin', '*');

      const data = await fetchJSON(url.toString());
      if (data.error) throw new Error(data.error.info || 'Article not found');

      const wikitext = data.parse.wikitext['*']
        .replace(/\{\{[^}]+\}\}/g, '')       // remove templates
        .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2') // [[link|text]] → text
        .replace(/'''([^']+)'''/g, '$1')      // bold
        .replace(/''([^']+)''/g, '$1')        // italic
        .replace(/==+([^=]+)==+/g, '\n## $1\n') // headers
        .replace(/<[^>]+>/g, '')              // html tags
        .replace(/\n{3,}/g, '\n\n')           // excess newlines
        .trim();

      const sections = data.parse.sections.map(s => ({
        index: s.index,
        title: s.line,
        level: s.level,
      }));

      output(envelope('wikipedia', 'full', {
        title: data.parse.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        word_count: wikitext.split(/\s+/).length,
        sections: opts.sections ? sections : undefined,
        content: wikitext.slice(0, 50000), // cap at 50k chars
      }));
    }));

  // related — find related articles
  cmd
    .command('related <title>')
    .description('Get related Wikipedia articles')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('wikipedia', async (title, opts) => {
      const encoded = encodeURIComponent(title.replace(/ /g, '_'));
      const data = await fetchJSON(`${API}/page/related/${encoded}`);

      const results = (data.pages || []).slice(0, parseInt(opts.limit)).map(p => ({
        title: p.title,
        description: p.description,
        extract: p.extract?.slice(0, 200),
        url: p.content_urls?.desktop?.page,
      }));

      output(envelope('wikipedia', 'related', results, { title }));
    }));

  return cmd;
}
