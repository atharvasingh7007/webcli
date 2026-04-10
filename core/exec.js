/**
 * core/exec.js
 * Utilities for running external CLI tools with timeouts and structured errors.
 */

import { execa } from 'execa';
import which from 'which';

const DEFAULT_TIMEOUT = 30_000; // 30 seconds

/**
 * Check if a binary exists in PATH.
 * @param {string} bin
 * @returns {Promise<boolean>}
 */
export async function binExists(bin) {
  try {
    await which(bin);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve yt-dlp — tries direct binary first, then python -m yt_dlp fallback.
 * On Windows, pip --user installs go to AppData\Roaming\Python\PythonXXX\Scripts
 * which often isn't in PATH.
 * @returns {Promise<{bin: string, args: string[]}>}
 */
export async function resolveYtDlp() {
  // 1. Try direct binary
  if (await binExists('yt-dlp')) {
    return { bin: 'yt-dlp', args: [] };
  }

  // 2. Try python -m yt_dlp
  const py = (await binExists('python3')) ? 'python3' : (await binExists('python')) ? 'python' : null;
  if (py) {
    try {
      await execa(py, ['-m', 'yt_dlp', '--version'], { reject: true, timeout: 5000 });
      return { bin: py, args: ['-m', 'yt_dlp'] };
    } catch {}
  }

  // 3. Try common Windows user-install path explicitly
  const { homedir } = await import('os');
  const { join } = await import('path');
  const { existsSync } = await import('fs');
  const home = homedir();

  // Python 3.x user scripts on Windows
  for (const ver of ['314', '313', '312', '311', '310', '39', '38']) {
    const candidate = join(home, 'AppData', 'Roaming', 'Python', `Python${ver}`, 'Scripts', 'yt-dlp.exe');
    if (existsSync(candidate)) {
      return { bin: candidate, args: [] };
    }
  }

  const err = new Error('Required tool not found: yt-dlp');
  err.hint = 'Install with: pip install yt-dlp  OR  winget install yt-dlp';
  err.code = 'DEP_MISSING';
  throw err;
}

/**
 * Require a binary or throw a structured error.
 * @param {string} bin
 * @param {string} installHint
 */
export async function requireBin(bin, installHint) {
  const exists = await binExists(bin);
  if (!exists) {
    const err = new Error(`Required tool not found: ${bin}`);
    err.hint = `Install with: ${installHint}`;
    err.code = 'DEP_MISSING';
    throw err;
  }
}

/**
 * Run a CLI command and return stdout as string.
 * @param {string} bin
 * @param {string[]} args
 * @param {object} opts
 * @returns {Promise<string>}
 */
export async function run(bin, args, opts = {}) {
  const { timeout = DEFAULT_TIMEOUT, cwd, env } = opts;

  try {
    const result = await execa(bin, args, {
      timeout,
      cwd,
      env: { ...process.env, ...env },
      reject: false,
    });

    if (result.exitCode !== 0 && result.exitCode !== null) {
      const err = new Error(result.stderr || `${bin} exited with code ${result.exitCode}`);
      err.code = 'CLI_ERROR';
      err.exitCode = result.exitCode;
      err.stderr = result.stderr;
      throw err;
    }

    return result.stdout;
  } catch (err) {
    if (err.code === 'ETIMEDOUT') {
      const e = new Error(`Command timed out after ${timeout}ms: ${bin} ${args.join(' ')}`);
      e.code = 'TIMEOUT';
      throw e;
    }
    throw err;
  }
}

/**
 * Run and parse JSON stdout.
 * @param {string} bin
 * @param {string[]} args
 * @param {object} opts
 * @returns {Promise<any>}
 */
export async function runJSON(bin, args, opts = {}) {
  const raw = await run(bin, args, opts);
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error(`Failed to parse JSON from ${bin}`);
    err.code = 'PARSE_ERROR';
    err.raw = raw.slice(0, 500);
    throw err;
  }
}

/**
 * Fetch a URL and return response body as text.
 * @param {string} url
 * @param {object} opts - fetch options
 * @returns {Promise<string>}
 */
export async function fetchText(url, opts = {}) {
  const { default: fetch } = await import('node-fetch');
  
  let retries = 3;
  let delay = 1000;

  while (retries >= 0) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'webcli/1.0.0 (AI agent web CLI; github.com/atharvasingh7007/webcli)',
        ...opts.headers,
      },
      ...opts,
    });

    if ((res.status === 429 || res.status >= 500) && retries > 0) {
      await new Promise(r => setTimeout(r, delay + Math.random() * delay));
      delay *= 2;
      retries--;
      continue;
    }

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} from ${url}`);
      err.code = 'HTTP_ERROR';
      err.status = res.status;
      throw err;
    }

    return res.text();
  }
}

/**
 * Fetch JSON from a URL.
 * @param {string} url
 * @param {object} opts
 * @returns {Promise<any>}
 */
export async function fetchJSON(url, opts = {}) {
  const text = await fetchText(url, opts);
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error(`Failed to parse JSON from ${url}`);
    err.code = 'PARSE_ERROR';
    throw err;
  }
}
