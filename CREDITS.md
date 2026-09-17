# Credits and data licences

SPEC §0.3 requires every data source to be open, its licence **verified from
the official source before use**, recorded here, and attributed visibly in the
application.

Verification date: **2026-09-17** (M0). Re-verify before each source is first
ingested, and at each major release.

---

## In use

### OpenStreetMap

- **Used for:** vector tiles, the coverage polygon, routing graph, search index
- **Licence:** [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/)
- **Source:** <https://www.openstreetmap.org/copyright>
- **Extracts:** <https://download.geofabrik.de/europe/italy.html>
- **Attribution shown in-app:** `© OpenStreetMap contributors`
- **Obligations:** attribution, and share-alike on _derived databases_. Tiles
  produced from OSM are a Produced Work; the underlying data remains ODbL.
  This constrains how tiles may be redistributed and is a separate question
  from the licence of this repository's source code.
- **Status:** ✅ verified, in use from M1

---

## Verified, scheduled for use

### TINITALY 1.1 — INGV

- **Used for:** elevation over Italian territory — hillshade, 3D terrain,
  contours, routing elevation (M1, M5)
- **Licence:** **CC BY 4.0**
- **Source:** <https://tinitaly.pi.ingv.it/>
- **Format:** 10 m grid, GeoTIFF, UTM WGS 84 zone 32; 193 tiles of ~50 km a side
- **Required citation** (a licence condition, not a courtesy):

  > Tarquini S., I. Isola, M. Favalli, A. Battistini, G. Dotta (2023).
  > TINITALY, a digital elevation model of Italy with a 10 meters cell size
  > (Version 1.1). Istituto Nazionale di Geofisica e Vulcanologia (INGV).
  > <https://doi.org/10.13127/tinitaly/1.1>

- **Attribution shown in-app:** `Elevation: TINITALY/1.1 © INGV (CC BY 4.0)`
- **Status:** ✅ verified 2026-09-17, first used in M1

### Copernicus DEM GLO-30

- **Used for:** elevation in the buffered margin outside Italian territory, so
  terrain does not cut abruptly at the border (SPEC §1.0)
- **Licence:** free for any user worldwide; redistribution permitted with the
  prescribed notice below
- **Source:** <https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM>
- **Required notice on distribution:**

  > © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided
  > under COPERNICUS by the European Union and ESA; all rights reserved.

  and:

  > The organisations in charge of the Copernicus programme by law or by
  > delegation do not incur any liability for any use of the Copernicus
  > WorldDEM-30.

- **Status:** ✅ verified 2026-09-17, first used in M1

### Noto Sans — Google Fonts

- **Used for:** map label glyphs (SDF PBF ranges), Regular / Italic / Bold,
  including Latin Extended for Ladin and German characters
- **Licence:** [SIL Open Font License 1.1](https://openfontlicense.org/)
- **Source:** <https://fonts.google.com/noto/specimen/Noto+Sans>
- **Status:** ✅ verified 2026-09-17, first used in M1

---

## Pending verification

### Orthophotos (Aerial layer, M6)

No source is configured yet, and the Aerial layer stays hidden until one is
(SPEC §3.1 step 6).

Each candidate must have a licence that **explicitly permits both download and
redistribution** before any bytes are fetched, and is recorded in
`docs/aerial-sources.md` with source, region, year, resolution, licence and
URL. Harvesting tiles from WMS services is prohibited by SPEC §0.1 regardless
of what the licence says.

---

## Software

Built with, among others: [MapLibre GL JS](https://maplibre.org/) (BSD-3),
[PMTiles](https://docs.protomaps.com/pmtiles/) (BSD-3),
[Planetiler](https://github.com/onthegomap/planetiler) (Apache-2.0),
[Valhalla](https://valhalla.github.io/valhalla/) (MIT),
[Photon](https://github.com/komoot/photon) (Apache-2.0),
[tippecanoe](https://github.com/felt/tippecanoe) (BSD-2),
[GDAL](https://gdal.org/) (MIT), [osmium-tool](https://osmcode.org/osmium-tool/) (GPL-3),
[spreet](https://github.com/flother/spreet) (MIT),
[Caddy](https://caddyserver.com/) (Apache-2.0),
[Fastify](https://fastify.dev/) (MIT), [React](https://react.dev/) (MIT),
[Vite](https://vite.dev/) (MIT).

Full dependency licences: `pnpm licenses list`.

---

## Originality

Per SPEC §0.2, this project is recreated **by observation only**. No tiles,
styles, sprites, fonts, JavaScript, CSS, internal endpoints or data have been
downloaded, scraped, proxied or reverse-engineered from any commercial map
provider. No provider's name, logo or icons are used.

The POI icon set in `packages/icons/svg` and the cartographic palette in
`packages/style/src/tokens.ts` are original work for this project.
