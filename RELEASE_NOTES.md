# v1.3.2 — Pipeline Fetch Upgrades and Schema Stabilization

This release marks the transition of `webcli` into a stable, production-grade tool. We have completed a comprehensive audit ensuring that all platforms return strictly bounded JSON contracts, resolving drift across 19 supported platforms.

## Key Upgrades
- **Search Composition Restored**: Fixed `--read-top` domain limits properly truncating arrays natively. 
- **Fetch Resiliency**: `fetchText` securely routes explicit `RATE_LIMITED` codes preventing silent 429 TCP delays.
- **Zero-Dependency RSS Platform**: Native ingestion pipeline tracking global `XML` feeds efficiently.
- **GitHub PR Support**: Native metadata capabilities mapped handling open metrics seamlessly.
- **Contract Schema Integrity**: Enforced invariant regression structures verifying constraints natively match `docs/contracts.md`. 
- **Runtime Optimization**: Implemented dynamically abstracted `webcli cache clear` capabilities manually escaping static limits natively.

# v1.2.0 — Agent Capability Layer, Composition, Batch, and Contract Hardening

### Agent Integration Guarantees & Contract Hardening
We've established rigorous output constraints protecting agent integrations from structural drift:
- **`help --json`**: Native machine-readable capability registry allowing autonomous workflows to discover APIs instantly without human parsing.
- **Contract Schema Testing**: Global schema constraints enforced by zero-concurrency tests guaranteeing stable shapes.
- **Output Safety Boundaries**: 100% of all executions output pure JSON payloads to `stdout`, segregating logging perfectly out of output layers.
- **Graceful Failures**: Inner `.results` failure envelopes allow batch flows to succeed without stalling pipelines globally.

### Composition & Pipelines
Introducing command chaining and nested retrieval integrations cleanly:
- `search --read-top N`: Composable search flow integrating native document extraction logic directly over top ranked web search returns.

### Multi-Item Batch Support
Agents can now dramatically enhance their efficiency with scaled fetching arrays internally throttled with smart `p-limit(5)` boundaries:
- `hf model modelA modelB`
- `docker image nginx python`
- `finance quote AAPL MSFT --asset-type equity`

### Financial Execution Tier (Phase 2B)
- **Equities Integration**: Yahoo Finance
- **Crypto Integration**: CoinGecko
- Live Quotes, Pricing Updates, and Disambiguated Asset Validation.

### Registry Insight Layer (Phase 2C & 2D)
- **HuggingFace Registry**: Unbound insights into `model` and `dataset` metrics and auto-resolving `readme_excerpt` configurations natively via HuggingFace's public API.
- **Docker Hub Metrics**: Pull architecture schemas natively without firing local `docker pull` streams saving pipeline bandwidth.

All configurations seamlessly fallback to gracefully structured `.error` mappings directly inside bounding layers preventing `JSON.parse()` crashes.

---
**Upgrade today:**
`npm install -g browseless@latest`
