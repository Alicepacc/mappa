#!/usr/bin/env bash
# Step 8 (SPEC §3.1): Valhalla routing tiles.
#
# Built from the same extract as the vector tiles, with elevation from the DEM
# so ascent/descent in the route summary and the elevation profile agree with
# what is drawn. Hiking costing is tuned for cai_scale/sac_scale, and via
# ferrata is excluded unless the caller opts in (SPEC §1.5).
#
# Output: $OUT_DIR/valhalla/
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="routing"

not_implemented "M5"
