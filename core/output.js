/**
 * core/output.js
 * All stdout is structured JSON. All logs/errors go to stderr.
 * Agents parse stdout, humans read stderr.
 */

/**
 * Write structured JSON result to stdout.
 * @param {object} data
 */
export function output(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

/**
 * Write an error to stderr and optionally exit.
 * @param {string} message
 * @param {object} [meta]
 * @param {boolean} [exit=false]
 */
export function outputError(message, meta = {}, exit = false) {
  const payload = {
    error: true,
    message,
    ...meta,
    timestamp: new Date().toISOString(),
  };
  process.stderr.write(JSON.stringify(payload) + '\n');
  if (exit) process.exit(1);
}

/**
 * Log info to stderr (not captured by agents parsing stdout).
 * @param {string} msg
 */
export function log(msg) {
  process.stderr.write(`[webcli] ${msg}\n`);
}

/**
 * Wrap a platform handler with standard error catching.
 * @param {string} platform
 * @param {Function} fn
 * @returns {Function}
 */
export function withErrorHandling(platform, fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      outputError(err.message || 'Command failed', {
        platform,
        code: err.code,
        hint: err.hint,
      });
      process.exit(1);
    }
  };
}

/**
 * Build a standard result envelope.
 * @param {string} source - platform name
 * @param {string} command - subcommand run
 * @param {any} results
 * @param {object} [meta]
 */
export function envelope(source, command, results, meta = {}) {
  return {
    source,
    command,
    count: Array.isArray(results) ? results.length : undefined,
    ...meta,
    results,
    fetched_at: new Date().toISOString(),
  };
}
