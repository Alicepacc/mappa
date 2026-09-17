# Data pipeline

Everything the map serves is built here from open data (SPEC §3). The build is
scripted, cached and idempotent: each step records a marker when it finishes
and is skipped on the next run until the marker is removed or `FORCE=1` is set.

> **Status after M0.** The framework — Makefile, area configuration, caching,
> timing, the toolchain image — is in place, and the sprite step runs. The
> steps that need external data are documented skeletons that exit with a clear
> "scheduled for M1" message. `make data AREA=dev` therefore stops at step 1
> today, by design.

## Running it

```bash
make data AREA=dev      # Dolomites window — minutes, hundreds of MB
make data AREA=italy    # the whole country — hours, tens of GB
make data-summary       # sizes and durations of the last build
```

Individual steps, and forcing a rebuild:

```bash
make -C pipeline basemap AREA=dev
make -C pipeline basemap AREA=dev FORCE=1
make -C pipeline rebuild AREA=dev     # drop all markers, keep downloads
```

The toolchain (osmium, GDAL, tippecanoe, Planetiler) lives in an image, so the
host needs only Docker:

```bash
make -C pipeline shell AREA=dev
```

## Areas

| Area    | bbox (W, S, E, N)          | Purpose                                                        |
| ------- | -------------------------- | -------------------------------------------------------------- |
| `dev`   | 11.55, 46.35, 11.95, 46.65 | Val Gardena / Val di Fassa / Sella. CI and local work.         |
| `italy` | 6.60, 35.29, 18.80, 47.10  | Production. Coarse clip; the exact boundary comes from step 2. |

The dev window is not arbitrary: it is dense in CAI trails, via ferrate, rifugi
and bivacchi, downhill and nordic pistes and aerialways, and it is trilingual
(Italian, German, Ladin), so it exercises the label-language rules in SPEC §4.1
on real data. Configuration is in `pipeline/areas/*.env`.

## Steps

| #   | Script            | Produces                                        | Milestone           |
| --- | ----------------- | ----------------------------------------------- | ------------------- |
| 1   | `10-download.sh`  | `work/area.osm.pbf`                             | M1                  |
| 2   | `20-coverage.sh`  | `data/coverage.geojson`                         | M1                  |
| 3   | `30-basemap.sh`   | `data/basemap.pmtiles`                          | M1                  |
| 4   | `40-terrain.sh`   | `data/terrain.pmtiles`, `data/contours.pmtiles` | M1                  |
| 5   | `50-glyphs.sh`    | `data/glyphs/`                                  | M1                  |
| 6   | `60-sprites.sh`   | `data/sprites/`                                 | **M0 — runs today** |
| 7   | `70-aerial.sh`    | `data/aerial.pmtiles` (optional)                | M6                  |
| 8   | `80-routing.sh`   | `data/valhalla/`                                | M5                  |
| 9   | `90-geocoding.sh` | `data/photon/`                                  | M4                  |
| 10  | `99-manifest.sh`  | `data/manifest.json`                            | M1                  |

Step numbering follows execution order; the SPEC §3.1 step number is in each
script's header where they differ.

Each script documents its plan in its header — the commands it will run, in
order, and why. Read `pipeline/scripts/40-terrain.sh` for the most involved
example.

### Step 1 — download

Fetches the Geofabrik Italy extract and **verifies it against the published
MD5**. A truncated download must fail here, not three hours later inside
Planetiler. It then checks that San Marino, Vatican City and Campione d'Italia
are present and merges them with osmium if not, and clips to the area bbox.

### Step 2 — coverage

Builds `data/coverage.geojson` from OSM `admin_level=2` boundaries — always
from the **full Italy extract**, never the dev clip, because coverage is
national regardless of which area is being tiled. Also writes a version
buffered by a few kilometres for DEM clipping, so hillshade does not cut
abruptly at the border (SPEC §1.0).

### Step 3 — basemap

Planetiler with a custom profile
([ADR-0005](adr/0005-planetiler-custom-profile.md)). OpenMapTiles-like base
layers plus `hiking_routes`, `cycle_routes`, `paths`, `pistes` and
`outdoor_poi`, carrying `cai_scale`, `sac_scale`, `via_ferrata_scale`, parsed
`osmc:symbol`, `piste:difficulty` and per-way route membership for parallel
offsets. Names are kept in `name`, `name:it`, `name:de`, `name:fr`, `name:lld`.

### Step 4 — terrain and contours

TINITALY 10 m for Italian territory, Copernicus GLO-30 for the buffered margin
([ADR-0010](adr/0010-dem-source-and-encoding.md)). Terrarium-encoded
`terrain.pmtiles` at z0–13; contours at 10 m with index lines at 50 m and 100 m,
tiled with tippecanoe at z11–14.

> Nationwide 10 m contours are the largest and least predictable artefact in
> the build. See the risk note in
> [resource-estimates.md](resource-estimates.md#step-4--dem-terrain-and-contours-gdal-tippecanoe).

### Step 6 — sprites (runs today)

Builds 1× and 2× SDF sprite sheets from `packages/icons/svg` with spreet,
through Docker unless `spreet` is on `PATH` or `SPREET_BIN` is set. The icon
set is original to this project (SPEC §0.2), and a unit test asserts the
registry and the files on disk agree in both directions.

### Step 7 — aerial

Only ingests orthophotos whose licence explicitly permits **download and
redistribution** — regional and provincial open data portals. Never harvests
tiles from WMS services (SPEC §0.1). Every configured source is recorded in
`docs/aerial-sources.md` before any bytes are fetched. With no source
configured, the step is a no-op and the Aerial layer stays hidden.

## Network access

Step 1 needs `download.geofabrik.de`, step 4 needs the INGV and Copernicus
hosts, and step 9 may need `download1.graphhopper.com`.

**Geofabrik is blocked by the egress proxy in the environment this repository
was scaffolded in.** It does not affect M0, which builds no data, but M1 and
the `e2e.yml` / `data.yml` workflows need either an allowlist entry or an
internal mirror. Decide before starting M1.

## Never committed

`data/` is generated and gitignored, along with `*.osm.pbf`, `*.pmtiles`,
`*.tif`, Valhalla tiles and the Photon index (SPEC §0.4). Scripts rebuild
everything; see `data/README.md` for what should be there after a successful
build.
