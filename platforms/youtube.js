/**
 * platforms/youtube.js
 * YouTube — wraps yt-dlp for transcripts/metadata.
 * Handles Windows user-install PATH issues via resolveYtDlp().
 */

import { Command } from 'commander';
import { output, withErrorHandling, envelope } from '../core/output.js';
import { resolveYtDlp, run } from '../core/exec.js';
import { getAuth } from '../core/auth.js';
import { tmpdir, homedir } from 'os';
import { join } from 'path';
import { writeFileSync, readFileSync, existsSync, unlinkSync, readdirSync } from 'fs';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ytdlp(extraArgs, opts = {}) {
  const { bin, args: baseArgs } = await resolveYtDlp();
  return run(bin, [...baseArgs, ...extraArgs], { timeout: 60_000, ...opts });
}

async function getCookiesFile() {
  const auth = getAuth('youtube');
  if (!auth.cookie_json) return null;
  try {
    const cookies = JSON.parse(auth.cookie_json);
    const lines = [
      '# Netscape HTTP Cookie File',
      ...cookies.map(c =>
        [c.domain || '.youtube.com', 'TRUE', c.path || '/', c.secure ? 'TRUE' : 'FALSE', c.expirationDate || 0, c.name, c.value].join('\t')
      ),
    ];
    const tmpFile = join(tmpdir(), `webcli_yt_cookies_${Date.now()}.txt`);
    writeFileSync(tmpFile, lines.join('\n'));
    return tmpFile;
  } catch {
    return null;
  }
}

function cleanupFile(path) {
  try { if (path && existsSync(path)) unlinkSync(path); } catch {}
}

function cleanupPrefix(prefix) {
  // Remove all temp files starting with a given prefix pattern
  try {
    const dir = tmpdir();
    for (const f of readdirSync(dir)) {
      if (f.startsWith('webcli_transcript_')) {
        try { unlinkSync(join(dir, f)); } catch {}
      }
    }
  } catch {}
}

// ── Command builder ───────────────────────────────────────────────────────────

export function youtubeCommand() {
  const cmd = new Command('youtube').alias('yt').description('YouTube commands');

  // transcript — killer feature for agents
  cmd
    .command('transcript <url>')
    .description('Get full transcript/subtitles from a YouTube video')
    .option('--lang <code>', 'Language code', 'en')
    .action(withErrorHandling('youtube', async (url, opts) => {
      const cookieFile = await getCookiesFile();
      const tmpBase = join(tmpdir(), `webcli_transcript_${Date.now()}`);

      const args = [
        url,
        '--skip-download',
        '--write-auto-sub',
        '--write-sub',
        '--sub-lang', opts.lang,
        '--sub-format', 'vtt',
        '--output', tmpBase,
        '--quiet',
        '--no-warnings',
      ];
      if (cookieFile) args.push('--cookies', cookieFile);

      try {
        await ytdlp(args);

        // yt-dlp may write with various suffixes — scan tmpdir for the file
        const tmpDir = tmpdir();
        const prefix = `webcli_transcript_`;
        let transcriptPath = null;

        for (const f of readdirSync(tmpDir)) {
          if (f.startsWith(prefix) && (f.endsWith('.vtt') || f.endsWith('.srt'))) {
            transcriptPath = join(tmpDir, f);
            break;
          }
        }

        // Also try exact known paths
        if (!transcriptPath) {
          const candidates = [
            `${tmpBase}.${opts.lang}.vtt`,
            `${tmpBase}.${opts.lang}-orig.vtt`,
            `${tmpBase}.${opts.lang}.auto.vtt`,
            `${tmpBase}.${opts.lang}.srt`,
          ];
          for (const c of candidates) {
            if (existsSync(c)) { transcriptPath = c; break; }
          }
        }

        if (!transcriptPath) {
          throw new Error(`No transcript found for language: ${opts.lang}. The video may not have captions.`);
        }

        const vtt = readFileSync(transcriptPath, 'utf8');
        cleanupFile(transcriptPath);
        cleanupFile(cookieFile);

        // Parse VTT → clean deduplicated text
        const lines = vtt.split('\n');
        const textLines = [];
        let lastText = '';
        for (const line of lines) {
          if (
            line.includes('-->') ||
            line.startsWith('WEBVTT') ||
            line.trim() === '' ||
            /^\d+$/.test(line.trim()) ||
            line.startsWith('NOTE') ||
            line.startsWith('Kind:') ||
            line.startsWith('Language:')
          ) continue;
          const clean = line.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
          if (clean && clean !== lastText) {
            textLines.push(clean);
            lastText = clean;
          }
        }

        const transcript = textLines.join(' ');
        output(envelope('youtube', 'transcript', {
          url,
          language: opts.lang,
          word_count: transcript.split(/\s+/).length,
          transcript,
        }));
      } catch (err) {
        cleanupFile(cookieFile);
        cleanupPrefix('webcli_transcript_');
        throw err;
      }
    }));

  // metadata
  cmd
    .command('metadata <url>')
    .description('Get metadata for a YouTube video')
    .action(withErrorHandling('youtube', async (url) => {
      const cookieFile = await getCookiesFile();
      const args = [
        url,
        '--dump-json',
        '--skip-download',
        '--quiet',
        '--no-warnings',
      ];
      if (cookieFile) args.push('--cookies', cookieFile);

      try {
        const raw = await ytdlp(args);
        cleanupFile(cookieFile);
        const meta = JSON.parse(raw);
        output(envelope('youtube', 'metadata', {
          id: meta.id,
          title: meta.title,
          description: meta.description?.slice(0, 800) || null,
          channel: meta.uploader,
          channel_id: meta.channel_id,
          duration_seconds: meta.duration,
          duration_formatted: meta.duration_string,
          view_count: meta.view_count,
          like_count: meta.like_count,
          upload_date: meta.upload_date,
          url: meta.webpage_url,
          thumbnail: meta.thumbnail,
          tags: meta.tags?.slice(0, 20),
          categories: meta.categories,
          language: meta.language,
          availability: meta.availability,
          chapters: meta.chapters?.map(c => ({
            title: c.title,
            start: c.start_time,
            end: c.end_time,
          })) || [],
        }));
      } catch (err) {
        cleanupFile(cookieFile);
        throw err;
      }
    }));

  // search
  cmd
    .command('search <query>')
    .description('Search YouTube videos')
    .option('-l, --limit <n>', 'Number of results', '10')
    .action(withErrorHandling('youtube', async (query, opts) => {
      const cookieFile = await getCookiesFile();
      const searchUrl = `ytsearch${opts.limit}:${query}`;
      const args = [
        searchUrl,
        '--dump-json',
        '--skip-download',
        '--flat-playlist',
        '--quiet',
        '--no-warnings',
      ];
      if (cookieFile) args.push('--cookies', cookieFile);

      try {
        const raw = await ytdlp(args);
        cleanupFile(cookieFile);

        const results = raw
          .trim()
          .split('\n')
          .filter(Boolean)
          .map(line => {
            try {
              const v = JSON.parse(line);
              return {
                id: v.id,
                title: v.title,
                url: v.url || `https://www.youtube.com/watch?v=${v.id}`,
                duration: v.duration_string || v.duration,
                channel: v.channel || v.uploader,
                view_count: v.view_count,
                upload_date: v.upload_date,
                description: v.description?.slice(0, 200) || null,
              };
            } catch { return null; }
          })
          .filter(Boolean);

        output(envelope('youtube', 'search', results, { query }));
      } catch (err) {
        cleanupFile(cookieFile);
        throw err;
      }
    }));

  // channel
  cmd
    .command('channel <url>')
    .description('List recent videos from a YouTube channel')
    .option('-l, --limit <n>', 'Number of videos', '10')
    .action(withErrorHandling('youtube', async (url, opts) => {
      const cookieFile = await getCookiesFile();
      const args = [
        url,
        '--dump-json',
        '--skip-download',
        '--flat-playlist',
        '--playlist-end', opts.limit,
        '--quiet',
        '--no-warnings',
      ];
      if (cookieFile) args.push('--cookies', cookieFile);

      try {
        const raw = await ytdlp(args);
        cleanupFile(cookieFile);

        const results = raw
          .trim()
          .split('\n')
          .filter(Boolean)
          .map(line => {
            try {
              const v = JSON.parse(line);
              return {
                id: v.id,
                title: v.title,
                url: v.url || `https://www.youtube.com/watch?v=${v.id}`,
                duration: v.duration_string || v.duration,
                upload_date: v.upload_date,
              };
            } catch { return null; }
          })
          .filter(Boolean);

        output(envelope('youtube', 'channel', results, { channel_url: url }));
      } catch (err) {
        cleanupFile(cookieFile);
        throw err;
      }
    }));

  return cmd;
}
