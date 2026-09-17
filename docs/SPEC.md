# PROJECT SPEC: Self-hosted outdoor web map of Italy (Mapy.com-like)

You are working inside a GitHub repository with the `gh` CLI available.
Build, from scratch, a full-featured web map application covering ONLY
Italy, whose layout, interaction model, cartographic density and overall
feel closely match Mapy.com (the Czech tourist/outdoor map), adapted to
Italian conventions. Everything runs on our own infrastructure from open
data.

## 0. Hard constraints (never violate)
1. NO third-party map APIs at runtime: no Mapy.com, Google, Mapbox,
   MapTiler, HERE, Stadia, Thunderforest, public Nominatim/OSRM, WMS
   services, etc. Every tile, glyph, sprite, search result, route and
   elevation value is served by services defined in this repo
   (docker-compose).
2. Recreate by observation only. Do NOT download, scrape, proxy or
   reverse-engineer Mapy.com tiles, styles, sprites, fonts, JS, CSS,
   internal endpoints or data. Do not use their name, logo or icons.
   Product name is a placeholder: `APP_NAME` (config).
3. Open data only, with licences verified and documented, and visible
   in-app attribution: OpenStreetMap (ODbL), TINITALY DEM (INGV) and/or
   Copernicus GLO-30, open-licensed orthophotos only. Verify each
   licence from the official source before use; record it in CREDITS.md.
4. Never commit large data (`*.osm.pbf`, `*.pmtiles`, `*.tif`, Valhalla
   tiles, Photon index). Add them to .gitignore; scripts rebuild them.
5. Coverage is Italy only (see §1.0). No other country is supported.

## 1. Product behaviour

### 1.0 Geographic scope
- Coverage polygon = Italy's national boundary (OSM admin_level=2)
  including islands, plus the enclaves San Marino and Vatican City and
  the exclave Campione d'Italia. Generate it in the pipeline from OSM
  and store it as `data/coverage.geojson`.
- Map `maxBounds` = coverage bbox + ~50 km margin. Min zoom set so Italy
  fills the viewport on desktop and mobile.
- Outside the coverage polygon: render a neutral light-grey mask
  (inverted polygon), no labels, no POIs, sea stays blue. Terrain and
  hillshade may extend a few km past the border so the Alps don't cut
  abruptly, faded under the mask.
- Search, reverse geocoding and routing only return results inside the
  coverage. Waypoints outside show a friendly error ("Outside the area
  covered by the map").
- Default view: whole Italy. Dev default view: Dolomites (see §3.0).

### 1.1 Layout (desktop ≥ 1024px)
- Full-screen map.
- Left floating panel (~400px, white, rounded, soft shadow), collapsible,
  containing: search box, category shortcuts (Ristoranti, Alloggi,
  Rifugi, Punti panoramici, Parcheggi, Fontane, Vie ferrate, Gite), and
  contextual content (results, place detail, route planner, my places).
- Top-right: map layer switcher (thumbnail cards) + overlays toggles.
- Bottom-right: zoom, compass/bearing reset, geolocate, 2D/3D toggle.
- Bottom: scale bar, attribution, cursor coordinates (toggleable).
- Elevation profile as a bottom drawer when a route exists.

### 1.2 Layout (mobile < 1024px)
- Floating search bar at top.
- Bottom sheet with three snap points (peek / half / full), draggable,
  replacing the left panel. Map controls reposition above the sheet.
- Long-press on map = context menu.

### 1.3 Map layers (base, mutually exclusive)
1. Base: clean general-purpose map, road hierarchy, POIs.
2. Turistica / Outdoor (default): Italian/European tourist-map
   conventions (§4.1).
3. Invernale / Winter: ski pistes, lifts, nordic and ski-touring
   trails, summer trails de-emphasised.
4. Aerea / Aerial: raster orthophoto where open data exists, with
   optional labels overlay (§3 step 6).
Overlays: hiking routes (CAI), cycle routes, contour lines, hillshade,
3D terrain, labels on aerial, coverage outline.

### 1.4 Interactions
- Click POI/label → place detail panel: name (with bilingual name where
  present), category, elevation, Italian-format address
  ("Via Roma 12, 38032 Canazei TN"), opening hours, website, phone,
  wheelchair, operator (e.g. CAI section for rifugi), capacity, OSM
  tags, nearby places, "Percorso fin qui", "Percorso da qui", "Salva",
  "Condividi".
- Right-click / long-press → context menu: "Cosa c'è qui?" (reverse
  geocode, elevation from DEM, coordinates in decimal, DMS and UTM
  WGS84 zone 32N/33N/34N as appropriate), "Percorso da qui",
  "Percorso fin qui", "Aggiungi tappa", "Misura distanza",
  "Copia coordinate", "Condividi punto".
- Search with autocomplete (debounced, keyboard navigable), viewport
  bias, Italian-first ranking (comuni, frazioni, località, cime,
  rifugi, addresses), category search within visible area, results
  list synced with markers. Accept inputs like "Rifugio Vajolet",
  "Cima Tosa", "Via del Corso 1 Roma", "46.5, 11.8".
- Hover on a hiking route → highlight the whole route relation with
  name/ref (e.g. "Sentiero CAI 546", "Alta Via 1"); click → route
  detail (length, ascent, cai_scale, network, elevation profile).
- Shareable URL always reflects state:
  `?x=<lon>&y=<lat>&z=<zoom>&l=<layer>&b=<bearing>&p=<pitch>` plus
  waypoints, mode and selected place. Browser back/forward works.

### 1.5 Route planner
- Modes: A piedi/Escursionismo, Bici da strada, Mountain bike,
  Auto (più veloce), Auto (più breve).
- Start, end, unlimited waypoints; add by click, context menu or search;
  drag markers; drag the line to insert a waypoint; reorder via handles;
  reverse; round trip.
- Summary: distance, duration, ascent/descent, min/max elevation.
- Breakdown bars: surface/road type, and for hiking the CAI difficulty
  (`cai_scale` T/E/EE/EEA, fallback from `sac_scale`) plus warnings for
  via ferrata segments (`highway=via_ferrata`, `via_ferrata_scale`) and
  seasonal/closed trails.
- Hiking mode must never route onto via ferrata or EE/EEA segments
  unless the user enables "Includi percorsi per esperti".
- Up to 2 alternatives in muted colour, selectable.
- Elevation profile: area chart, slope-coloured segments, hover synced
  with a marker on the map and vice versa, drag-to-zoom.
- Turn-by-turn list in Italian (collapsible).
- Export GPX; import GPX/KML/GeoJSON as a layer.

### 1.6 My places (local-first, no accounts in v1)
Save places and routes into folders with name, note, colour, icon,
stored in IndexedDB; export/import JSON and GPX.

### 1.7 Tools
Measure distance and area; export current view to PNG with attribution
and scale; geolocation with accuracy circle and heading; "Condividi
posizione per emergenza" panel showing coordinates in all formats and
a reminder of the 112 emergency number (no data sent anywhere).

## 2. Architecture
Monorepo with pnpm workspaces:

    apps/web          Vite + React 18 + TypeScript (strict)
    apps/gateway      Fastify (TypeScript): single public API, proxies and
                      normalises internal services, caching, rate limits,
                      coverage checks
    packages/style    MapLibre styles generated from TypeScript, tokens
    packages/icons    Original SVG POI icon set + sprite build
    packages/shared   Shared types (Place, Route, Waypoint, API DTOs)
    pipeline/         Reproducible Docker-based data build
    infra/            docker-compose, Caddy config, env examples
    docs/             Architecture, pipeline, cartography guide, ADRs

### 2.1 Frontend stack
- MapLibre GL JS (latest) + PMTiles protocol.
- State: Zustand; server data: TanStack Query; URL-driven state.
- Styling with design tokens; light and dark UI themes (map stays light).
- Elevation chart: uPlot or visx.
- i18n with i18next: Italian (default) and English; metric units;
  Italian date/number formats.
- IndexedDB via Dexie. PWA: cache app shell, glyphs, sprites and a
  bounded cache of recently viewed tiles; installable manifest.

### 2.2 Backend services (docker-compose)
| Service   | Tool                                   | Purpose                         |
|-----------|----------------------------------------|---------------------------------|
| tiles     | Caddy serving PMTiles via HTTP range   | vector, contours, terrain, aerial |
| routing   | Valhalla (Italy graph + DEM)           | routes, alternatives, heights   |
| geocoding | Photon (Italy index, it/en/de/fr)      | search, autocomplete, reverse   |
| gateway   | apps/gateway                           | unified `/api/*`                |
| web       | static build via Caddy                 | frontend                        |

Gateway endpoints (OpenAPI documented, all coverage-checked):
- `GET /api/search?q=&lat=&lon=&bbox=&limit=&lang=`
- `GET /api/reverse?lat=&lon=&lang=`
- `GET /api/place/:osmType/:osmId`
- `POST /api/route` { mode, waypoints[], alternatives, allowExpert }
- `POST /api/elevation` { coordinates[] }
- `GET /api/coverage` (GeoJSON) and `GET /api/health`
Frontend only talks to the gateway and the tile host (configurable).

## 3. Data pipeline (pipeline/, scripted, idempotent)

### 3.0 Areas
- `AREA=dev` (default): Italy extract clipped with osmium to a Dolomites
  bbox around Val Gardena / Val di Fassa / Sella group (approx. lon
  11.55–11.95, lat 46.35–46.65). Contains CAI trails, via ferrate,
  rifugi, pistes, lifts, bilingual names. Used in CI.
- `AREA=italy`: full Italy (production).
Entry point: `make data AREA=dev` / `make data AREA=italy`.

### 3.1 Steps (each cached and skippable)
1. Download the Italy extract from Geofabrik, verify checksum. Verify
   San Marino, Vatican City and Campione d'Italia are included; if not,
   download and merge them with osmium. Clip to AREA.
2. Build `coverage.geojson` from OSM boundaries (§1.0) and a buffered
   version for DEM clipping.
3. Vector tiles with Planetiler using a CUSTOM profile: OpenMapTiles-
   like base layers PLUS:
   - `hiking_routes`: route=hiking/foot relations with name, ref,
     network (iwn/nwn/rwn/lwn), operator (CAI), parsed `osmc:symbol`
     → colour + symbol (Italian red-white-red markings), `cai_scale`,
     and per-way member route lists for parallel offsets.
   - `cycle_routes`: route=bicycle/mtb with network, ref, name.
   - `paths`: highway=path/footway/track/via_ferrata with cai_scale,
     sac_scale, via_ferrata_scale, trail_visibility, tracktype, surface,
     mtb:scale, access, seasonal.
   - `pistes`: piste:type (downhill, nordic, skitour, sled, hike),
     piste:difficulty, piste:grooming; aerialway types with names.
   - `outdoor_poi`: peaks (ele, prominence rank), saddles/passi,
     viewpoints, alpine_hut (rifugio), wilderness_hut (bivacco),
     shelter, spring, drinking_water (fontane), guidepost, chapels and
     wayside shrines, castles, ruins, cave_entrance, waterfall,
     picnic_site, camp_site, parking, ski resorts, beaches, lighthouses.
   - Keep `name`, `name:it`, `name:de`, `name:fr`, `name:lld` for labels.
   Output `basemap.pmtiles`, max zoom 14, overzoom to 18+ in client.
4. DEM: prefer TINITALY 10 m (INGV) after verifying its current
   licence and download terms; fallback Copernicus GLO-30. Merge,
   clip to buffered coverage, reproject with GDAL.
   - `terrain.pmtiles`: terrain-RGB (Terrarium or Mapbox encoding) for
     hillshade and 3D, z0–13.
   - `contours.pmtiles`: gdal_contour 10 m interval, index lines at 50 m
     and 100 m, simplified per zoom, tiled with tippecanoe, z11–14,
     clipped to coverage.
5. Glyphs: SDF PBF ranges from Noto Sans (Regular, Italic, Bold),
   including Latin Extended for Ladin and German characters.
6. Aerial (optional, per-source): ingest only orthophotos whose licence
   explicitly permits download and redistribution (e.g. regional or
   provincial open data portals). Tile them into `aerial.pmtiles`. Keep
   a `docs/aerial-sources.md` table (source, region, year, resolution,
   licence, URL). The layer shows imagery only where coverage exists;
   elsewhere show the Base layer underneath with a notice. If no source
   is configured, hide the Aerial layer. Never harvest tiles from WMS
   services.
7. Sprites from packages/icons SVGs with spreet (1x/2x).
8. Valhalla routing tiles from the same extract, with elevation from the
   DEM; tune hiking costing for `cai_scale`/`sac_scale` and via ferrata
   exclusion.
9. Photon index for AREA (build from OSM or import an Italy dump; check
   current Photon docs), languages it, en, de, fr.
10. Write `data/manifest.json` (tool versions, OSM timestamp, build
    date, bbox, sizes) consumed by the frontend "Info" dialog.
Print a summary of sizes and durations. In M0, research current tool
docs and document realistic RAM, disk and time requirements for the
full Italy build in README.

## 4. Cartography guide (packages/style)
Write docs/cartography.md first, then implement. Styles are generated
from TypeScript with shared tokens; validate with the MapLibre style
spec validator in CI.

### 4.1 Turistica / Outdoor (priority)
- Land warm off-white; forests soft medium green with subtle texture at
  high zoom; meadows/pastures, scrub, vineyards, olive groves, orchards
  with distinct light tints or patterns (vineyards and olive groves
  matter in Italy); rock/scree grey patterned; glaciers pale blue with
  dashed edges; wetlands patterned; sea and lakes calm blue with
  coastline emphasis; rivers tapered by zoom.
- Hillshade subtle, stronger at mid zooms, fading at z16+. Contours
  brown and thin, index contours thicker and labelled, text never upside
  down.
- Roads with casings and clear hierarchy (autostrade, statali,
  provinciali, comunali) without dominating; tracks dashed brown by
  tracktype; paths thin dashed dark lines styled by difficulty
  (T solid-ish → EE sparse dashes); via ferrata: dark line with small
  cross ticks; seasonal/closed trails dimmed.
- CAI hiking routes: coloured bands following `osmc:symbol` (mostly red)
  with white casing, visible from z11, parallel routes offset side by
  side, route numbers in small red-white shields; long-distance routes
  (Alte Vie, Sentiero Italia CAI, Via Francigena) emphasised from z9.
- Cycle routes magenta/purple bands from z10 with ref shields.
- POIs: original icon set, priority by zoom (peaks, passes, rifugi and
  bivacchi first), peaks with name + elevation, water points in blue.
- Labels: Noto Sans with halos over hillshade; label language rule:
  `name:it` → `name`; in bilingual areas (Alto Adige/Südtirol, Valle
  d'Aosta, Ladin valleys) show both names where OSM `name` contains them
  (e.g. "Bolzano - Bozen"), configurable in settings. Settlement sizes
  by place type/population; water labels italic blue; valleys and
  ridges spaced along lines.
- Density: Mapy.com-level richness at z13–16 without clutter; test with
  collision debugging.

### 4.2 Base
Neutral light palette, prominent roads, buildings from z14 with 3D
extrusion when pitched, POIs coloured by category, no contours, light
hillshade in mountains only.

### 4.3 Invernale / Winter
Cool white/blue-grey palette, forests grey-green, pistes by Italian
difficulty colours (facile blu, media rossa, difficile nera; novice
green if tagged; freeride dashed orange), nordic trails dashed blue,
ski-touring routes dashed purple, aerialways thin black with station
names, ski resorts and rifugi emphasised, summer trails at 30% opacity.

### 4.4 Aerea / Aerial
Imagery with optional overlay: thin semi-transparent roads, labels with
strong halos, optional hiking routes.

## 5. UX & design system
- Original brand: placeholder logo, own accent green scale, 12–16px
  radii, 8px spacing grid, system font stack for UI, Noto Sans on map.
- Motion: 200ms panels, bounded `flyTo`, respect prefers-reduced-motion.
- Accessibility: WCAG 2.2 AA, full keyboard support (context menu via
  Shift+F10), visible focus, aria-live for route results, labelled
  controls.
- Empty, loading (skeleton) and error states everywhere; offline banner.

## 6. Quality bar
- TypeScript strict, ESLint + Prettier.
- Vitest: URL state, osmc:symbol parser, cai_scale/sac_scale mapping,
  coverage checks, ascent/descent with smoothing, GPX import/export,
  route normalisation, bilingual label logic.
- Playwright E2E: search "Rifugio" → place → route → profile → GPX,
  context menu, mobile bottom sheet, layer switching, out-of-coverage
  waypoint error.
- Visual regression baselines at fixed views: Sella group (z13, z15),
  Canazei village (z16), a ski area (winter layer), Cinque Terre coast
  and Florence centre (only when AREA=italy), whole Italy (z5).
- Performance: initial JS < 300 KB gzip excluding MapLibre, smooth
  panning, Lighthouse ≥ 90 performance and accessibility on the shell.

## 7. GitHub workflow
- First read the repo; if code exists, summarise it and propose how to
  integrate or restructure before changing anything.
- One branch per milestone (`feat/m1-data-pipeline`, ...), Conventional
  Commits, a PR per milestone via `gh pr create` with summary,
  screenshots and test notes.
- GitHub Actions: `ci.yml` (lint, typecheck, unit tests, build, style
  validation); `e2e.yml` (build AREA=dev data with cache, compose up,
  Playwright + visual tests); `data.yml` (manual dispatch smoke test).
- Issue/PR templates, CONTRIBUTING.md, CREDITS.md; ask me which LICENSE
  to use before adding one.

## 8. Milestones (stop and ask for confirmation after each)
- M0: Repo audit, ADRs for key choices, scaffold, compose skeleton,
  README with prerequisites and measured resource estimates.
- M1: Pipeline for AREA=dev: coverage, basemap, terrain, contours,
  glyphs, sprites; PMTiles served locally.
- M2: Web shell: map with Base layer, coverage mask and bounds,
  controls, URL state, panel/bottom sheet, i18n it/en, themes.
- M3: Turistica layer: hillshade, contours, CAI routes, cycle routes,
  outdoor POIs, via ferrate, 3D terrain, visual baselines.
- M4: Photon + gateway: search, autocomplete, categories, reverse
  geocoding, place panel, context menu, coordinate formats.
- M5: Valhalla + gateway: planner, all modes, expert-trail toggle,
  alternatives, breakdowns, synced elevation profile.
- M6: Invernale and Aerea layers, overlays panel, aerial sources doc.
- M7: My places, GPX/KML/GeoJSON import/export, measure, PNG export,
  share links, emergency coordinates panel.
- M8: PWA, caching, performance and accessibility pass, full tests.
- M9: Full AREA=italy build, deployment guide, weekly OSM refresh
  script, backup and update strategy.

## 9. Definition of done (per milestone)
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass.
- `docker compose up` runs the milestone end-to-end locally.
- Docs updated, screenshots in PR, no data or secrets committed.
- Feature manually verified in the browser; known limitations reported.

Begin with M0: explore the repository, present your plan, and wait for
my approval before writing code.
