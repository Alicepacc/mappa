#!/usr/bin/env bash
# Step 9 (SPEC §3.1): Photon search index.
#
# Languages it, en, de, fr. Either built from the OSM extract via Nominatim or
# imported from a country dump — the choice is made in M4 against the Photon
# docs current at that time (see docs/adr/0007).
#
# Output: $OUT_DIR/photon/
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="geocoding"

not_implemented "M4"
