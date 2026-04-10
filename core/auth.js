/**
 * core/auth.js
 * Manages credentials stored in ~/.webcli/config.json
 * Uses the `conf` package for cross-platform config storage.
 */

import Conf from 'conf';
import { createInterface } from 'readline';
import { output, outputError, log } from './output.js';
import open from 'open';

const store = new Conf({
  projectName: 'webcli',
  schema: {
    github: { type: 'object', default: {} },
    reddit: { type: 'object', default: {} },
    twitter: { type: 'object', default: {} },
    youtube: { type: 'object', default: {} },
    linkedin: { type: 'object', default: {} },
  },
});

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get credentials for a platform.
 * @param {string} platform
 * @returns {object}
 */
export function getAuth(platform) {
  return store.get(platform) || {};
}

/**
 * Set credentials for a platform.
 * @param {string} platform
 * @param {object} creds
 */
export function setAuth(platform, creds) {
  store.set(platform, creds);
}

/**
 * Clear credentials for a platform.
 * @param {string} platform
 */
export function clearAuth(platform) {
  store.set(platform, {});
}

/**
 * Check if a platform has credentials set.
 * @param {string} platform
 * @param {string[]} required - required keys
 */
export function hasAuth(platform, required = []) {
  const creds = getAuth(platform);
  return required.every(k => creds[k] && creds[k].length > 0);
}

/**
 * Throw a structured error if auth is missing.
 * @param {string} platform
 * @param {string[]} required
 */
export function requireAuth(platform, required = []) {
  if (!hasAuth(platform, required)) {
    const err = new Error(`Not authenticated for ${platform}. Run: webcli auth ${platform}`);
    err.hint = `webcli auth ${platform}`;
    err.code = 'AUTH_MISSING';
    throw err;
  }
}

/**
 * Interactive auth setup runner.
 * @param {string} platform
 * @param {object} opts
 */
export async function runAuth(platform, opts) {
  const supported = ['github', 'reddit', 'twitter', 'youtube', 'linkedin'];

  if (!supported.includes(platform)) {
    outputError(`Unsupported platform: ${platform}. Supported: ${supported.join(', ')}`);
    process.exit(1);
  }

  if (opts.clear) {
    clearAuth(platform);
    output({ success: true, message: `Cleared auth for ${platform}` });
    return;
  }

  switch (platform) {
    case 'github':
      await authGitHub(opts);
      break;
    case 'reddit':
      await authReddit(opts);
      break;
    case 'twitter':
      await authTwitter(opts);
      break;
    case 'youtube':
      await authYouTube(opts);
      break;
    case 'linkedin':
      await authLinkedIn(opts);
      break;
  }
}

// ── Platform auth flows ───────────────────────────────────────────────────────

async function authGitHub(opts) {
  if (opts.token) {
    setAuth('github', { token: opts.token });
    output({ success: true, message: 'GitHub token saved.' });
    return;
  }

  log('Opening GitHub token creation page...');
  log('Create a token with: repo (read), read:user scopes');
  await open('https://github.com/settings/tokens/new?description=webcli&scopes=repo,read:user');

  const token = await prompt('Paste your GitHub personal access token: ');
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    outputError('Invalid token format. GitHub tokens start with ghp_ or github_pat_');
    process.exit(1);
  }
  setAuth('github', { token: token.trim() });
  output({ success: true, message: 'GitHub token saved.' });
}

async function authReddit(opts) {
  log('Reddit requires an API app. Opening Reddit app creation page...');
  await open('https://www.reddit.com/prefs/apps');
  log('Create a "script" type app and note the client_id and secret.');

  const client_id = await prompt('Client ID: ');
  const client_secret = await prompt('Client Secret: ');
  const username = await prompt('Reddit username: ');
  const password = await prompt('Reddit password (stored locally, never sent anywhere): ');

  setAuth('reddit', {
    client_id: client_id.trim(),
    client_secret: client_secret.trim(),
    username: username.trim(),
    password: password.trim(),
  });
  output({ success: true, message: 'Reddit credentials saved.' });
}

async function authTwitter(opts) {
  log('Twitter/X uses cookie-based auth (no official API needed).');
  log('Steps:');
  log('  1. Log into twitter.com in Chrome/Firefox');
  log('  2. Install Cookie-Editor extension');
  log('  3. Export cookies as JSON');
  log('  4. Paste the cookie string here');

  await open('https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm');

  const cookieJson = await prompt('Paste exported cookie JSON (single line): ');
  try {
    JSON.parse(cookieJson); // validate
  } catch {
    outputError('Invalid JSON. Export cookies as JSON from Cookie-Editor.');
    process.exit(1);
  }
  setAuth('twitter', { cookie_json: cookieJson.trim() });
  output({ success: true, message: 'Twitter cookies saved.' });
}

async function authYouTube(opts) {
  log('YouTube transcript fetching works without auth (yt-dlp).');
  log('For private videos or higher rate limits, provide a cookies file.');
  log('Optional: Export youtube.com cookies via Cookie-Editor.');

  const cookieJson = await prompt('Paste YouTube cookie JSON (or press Enter to skip): ');
  if (cookieJson.trim()) {
    try {
      JSON.parse(cookieJson);
    } catch {
      outputError('Invalid JSON.');
      process.exit(1);
    }
    setAuth('youtube', { cookie_json: cookieJson.trim() });
    output({ success: true, message: 'YouTube cookies saved.' });
  } else {
    output({ success: true, message: 'YouTube will work without auth (public videos only).' });
  }
}

async function authLinkedIn(opts) {
  log('LinkedIn uses cookie-based auth.');
  log('Steps:');
  log('  1. Log into linkedin.com');
  log('  2. Export cookies via Cookie-Editor');
  log('  3. Paste here');

  await open('https://www.linkedin.com');

  const cookieJson = await prompt('Paste LinkedIn cookie JSON: ');
  try {
    JSON.parse(cookieJson);
  } catch {
    outputError('Invalid JSON.');
    process.exit(1);
  }
  setAuth('linkedin', { cookie_json: cookieJson.trim() });
  output({ success: true, message: 'LinkedIn cookies saved.' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}
