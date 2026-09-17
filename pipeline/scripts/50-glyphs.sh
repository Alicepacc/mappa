#!/usr/bin/env bash
# Step 5 (SPEC §3.1): SDF glyph ranges from Noto Sans.
#
# Regular, Italic and Bold, including Latin Extended so Ladin and German
# characters in the Dolomites render correctly (SPEC §3.1 step 5).
#
# Output: $OUT_DIR/glyphs/{fontstack}/{range}.pbf
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="glyphs"

not_implemented "M1"
