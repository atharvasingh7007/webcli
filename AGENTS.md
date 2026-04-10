# webcli — Agent Discovery File
# Drop this in your workspace root. OpenClaw, Claude Code, Codex auto-discover all commands.

## What is webcli?

webcli is a unified shell CLI giving AI agents structured JSON access to 14 web platforms — no browser, no scraping, no API keys for most.

**Install:** `npm install -g webcli`
**All commands:** `webcli list` (returns full JSON map)
**Health check:** `webcli doctor`

---

## Output Contract

ALL commands:
- Write JSON to **stdout** → agents parse this
- Write logs/errors to **stderr** → humans read this
- Exit `0` on success, `1` on error

```json
{
  "source": "platform",
  "command": "subcommand",
  "count": 10,
  "results": [...],
  "fetched_at": "ISO8601"
}
```

---

## Platform Commands

### hackernews — NO AUTH
```
webcli hackernews top [--limit n]
webcli hackernews new [--limit n]
webcli hackernews best [--limit n]
webcli hackernews ask [--limit n]
webcli hackernews show [--limit n]
webcli hackernews search <query> [--sort relevance|date] [--type story|comment] [--limit n]
webcli hackernews item <id> [--comments n]       ← post + top comments
webcli hackernews user <username>
```

### reddit — NO AUTH (public reads)
```
webcli reddit hot [--subreddit name] [--limit n]
webcli reddit top [--subreddit name] [--time hour|day|week|month|year|all] [--limit n]
webcli reddit new [--subreddit name] [--limit n]
webcli reddit search <query> [--subreddit name] [--sort relevance|top|new] [--time all]
webcli reddit thread <url> [--comments n]         ← post + comments
webcli reddit user <username>
webcli reddit info <subreddit>
```

### wikipedia — NO AUTH
```
webcli wikipedia search <query> [--limit n]
webcli wikipedia summary <title>                  ← TL;DR of any topic, great for grounding
webcli wikipedia full <title> [--sections]        ← full article text, agents Q&A over it
webcli wikipedia related <title> [--limit n]
```

### arxiv — NO AUTH
```
webcli arxiv search <query> [--category cs.AI|cs.LG|cs.CV|physics|math] [--sort relevance|submittedDate] [--limit n]
webcli arxiv recent [--category cs.AI] [--limit n]
webcli arxiv get <id|url>                         ← fetch paper by arxiv ID e.g. 2312.00752
webcli arxiv author "<name>" [--limit n]
```

### npm — NO AUTH
```
webcli npm search <query> [--limit n]
webcli npm info <package> [--version v]           ← full package metadata
webcli npm versions <package> [--limit n]
webcli npm downloads <package> [--period last-day|last-week|last-month|last-year]
webcli npm deps <package>                         ← list all dependencies
```

### pypi — NO AUTH
```
webcli pypi info <package> [--version v]
webcli pypi search <query> [--limit n]
webcli pypi versions <package> [--limit n]
```

### stackoverflow — NO AUTH
```
webcli stackoverflow search <query> [--sort relevance|votes|activity] [--tag tag] [--limit n]
webcli stackoverflow question <id>                ← question + top answers
webcli stackoverflow similar <query> [--limit n]
webcli stackoverflow tags <tag>
```

### devto — NO AUTH
```
webcli devto feed [--tag name] [--top 7|30|365] [--limit n]
webcli devto search <query> [--limit n]
webcli devto article <id|slug>
webcli devto user <username> [--limit n]
webcli devto tags [--limit n]
```

### weather — NO AUTH
```
webcli weather current <city>                     ← temperature, humidity, wind, condition
webcli weather forecast <city> [--days 1-16]      ← daily forecast
```

### read — NO AUTH — MOST USEFUL FOR AGENTS
```
webcli read <url>                                 ← fetch ANY webpage as clean markdown text
webcli read <url> --raw                           ← raw HTML
```
Use this to let agents read documentation, articles, GitHub pages, any URL.

### github — NEEDS: gh CLI installed + gh auth login
```
webcli github search-repos <query> [--language lang] [--sort stars|forks|updated] [--limit n]
webcli github search-issues <query> [--repo owner/repo] [--state open|closed] [--type issue|pr]
webcli github issues <owner/repo> [--state open|closed] [--label label] [--limit n]
webcli github get-readme <owner/repo>             ← full README text
webcli github get-file <owner/repo> <path> [--ref branch]
webcli github list-repos [--user username] [--limit n]
webcli github trending [--language lang] [--since daily|weekly|monthly]
```

### youtube — NEEDS: yt-dlp installed
```
webcli youtube search <query> [--limit n]
webcli youtube transcript <url> [--lang en]       ← full spoken transcript as text
webcli youtube metadata <url>                     ← title, views, duration, chapters, tags
webcli youtube channel <url> [--limit n]
```

### twitter — NEEDS: webcli auth twitter (cookie export)
```
webcli twitter search <query> [--limit n] [--lang en]
webcli twitter timeline [--type for-you|following] [--limit n]
webcli twitter user <handle> [--limit n]
webcli twitter bookmarks [--limit n]
webcli twitter thread <url>
```

### linkedin — NEEDS: webcli auth linkedin (cookie export)
```
webcli linkedin search-jobs <query> [--location city] [--remote] [--limit n]
webcli linkedin search-people <query> [--company name] [--limit n]
webcli linkedin company <name|url>
```

---

## Best Commands for Agents (no-auth, high value)

1. `webcli read <url>` — read any webpage
2. `webcli youtube transcript <url>` — full video transcript
3. `webcli stackoverflow search "<error message>"` — debug help
4. `webcli arxiv search "<topic>" --category cs.AI` — research papers
5. `webcli wikipedia summary "<topic>"` — factual grounding
6. `webcli hackernews search "<topic>"` — community discussion
7. `webcli npm info <package>` — package research
8. `webcli reddit search "<topic>" --sort top` — community opinions
9. `webcli weather current <city>` — live weather
10. `webcli github get-readme <owner/repo>` — read any repo README

---

## Example Agent Workflows

**Debug an error:**
```bash
webcli stackoverflow search "TypeError cannot read property of undefined react hooks" --tag javascript
```

**Research a paper:**
```bash
webcli arxiv search "mixture of experts llm" --category cs.AI --limit 5
webcli arxiv get 2401.04088
```

**Read docs:**
```bash
webcli read https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
```

**Market research:**
```bash
webcli reddit search "best nextjs hosting 2026" --subreddit webdev --sort top
webcli hackernews search "vercel vs cloudflare"
webcli devto search "nextjs performance"
```

**Package due diligence:**
```bash
webcli npm info drizzle-orm
webcli npm downloads drizzle-orm --period last-month
webcli github search-repos "drizzle-orm" --sort stars
```
