/**
 * platforms/stackoverflow.js
 * Stack Overflow — uses the Stack Exchange API v2.3 (no auth for read-only).
 * https://api.stackexchange.com
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON } from '../core/exec.js';

const API = 'https://api.stackexchange.com/2.3';
const DEFAULTS = { site: 'stackoverflow', filter: 'withbody' };

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildUrl(path, params = {}) {
  const url = new URL(`${API}${path}`);
  const merged = { ...DEFAULTS, ...params };
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  return url.toString();
}

function stripHtml(html) {
  return (html || '')
    .replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, '\n```\n$1\n```\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .trim();
}

function formatQuestion(q) {
  return {
    id: q.question_id,
    title: q.title,
    body: q.body ? stripHtml(q.body).slice(0, 600) : null,
    tags: q.tags,
    score: q.score,
    answer_count: q.answer_count,
    is_answered: q.is_answered,
    accepted_answer_id: q.accepted_answer_id || null,
    author: q.owner?.display_name,
    created_at: new Date(q.creation_date * 1000).toISOString(),
    url: q.link,
  };
}

function formatAnswer(a) {
  return {
    id: a.answer_id,
    body: stripHtml(a.body).slice(0, 1500),
    score: a.score,
    is_accepted: a.is_accepted,
    author: a.owner?.display_name,
    created_at: new Date(a.creation_date * 1000).toISOString(),
  };
}

// ── Command builder ───────────────────────────────────────────────────────────

export function stackoverflowCommand() {
  const cmd = new Command('stackoverflow').alias('so').description('Stack Overflow commands');

  // search
  cmd
    .command('search <query>')
    .description('Search Stack Overflow questions')
    .option('-l, --limit <n>', 'Number of results', '10')
    .option('--sort <by>', 'Sort: relevance | votes | activity | creation', 'relevance')
    .option('--tag <tag>', 'Filter by tag (e.g. python, javascript)')
    .option('--site <site>', 'Stack Exchange site', 'stackoverflow')
    .action(withErrorHandling('stackoverflow', async (query, opts) => {
      const params = {
        intitle: query,
        pagesize: opts.limit,
        sort: opts.sort === 'relevance' ? 'activity' : opts.sort,
        order: 'desc',
        site: opts.site,
        filter: 'withbody',
      };
      if (opts.tag) params.tagged = opts.tag;

      const data = await fetchJSON(buildUrl('/search/advanced', params));
      const results = (data.items || []).map(formatQuestion);
      output(envelope('stackoverflow', 'search', results, { query }));
    }));

  // question — get a question with its answers
  cmd
    .command('question <id>')
    .description('Get a Stack Overflow question with all answers')
    .option('--site <site>', 'Stack Exchange site', 'stackoverflow')
    .action(withErrorHandling('stackoverflow', async (id, opts) => {
      const [qData, aData] = await Promise.all([
        fetchJSON(buildUrl(`/questions/${id}`, { site: opts.site, filter: 'withbody' })),
        fetchJSON(buildUrl(`/questions/${id}/answers`, { site: opts.site, filter: 'withbody', sort: 'votes', order: 'desc', pagesize: 5 })),
      ]);

      const question = formatQuestion(qData.items?.[0]);
      const answers = (aData.items || []).map(formatAnswer);

      output(envelope('stackoverflow', 'question', { question, answers }));
    }));

  // similar — find similar questions
  cmd
    .command('similar <query>')
    .description('Find questions similar to a description')
    .option('-l, --limit <n>', 'Number of results', '5')
    .option('--site <site>', 'Stack Exchange site', 'stackoverflow')
    .action(withErrorHandling('stackoverflow', async (query, opts) => {
      const data = await fetchJSON(buildUrl('/similar', {
        title: query,
        pagesize: opts.limit,
        sort: 'relevance',
        order: 'desc',
        site: opts.site,
        filter: 'withbody',
      }));
      const results = (data.items || []).map(formatQuestion);
      output(envelope('stackoverflow', 'similar', results, { query }));
    }));

  // tags — get info about a tag
  cmd
    .command('tags <tag>')
    .description('Get info about a Stack Overflow tag')
    .option('--site <site>', 'Stack Exchange site', 'stackoverflow')
    .action(withErrorHandling('stackoverflow', async (tag, opts) => {
      const data = await fetchJSON(buildUrl('/tags', {
        inname: tag,
        pagesize: 5,
        sort: 'popular',
        order: 'desc',
        site: opts.site,
      }));
      output(envelope('stackoverflow', 'tags', data.items || [], { tag }));
    }));

  return cmd;
}
