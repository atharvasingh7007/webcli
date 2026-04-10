#!/usr/bin/env node

/**
 * webcli — Unified Web CLI for AI Agents
 * Entry point: routes commands to platform handlers
 */

import { program, Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { runDoctor } from '../core/doctor.js';
import { runAuth } from '../core/auth.js';
import { clearCache } from '../core/cache.js';
import { output, outputError } from '../core/output.js';

// ── Platform imports ──────────────────────────────────────────────────────────
import { githubCommand }        from '../platforms/github.js';
import { redditCommand }        from '../platforms/reddit.js';
import { twitterCommand }       from '../platforms/twitter.js';
import { youtubeCommand }       from '../platforms/youtube.js';
import { hackernewsCommand }    from '../platforms/hackernews.js';
import { linkedinCommand }      from '../platforms/linkedin.js';
import { arxivCommand }         from '../platforms/arxiv.js';
import { npmCommand }           from '../platforms/npm.js';
import { pypiCommand }          from '../platforms/pypi.js';
import { wikipediaCommand }     from '../platforms/wikipedia.js';
import { stackoverflowCommand } from '../platforms/stackoverflow.js';
import { weatherCommand }       from '../platforms/weather.js';
import { devtoCommand }         from '../platforms/devto.js';
import { readCommand }          from '../platforms/read.js';
import { searchCommand }        from '../platforms/search.js';
import { financeCommand }       from '../platforms/finance.js';
import { huggingfaceCommand }   from '../platforms/huggingface.js';
import { dockerCommand }        from '../platforms/docker.js';
import { rssCommand }           from '../platforms/rss.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

program
  .name('webcli')
  .description('Unified web CLI for AI agents — read the web from your shell')
  .version(pkg.version)
  .option('--json', 'Force JSON output (default for all commands)')
  .option('--silent', 'Suppress stderr logs');

// ── Platform subcommands ──────────────────────────────────────────────────────
program.addCommand(githubCommand());
program.addCommand(redditCommand());
program.addCommand(twitterCommand());
program.addCommand(youtubeCommand());
program.addCommand(hackernewsCommand());
program.addCommand(linkedinCommand());
program.addCommand(arxivCommand());
program.addCommand(npmCommand());
program.addCommand(pypiCommand());
program.addCommand(wikipediaCommand());
program.addCommand(stackoverflowCommand());
program.addCommand(weatherCommand());
program.addCommand(devtoCommand());
program.addCommand(readCommand());
program.addCommand(searchCommand());
program.addCommand(financeCommand());
program.addCommand(huggingfaceCommand());
program.addCommand(dockerCommand());
program.addCommand(rssCommand());

// ── doctor ────────────────────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Check all dependencies and auth status')
  .action(async () => {
    await runDoctor();
  });

// ── auth ──────────────────────────────────────────────────────────────────────
program
  .command('auth <platform>')
  .description('Configure auth for a platform')
  .option('--token <token>', 'Provide token directly (non-interactive)')
  .option('--clear', 'Remove stored credentials for this platform')
  .action(async (platform, opts) => {
    await runAuth(platform, opts);
  });

// ── cache ─────────────────────────────────────────────────────────────────────
program
  .command('cache')
  .description('Manage the local cache block directly')
  .addCommand(
    new Command('clear')
      .description('Wipe ~/.webcli/cache completely')
      .action(() => {
        const cleared = clearCache();
        output({ source: 'webcli', command: 'cache clear', ok: true, cleared });
      })
  );

// ── list ──────────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all available commands (machine-readable for agents)')
  .action(() => {
    const listMap = {
      hackernews: {
        auth: 'none',
          commands: [
            'top [--limit n]',
            'new [--limit n]',
            'best [--limit n]',
            'ask [--limit n]',
            'show [--limit n]',
            'search <query> [--sort relevance|date] [--type story|comment]',
            'item <id> [--comments n]',
            'user <username>',
          ],
        },
        reddit: {
          auth: 'optional (OAuth for user endpoints)',
          commands: [
            'hot [--subreddit name] [--limit n]',
            'top [--subreddit name] [--time hour|day|week|month|year|all]',
            'new [--subreddit name] [--limit n]',
            'search <query> [--subreddit name] [--sort relevance|top|new]',
            'thread <url> [--comments n]',
            'user <username>',
            'info <subreddit>',
          ],
        },
        twitter: {
          auth: 'required (cookie-based)',
          commands: [
            'search <query> [--limit n] [--lang en]',
            'timeline [--type for-you|following] [--limit n]',
            'user <handle> [--limit n]',
            'bookmarks [--limit n]',
            'thread <url>',
          ],
        },
        linkedin: {
          auth: 'required (cookie-based)',
          commands: [
            'search-jobs <query> [--location city] [--remote] [--limit n]',
            'search-people <query> [--company name] [--limit n]',
            'company <name|url>',
          ],
        },
        devto: {
          auth: 'none',
          commands: [
            'feed [--tag name] [--top days] [--limit n]',
            'search <query> [--limit n]',
            'article <id|slug>',
            'user <username> [--limit n]',
            'tags [--limit n]',
          ],
        },
        finance: {
          auth: 'none',
          commands: [
            'quote <symbol1> <symbol2> [--asset-type equity|crypto] — Get structured quotes and market data',
          ],
        },
        docker: {
          auth: 'none (public endpoints)',
          commands: [
            'image <name>       — Get structured metadata for a Docker image repo',
            'tags <name>        — List available published tags for a Docker image',
          ]
        },
        huggingface: {
          auth: 'none (public endpoints)',
          commands: [
            'model <repo-id>    — Get HuggingFace model metadata',
            'dataset <repo-id>  — Get HuggingFace dataset metadata',
          ]
        },
        github: {
          auth: 'required (gh CLI + token)',
          commands: [
            'search-repos <query> [--language lang] [--sort stars|forks|updated]',
            'search-issues <query> [--repo owner/repo] [--state open|closed]',
            'issues <owner/repo> [--state open|closed] [--label label]',
            'get-readme <owner/repo>',
            'get-file <owner/repo> <path> [--ref branch]',
            'list-repos [--user username] [--limit n]',
            'trending [--language lang] [--since daily|weekly|monthly]',
            'pr list --repo <owner/repo> [--state open|closed|all]',
            'pr diff <number> --repo <owner/repo>',
            'pr view <number> --repo <owner/repo> [--comments]',
          ],
        },
        npm: {
          auth: 'none',
          commands: [
            'search <query> [--limit n]',
            'info <package> [--version v]',
            'versions <package> [--limit n]',
            'downloads <package> [--period last-day|last-week|last-month|last-year]',
            'deps <package> [--version v]',
          ],
        },
        pypi: {
          auth: 'none',
          commands: [
            'info <package> [--version v]',
            'search <query> [--limit n]',
            'versions <package> [--limit n]',
          ],
        },
        stackoverflow: {
          auth: 'none',
          commands: [
            'search <query> [--sort relevance|votes|activity] [--tag tag] [--limit n]',
            'question <id>',
            'similar <query> [--limit n]',
            'tags <tag>',
          ],
        },
        arxiv: {
          auth: 'none',
          commands: [
            'search <query> [--category cs.AI|cs.LG|cs.CV|...] [--sort relevance|submittedDate]',
            'recent [--category cs.AI] [--limit n]',
            'get <id|url>',
            'author <name> [--limit n]',
          ],
        },
        wikipedia: {
          auth: 'none',
          commands: [
            'search <query> [--limit n]',
            'summary <title>',
            'full <title> [--sections]',
            'related <title> [--limit n]',
          ],
        },
        search: {
          auth: 'none (ddg) | optional API Key (brave|tavily)',
          commands: [
            'search <query> [--engine ddg|brave|tavily] [--limit n] [--delay ms] [--read-top n]',
          ]
        },
        read: {
          auth: 'none',
          commands: [
            'read <url>        — fetch any webpage as clean markdown text',
            'read <url> --raw  — fetch raw HTML',
          ],
        },
        youtube: {
          auth: 'optional (cookies for private videos)',
          commands: [
            'search <query> [--limit n]',
            'transcript <url> [--lang en]',
            'metadata <url>',
            'channel <url> [--limit n]',
          ],
        },
        weather: {
          auth: 'none',
          commands: [
            'current <city>',
            'forecast <city> [--days n]',
          ],
        },
        rss: {
          auth: 'none',
          commands: [
            'rss <url> -- Fetch standard XML feeds cleanly mapped',
          ]
        }
    };

    output({
      source: 'webcli',
      version: pkg.version,
      total_platforms: Object.keys(listMap).length,
      platforms: listMap
    });
  });

// ── Global error handling ─────────────────────────────────────────────────────
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (err.code === 'commander.unknownCommand') {
    outputError(`Unknown command: ${err.message}`);
    process.exit(1);
  }
  if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
    process.exit(0);
  }
  outputError(err.message || 'Unknown error');
  process.exit(1);
}
