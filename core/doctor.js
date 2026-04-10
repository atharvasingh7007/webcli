/**
 * core/doctor.js
 * Checks that all required external CLIs are installed and auth is configured.
 */

import { execa } from 'execa';
import which from 'which';
import chalk from 'chalk';
import { hasAuth } from './auth.js';
import { resolveYtDlp } from './exec.js';

const DEPS = [
  {
    name: 'gh (GitHub CLI)',
    bin: 'gh',
    install: 'winget install GitHub.cli  OR  https://cli.github.com',
    required_for: 'github',
  },
  {
    name: 'yt-dlp',
    bin: null, // custom resolver
    install: 'pip install yt-dlp  OR  winget install yt-dlp',
    required_for: 'youtube',
    customCheck: async () => {
      try {
        const { bin, args } = await resolveYtDlp();
        const r = await execa(bin, [...args, '--version'], { reject: false });
        return { found: true, path: bin, version: r.stdout?.trim() || 'found' };
      } catch {
        return { found: false };
      }
    },
  },
  {
    name: 'twitter-cli',
    bin: 'twitter',
    install: 'npm install -g twitter-cli',
    required_for: 'twitter',
  },
  {
    name: 'python3 / python',
    bin: ['python3', 'python'],
    install: 'https://python.org/downloads',
    required_for: 'reddit (OAuth), youtube (fallback)',
  },
];

const AUTH_CHECKS = [
  { platform: 'github',   required: ['token'],       label: 'GitHub',    note: 'Run: gh auth login  OR  webcli auth github' },
  { platform: 'reddit',   required: [],              label: 'Reddit',    note: 'Public API works without auth' },
  { platform: 'twitter',  required: ['cookie_json'], label: 'Twitter/X', note: 'Run: webcli auth twitter' },
  { platform: 'youtube',  required: [],              label: 'YouTube',   note: 'Public videos work without auth' },
  { platform: 'linkedin', required: ['cookie_json'], label: 'LinkedIn',  note: 'Run: webcli auth linkedin' },
];

const NO_AUTH_PLATFORMS = [
  'hackernews', 'stackoverflow', 'arxiv', 'wikipedia',
  'npm', 'pypi', 'devto', 'weather', 'read',
  'search', 'finance', 'huggingface', 'docker'
];

export async function runDoctor() {
  const results = {
    source: 'webcli',
    command: 'doctor',
    node_version: process.version,
    total_platforms: NO_AUTH_PLATFORMS.length + AUTH_CHECKS.length,
    dependencies: [],
    auth: [],
    no_auth_platforms: NO_AUTH_PLATFORMS,
    overall: 'ok',
  };

  process.stderr.write('\n');
  process.stderr.write(chalk.bold('webcli doctor\n'));
  process.stderr.write(chalk.dim('─'.repeat(52) + '\n\n'));

  // ── Dependency checks ──────────────────────────────────────────────────────
  process.stderr.write(chalk.bold('External Dependencies:\n'));

  for (const dep of DEPS) {
    let found = null;
    let version = null;
    let path = null;

    if (dep.customCheck) {
      const res = await dep.customCheck();
      found = res.found;
      version = res.version;
      path = res.path;
    } else {
      const bins = Array.isArray(dep.bin) ? dep.bin : [dep.bin];
      for (const bin of bins) {
        try {
          path = await which(bin);
          found = true;
          try {
            const r = await execa(bin, ['--version'], { reject: false, timeout: 5000 });
            version = (r.stdout || r.stderr || '').split('\n')[0].trim();
          } catch {}
          break;
        } catch {}
      }
    }

    const status = found ? 'ok' : 'missing';
    results.dependencies.push({ name: dep.name, status, version, path, install: dep.install, required_for: dep.required_for });

    if (found) {
      process.stderr.write(
        `  ${chalk.green('✓')} ${dep.name.padEnd(22)} ${chalk.dim(version || 'found')}\n`
      );
    } else {
      results.overall = 'degraded';
      process.stderr.write(
        `  ${chalk.red('✗')} ${dep.name.padEnd(22)} ${chalk.red('NOT FOUND')}\n`
      );
      process.stderr.write(
        `    ${chalk.dim('→')} ${dep.install}\n`
      );
    }
  }

  // ── Auth checks ────────────────────────────────────────────────────────────
  process.stderr.write('\n');
  process.stderr.write(chalk.bold('Auth (platforms requiring credentials):\n'));

  for (const check of AUTH_CHECKS) {
    const configured = check.required.length === 0
      ? true
      : hasAuth(check.platform, check.required);

    results.auth.push({ platform: check.platform, configured });

    if (configured) {
      process.stderr.write(
        `  ${chalk.green('✓')} ${check.label.padEnd(16)} ${chalk.dim('configured')}\n`
      );
    } else {
      process.stderr.write(
        `  ${chalk.yellow('!')} ${check.label.padEnd(16)} ${chalk.yellow('not configured')}  ${chalk.dim(check.note)}\n`
      );
    }
  }

  // ── No-auth platforms ──────────────────────────────────────────────────────
  process.stderr.write('\n');
  process.stderr.write(chalk.bold('No-auth Platforms (work immediately):\n'));
  process.stderr.write(
    `  ${chalk.green('✓')} ${NO_AUTH_PLATFORMS.join(', ')}\n`
  );

  // ── Summary ────────────────────────────────────────────────────────────────
  process.stderr.write('\n');
  if (results.overall === 'ok') {
    process.stderr.write(chalk.green.bold('All systems go.\n\n'));
  } else {
    process.stderr.write(chalk.yellow('Some dependencies missing — see above.\n'));
    process.stderr.write(chalk.dim('Missing deps only affect their specific platform.\n\n'));
  }

  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
}
