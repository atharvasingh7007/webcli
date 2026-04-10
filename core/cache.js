/**
 * core/cache.js
 * Basic filesystem JSON cache for GET requests explicitly designed for 
 * AI agents looping heavily. Prevents repetitive massive network traffic.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const CACHE_DIR = path.join(os.homedir(), '.webcli', 'cache');

export function getCachePath(key) {
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

export function readCache(key, ttlSec = 60) {
  try {
    const file = getCachePath(key);
    if (!fs.existsSync(file)) return null;

    const stats = fs.statSync(file);
    const ageSec = (Date.now() - stats.mtimeMs) / 1000;
    if (ageSec > ttlSec) {
      fs.unlinkSync(file); // Expired cache is deleted dynamically on access
      return null;
    }

    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw); // Return stored envelope object
  } catch {
    return null; // Corrupted JSON gracefully cascades into a cache-miss
  }
}

export function writeCache(key, data) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const file = getCachePath(key);
    fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  } catch {
    // Mute write errors; lack of caching should not break the pipeline
  }
}

export function clearCache() {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      fs.rmSync(CACHE_DIR, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
