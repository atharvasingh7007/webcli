/**
 * platforms/twitter.js
 * Twitter/X — cookie-based via twitter-cli (npm: twitter-cli by public-clis)
 * Install: npm i -g twitter-cli
 * Auth: webcli auth twitter (exports cookies via Cookie-Editor)
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { binExists, run } from '../core/exec.js';
import { getAuth, hasAuth } from '../core/auth.js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resolveTwitterBin() {
  // twitter-cli installs as 'twitter' binary
  if (await binExists('twitter')) return 'twitter';
  const err = new Error('twitter-cli not found');
  err.hint = 'Install with: npm i -g twitter-cli';
  err.code = 'DEP_MISSING';
  throw err;
}

async function writeCookieFile() {
  const auth = getAuth('twitter');
  if (!auth.cookie_json) return null;
  const tmpFile = join(tmpdir(), `webcli_twitter_${Date.now()}.json`);
  writeFileSync(tmpFile, auth.cookie_json);
  return tmpFile;
}

function cleanupFile(path) {
  try { if (path && existsSync(path)) unlinkSync(path); } catch {}
}

async function tw(args, cookieFile) {
  const bin = await resolveTwitterBin();
  const fullArgs = [...args, '--json'];
  if (cookieFile) fullArgs.push('--cookies', cookieFile);
  const raw = await run(bin, fullArgs, { timeout: 30_000 });
  try { return JSON.parse(raw); } catch { return { raw }; }
}

function requireTwitterAuth() {
  if (!hasAuth('twitter', ['cookie_json'])) {
    const err = new Error('Twitter auth required. Run: webcli auth twitter');
    err.hint = 'webcli auth twitter';
    err.code = 'AUTH_MISSING';
    throw err;
  }
}

function fmt(t) {
  if (!t) return null;
  return {
    id: t.id || t.tweetId,
    text: t.text || t.fullText || t.content,
    author: t.author?.username || t.user?.screenName || t.handle,
    author_name: t.author?.name || t.user?.name,
    created_at: t.createdAt || t.timestamp,
    likes: t.likeCount ?? t.favoriteCount ?? t.likes,
    retweets: t.retweetCount ?? t.retweets,
    replies: t.replyCount ?? t.replies,
    views: t.viewCount ?? t.views ?? null,
    url: t.url || (t.id ? `https://x.com/i/web/status/${t.id}` : null),
    lang: t.lang,
    is_reply: t.isReply ?? false,
    has_media: !!(t.media?.length || t.attachments?.length),
  };
}

// ── Command builder ───────────────────────────────────────────────────────────

export function twitterCommand() {
  const cmd = new Command('twitter').alias('tw').description('[EXPERIMENTAL] Twitter/X commands (fragile cookie auth)');

  // search — works without auth for public tweets
  cmd
    .command('search <query>')
    .description('[EXPERIMENTAL] Search Twitter/X posts (auth optional)')
    .option('-l, --limit <n>', 'Number of results', '20')
    .option('--lang <code>', 'Filter by language (e.g. en)')
    .option('--from <handle>', 'Only tweets from this user')
    .option('--since <date>', 'Since date (YYYY-MM-DD)')
    .action(withErrorHandling('twitter', async (query, opts) => {
      const cookieFile = hasAuth('twitter', ['cookie_json']) ? await writeCookieFile() : null;
      try {
        let q = query;
        if (opts.from) q += ` from:${opts.from.replace('@', '')}`;
        if (opts.since) q += ` since:${opts.since}`;
        if (opts.lang) q += ` lang:${opts.lang}`;

        const args = ['search', q, '--max', opts.limit];
        const data = await tw(args, cookieFile);
        const tweets = Array.isArray(data) ? data : data.tweets || data.results || [];
        output(envelope('twitter', 'search', tweets.map(fmt).filter(Boolean), { query: q, experimental: true }));
      } finally {
        cleanupFile(cookieFile);
      }
    }));

  // timeline — requires auth
  cmd
    .command('timeline')
    .description('Get your home timeline (requires auth)')
    .option('-l, --limit <n>', 'Number of tweets', '20')
    .option('--type <t>', 'Feed type: for-you | following', 'for-you')
    .action(withErrorHandling('twitter', async (opts) => {
      requireTwitterAuth();
      const cookieFile = await writeCookieFile();
      try {
        const args = ['feed', '--max', opts.limit];
        if (opts.type === 'following') args.push('-t', 'following');
        const data = await tw(args, cookieFile);
        const tweets = Array.isArray(data) ? data : data.tweets || [];
        output(envelope('twitter', 'timeline', tweets.map(fmt).filter(Boolean), { type: opts.type, experimental: true }));
      } finally {
        cleanupFile(cookieFile);
      }
    }));

  // user profile + recent tweets
  cmd
    .command('user <handle>')
    .description('Get a Twitter user profile and recent tweets')
    .option('-l, --limit <n>', 'Number of recent tweets', '10')
    .action(withErrorHandling('twitter', async (handle, opts) => {
      const cookieFile = hasAuth('twitter', ['cookie_json']) ? await writeCookieFile() : null;
      const cleanHandle = handle.replace('@', '');
      try {
        const args = ['user', cleanHandle, '--max', opts.limit];
        const data = await tw(args, cookieFile);
        output(envelope('twitter', 'user', {
          handle: cleanHandle,
          profile: data.profile || data.user || {},
          recent_tweets: (data.tweets || []).map(fmt).filter(Boolean),
        }, { experimental: true }));
      } finally {
        cleanupFile(cookieFile);
      }
    }));

  // bookmarks — requires auth
  cmd
    .command('bookmarks')
    .description('Get your Twitter bookmarks (requires auth)')
    .option('-l, --limit <n>', 'Number of bookmarks', '20')
    .action(withErrorHandling('twitter', async (opts) => {
      requireTwitterAuth();
      const cookieFile = await writeCookieFile();
      try {
        const args = ['bookmarks', '--max', opts.limit];
        const data = await tw(args, cookieFile);
        const tweets = Array.isArray(data) ? data : data.tweets || data.bookmarks || [];
        output(envelope('twitter', 'bookmarks', tweets.map(fmt).filter(Boolean), { experimental: true }));
      } finally {
        cleanupFile(cookieFile);
      }
    }));

  // thread — get a full thread
  cmd
    .command('thread <url>')
    .description('Get a full Twitter thread by URL')
    .action(withErrorHandling('twitter', async (url) => {
      const cookieFile = hasAuth('twitter', ['cookie_json']) ? await writeCookieFile() : null;
      try {
        const match = url.match(/status\/(\d+)/);
        if (!match) throw new Error('Invalid Twitter URL. Expected: https://x.com/user/status/123456');
        const tweetId = match[1];
        const args = ['thread', tweetId];
        const data = await tw(args, cookieFile);
        const tweets = Array.isArray(data) ? data : data.tweets || [];
        output(envelope('twitter', 'thread', tweets.map(fmt).filter(Boolean), { url }));
      } finally {
        cleanupFile(cookieFile);
      }
    }));

  // trending — top trending topics
  cmd
    .command('trending')
    .description('Get trending topics (requires auth)')
    .option('--country <code>', 'Country code (e.g. US, IN, GB)', 'US')
    .action(withErrorHandling('twitter', async (opts) => {
      requireTwitterAuth();
      const cookieFile = await writeCookieFile();
      try {
        const args = ['trending', '--country', opts.country];
        const data = await tw(args, cookieFile);
        const trends = Array.isArray(data) ? data : data.trends || data.trending || [];
        output(envelope('twitter', 'trending', trends, { country: opts.country }));
      } finally {
        cleanupFile(cookieFile);
      }
    }));

  return cmd;
}
