/**
 * scripts/setup.js
 * Bootstraps all external dependencies for webcli.
 * Run with: node scripts/setup.js
 *
 * What it does:
 *  1. Checks Node version
 *  2. Checks/installs external CLIs (gh, yt-dlp, twitter-cli)
 *  3. Prints a summary with next steps
 */

import { execa } from 'execa';
import which from 'which';
import { platform } from 'os';

const IS_WIN = platform() === 'win32';
const IS_MAC = platform() === 'darwin';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function ok(msg) { console.log(`  ${GREEN}✓${RESET} ${msg}`); }
function fail(msg) { console.log(`  ${RED}✗${RESET} ${msg}`); }
function warn(msg) { console.log(`  ${YELLOW}!${RESET} ${msg}`); }
function header(msg) { console.log(`\n${BOLD}${msg}${RESET}`); }
function dim(msg) { console.log(`    ${DIM}${msg}${RESET}`); }

async function exists(bin) {
  try { await which(bin); return true; } catch { return false; }
}

async function tryRun(bin, args) {
  try {
    const r = await execa(bin, args, { reject: false });
    return r.stdout || r.stderr || '';
  } catch { return ''; }
}

// ── Node version check ────────────────────────────────────────────────────────
header('Node.js');
const nodeVer = process.versions.node.split('.').map(Number);
if (nodeVer[0] < 18) {
  fail(`Node ${process.version} detected. webcli requires Node 18+.`);
  dim('Download: https://nodejs.org');
  process.exit(1);
} else {
  ok(`Node ${process.version}`);
}

// ── gh CLI ────────────────────────────────────────────────────────────────────
header('GitHub CLI (gh)');
if (await exists('gh')) {
  const ver = await tryRun('gh', ['--version']);
  ok(`gh found — ${ver.split('\n')[0]}`);
} else {
  fail('gh not found');
  if (IS_WIN) dim('Install: winget install GitHub.cli');
  else if (IS_MAC) dim('Install: brew install gh');
  else dim('Install: https://cli.github.com');
  warn('GitHub commands will not work until gh is installed.');
}

// ── yt-dlp ────────────────────────────────────────────────────────────────────
header('yt-dlp');
if (await exists('yt-dlp')) {
  const ver = await tryRun('yt-dlp', ['--version']);
  ok(`yt-dlp found — ${ver.trim()}`);
} else {
  console.log('  yt-dlp not found. Attempting install via pip...');
  try {
    const pip = (await exists('pip3')) ? 'pip3' : 'pip';
    await execa(pip, ['install', 'yt-dlp'], { stdio: 'inherit' });
    ok('yt-dlp installed via pip');
  } catch {
    fail('Could not auto-install yt-dlp');
    dim('Install manually: pip install yt-dlp');
    warn('YouTube commands will not work until yt-dlp is installed.');
  }
}

// ── twitter-cli ───────────────────────────────────────────────────────────────
header('twitter-cli');
if (await exists('twitter')) {
  ok('twitter-cli found');
} else {
  console.log('  twitter-cli not found. Attempting install via npm...');
  try {
    await execa('npm', ['install', '-g', 'twitter-cli'], { stdio: 'inherit' });
    ok('twitter-cli installed');
  } catch {
    fail('Could not auto-install twitter-cli');
    dim('Install manually: npm install -g twitter-cli');
    warn('Twitter commands will not work until twitter-cli is installed.');
  }
}

// ── Python check ──────────────────────────────────────────────────────────────
header('Python (for Reddit OAuth)');
const hasPy = (await exists('python3')) || (await exists('python'));
if (hasPy) {
  const py = (await exists('python3')) ? 'python3' : 'python';
  const ver = await tryRun(py, ['--version']);
  ok(ver.trim());
} else {
  warn('Python not found. Reddit will use public API (unauthenticated).');
  dim('Download: https://python.org/downloads');
}

// ── Summary ───────────────────────────────────────────────────────────────────
header('Next Steps');
console.log(`
  1. Authenticate platforms:
       webcli auth github
       webcli auth reddit
       webcli auth twitter

  2. Verify everything:
       webcli doctor

  3. Start using:
       webcli hackernews top --limit 5
       webcli github search-repos "esp32" --language C
       webcli reddit hot --subreddit MachineLearning
       webcli youtube transcript <url>

  4. Run tests:
       npm test

  Full docs: README.md
  Agent discovery: AGENTS.md
`);
