# webcli — Unified Web CLI for AI Agents

> Read the web from your shell. Designed for Claude Code, OpenClaw, Codex, and any agent that can run shell commands.

**14 platforms. Zero browser needed. All output is structured JSON.**

## Install

```bash
npm install -g browseless
# or run directly
npx -p browseless webcli hackernews top
```

## Quick Start

```bash
# Check all deps
webcli doctor

# Start immediately (no auth needed)
webcli hackernews top --limit 5
webcli reddit hot --subreddit programming
webcli wikipedia summary "Kalman filter"
webcli arxiv search "LLM agents" --category cs.AI
webcli npm info express
webcli weather current "New Delhi"
webcli read https://example.com

# After installing gh CLI
webcli github search-repos "esp32 freertos" --language C

# After installing yt-dlp
webcli youtube transcript https://youtube.com/watch?v=...
```

---

## All 14 Platforms

### 🔓 No Auth Required

| Platform | Key Commands |
|---|---|
| **hackernews** | `top`, `new`, `best`, `ask`, `show`, `search`, `item`, `user` |
| **reddit** | `hot`, `top`, `new`, `search`, `thread`, `user`, `info` |
| **wikipedia** | `search`, `summary`, `full`, `related` |
| **arxiv** | `search`, `recent`, `get`, `author` |
| **npm** | `search`, `info`, `versions`, `downloads`, `deps` |
| **pypi** | `info`, `search`, `versions` |
| **stackoverflow** | `search`, `question`, `similar`, `tags` |
| **devto** | `feed`, `search`, `article`, `user`, `tags` |
| **weather** | `current`, `forecast` |
| **read** | `<url>` — fetch any webpage as clean text |

### 🔑 Auth Required

| Platform | Auth Method | Setup |
|---|---|---|
| **github** | `gh` CLI + token | `webcli auth github` |
| **youtube** | Optional cookies | `webcli auth youtube` (or skip) |
| **twitter** | Cookie export | `webcli auth twitter` |
| **linkedin** | Cookie export | `webcli auth linkedin` |

---

## Command Reference

### hackernews (`webcli hn`)
```bash
webcli hackernews top [--limit n]
webcli hackernews new [--limit n]
webcli hackernews best [--limit n]
webcli hackernews ask [--limit n]
webcli hackernews show [--limit n]
webcli hackernews search <query> [--sort relevance|date] [--type story|comment]
webcli hackernews item <id> [--comments n]
webcli hackernews user <username>
```

### reddit
```bash
webcli reddit hot [--subreddit name] [--limit n]
webcli reddit top [--subreddit name] [--time hour|day|week|month|year|all]
webcli reddit new [--subreddit name] [--limit n]
webcli reddit search <query> [--subreddit name] [--sort relevance|top|new]
webcli reddit thread <url> [--comments n]
webcli reddit user <username>
webcli reddit info <subreddit>
```

### github (`webcli gh`)
```bash
webcli github search-repos <query> [--language lang] [--sort stars|forks|updated] [--limit n]
webcli github search-issues <query> [--repo owner/repo] [--state open|closed] [--type issue|pr]
webcli github issues <owner/repo> [--state open|closed] [--label label] [--limit n]
webcli github get-readme <owner/repo>
webcli github get-file <owner/repo> <path> [--ref branch]
webcli github list-repos [--user username] [--limit n]
webcli github trending [--language lang] [--since daily|weekly|monthly]
```

### youtube (`webcli yt`)
```bash
webcli youtube search <query> [--limit n]
webcli youtube transcript <url> [--lang en]     ← full transcript as text
webcli youtube metadata <url>
webcli youtube channel <url> [--limit n]
```

### twitter (`webcli tw`)
```bash
webcli twitter search <query> [--limit n] [--lang en]
webcli twitter timeline [--type for-you|following] [--limit n]  ← auth required
webcli twitter user <handle> [--limit n]
webcli twitter bookmarks [--limit n]                             ← auth required
webcli twitter thread <url>
```

### linkedin (`webcli li`)
```bash
webcli linkedin search-jobs <query> [--location city] [--remote] [--limit n]
webcli linkedin search-people <query> [--company name] [--limit n]
webcli linkedin company <name|url>
```

### arxiv
```bash
webcli arxiv search <query> [--category cs.AI|cs.LG|cs.CV|physics] [--limit n]
webcli arxiv recent [--category cs.AI] [--limit n]
webcli arxiv get <id|url>
webcli arxiv author "<name>" [--limit n]
```

### npm
```bash
webcli npm search <query> [--limit n]
webcli npm info <package> [--version v]
webcli npm versions <package> [--limit n]
webcli npm downloads <package> [--period last-day|last-week|last-month|last-year]
webcli npm deps <package>
```

### pypi
```bash
webcli pypi info <package> [--version v]
webcli pypi search <query> [--limit n]
webcli pypi versions <package> [--limit n]
```

### stackoverflow (`webcli so`)
```bash
webcli stackoverflow search <query> [--sort relevance|votes] [--tag tag] [--limit n]
webcli stackoverflow question <id>
webcli stackoverflow similar <query> [--limit n]
webcli stackoverflow tags <tag>
```

### wikipedia (`webcli wiki`)
```bash
webcli wikipedia search <query> [--limit n]
webcli wikipedia summary <title>
webcli wikipedia full <title> [--sections]
webcli wikipedia related <title> [--limit n]
```

### devto (`webcli dev`)
```bash
webcli devto feed [--tag name] [--top 7|30|365] [--limit n]
webcli devto search <query> [--limit n]
webcli devto article <id|slug>
webcli devto user <username>
webcli devto tags [--limit n]
```

### weather
```bash
webcli weather current <city>
webcli weather forecast <city> [--days 1-16]
```

### read
```bash
webcli read <url>           ← fetch any URL as clean markdown (best for agents)
webcli read <url> --raw     ← raw HTML
```

---

## Auth Setup

### GitHub
```bash
# Install gh CLI first
winget install GitHub.cli   # Windows
brew install gh             # macOS

# Then authenticate
gh auth login
# or provide token directly
webcli auth github --token ghp_xxxx
```

### Twitter/X (Cookie-based)
```bash
# 1. Log into twitter.com in Chrome
# 2. Install Cookie-Editor extension
# 3. Click "Export" → JSON
# 4. Run:
webcli auth twitter
# Paste the JSON when prompted
```

### LinkedIn (Cookie-based)
```bash
# 1. Log into linkedin.com
# 2. Export cookies via Cookie-Editor
# 3. Run:
webcli auth linkedin
```

### YouTube (Optional)
```bash
# Only needed for private videos or higher rate limits
webcli auth youtube
# Press Enter to skip if not needed
```

---

## Output Format

All commands output structured JSON to **stdout**. Errors go to **stderr**.

```json
{
  "source": "hackernews",
  "command": "top",
  "count": 5,
  "results": [...],
  "fetched_at": "2026-04-09T12:00:00.000Z"
}
```

**Agents parse stdout. Humans read stderr. They never mix.**

Exit codes: `0` = success, `1` = error.

---

## Agent Integration

### OpenClaw / Claude Code
Drop `AGENTS.md` in your workspace root. Agents auto-discover all commands via `webcli list`.

### Any shell-capable agent
```bash
# Agent runs this, parses JSON output
webcli hackernews top --limit 10
webcli arxiv search "transformer attention mechanisms" --category cs.AI
webcli read https://some-article.com
webcli youtube transcript https://youtube.com/watch?v=xxx
```

### Claude Code example prompts
```
"Search GitHub for ESP32 FreeRTOS examples in C using webcli"
"Get the transcript of this YouTube video and summarize it"
"Find the top Stack Overflow answers for this error message"
"What's the weather in Phagwara today?"
"Search ArXiv for recent papers on LLM memory"
```

---

## Dependencies

| Tool | Required for | Install |
|---|---|---|
| `gh` | GitHub commands | `winget install GitHub.cli` |
| `yt-dlp` | YouTube transcript/metadata | `pip install yt-dlp` |
| `twitter-cli` | Twitter commands | `npm i -g twitter-cli` |
| Node 18+ | Everything | https://nodejs.org |

Everything else uses direct HTTP APIs — no additional installs.

Run `webcli doctor` to check all deps at once.

---

## Add a New Platform

1. Create `platforms/yourplatform.js` — export `yourplatformCommand()`
2. Add import + `program.addCommand(yourplatformCommand())` in `bin/webcli.js`
3. Add entry to `webcli list` and `AGENTS.md`

That's it. Every platform is just a Commander subcommand + fetch calls.

---

## License
MIT © Atharva Singh
