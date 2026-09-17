# Mappa

A self-hosted outdoor web map of Italy, built entirely from open data.

Everything — tiles, glyphs, sprites, search, routing and elevation — is served
by services defined in this repository. There is no runtime dependency on any
third-party map provider (SPEC §0.1).

> **Status: M0 (scaffold).** The workspace, the gateway's API contract, the
> style generator, the compose stack and the pipeline framework are in place
> and the full quality gate passes. **There is no map yet** — that lands in M2,
> once M1 has produced tiles. See [Milestones](#milestones).
>
> `APP_NAME` is a placeholder (SPEC §0.2), configurable via `APP_NAME` /
> `VITE_APP_NAME`.

## Prerequisites

|                      | Version | Needed for                                 |
| -------------------- | ------- | ------------------------------------------ |
| **Node.js**          | ≥ 22.12 | everything (`.nvmrc` pins 22)              |
| **pnpm**             | ≥ 10    | workspace management — `corepack enable`   |
| **Docker** + Compose | ≥ 24    | the local stack and the pipeline toolchain |
| **GNU Make**         | ≥ 4     | entry points                               |

GDAL, osmium, tippecanoe, Planetiler and Valhalla are **not** installed on the
host — they live in the pipeline image (`pipeline/Dockerfile`). Docker is the
only thing you need for the data build.

For a full `AREA=italy` data build: **8+ cores, 32 GB RAM, 250 GB free SSD**.
See [resource estimates](docs/resource-estimates.md) before starting one.

## Quick start

```bash
corepack enable
pnpm install
pnpm dev            # web on :5173, gateway on :8080
```

The full quality gate (SPEC §9) — about 18 seconds on a warm cache:

```bash
make check          # lint && typecheck && test && build
```

The containerised stack:

```bash
cp infra/.env.example infra/.env
make up             # web :8000 · gateway :8080 · tiles :8081
make down
```

With no data built, the gateway serves `/api/health` and `/api/coverage` (the
latter flagged `exact: false`, falling back to Italy's bounding box) and logs a
warning naming the command to fix it. That is expected in M0.

## Building map data

```bash
make data AREA=dev      # Dolomites window — minutes
make data AREA=italy    # the whole country — hours
make data-summary       # sizes and durations of the last build
```

`AREA=dev` is the Val Gardena / Val di Fassa / Sella window: dense in CAI
trails, via ferrate, rifugi, pistes and lifts, and trilingual, so it exercises
the cartography properly while staying laptop-sized. It is the area CI uses.

Details, including per-step plans and network requirements, are in
[docs/pipeline.md](docs/pipeline.md).

> In M0 the pipeline framework is complete but the steps that need external
> data are documented skeletons; `make data` stops at step 1 with a message
> naming the milestone. Step 6 (sprites) runs today.

## Layout

```
apps/web          Vite + React + TypeScript frontend
apps/gateway      Fastify — the single public API
packages/shared   DTOs, geo primitives, coverage constants
packages/style    MapLibre styles generated from TypeScript
packages/icons    Original SVG POI icon set
pipeline/         Dockerised, cached, idempotent data build
infra/            docker-compose, Caddy, env examples
docs/             Architecture, pipeline, ADRs, estimates
```

## Documentation

|                                                     |                                             |
| --------------------------------------------------- | ------------------------------------------- |
| [SPEC.md](docs/SPEC.md)                             | The project specification                   |
| [architecture.md](docs/architecture.md)             | How the pieces fit together                 |
| [pipeline.md](docs/pipeline.md)                     | The data build, step by step                |
| [resource-estimates.md](docs/resource-estimates.md) | RAM, disk and time — measured and estimated |
| [repo-audit.md](docs/repo-audit.md)                 | M0 audit of the starting repository         |
| [ADRs](docs/adr/README.md)                          | Why the key choices were made               |
| [CREDITS.md](CREDITS.md)                            | Data sources and their verified licences    |
| [CONTRIBUTING.md](CONTRIBUTING.md)                  | Workflow and conventions                    |

## Milestones

|        |                                                                            |          |
| ------ | -------------------------------------------------------------------------- | -------- |
| **M0** | Scaffold, ADRs, compose skeleton, README                                   | **done** |
| M1     | `AREA=dev` pipeline: coverage, basemap, terrain, contours, glyphs, sprites | next     |
| M2     | Map shell: Base layer, mask, bounds, controls, URL state, i18n             |          |
| M3     | Turistica layer: hillshade, contours, CAI routes, outdoor POIs, 3D         |          |
| M4     | Photon: search, autocomplete, reverse geocoding, place panel               |          |
| M5     | Valhalla: route planner, all modes, alternatives, elevation profile        |          |
| M6     | Invernale and Aerea layers, overlays panel                                 |          |
| M7     | My places, GPX/KML/GeoJSON, measure, PNG export, share links               |          |
| M8     | PWA, caching, performance and accessibility pass                           |          |
| M9     | Full `AREA=italy` build, deployment, weekly refresh                        |          |

## Data and attribution

Map data © OpenStreetMap contributors, licensed under the
[ODbL](https://www.openstreetmap.org/copyright). Elevation from
[TINITALY](https://tinitaly.pi.ingv.it/) (INGV, CC BY 4.0) and
[Copernicus DEM GLO-30](https://spacedata.copernicus.eu/). Full details,
verified licence terms and required citations are in [CREDITS.md](CREDITS.md).

This project is an original work. It does not use, proxy or reverse-engineer
any commercial map provider's tiles, styles, sprites, fonts or endpoints
(SPEC §0.2). All icons and cartographic styling in this repository are drawn
for it.

## Licence

**Not yet chosen** — SPEC §7 asks for a decision before a LICENSE file is
added. `package.json` carries `UNLICENSED` as a placeholder until then. Note
that the ODbL obligations attaching to OpenStreetMap-derived _data_ are a
separate question from the licence of this _source code_.
