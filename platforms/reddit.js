/**
 * platforms/reddit.js
 * Reddit — uses Reddit's public JSON API (no auth for read-only).
 * For user-specific endpoints, uses OAuth via stored credentials.
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { fetchJSON, fetchText } from '../core/exec.js';
import { getAuth, hasAuth } from '../core/auth.js';

const REDDIT_API = 'https://www.reddit.com';
const OAUTH_API = 'https://oauth.reddit.com';
// const USER_AGENT = 'webcli/1.0.0 by webcli-agent';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Auth / fetch helpers ──────────────────────────────────────────────────────

let _accessToken = null;
let _tokenExpiry = 0;

async function getAccessToken() {
  const auth = getAuth('reddit');
  if (!hasAuth('reddit', ['client_id', 'client_secret', 'username', 'password'])) {
    return null; // fall back to public API
  }

  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  const { default: fetch } = await import('node-fetch');
  const credentials = Buffer.from(`${auth.client_id}:${auth.client_secret}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=password&username=${encodeURIComponent(auth.username)}&password=${encodeURIComponent(auth.password)}`,
  });

  const data = await res.json();
  if (data.error) throw new Error(`Reddit auth failed: ${data.error}`);

  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _accessToken;
}

async function redditFetch(path, params = {}) {
  const token = await getAccessToken();
  const base = token ? OAUTH_API : REDDIT_API;
  const url = new URL(`${base}${path}.json`);
  url.searchParams.set('raw_json', '1');
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  // const headers = { 'User-Agent': USER_AGENT };
  // if (token) headers['Authorization'] = `Bearer ${token}`;
  const headers = {
    'User-Agent': USER_AGENT,
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return fetchJSON(url.toString(), { headers });
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatPost(post) {
  const p = post.data;
  return {
    id: p.id,
    title: p.title,
    selftext: p.selftext?.slice(0, 600) || null,
    url: p.url,
    permalink: `https://www.reddit.com${p.permalink}`,
    subreddit: p.subreddit,
    author: p.author,
    score: p.score,
    upvote_ratio: p.upvote_ratio,
    num_comments: p.num_comments,
    created_at: new Date(p.created_utc * 1000).toISOString(),
    flair: p.link_flair_text || null,
    is_self: p.is_self,
    media: p.media?.reddit_video?.fallback_url || null,
  };
}

function formatComment(comment) {
  const c = comment.data;
  return {
    id: c.id,
    author: c.author,
    body: c.body?.slice(0, 800) || null,
    score: c.score,
    created_at: new Date(c.created_utc * 1000).toISOString(),
    permalink: `https://www.reddit.com${c.permalink}`,
    replies: Array.isArray(c.replies?.data?.children)
      ? c.replies.data.children
        .filter(r => r.kind === 't1')
        .slice(0, 3)
        .map(r => ({
          author: r.data.author,
          body: r.data.body?.slice(0, 300),
          score: r.data.score,
        }))
      : [],
  };
}

// ── Command builder ───────────────────────────────────────────────────────────

export function redditCommand() {
  const cmd = new Command('reddit').description('Reddit commands');

  // hot
  cmd
    .command('hot')
    .description('Hot posts from a subreddit or frontpage')
    .option('-s, --subreddit <name>', 'Subreddit name (without r/)', 'all')
    .option('-l, --limit <n>', 'Number of results', '15')
    .action(withErrorHandling('reddit', async (opts) => {
      const data = await redditFetch(`/r/${opts.subreddit}/hot`, { limit: opts.limit });
      const results = data.data.children.map(formatPost);
      output(envelope('reddit', 'hot', results, { subreddit: opts.subreddit }));
    }));

  // top
  cmd
    .command('top')
    .description('Top posts from a subreddit')
    .option('-s, --subreddit <name>', 'Subreddit name', 'all')
    .option('-l, --limit <n>', 'Number of results', '15')
    .option('-t, --time <period>', 'Time period: hour|day|week|month|year|all', 'week')
    .action(withErrorHandling('reddit', async (opts) => {
      const data = await redditFetch(`/r/${opts.subreddit}/top`, { limit: opts.limit, t: opts.time });
      const results = data.data.children.map(formatPost);
      output(envelope('reddit', 'top', results, { subreddit: opts.subreddit, time: opts.time }));
    }));

  // new
  cmd
    .command('new')
    .description('New posts from a subreddit')
    .option('-s, --subreddit <name>', 'Subreddit name', 'programming')
    .option('-l, --limit <n>', 'Number of results', '15')
    .action(withErrorHandling('reddit', async (opts) => {
      const data = await redditFetch(`/r/${opts.subreddit}/new`, { limit: opts.limit });
      const results = data.data.children.map(formatPost);
      output(envelope('reddit', 'new', results, { subreddit: opts.subreddit }));
    }));

  // search
  cmd
    .command('search <query>')
    .description('Search Reddit posts')
    .option('-s, --subreddit <name>', 'Limit to subreddit')
    .option('-l, --limit <n>', 'Number of results', '15')
    .option('--sort <by>', 'Sort: relevance | top | new | comments', 'relevance')
    .option('-t, --time <period>', 'Time: hour | day | week | month | year | all', 'all')
    .action(withErrorHandling('reddit', async (query, opts) => {
      const path = opts.subreddit ? `/r/${opts.subreddit}/search` : '/search';
      const data = await redditFetch(path, {
        q: query,
        limit: opts.limit,
        sort: opts.sort,
        t: opts.time,
        restrict_sr: opts.subreddit ? '1' : undefined,
      });
      const results = data.data.children.map(formatPost);
      output(envelope('reddit', 'search', results, { query, subreddit: opts.subreddit || 'all' }));
    }));

  // thread — fetch a post and its top comments
  cmd
    .command('thread <url>')
    .description('Get a Reddit thread with top comments')
    .option('-c, --comments <n>', 'Number of top comments', '15')
    .action(withErrorHandling('reddit', async (url, opts) => {
      // Extract path from URL
      let path = url.replace('https://www.reddit.com', '').replace('https://reddit.com', '');
      if (!path.startsWith('/')) path = '/' + path;
      path = path.replace(/\/$/, '');

      const data = await redditFetch(path, { limit: opts.comments, depth: 2 });
      const post = formatPost(data[0].data.children[0]);
      const comments = data[1].data.children
        .filter(c => c.kind === 't1')
        .slice(0, parseInt(opts.comments))
        .map(formatComment);

      output(envelope('reddit', 'thread', { post, comments }));
    }));

  // user
  cmd
    .command('user <username>')
    .description('Get a Reddit user profile and recent posts')
    .option('-l, --limit <n>', 'Number of recent posts', '10')
    .action(withErrorHandling('reddit', async (username, opts) => {
      const [about, posts] = await Promise.all([
        redditFetch(`/user/${username}/about`),
        redditFetch(`/user/${username}/submitted`, { limit: opts.limit, sort: 'new' }),
      ]);

      const u = about.data;
      output(envelope('reddit', 'user', {
        username: u.name,
        karma: { post: u.link_karma, comment: u.comment_karma, total: u.total_karma },
        created_at: new Date(u.created_utc * 1000).toISOString(),
        is_mod: u.is_mod,
        icon: u.icon_img || null,
        recent_posts: posts.data.children.map(formatPost),
      }));
    }));

  // subreddit info
  cmd
    .command('info <subreddit>')
    .description('Get subreddit metadata')
    .action(withErrorHandling('reddit', async (subreddit) => {
      const data = await redditFetch(`/r/${subreddit}/about`);
      const s = data.data;
      output(envelope('reddit', 'info', {
        name: s.display_name,
        title: s.title,
        description: s.public_description,
        subscribers: s.subscribers,
        active_users: s.active_user_count,
        created_at: new Date(s.created_utc * 1000).toISOString(),
        nsfw: s.over18,
        url: `https://www.reddit.com/r/${s.display_name}`,
      }));
    }));

  return cmd;
}
