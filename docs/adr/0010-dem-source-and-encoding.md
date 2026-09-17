# ADR-0010: TINITALY as primary DEM, Terrarium encoding

- **Status:** Accepted
- **Date:** 2026-09-17
- **Milestone:** M1

## Context

SPEC §3.1 step 4 requires terrain-RGB tiles for hillshade and 3D, plus 10 m
contours, and says to prefer TINITALY 10 m "after verifying its current licence
and download terms", falling back to Copernicus GLO-30. SPEC §0.3 requires the
licence to be verified from the official source and recorded in CREDITS.md.

## Licence verification (M0)

- **TINITALY 1.1** (INGV) is published under **CC BY 4.0** and requires
  citation. It is a 10 m grid distributed as GeoTIFF in UTM WGS 84 zone 32,
  arranged as 193 tiles of roughly 50 km a side.
  Source: <https://tinitaly.pi.ingv.it/>.
- **Copernicus DEM GLO-30** is free for any registered user worldwide, and
  redistribution is permitted with a prescribed attribution notice (© DLR e.V.
  2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under
  COPERNICUS by the European Union and ESA) plus a liability disclaimer.

Both permit redistribution with attribution. Both are recorded in CREDITS.md.

## Decision

- **TINITALY 10 m** as the primary DEM for Italian territory: three times the
  linear resolution of GLO-30, which is what makes 10 m contours in the
  Dolomites honest rather than interpolated.
- **Copernicus GLO-30** to fill the buffered margin outside Italian territory,
  so hillshade and terrain do not cut abruptly at the border (SPEC §1.0).
- **Terrarium** encoding for `terrain.pmtiles`, not Mapbox Terrain-RGB.

## Rationale for Terrarium

Both are supported by MapLibre's `raster-dem` source. Terrarium's decoding is
the simpler formula, it is the encoding used by open elevation tilesets, and it
is unencumbered by association with a commercial provider's format — which fits
SPEC §0.1's posture.

## Consequences

- Two DEM sources must be merged and reprojected; TINITALY is UTM 32N, and the
  tile pyramid is EPSG:3857. GDAL handles it, but the seam needs checking where
  the sources meet.
- TINITALY covers Italy only. Any future coverage change means revisiting this.
- The attribution strings for both sources appear in-app (SPEC §0.3), not only
  in CREDITS.md.
- Citation of TINITALY 1.1 is a licence condition, not a courtesy. The exact
  citation is in CREDITS.md.
