#!/usr/bin/env bash
# Step 2 (SPEC §3.1, §1.0): build the coverage polygon.
#
# Plan:
#   1. Extract the admin_level=2 boundary relation for Italy, plus San Marino
#      and Vatican City, from the full Italy extract (never the dev clip — the
#      coverage polygon is national regardless of AREA).
#   2. Union them, keeping islands; verify Campione d'Italia is included.
#   3. Write data/coverage.geojson (used by the gateway and the render mask).
#   4. Write a version buffered by a few km for DEM clipping, so hillshade and
#      terrain do not cut abruptly at the border (SPEC §1.0).
#
# Output: $OUT_DIR/coverage.geojson, $WORK_DIR/coverage-buffered.geojson
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="coverage"

require_tool osmium "part of osmium-tool"
require_tool ogr2ogr "part of GDAL"
not_implemented "M1"
