# webcli

webcli is a parse-safe, provider-agnostic CLI designed for autonomous agents.

It gives AI agents structured JSON access to 19 web platforms — including documentation reading, web search, GitHub repos, finance quotes, HuggingFace models, and Docker registries — without requiring browsers, scrapers, or complex API keys.

## Agent Integration Guarantees

- stdout is **always** valid JSON, never mixed with logs
- stderr is diagnostic only and safe to discard
- batch commands preserve input order exactly
- partial failures are item-local — one bad URL or symbol never fails the batch
- `count` always equals the number of returned items
- composed commands (`--read-top`) colocate nested results on each item
- exit code 0 on structured errors, 1 on command execution failure

## Installation

```bash
npm install -g browseless
```
*(Development/Local install)*: `npm install -g .`

## Quick Start

Check dependencies and platform availability:
```bash
webcli doctor
```

Read any webpage as clean markdown:
```bash
webcli read https://example.com
```

Universal web search:
```bash
webcli search "react memory leaks"
```

## Core Commands

### `search`
Search the web across multiple providers (DuckDuckGo, Brave, Tavily) with built-in pacing.

```json
$ webcli search "react memory leaks" --limit 3 --read-top 1
{
  "source": "search",
  "command": "search",
  "count": 3,
  "ok": true,
  "mode": "search+read",
  "engine": "ddg",
  "query": "react memory leaks",
  "results": [
    {
      "title": "How to Fix Memory Leaks in React Applications",
      "url": "https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/",
      "snippet": "",
      "source": "duckduckgo",
      "rank": 1,
      "read": {
        "ok": true,
        "url": "https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/",
        "content": "Title: How to Fix Memory Leaks in React Applications...",
        "provider": "jina",
        "error": null
      }
    }
  ],
  "fetched_at": "2026-04-10T18:29:15.721Z"
}
```

### `finance`
Get live or delayed price quotes and market caps.

```json
$ webcli finance quote BTC ETH --asset-type crypto
{
  "source": "finance",
  "command": "quote_batch",
  "count": 2,
  "ok": true,
  "asset_type": "crypto",
  "results": [
    {
      "ok": true,
      "type": "quote",
      "symbol": "BTC",
      "name": "Bitcoin",
      "asset_type": "crypto",
      "source": "coingecko",
      "price": {
        "value": 72947,
        "currency": "USD",
        "change": 1039,
        "change_percent": 1.4452
      },
      "fundamentals": {
        "market_cap": 1459933521086
      },
      "market": {
        "delayed": false,
        "as_of": "2026-04-10T18:28:58.053Z"
      }
    }
  ],
  "fetched_at": "2026-04-10T18:29:18.154Z"
}
```
*(Also available: AAPL MSFT --asset-type equity)*

### `huggingface` (hf)
Discover capabilities and metadata for ML models and datasets.

```json
$ webcli hf model sentence-transformers/all-MiniLM-L6-v2
{
  "source": "huggingface",
  "command": "model",
  "ok": true,
  "results": {
    "type": "model",
    "id": "sentence-transformers/all-MiniLM-L6-v2",
    "source": "huggingface",
    "card": {
      "author": "sentence-transformers",
      "pipeline_tag": "sentence-similarity",
      "downloads": 194504137,
      "tags": ["sentence-transformers", "pytorch", "bert"]
    },
    "readme_excerpt": "# all-MiniLM-L6-v2 This is a sentence-transformers model..."
  }
}
```

### `docker`
Identify metadata and available tags for Docker Hub containers.

```json
$ webcli docker tags nginx --limit 3
{
  "source": "docker",
  "command": "tags",
  "ok": true,
  "results": {
    "type": "tags",
    "image": "nginx",
    "source": "dockerhub",
    "count": 3,
    "tags": [
      {
        "name": "mainline-alpine3.23",
        "size": 25988064,
        "architectures": ["amd64", "arm", "arm64"]
      }
    ]
  }
}
```

### `doctor`
View current CLI installation bounds dynamically and verify which systems have auth correctly mapped.

```bash
webcli doctor
```

## Composition & Batch

Webcli exposes deep composition pipelines. You can pass arrays of images directly inside a single command to exploit built-in concurrency tracking:
```bash
webcli docker image nginx python redis
webcli finance quote AAPL MSFT NVDA --asset-type equity
```

Or you can compose entirely decoupled pipelines like search-to-read seamlessly:
```bash
webcli search "react memory leaks" --read-top 3
```

## Environment Variables

| Variable | Description |
|---|---|
| `BRAVE_API_KEY` | Overrides generic searches leveraging Brave Search APIs securely |
| `TAVILY_API_KEY` | Switches core capabilities to Tavily dynamic results securely |
| `--delay <ms>` | Modifies underlying DDG delay (default 1500) preventing 429 backoff faults |

## Operational Notes

- **Caching**: `read` pipelines enforce generic ETags dynamically.
- **Finance Limits**: Yahoo Equity results may carry a 15-minute delay during live hours.
- **Bounded Concurrency**: All `batch` lists are internally bottlenecked via `p-limit(5)`. Submitting large arrays is safe and will not crash the socket pipeline.
- **Failures**: If one URL inside `read` batch fails (404), the item marks `ok: false` explicitly while leaving the batch envelope `ok: true`.

## Contracts

View all hard schemas, bounded conditions, and strict parsing mappings comprehensively at [docs/contracts.md](docs/contracts.md).
