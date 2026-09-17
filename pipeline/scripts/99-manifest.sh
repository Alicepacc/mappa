#!/usr/bin/env bash
# Step 10 (SPEC §3.1): write data/manifest.json and print the build summary.
#
# The manifest records tool versions, the OSM timestamp, build date, bbox and
# artefact sizes. The frontend "Info" dialog reads it; CI uses it to detect a
# stale data cache.
#
# Output: $OUT_DIR/manifest.json
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="manifest"

not_implemented "M1"
