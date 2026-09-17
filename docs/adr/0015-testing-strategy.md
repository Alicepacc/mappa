# ADR-0015: Testing strategy — Vitest, Playwright, visual baselines

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M0

## Context

SPEC §6 names the unit tests (URL state, `osmc:symbol` parser,
`cai_scale`/`sac_scale` mapping, coverage checks, ascent/descent with
smoothing, GPX import/export, route normalisation, bilingual label logic), the
E2E journeys, and visual regression baselines at fixed views. SPEC §9 makes
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` the gate.

## Decision

Four layers, each with a defined job:

1. **Unit (Vitest)** — pure logic, no network, no browser unless the code needs
   one. Every item in SPEC §6's list lands here. Runs on every push.
2. **Contract (Vitest + `fastify.inject`)** — the gateway's HTTP surface
   without a network listener: status codes, error codes, coverage rejection.
   Fast enough to run with the unit tests.
3. **E2E (Playwright)** — the journeys in SPEC §6 against a real compose stack
   with `AREA=dev` data. Separate workflow (`e2e.yml`) with a data cache.
4. **Visual regression** — baselines at the fixed views in SPEC §6. Part of the
   E2E workflow, because they need real tiles.

## Rationale

- Splitting E2E from CI keeps the fast gate fast: unit and contract tests run in
  seconds on a clean checkout with no data build, which is what makes them
  usable on every push.
- `fastify.inject` gives real routing, real serialisation and real error
  handling without a port, so the contract tests are honest without being slow.
- Visual baselines are worthless without deterministic data, which is exactly
  why `AREA=dev` is pinned to a fixed bbox and the manifest records the OSM
  timestamp.

## M0 state

135 tests across five packages: geo primitives and the coverage bbox against
nine extreme points of Italian territory, point-in-polygon with holes, the URL
state codec including round-trip properties, the generated style against the
MapLibre validator, the icon registry against the files on disk, and the
gateway's full HTTP contract. E2E and visual baselines arrive with the map in
M2–M3.

## Consequences

- A test that needs map data belongs in the E2E workflow, not the unit suite.
  Keeping that line sharp is what prevents the fast gate from rotting.
- Visual baselines must be regenerated deliberately when cartography changes,
  and the diff reviewed — an updated baseline is a design decision, not a fix.
