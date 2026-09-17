#!/usr/bin/env bash
# Build the MapLibre sprite sheet (1x and 2x) from packages/icons/svg.
#
# SPEC §3.1 step 7 specifies spreet. spreet is a Rust binary, so we run it
# through Docker to keep the host toolchain to Node + Docker only. Set
# SPREET_BIN to use a locally installed binary instead.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pkg_dir="$(dirname "$here")"
svg_dir="$pkg_dir/svg"
out_dir="$pkg_dir/dist"
sprite_name="${SPRITE_NAME:-mappa}"
spreet_image="${SPREET_IMAGE:-ghcr.io/flother/spreet:0.11.0}"

mkdir -p "$out_dir"

run_spreet() {
  # $1.. = spreet arguments
  if [[ -n "${SPREET_BIN:-}" ]]; then
    "$SPREET_BIN" "$@"
  elif command -v spreet >/dev/null 2>&1; then
    spreet "$@"
  elif command -v docker >/dev/null 2>&1; then
    docker run --rm \
      -v "$svg_dir:/svg:ro" \
      -v "$out_dir:/out" \
      "$spreet_image" "$@"
  else
    echo "error: need spreet or docker on PATH to build sprites." >&2
    echo "       install spreet (https://github.com/flother/spreet) or set SPREET_BIN." >&2
    exit 1
  fi
}

# Paths differ between the container and a local binary.
if [[ -n "${SPREET_BIN:-}" ]] || command -v spreet >/dev/null 2>&1; then
  in_path="$svg_dir"
  out_path="$out_dir/$sprite_name"
  out_path_2x="$out_dir/${sprite_name}@2x"
else
  in_path="/svg"
  out_path="/out/$sprite_name"
  out_path_2x="/out/${sprite_name}@2x"
fi

echo "Building sprite '$sprite_name' from $svg_dir"
run_spreet --sdf "$in_path" "$out_path"
run_spreet --sdf --retina "$in_path" "$out_path_2x"

echo "Sprite written to $out_dir:"
ls -la "$out_dir"
