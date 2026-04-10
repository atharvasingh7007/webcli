/**
 * platforms/github.js
 * GitHub — wraps the official `gh` CLI.
 * Requires: gh CLI installed and authenticated (gh auth login).
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { requireBin, run, runJSON, fetchJSON } from '../core/exec.js';
import { getAuth } from '../core/auth.js';

const GH_BIN = 'gh';
const GITHUB_API = 'https://api.github.com';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ghJSON(args) {
  await requireBin(GH_BIN, 'winget install GitHub.cli  OR  https://cli.github.com');
  return runJSON(GH_BIN, args);
}

async function ghRaw(args) {
  await requireBin(GH_BIN, 'winget install GitHub.cli  OR  https://cli.github.com');
  return run(GH_BIN, args);
}

function getHeaders() {
  const auth = getAuth('github');
  const headers = { Accept: 'application/vnd.github+json' };
  if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;
  return headers;
}

async function apiGet(path) {
  return fetchJSON(`${GITHUB_API}${path}`, { headers: getHeaders() });
}

// ── Command builder ───────────────────────────────────────────────────────────

export function githubCommand() {
  const cmd = new Command('github').alias('gh').description('GitHub commands');

  // search-repos
  cmd
    .command('search-repos <query>')
    .description('Search GitHub repositories')
    .option('-l, --limit <n>', 'Number of results', '10')
    .option('--language <lang>', 'Filter by language')
    .option('--sort <by>', 'Sort by: stars | forks | updated', 'stars')
    .action(withErrorHandling('github', async (query, opts) => {
      const args = [
        'search', 'repos', query,
        '--limit', opts.limit,
        '--sort', opts.sort,
        '--json', 'fullName,description,stargazersCount,forksCount,language,updatedAt,url',
      ];
      if (opts.language) args.push('--language', opts.language);
      const results = await ghJSON(args);
      output(envelope('github', 'search-repos', results.map(r => ({
        full_name: r.fullName,
        description: r.description,
        stars: r.stargazersCount,
        forks: r.forksCount,
        language: r.language,
        updated_at: r.updatedAt,
        url: r.url,
      })), { query }));
    }));

  // search-issues
  cmd
    .command('search-issues <query>')
    .description('Search GitHub issues and PRs')
    .option('-l, --limit <n>', 'Number of results', '10')
    .option('--repo <owner/repo>', 'Limit to a specific repo')
    .option('--state <state>', 'Filter by state: open | closed', 'open')
    .option('--type <type>', 'Filter by type: issue | pr', 'issue')
    .action(withErrorHandling('github', async (query, opts) => {
      let q = query;
      if (opts.repo) q += ` repo:${opts.repo}`;
      if (opts.state) q += ` state:${opts.state}`;
      if (opts.type === 'pr') q += ' is:pr';
      else q += ' is:issue';

      const args = [
        'search', 'issues', q,
        '--limit', opts.limit,
        '--json', 'title,body,state,url,author,createdAt,labels,repository',
      ];
      const results = await ghJSON(args);
      output(envelope('github', 'search-issues', results.map(r => ({
        title: r.title,
        body: r.body?.slice(0, 500) || null,
        state: r.state,
        url: r.url,
        author: r.author?.login,
        created_at: r.createdAt,
        labels: r.labels?.map(l => l.name),
        repo: r.repository?.nameWithOwner,
      })), { query: q }));
    }));

  // get-readme
  cmd
    .command('get-readme <repo>')
    .description('Get README of a repository (owner/repo)')
    .action(withErrorHandling('github', async (repo) => {
      const data = await apiGet(`/repos/${repo}/readme`);
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      output(envelope('github', 'get-readme', {
        repo,
        path: data.path,
        size: data.size,
        content,
        url: data.html_url,
      }));
    }));

  // get-file
  cmd
    .command('get-file <repo> <path>')
    .description('Get a file from a repository')
    .option('--ref <branch>', 'Branch or commit SHA', 'HEAD')
    .action(withErrorHandling('github', async (repo, filePath, opts) => {
      const data = await apiGet(`/repos/${repo}/contents/${filePath}?ref=${opts.ref}`);
      if (Array.isArray(data)) {
        output(envelope('github', 'get-file', data.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          path: f.path,
          url: f.html_url,
        })), { repo, path: filePath }));
      } else {
        const content = data.encoding === 'base64'
          ? Buffer.from(data.content, 'base64').toString('utf8')
          : data.content;
        output(envelope('github', 'get-file', {
          repo,
          path: data.path,
          size: data.size,
          encoding: data.encoding,
          content,
          url: data.html_url,
        }));
      }
    }));

  // list-repos
  cmd
    .command('list-repos')
    .description('List repos for a user or the authenticated user')
    .option('--user <username>', 'GitHub username (default: authenticated user)')
    .option('-l, --limit <n>', 'Number of results', '20')
    .option('--sort <by>', 'Sort by: pushed | stars | name | created', 'pushed')
    .action(withErrorHandling('github', async (opts) => {
      const args = opts.user
        ? ['repo', 'list', opts.user, '--limit', opts.limit, '--json', 'name,description,stargazersCount,isPrivate,language,pushedAt,url']
        : ['repo', 'list', '--limit', opts.limit, '--json', 'name,description,stargazersCount,isPrivate,language,pushedAt,url'];
      const results = await ghJSON(args);
      output(envelope('github', 'list-repos', results.map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stargazersCount,
        private: r.isPrivate,
        language: r.language,
        pushed_at: r.pushedAt,
        url: r.url,
      })), { user: opts.user || 'authenticated' }));
    }));

  // trending
  cmd
    .command('trending')
    .description('Trending repositories')
    .option('--language <lang>', 'Filter by language')
    .option('--since <period>', 'Period: daily | weekly | monthly', 'daily')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('github', async (opts) => {
      let url = `https://gh-trending-api.vercel.app/repositories?since=${opts.since}`;
      if (opts.language) url += `&language=${encodeURIComponent(opts.language)}`;
      const data = await fetchJSON(url);
      const results = (data || []).slice(0, parseInt(opts.limit)).map(r => ({
        full_name: `${r.author}/${r.name}`,
        description: r.description,
        stars: r.stars,
        forks: r.forks,
        language: r.language,
        stars_today: r.currentPeriodStars,
        url: r.url,
      }));
      output(envelope('github', 'trending', results, { since: opts.since, language: opts.language || 'any' }));
    }));

  // issues
  cmd
    .command('issues <repo>')
    .description('List open issues for a repository (owner/repo)')
    .option('-l, --limit <n>', 'Number of results', '20')
    .option('--state <state>', 'Filter: open | closed | all', 'open')
    .option('--label <label>', 'Filter by label')
    .action(withErrorHandling('github', async (repo, opts) => {
      const args = [
        'issue', 'list',
        '--repo', repo,
        '--limit', opts.limit,
        '--state', opts.state,
        '--json', 'number,title,body,state,url,author,createdAt,labels,assignees',
      ];
      if (opts.label) args.push('--label', opts.label);
      const results = await ghJSON(args);
      output(envelope('github', 'issues', results.map(r => ({
        number: r.number,
        title: r.title,
        body: r.body?.slice(0, 400) || null,
        state: r.state,
        url: r.url,
        author: r.author?.login,
        created_at: r.createdAt,
        labels: r.labels?.map(l => l.name),
        assignees: r.assignees?.map(a => a.login),
      })), { repo }));
    }));

  return cmd;
}
