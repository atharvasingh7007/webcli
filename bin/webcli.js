#!/usr/bin/env node

/**
 * webcli — Unified Web CLI for AI Agents
 * Entry point: routes commands to platform handlers
 */

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { runDoctor } from '../core/doctor.js';
import { runAuth } from '../core/auth.js';
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

// ── Machine-readable help (--json) ────────────────────────────────────────────
// Intercept before commander to cleanly format agent metadata boundaries.
if (process.argv.includes('help') && process.argv.includes('--json') || process.argv.includes('--help-json')) {
  output({
    name: 'webcli',
    version: pkg.version,
    commands: [
      {
        name: "search",
        description: "Universal Web Search via multiple engines",
        arguments: [{ name: "query", required: true, variadic: false }],
        options: [
          { name: "--engine", default: "ddg", env_vars: ["BRAVE_API_KEY", "TAVILY_API_KEY"] },
          { name: "--limit", default: 10 },
          { name: "--delay", default: 1500 },
          { name: "--read-top", default: null }
        ],
        auth_required: false,
        env_vars: ["BRAVE_API_KEY", "TAVILY_API_KEY"],
        batch: false,
        composed: true,
        experimental: false
      },
      {
        name: "finance quote",
        description: "Get structured quotes and market data",
        arguments: [{ name: "symbols", required: true, variadic: true }],
        options: [
          { name: "--asset-type", required: true, default: null }
        ],
        auth_required: false,
        env_vars: [],
        batch: true,
        composed: false,
        experimental: false
      },
      {
        name: "hf model",
        description: "Get HuggingFace model metadata",
        arguments: [{ name: "models", required: true, variadic: true }],
        options: [],
        auth_required: false,
        env_vars: [],
        batch: true,
        composed: false,
        experimental: false
      },
      {
        name: "hf dataset",
        description: "Get HuggingFace dataset metadata",
        arguments: [{ name: "datasets", required: true, variadic: true }],
        options: [],
        auth_required: false,
        env_vars: [],
        batch: true,
        composed: false,
        experimental: false
      },
      {
        name: "docker image",
        description: "Get structured metadata for a Docker image repo",
        arguments: [{ name: "images", required: true, variadic: true }],
        options: [],
        auth_required: false,
        env_vars: [],
        batch: true,
        composed: false,
        experimental: false
      },
      {
        name: "docker tags",
        description: "List available published tags for a Docker image",
        arguments: [{ name: "images", required: true, variadic: true }],
        options: [
          { name: "--limit", default: 20 }
        ],
        auth_required: false,
        env_vars: [],
        batch: true,
        composed: false,
        experimental: false
      },
      {
        name: "read",
        description: "Fetch any webpage as clean markdown text",
        arguments: [{ name: "urls", required: true, variadic: true }],
        options: [
          { name: "--raw", default: false }
        ],
        auth_required: false,
        env_vars: [],
        batch: true,
        composed: false,
        experimental: false
      },
      {
        name: "doctor",
        description: "Check all dependencies and auth status",
        arguments: [],
        options: [],
        auth_required: false,
        env_vars: [],
        batch: false,
        composed: false,
        experimental: false
      }
    ]
  });
  process.exit(0);
}

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
