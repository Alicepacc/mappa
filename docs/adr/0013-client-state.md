# ADR-0013: URL as the source of truth, Zustand for the rest

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M2

## Context

SPEC §2.1 specifies Zustand for state and TanStack Query for server data, with
URL-driven state. SPEC §1.4 fixes the URL contract —
`?x=&y=&z=&l=&b=&p=` plus waypoints, mode and selected place — and requires
browser back/forward to work.

## Decision

Three tiers, with a clear rule for which owns what:

1. **The URL owns shareable state**: camera, active base layer, waypoints,
   routing mode, selected place. `apps/web/src/lib/url-state.ts` is the single
   parse/serialize pair. Defaults are omitted when serialising so links stay
   short.
2. **Zustand owns ephemeral UI state**: panel open/collapsed, bottom-sheet snap
   point, overlay toggles, measurement in progress.
3. **TanStack Query owns server data**: search results, place details, routes,
   elevation — with caching, deduplication and request cancellation.

## Rationale

- Anything a user can share or bookmark belongs in the URL by definition, and
  making that the _source_ rather than a mirror is what makes back/forward
  correct for free instead of a synchronisation problem.
- Parsing must never throw: URLs are user-editable. Every malformed parameter
  falls back to its default, per-parameter, so one bad value does not discard a
  whole link. This is covered by 26 unit tests including round-trip properties.
- Zustand over Redux: the ephemeral state here is small and mostly independent.

## Consequences

- Map movement must be throttled before it reaches `history.replaceState`, or
  panning floods the history API. M2 implements this.
- Coordinates are rounded to 6 decimals (~11 cm) and angles to 2 on
  serialisation, so imperceptible float drift does not produce a "changed" URL.
- `urlStateEquals` compares serialised forms, which is the comparison that
  actually matters for deciding whether to push history.
