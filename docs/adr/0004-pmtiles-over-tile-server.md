# ADR-0004: PMTiles on a static host instead of a tile server

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §2.2 lists the tile service as "Caddy serving PMTiles via HTTP range".
The alternatives are a tile server reading MBTiles (tileserver-gl, martin), or
pre-rendered tile pyramids on disk.

## Decision

Serve [PMTiles](https://docs.protomaps.com/pmtiles/) archives from a static
file server, read directly by the browser through the `pmtiles` protocol
handler registered with MapLibre.

## Rationale

- **No tile server to run or scale.** A PMTiles archive is one file; the client
  fetches byte ranges. The "tiles" service is `file_server` plus cache headers.
- **Atomic deploys.** A rebuild writes a new file and it is swapped in; there is
  no cache to invalidate per tile and no half-updated pyramid.
- **Millions of small files avoided.** A z0–14 pyramid for Italy is a
  filesystem problem; one archive is not.
- **It matches the constraint in SPEC §0.1.** Everything is served from our own
  infrastructure, with no runtime dependency on any third party.

## Consequences

- The tile host must support HTTP range requests and CORS correctly. Caddy's
  `file_server` does; the configuration is in `infra/caddy/Caddyfile.tiles`.
- Updating one region means rebuilding the archive that contains it. Acceptable:
  SPEC §9 schedules a weekly refresh, not continuous updates.
- The client carries the `pmtiles` library (~15 KB gzip). Counted against the
  SPEC §6 budget.
- Range requests are not cacheable by naive intermediaries. Archives are served
  `immutable` with a long max-age, and a rebuild produces a new filename.
