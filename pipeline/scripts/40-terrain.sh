#!/usr/bin/env bash
# Step 4 (SPEC §3.1): DEM, terrain-RGB tiles and contour lines.
#
# Plan:
#   1. Fetch the DEM — TINITALY 10 m (CC BY 4.0, see CREDITS.md) for Italy,
#      falling back to Copernicus GLO-30 where TINITALY has no coverage.
#   2. Merge tiles, clip to the buffered coverage, reproject to EPSG:3857.
#   3. terrain.pmtiles — Terrarium-encoded RGB, z$TERRAIN_MIN_ZOOM–$TERRAIN_MAX_ZOOM.
#   4. contours.pmtiles — gdal_contour at ${CONTOUR_INTERVAL_M} m, index lines
#      at ${CONTOUR_INDEX_M} m and ${CONTOUR_INDEX_MAJOR_M} m, simplified per
#      zoom, tiled with tippecanoe, z$CONTOUR_MIN_ZOOM–$CONTOUR_MAX_ZOOM.
#
# Output: $OUT_DIR/terrain.pmtiles, $OUT_DIR/contours.pmtiles
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="terrain"

require_tool gdalwarp "part of GDAL"
require_tool gdal_contour "part of GDAL"
require_tool tippecanoe "https://github.com/felt/tippecanoe"
not_implemented "M1"
