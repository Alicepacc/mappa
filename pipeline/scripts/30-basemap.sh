#!/usr/bin/env bash
# Step 3 (SPEC §3.1): vector tiles with a custom Planetiler profile.
#
# The profile emits OpenMapTiles-like base layers plus the layers this product
# is actually about: hiking_routes, cycle_routes, paths, pistes and outdoor_poi
# (SPEC §3.1 step 3). Names are kept in it/de/fr/lld for the label rules.
#
# Output: $OUT_DIR/basemap.pmtiles (max zoom $BASEMAP_MAX_ZOOM)
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="basemap"

require_tool java "JDK 21+ for Planetiler"
not_implemented "M1"
