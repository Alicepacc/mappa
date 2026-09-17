# Architecture Decision Records

Short documents recording the decisions that would be expensive to reverse,
and _why_ they were made — so a future contributor can tell a deliberate
choice from an accident.

Format: [MADR](https://adr.github.io/madr/)-flavoured, one file per decision,
numbered in the order they were taken. Status is one of `Proposed`,
`Accepted`, `Superseded by ADR-NNNN` or `Deprecated`.

| ADR                                           | Title                                                  | Status   |
| --------------------------------------------- | ------------------------------------------------------ | -------- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions                          | Accepted |
| [0002](0002-pnpm-monorepo.md)                 | pnpm workspace monorepo with source-exporting packages | Accepted |
| [0003](0003-frontend-stack.md)                | Frontend stack: Vite, React 19, TypeScript strict      | Accepted |
| [0004](0004-pmtiles-over-tile-server.md)      | PMTiles on a static host instead of a tile server      | Accepted |
| [0005](0005-planetiler-custom-profile.md)     | Planetiler with a custom profile for vector tiles      | Accepted |
| [0006](0006-valhalla-routing.md)              | Valhalla for routing                                   | Accepted |
| [0007](0007-photon-geocoding.md)              | Photon for search and reverse geocoding                | Accepted |
| [0008](0008-fastify-gateway.md)               | A single Fastify gateway in front of every service     | Accepted |
| [0009](0009-styles-from-typescript.md)        | Generate MapLibre styles from TypeScript               | Accepted |
| [0010](0010-dem-source-and-encoding.md)       | TINITALY as primary DEM, Terrarium encoding            | Accepted |
| [0011](0011-coverage-enforcement.md)          | Coverage as a polygon enforced at the gateway          | Accepted |
| [0012](0012-caddy-static-hosting.md)          | Caddy for tiles and static hosting                     | Accepted |
| [0013](0013-client-state.md)                  | URL as the source of truth, Zustand for the rest       | Accepted |
| [0014](0014-local-first-storage.md)           | Local-first storage in IndexedDB, no accounts in v1    | Accepted |
| [0015](0015-testing-strategy.md)              | Testing strategy: Vitest, Playwright, visual baselines | Accepted |
