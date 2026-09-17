# ADR-0006: Valhalla for routing

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M5

## Context

SPEC §2.2 names Valhalla. SPEC §1.5 sets requirements that constrain the
choice: five modes including two distinct hiking-aware profiles, unlimited
waypoints, up to two alternatives, elevation along the route, and — the hard
one — costing that understands `cai_scale`/`sac_scale` and **must not** route
onto `highway=via_ferrata` or EE/EEA terrain unless the user opts in.

Alternatives considered: OSRM (fastest, but costing is compiled in via Lua
profiles and it has no elevation support), GraphHopper (good hiking support,
JVM, custom models in JSON).

## Decision

[Valhalla](https://valhalla.github.io/valhalla/), as specified.

## Rationale

- **Dynamic costing.** Valhalla applies costing options per request rather than
  per compiled graph. `allowExpert` becomes a costing parameter, not a second
  graph — which is what makes SPEC §1.5's toggle cheap.
- **Elevation is built in.** Valhalla ingests the DEM at tile-build time and
  serves `/height`, so the route summary's ascent/descent and the elevation
  profile come from the same source as the terrain tiles (ADR-0010).
- **Tiled graph.** Memory maps only what a request touches, so an Italy graph
  serves comfortably on a modest machine.

## Consequences

- Tile building is the expensive step: the Enhance and Validation phases are
  memory-hungry, and adding elevation materially increases both time and disk.
  See `docs/resource-estimates.md`.
- Trail attributes must survive into the graph. The hiking costing work in M5
  is a real task, not configuration, and is the milestone's main risk.
- Turn-by-turn text is localised by Valhalla; SPEC §1.5 wants Italian
  instructions, so the gateway pins `language=it` and normalises the output.
