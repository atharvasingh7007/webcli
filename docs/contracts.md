# WebCLI Output Contracts
This document serves as the ground truth for validating webcli outputs explicitly targeting system boundaries and regression checks. 

## 1. webcli finance quote
### Single item
- **Success envelope shape:**
  ```json
  {
    "source": "finance",
    "command": "quote",
    "ok": true,
    "results": {
      "type": "quote",
      "symbol": "NVDA",
      "name": "NVIDIA Corporation",
      "asset_type": "equity",
      "source": "yahoo",
      "price": { "value": 123.4, "currency": "USD" },
      "fundamentals": { ... },
      "market": { "delayed": true, "as_of": "2026-04-10T..." }
    },
    ...
  }
  ```
- **Error envelope shape:**
  ```json
  {
     "source": "finance",
     "command": "quote",
     "ok": false,
     "results": {
       "type": "quote",
       "symbol": "FAKE",
       "error": { "code": "NOT_FOUND", "message": "..." }
     }
  }
  ```
- **Required fields:** `ok`, `results.type`, `results.symbol`, `results.source`, `results.price.value`, `results.price.currency`, `results.market.delayed`, `results.market.as_of`

### Batch
- **Wrapper envelope shape:**
  ```json
  {
     "source": "finance",
     "command": "quote_batch",
     "ok": true,
     "asset_type": "equity",
     "count": 2,
     "results": [
        { "type": "quote", "symbol": "NVDA", "ok": true, ... },
        { "symbol": "BAD", "ok": false, "error": { "code": "...", "message": "..." } }
     ]
  }
  ```

### Semantic Rules
- `count` equals `results.length` always.
- Batch `ok` is `true` even if all items fail.
- Output order matches input order exactly.
- `symbol` is present on every item including errors.
- `AMBIGUOUS_ASSET_TYPE` fails the whole command if `--asset-type` is omitted.
- Single item inputs return the single item wrapper, not the array batch wrapper.

## 2. webcli search
### Single Command (Standard Search)
- **Success envelope shape:**
  ```json
  {
     "source": "search",
     "command": "search",
     "ok": true,
     "mode": "search",
     "engine": "ddg",
     "query": "react",
     "count": 10,
     "results": [
        { "rank": 1, "title": "...", "url": "...", "snippet": "...", "source": "duckduckgo" }
     ]
  }
  ```
- **Error envelope shape:**
  ```json
  { "source": "search", "command": "search", "ok": false, "query": "react", "error": { "code": "RATE_LIMITED", "message": "..." } }
  ```

### Search Composition (`--read-top N`)
- **Success envelope shape nested reads:**
  ```json
  {
    ...,
    "results": [
      {
         "rank": 1,
         "title": "...",
         "url": "...",
         "snippet": "...",
         "source": "duckduckgo",
         "read": { "ok": true, "url": "...", "content": "...", "provider": "jina", "fromCache": false, "error": null }
      }
    ]
  }
  ```

### Semantic Rules
- `--read-top N` fetches occur strictly after the initial array deduplication.
- Failed composed `read` calls set `read.ok = false` but do NOT fail the parent search `ok`.
- The `url` property is always present inside the `read` sub-object regardless of success or failure.

## 3. webcli read
### URL Fetch Wrapper
- **Success/Multi-URL Wrapper envelope shape:**
  ```json
  {
     "source": "read",
     "command": "read",
     "ok": true,
     "count": 2,
     "results": [ 
        { "url": "...", "method": "...", "ok": true, "word_count": 0, "char_count": 0, "content": "..." },
        { "url": "...", "ok": false, "error": { "message": "...", "code": "HTTP_ERROR", "status": 404 } }
     ]
  }
  ```

### Semantic Rules
- Single URL inputs return the exact same array wrapper as multi-URL inputs.
- Multi-URL inputs output identical structures to single-URL inputs (array results wrapper).
- `url` parameter exists rigidly on all objects inside the results array.

## 4. webcli hf model / dataset
### Single item
- **Success envelope shape:**
  ```json
  {
    "source": "huggingface",
    "command": "model",
    "ok": true,
    "results": {
       "type": "model",
       "id": "t5-base",
       "source": "huggingface",
       "card": {},
       "readme_excerpt": "...",
       "links": {}
    }
  }
  ```
- **Error envelope shape:**
  ```json
  {
    "source": "huggingface",
    "command": "model",
    "ok": false,
    "results": {
       "type": "model",
       "id": "t5",
       "error": { "code": "NOT_FOUND", "message": "..." }
    }
  }
  ```

### Batch
- **Wrapper envelope shape:**
  ```json
  {
     "source": "huggingface",
     "command": "model_batch",
     "ok": true,
     "count": 2,
     "results": [
        { "id": "t5-base", "ok": true, ... },
        { "id": "t5", "ok": false, "error": { ... } }
     ]
  }
  ```

### Semantic Rules
- `id` is present on every item including errors.
- Batch `ok` is globally true even if all specific IDs throw `NOT_FOUND` or 403s.
- `count` is exactly equal to `results.length`.

## 5. webcli docker image / tags
### Single item
- **Success envelope shape (`image`):**
  ```json
  {
     "source": "docker",
     "command": "image",
     "ok": true,
     "results": {
        "type": "image",
        "image": "nginx",
        "source": "dockerhub",
        "data": { "name": "nginx", "namespace": "library", "official": true, "description": "...", "pull_count": 1000, "last_updated": "..." },
        "links": {}
     }
  }
  ```
- **Success envelope shape (`tags`):**
  ```json
  {
     "source": "docker",
     "command": "tags",
     "ok": true,
     "results": {
        "type": "tags",
        "image": "nginx",
        "source": "dockerhub",
        "count": 3,
        "tags": [ { "name": "latest", "last_updated": "...", "digest": "...", "size": 1024, "architectures": ["amd64", "arm64"] } ]
     }
  }
  ```

### Batch
- **Wrapper envelope shape (`image_batch`):**
  ```json
  {
     "source": "docker",
     "command": "image_batch",
     "ok": true,
     "count": 2,
     "results": [
        { "type": "image", "image": "nginx", "ok": true, ... },
        { "image": "fake", "ok": false, "error": { ... } }
     ]
  }
  ```
- **Wrapper envelope shape (`tags_batch`):**
  ```json
  {
     "source": "docker",
     "command": "tags_batch",
     "ok": true,
     "count": 2,
     "results": [
        { "type": "tags", "image": "nginx", "ok": true, "count": 2, "tags": [ ... ] },
        { "image": "fake", "ok": false, "error": { ... } }
     ]
  }
  ```

### Semantic Rules
- `image` must be strictly present on every result object.
- Implicitly prepending the strings lacking slashes to match the `library/` prefix must not drop the `image` string mapping the user requested.
- `architectures` arrays dynamically map string deduplications perfectly on tags.

## 6. webcli doctor 
- **Success envelope shape:**
  ```json
  {
    "source": "webcli",
    "command": "doctor",
    "node_version": "...",
    "total_platforms": 19,
    "overall": "ok",
    "dependencies": [],
    "auth": [],
    "no_auth_platforms": []
  }
  ```

### Semantic Rules
- `total_platforms` equals the actual number of registered commands (tested as a positive integer, not a hardcoded strict value).

## 7. webcli rss
### URL Fetch Wrapper
- **Success/Multi-URL Wrapper envelope shape:**
  ```json
  {
     "source": "rss",
     "command": "rss_batch",
     "ok": true,
     "count": 2,
     "results": [ 
        { "url": "...", "ok": true, "count": 10, "items": [ { "title": "...", "link": "...", "description": "...", "pubDate": "..." } ] },
        { "url": "...", "ok": false, "error": { "code": "HTTP_ERROR", "message": "HTTP 404" } }
     ]
  }
  ```

### Semantic Rules
- `count` equals the number of RSS feeds requested.
- Object properties `title`, `link`, `description`, `pubDate` are strictly mapped internally cleanly escaping undefined fields gracefully.
- Failed items carry `ok: false` explicitly populated with standard `{ code, message }` error schemas safely.
