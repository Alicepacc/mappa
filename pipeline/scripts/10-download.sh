#!/usr/bin/env bash
# Step 1 (SPEC §3.1): obtain the OSM extract for AREA.
#
# Plan:
#   1. Download europe/italy-latest.osm.pbf from Geofabrik.
#   2. Verify it against the published .md5 — a truncated extract must fail
#      here, not three hours later inside Planetiler.
#   3. Verify San Marino, Vatican City and Campione d'Italia are present
#      (osmium getid on their known relation ids); download and osmium merge
#      the missing ones.
#   4. For AREA=dev, clip with `osmium extract --bbox` to the Sella window.
#
# Output: $WORK_DIR/area.osm.pbf
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="download"

require_tool osmium "part of osmium-tool"
not_implemented "M1"
