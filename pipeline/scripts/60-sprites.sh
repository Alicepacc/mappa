#!/usr/bin/env bash
# Step 7 (SPEC §3.1): sprite sheets from the original icon set.
#
# Unlike the other steps this one has no external data dependency, so it runs
# today: it shells out to packages/icons, which builds 1x and 2x SDF sprites
# with spreet.
#
# Output: $OUT_DIR/sprites/mappa{,@2x}.{json,png}
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
STEP_NAME="sprites"

build_sprites() {
  ( cd "$REPO_DIR" && pnpm --filter @mappa/icons run build:sprite )
  mkdir -p "$OUT_DIR/sprites"
  cp "$REPO_DIR"/packages/icons/dist/* "$OUT_DIR/sprites/"
  log "sprite sheet: $(human_size "$OUT_DIR/sprites")"
}

run_step "sprites" "building sprites from packages/icons" build_sprites
