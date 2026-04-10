/**
 * platforms/devto.js
 * Dev.to — uses the public Forem API. No auth needed for reads.
 * Great for agents researching dev tutorials, trends, community discussions.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON } from '../core/exec.js';

const API = 'https://dev.to/api';

function formatArticle(a) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    url: a.url,
    cover_image: a.cover_image,
    tags: a.tag_list,
    author: {
      name: a.user?.name,
      username: a.user?.username,
    },
    reactions: a.public_reactions_count,
    comments: a.comments_count,
    reading_time: a.reading_time_minutes,
    published_at: a.published_at,
  };
}

export function devtoCommand() {
  const cmd = new Command('devto').alias('dev').description('Dev.to article commands');

  // feed — latest articles
  cmd
    .command('feed')
    .description('Latest articles on Dev.to')
    .option('-l, --limit <n>', 'Number of results', '15')
    .option('--tag <tag>', 'Filter by tag (e.g. javascript, python, webdev)')
    .option('--top <days>', 'Top articles in last N days (7, 30, 365)')
    .action(withErrorHandling('devto', async (opts) => {
      const url = new URL(`${API}/articles`);
      url.searchParams.set('per_page', opts.limit);
      if (opts.tag) url.searchParams.set('tag', opts.tag);
      if (opts.top) {
        url.searchParams.set('top', opts.top);
      } else {
        url.searchParams.set('state', 'fresh');
      }

      const data = await fetchJSON(url.toString());
      output(envelope('devto', 'feed', data.map(formatArticle), {
        tag: opts.tag || 'all',
        period: opts.top ? `last ${opts.top} days` : 'fresh',
      }));
    }));

  // search
  cmd
    .command('search <query>')
    .description('Search Dev.to articles')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('devto', async (query, opts) => {
      const url = new URL(`${API}/articles/search`);
      url.searchParams.set('q', query);
      url.searchParams.set('per_page', opts.limit);

      const data = await fetchJSON(url.toString());
      // search endpoint returns different shape
      const articles = Array.isArray(data) ? data : data.result || [];
      output(envelope('devto', 'search', articles.map(formatArticle), { query }));
    }));

  // article — get full article by ID or slug
  cmd
    .command('article <id>')
    .description('Get a full Dev.to article by ID or slug')
    .action(withErrorHandling('devto', async (id) => {
      const data = await fetchJSON(`${API}/articles/${id}`);

      output(envelope('devto', 'article', {
        ...formatArticle(data),
        body_markdown: data.body_markdown?.slice(0, 8000),
      }));
    }));

  // user — get articles by a user
  cmd
    .command('user <username>')
    .description('Get articles by a Dev.to user')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('devto', async (username, opts) => {
      const url = new URL(`${API}/articles`);
      url.searchParams.set('username', username);
      url.searchParams.set('per_page', opts.limit);

      const data = await fetchJSON(url.toString());
      output(envelope('devto', 'user', data.map(formatArticle), { username }));
    }));

  // tags — trending tags
  cmd
    .command('tags')
    .description('Get trending Dev.to tags')
    .option('-l, --limit <n>', 'Number of tags', '20')
    .action(withErrorHandling('devto', async (opts) => {
      const url = new URL(`${API}/tags`);
      url.searchParams.set('per_page', opts.limit);

      const data = await fetchJSON(url.toString());
      const results = data.map(t => ({
        name: t.name,
        bg_color: t.bg_color,
        text_color: t.text_color,
      }));

      output(envelope('devto', 'tags', results));
    }));

  return cmd;
}
