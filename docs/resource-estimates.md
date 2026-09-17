# Resource estimates

SPEC §3 asks M0 to "research current tool docs and document realistic RAM, disk
and time requirements for the full Italy build".

**Read the confidence column.** Only the application-build figures were
measured on this machine. Everything about the data build is derived from
upstream documentation and published benchmarks, scaled to Italy's share of the
planet. No full Italy build has been run yet — the first real numbers arrive
with the `AREA=dev` build in M1, and this document is updated then.

Confidence key: **M** measured here · **D** stated in upstream docs ·
**E** extrapolated (treat as an order of magnitude, not a budget).

---

## 1. Measured: application build

Node 22.22.2, pnpm 10.33.0, 2026-09-17. Warm cache, single machine.

| Step             | Time      | Notes                                          |     |
| ---------------- | --------- | ---------------------------------------------- | --- |
| `pnpm install`   | ~5 s      | 336 packages, 181 MB `node_modules`            | M   |
| `pnpm lint`      | ~6.1 s    | ESLint 10, type-aware rules                    | M   |
| `pnpm typecheck` | ~5.2 s    | 5 packages, `tsc --noEmit`                     | M   |
| `pnpm test`      | ~3.5 s    | 135 tests, 7 files                             | M   |
| `pnpm build`     | ~2.6 s    | gateway bundle, style JSON, web bundle         | M   |
| **Full gate**    | **~18 s** | SPEC §9's `lint && typecheck && test && build` | M   |

Frontend bundle, production build:

| Artefact    | Raw    | Gzip    | Budget (SPEC §6) |     |
| ----------- | ------ | ------- | ---------------- | --- |
| `index.js`  | 279 KB | 88.4 KB | < 300 KB gzip    | M   |
| `index.css` | 3.8 KB | 1.4 KB  | —                | M   |

88 KB of the 300 KB budget is used with React, i18next and Zustand in place.
MapLibre GL JS is excluded from the budget by SPEC §6 and is code-split into
its own chunk when it arrives in M2; `pmtiles` (~15 KB gzip) counts against it.

Source tree excluding `.git` and `node_modules`: **2.3 MB**.

---

## 2. Input data sizes

| Source                                 | Size                                                   |     |     |
| -------------------------------------- | ------------------------------------------------------ | --- | --- |
| Geofabrik `italy-latest.osm.pbf`       | **2.1 GB** (2026-09-15)                                | D   |
| TINITALY 1.1 DEM                       | 193 zipped tiles, ~50 km a side, 10 m, GeoTIFF UTM 32N | D   |
| TINITALY uncompressed raster           | ~6 GB as Int16, ~12 GB as Float32                      | E   |
| Copernicus GLO-30 (border margin only) | a few GB for the buffered strip                        | E   |

The TINITALY figure is derived: Italy is ~302,000 km²; at 10 m that is ~3.0
billion cells, so 2 bytes/cell ≈ 6 GB and 4 bytes/cell ≈ 12 GB before
compression.

---

## 3. Per-step requirements for `AREA=italy`

### Step 1 — download and clip (osmium)

|      |                                                  |     |
| ---- | ------------------------------------------------ | --- |
| RAM  | ~2 GB                                            | E   |
| Disk | ~5 GB (extract + merged enclaves + clip)         | E   |
| Time | download-bound; 10–30 min on a normal connection | E   |

### Step 3 — vector tiles (Planetiler)

Planetiler documents **≥0.5× the input `.osm.pbf` size in free RAM**, and
**1 GB plus 5–10× the input size in fast SSD scratch**. With ≥1.5× the input
size available it keeps the node-location cache in memory, which is
substantially faster.

|              |                                                                          |     |
| ------------ | ------------------------------------------------------------------------ | --- |
| RAM          | 1.1 GB minimum; **4 GB recommended** (≥1.5× input, in-memory node cache) | D   |
| Scratch disk | **11–21 GB** (5–10× the 2.1 GB input)                                    | D   |
| Output       | `basemap.pmtiles`, z0–14, ~2–5 GB                                        | E   |
| Time         | **10–30 min** on 8 cores                                                 | E   |

The time figure is extrapolated from published planet benchmarks (a 73 GB
planet in 42 min on 64 cores/128 GB; 2 h 38 m on 16 cores/32 GB). Italy is
~3% of the planet by input size, but the relationship is not linear — fixed
costs (Natural Earth, ocean polygons, ~1 GB of downloads) dominate at this
scale.

### Step 4 — DEM, terrain and contours (GDAL, tippecanoe)

|                           |                                                               |     |
| ------------------------- | ------------------------------------------------------------- | --- |
| RAM                       | 8 GB                                                          | E   |
| Scratch disk              | **~40 GB** (merged DEM, reprojected copy, contour shapefiles) | E   |
| `terrain.pmtiles` z0–13   | ~3–6 GB                                                       | E   |
| `contours.pmtiles` z11–14 | **5–20 GB — the least certain number here**                   | E   |
| Time                      | 2–6 h                                                         | E   |

> **Risk flagged in M0.** 10 m contours across all of Italy is the single
> largest and least predictable artefact in the build. Three billion DEM cells
> produce an enormous amount of line geometry, and tippecanoe's output depends
> heavily on simplification settings. M1 measures this on the dev area and
> extrapolates honestly before committing to a nationwide 10 m interval;
> if it proves unreasonable, the mitigations are a coarser interval outside
> mountain regions, or a higher `CONTOUR_MIN_ZOOM`. Both are configuration in
> `pipeline/areas/italy.env`, not code.

### Step 8 — routing graph (Valhalla)

Valhalla's docs recommend **≥16 GB RAM for the builder**; the Enhance and
Validation phases are the memory peak. A full planet build needs roughly
400 GB of disk without elevation, and "another couple hundred gigs" with it,
taking ~15 h.

|      |                                         |     |
| ---- | --------------------------------------- | --- |
| RAM  | **16 GB recommended**                   | D   |
| Disk | ~15–25 GB for Italy, **plus elevation** | E   |
| Time | 30–90 min                               | E   |

Elevation is not optional here: SPEC §1.5's ascent/descent and elevation
profile come from the routing graph, so the elevation-inclusive figures apply.

### Step 9 — geocoding index (Photon)

The planet index is ~31 GB compressed / 56–75 GB uncompressed. Per-country
extracts are published weekly.

|      |                                                                        |     |
| ---- | ---------------------------------------------------------------------- | --- |
| RAM  | 4–8 GB to serve                                                        | D   |
| Disk | **2–5 GB** for Italy                                                   | E   |
| Time | minutes if importing the country dump; hours if building via Nominatim | E   |

Which of those two paths is taken is an open question for M4
([ADR-0007](adr/0007-photon-geocoding.md)).

---

## 4. Totals for a full `AREA=italy` build

|                                 | Estimate                            |     |
| ------------------------------- | ----------------------------------- | --- |
| Peak RAM (one step at a time)   | **16 GB** (Valhalla sets the floor) | E   |
| Peak RAM (recommended headroom) | 32 GB                               | E   |
| Transient scratch disk          | **~80 GB**                          | E   |
| Persistent output in `data/`    | **30–60 GB**, dominated by contours | E   |
| Wall-clock, sequential, 8 cores | **6–12 h**                          | E   |

**Recommended build machine:** 8+ cores, 32 GB RAM, 250 GB free SSD.
**Minimum:** 4 cores, 16 GB RAM, 150 GB free SSD — expect the upper end of
every time range.

Serving is far cheaper than building. Once `data/` exists, the runtime stack
(Caddy + gateway + Valhalla + Photon) runs comfortably in **8 GB RAM**, because
PMTiles is read by range request and Valhalla memory-maps its tiles.

### `AREA=dev`

The Dolomites window is ~0.4° × 0.3°. Every figure above collapses to minutes
and hundreds of megabytes; it builds on a laptop, which is the point of
pinning it as the CI area (SPEC §3.0).

---

## 5. How these numbers get replaced

1. **M1** measures the full `AREA=dev` build and records real timings and sizes
   in `data/manifest.json` via `make data-summary`.
2. **M9** runs the first full `AREA=italy` build. This document is then rewritten
   with measured figures and the confidence column drops the **E** rows.

Until then, treat every **E** row as a planning figure, not a guarantee.

## Sources

- [Planetiler README](https://github.com/onthegomap/planetiler) — RAM, disk and benchmark figures
- [Planetiler PLANET.md](https://github.com/onthegomap/planetiler/blob/main/PLANET.md)
- [Valhalla — Mjolnir getting started guide](https://valhalla.github.io/valhalla/mjolnir/getting_started_guide/)
- [Valhalla discussion #3661 — planet disk space](https://github.com/valhalla/valhalla/discussions/3661)
- [Valhalla discussion #3288 — build_tiles memory](https://github.com/valhalla/valhalla/discussions/3288)
- [Photon](https://github.com/komoot/photon) and [country extracts](https://nominatim.org/2020/10/21/photon-country-extracts.html)
- [Geofabrik Italy extract](https://download.geofabrik.de/europe/italy.html)
- [TINITALY DEM, INGV](https://tinitaly.pi.ingv.it/)
