# Changelog

## [1.1.0] - 2026-04-09

### Added
- **arxiv** — search papers, recent by category, fetch by ID, search by author
- **npm** — search, info, versions, download stats, dependency list
- **pypi** — info, search, versions
- **stackoverflow** — search, question + answers, similar, tag info
- **wikipedia** — search, summary, full article text, related articles
- **devto** — feed, search, article, user, trending tags
- **weather** — current conditions + 16-day forecast via open-meteo (no API key)
- **read** — fetch any URL as clean markdown text via Jina Reader with direct fetch fallback
- Updated `AGENTS.md` with all 14 platforms, example workflows, best commands for agents
- Updated `README.md` with full command reference and auth guide

### Fixed
- GitHub `search-repos`: removed `topics` field (not supported by `gh` CLI JSON output)
- YouTube: `resolveYtDlp()` now handles Windows user-install PATH issue (AppData/Roaming/Python)
- Reddit: browser-like User-Agent headers to avoid 403s on restrictive networks

## [1.0.0] - 2026-04-09

### Added
- **github** — search repos, issues, get README/file, list repos, trending
- **reddit** — hot, top, new, search, thread, user, subreddit info
- **twitter** — search, timeline, user, bookmarks, thread
- **youtube** — search, transcript, metadata, channel
- **hackernews** — top, new, best, ask, show, search, item, user
- **linkedin** — search-jobs, search-people, company
- `webcli doctor` — dep + auth health check
- `webcli auth` — interactive auth for all platforms
- `webcli list` — machine-readable command discovery
- Core: structured JSON stdout, stderr error separation, auth store, exec utilities
