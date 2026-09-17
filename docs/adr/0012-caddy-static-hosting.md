# ADR-0012: Caddy for tiles and static hosting

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §2.2 lists Caddy twice: serving PMTiles by range request, and serving the
built frontend. Two roles, two configurations, one binary.

## Decision

Caddy for both, as two compose services with separate Caddyfiles:

- `infra/caddy/Caddyfile.tiles` — `file_server` over the data directory, CORS
  for cross-origin tile fetches, `immutable` caching for `*.pmtiles`, glyphs
  and sprites.
- `infra/caddy/Caddyfile.web` — the SPA with `try_files … /index.html`,
  `no-cache` on `index.html`, `immutable` on hashed assets, and
  `reverse_proxy` of `/api/*` to the gateway so the browser sees one origin.

## Rationale

- Range requests, compression and CORS are one-liners; nginx needs more care to
  get range + CORS + preflight right.
- Automatic HTTPS with real certificates in production, with no separate ACME
  client (disabled in compose, where TLS is terminated ahead of the stack).
- One image for both roles keeps the stack small.

## Consequences

- The tile host and the app are separate origins in development
  (`:8081` and `:8000`), so CORS on the tile host is not optional — it is
  configured and must stay configured.
- Production deployment (M9) decides whether both sit behind one Caddy or the
  tile host moves to a CDN. Nothing here prevents either; `VITE_TILE_BASE` and
  the style's `StyleContext` already treat the tile host as a variable.
