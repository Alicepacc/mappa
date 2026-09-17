# ADR-0005: Planetiler with a custom profile for vector tiles

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M1

## Context

SPEC §3.1 step 3 requires vector tiles with OpenMapTiles-like base layers
**plus** five layers this product depends on and OpenMapTiles does not provide:
`hiking_routes`, `cycle_routes`, `paths`, `pistes` and `outdoor_poi` — carrying
`cai_scale`, `sac_scale`, `via_ferrata_scale`, parsed `osmc:symbol`,
`piste:difficulty`, and per-way route membership for parallel offsets.

Alternatives: tilemaker (Lua profiles, lower memory, slower), or the stock
OpenMapTiles toolchain (PostGIS-based, heavy, and would need forking anyway).

## Decision

[Planetiler](https://github.com/onthegomap/planetiler) with a **custom Java
profile**, not the bundled OpenMapTiles profile.

## Rationale

- The custom layers are the product. Any option requires writing a profile, so
  the question is which engine runs it — and Planetiler is the fastest by a
  wide margin (it builds the planet in well under an hour on a large machine;
  a 2.1 GB Italy extract is a small fraction of that).
- Single self-contained JVM process: no PostGIS, no import step, no database to
  keep in sync. That matters for SPEC §3's "reproducible and idempotent".
- It emits PMTiles directly, which pairs with ADR-0004.

## Consequences

- The profile is Java, the only Java in the repo. It is confined to
  `pipeline/` and versioned with the pipeline image.
- Planetiler requires Java 21+ and roughly 0.5× the input `.osm.pbf` size in
  free RAM, plus 5–10× that size in fast scratch disk. See
  `docs/resource-estimates.md`.
- A schema change means a full retile. Acceptable at this data size.
- The profile must be covered by tests on fixture data: the `osmc:symbol`
  parser and the `cai_scale`/`sac_scale` mapping are explicitly called out in
  SPEC §6.
