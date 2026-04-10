/**
 * platforms/arxiv.js
 * ArXiv — uses the public ArXiv API. No auth needed.
 * Extremely useful for AI/ML/CS/Physics agents researching papers.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchText } from '../core/exec.js';

const API = 'https://export.arxiv.org/api/query';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseXML(xml) {
  // Lightweight XML field extractor — no external deps
  const getField = (str, tag) => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');
    const matches = [];
    let m;
    while ((m = re.exec(str)) !== null) matches.push(m[1].trim());
    return matches;
  };

  const getAttr = (str, tag, attr) => {
    const re = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'g');
    const matches = [];
    let m;
    while ((m = re.exec(str)) !== null) matches.push(m[1]);
    return matches;
  };

  const entries = [];
  const entryBlocks = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

  for (const block of entryBlocks) {
    const id = getField(block, 'id')[0]?.replace('http://arxiv.org/abs/', '').trim();
    const title = getField(block, 'title')[0]?.replace(/\s+/g, ' ');
    const summary = getField(block, 'summary')[0]?.replace(/\s+/g, ' ').trim();
    const published = getField(block, 'published')[0];
    const updated = getField(block, 'updated')[0];

    const authorNames = getField(block, 'name');
    const categories = getAttr(block, 'category', 'term');
    const primaryCategory = getAttr(block, 'arxiv:primary_category', 'term')[0];

    // Extract PDF link
    const pdfMatch = block.match(/href="([^"]*\/pdf\/[^"]*)"/);
    const pdf = pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${id}`;

    entries.push({
      id,
      title,
      summary: summary?.slice(0, 600),
      authors: authorNames,
      published,
      updated,
      categories,
      primary_category: primaryCategory,
      url: `https://arxiv.org/abs/${id}`,
      pdf,
    });
  }

  return entries;
}

async function arxivFetch(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  const xml = await fetchText(url.toString());
  return parseXML(xml);
}

// ── Command builder ───────────────────────────────────────────────────────────

export function arxivCommand() {
  const cmd = new Command('arxiv').description('ArXiv research paper commands');

  // search
  cmd
    .command('search <query>')
    .description('Search ArXiv papers')
    .option('-l, --limit <n>', 'Number of results', '10')
    .option('--category <cat>', 'Filter by category (e.g. cs.AI, cs.LG, cs.CV, physics)')
    .option('--sort <by>', 'Sort: relevance | lastUpdatedDate | submittedDate', 'relevance')
    .action(withErrorHandling('arxiv', async (query, opts) => {
      let q = `all:${query}`;
      if (opts.category) q += ` AND cat:${opts.category}`;

      const results = await arxivFetch({
        search_query: q,
        max_results: opts.limit,
        sortBy: opts.sort === 'relevance' ? 'relevance' : opts.sort,
        sortOrder: 'descending',
      });

      output(envelope('arxiv', 'search', results, { query, category: opts.category || 'all' }));
    }));

  // recent — latest papers in a category
  cmd
    .command('recent')
    .description('Most recent papers in a category')
    .option('-l, --limit <n>', 'Number of results', '10')
    .option('--category <cat>', 'ArXiv category', 'cs.AI')
    .action(withErrorHandling('arxiv', async (opts) => {
      const results = await arxivFetch({
        search_query: `cat:${opts.category}`,
        max_results: opts.limit,
        sortBy: 'submittedDate',
        sortOrder: 'descending',
      });

      output(envelope('arxiv', 'recent', results, { category: opts.category }));
    }));

  // get — fetch a specific paper by ID
  cmd
    .command('get <id>')
    .description('Get a specific ArXiv paper by ID (e.g. 2312.00752)')
    .action(withErrorHandling('arxiv', async (id) => {
      // Strip any URL prefix
      const cleanId = id.replace(/.*arxiv\.org\/(abs|pdf)\//, '').replace('.pdf', '').trim();

      const results = await arxivFetch({ id_list: cleanId, max_results: 1 });
      if (!results.length) throw new Error(`Paper not found: ${cleanId}`);

      output(envelope('arxiv', 'get', results[0]));
    }));

  // author — find papers by an author
  cmd
    .command('author <name>')
    .description('Find papers by an author')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('arxiv', async (name, opts) => {
      const results = await arxivFetch({
        search_query: `au:${name.replace(/ /g, '_')}`,
        max_results: opts.limit,
        sortBy: 'submittedDate',
        sortOrder: 'descending',
      });

      output(envelope('arxiv', 'author', results, { author: name }));
    }));

  return cmd;
}
