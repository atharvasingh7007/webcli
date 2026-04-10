/**
 * platforms/hackernews.js
 * HackerNews — uses the official Firebase JSON API (no auth needed).
 * https://github.com/HackerNews/API
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON } from '../core/exec.js';

const HN_API = 'https://hacker-news.firebaseio.com/v0';
const ALGOLIA = 'https://hn.algolia.com/api/v1';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchItem(id) {
  return fetchJSON(`${HN_API}/item/${id}.json`);
}

async function fetchItems(ids, limit) {
  const slice = ids.slice(0, limit);
  return Promise.all(slice.map(id => fetchItem(id)));
}

function formatItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    type: item.type,
    title: item.title || null,
    url: item.url || null,
    text: item.text ? item.text.replace(/<[^>]+>/g, '').slice(0, 500) : null,
    score: item.score || 0,
    by: item.by || null,
    descendants: item.descendants || 0,
    time: item.time ? new Date(item.time * 1000).toISOString() : null,
    hn_url: `https://news.ycombinator.com/item?id=${item.id}`,
  };
}

async function fetchStoryList(type, limit) {
  const ids = await fetchJSON(`${HN_API}/${type}stories.json`);
  const items = await fetchItems(ids, limit);
  return items.map(formatItem).filter(Boolean);
}

// ── Command builder ───────────────────────────────────────────────────────────

export function hackernewsCommand() {
  const cmd = new Command('hackernews').alias('hn').description('HackerNews commands');

  // top
  cmd
    .command('top')
    .description('Top stories on HackerNews')
    .option('-l, --limit <n>', 'Number of results', '20')
    .action(withErrorHandling('hackernews', async (opts) => {
      const limit = parseInt(opts.limit);
      const results = await fetchStoryList('top', limit);
      output(envelope('hackernews', 'top', results));
    }));

  // new
  cmd
    .command('new')
    .description('Newest stories')
    .option('-l, --limit <n>', 'Number of results', '20')
    .action(withErrorHandling('hackernews', async (opts) => {
      const results = await fetchStoryList('new', parseInt(opts.limit));
      output(envelope('hackernews', 'new', results));
    }));

  // best
  cmd
    .command('best')
    .description('Best stories')
    .option('-l, --limit <n>', 'Number of results', '20')
    .action(withErrorHandling('hackernews', async (opts) => {
      const results = await fetchStoryList('best', parseInt(opts.limit));
      output(envelope('hackernews', 'best', results));
    }));

  // ask
  cmd
    .command('ask')
    .description('Ask HN posts')
    .option('-l, --limit <n>', 'Number of results', '15')
    .action(withErrorHandling('hackernews', async (opts) => {
      const results = await fetchStoryList('ask', parseInt(opts.limit));
      output(envelope('hackernews', 'ask', results));
    }));

  // show
  cmd
    .command('show')
    .description('Show HN posts')
    .option('-l, --limit <n>', 'Number of results', '15')
    .action(withErrorHandling('hackernews', async (opts) => {
      const results = await fetchStoryList('show', parseInt(opts.limit));
      output(envelope('hackernews', 'show', results));
    }));

  // search
  cmd
    .command('search <query>')
    .description('Search HackerNews via Algolia')
    .option('-l, --limit <n>', 'Number of results', '20')
    .option('--sort <by>', 'Sort by: relevance | date', 'relevance')
    .option('--type <type>', 'Filter by type: story | comment | ask | show | job', 'story')
    .action(withErrorHandling('hackernews', async (query, opts) => {
      const endpoint = opts.sort === 'date' ? 'search_by_date' : 'search';
      const url = new URL(`${ALGOLIA}/${endpoint}`);
      url.searchParams.set('query', query);
      url.searchParams.set('hitsPerPage', opts.limit);
      if (opts.type) url.searchParams.set('tags', opts.type);

      const data = await fetchJSON(url.toString());
      const results = data.hits.map(h => ({
        id: h.objectID,
        type: h._tags?.[0] || 'story',
        title: h.title || h.comment_text?.slice(0, 100) || null,
        url: h.url || null,
        score: h.points || 0,
        by: h.author,
        comments: h.num_comments || 0,
        time: h.created_at,
        hn_url: `https://news.ycombinator.com/item?id=${h.objectID}`,
      }));

      output(envelope('hackernews', 'search', results, { query }));
    }));

  // item
  cmd
    .command('item <id>')
    .description('Get a specific HN item with top comments')
    .option('--comments <n>', 'Number of top comments to fetch', '10')
    .action(withErrorHandling('hackernews', async (id, opts) => {
      const item = await fetchItem(parseInt(id));
      const formatted = formatItem(item);

      // fetch top-level comments
      if (item.kids && item.kids.length > 0) {
        const commentIds = item.kids.slice(0, parseInt(opts.comments));
        const comments = await Promise.all(commentIds.map(cid => fetchItem(cid)));
        formatted.top_comments = comments
          .filter(c => c && !c.deleted && !c.dead)
          .map(c => ({
            id: c.id,
            by: c.by,
            text: c.text ? c.text.replace(/<[^>]+>/g, '').slice(0, 800) : null,
            time: c.time ? new Date(c.time * 1000).toISOString() : null,
          }));
      }

      output(envelope('hackernews', 'item', formatted));
    }));

  // user
  cmd
    .command('user <username>')
    .description('Get HackerNews user profile and recent submissions')
    .action(withErrorHandling('hackernews', async (username) => {
      const user = await fetchJSON(`${HN_API}/user/${username}.json`);
      if (!user) {
        throw new Error(`User not found: ${username}`);
      }

      const recentIds = (user.submitted || []).slice(0, 10);
      const recent = await fetchItems(recentIds, 10);

      output(envelope('hackernews', 'user', {
        username: user.id,
        karma: user.karma,
        created: new Date(user.created * 1000).toISOString(),
        about: user.about ? user.about.replace(/<[^>]+>/g, '') : null,
        recent_submissions: recent.map(formatItem).filter(Boolean),
      }));
    }));

  return cmd;
}
