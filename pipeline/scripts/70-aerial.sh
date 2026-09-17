#!/usr/bin/env bash
# Step 6 (SPEC §3.1): optional orthophoto layer.
#
# Only ingests sources whose licence explicitly permits download AND
# redistribution — regional and provincial open data portals. Never harvests
# tiles from WMS services (SPEC §0.1, §3.1 step 6). Each configured source is
# recorded in docs/aerial-sources.md before any bytes are fetched.
#
# When no source is configured this step is a no-op and the Aerial base layer
# stays hidden in the UI.
#
# Output: $OUT_DIR/aerial.pmtiles (optional)
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="aerial"

if [[ -z "${AERIAL_SOURCES:-}" ]]; then
  log "no AERIAL_SOURCES configured — skipping (the Aerial layer will stay hidden)"
  exit 0
fi

not_implemented "M6"
