#!/usr/bin/env bash
# Shared helpers for the pipeline steps.
#
# Every step is cached and skippable (SPEC §3.1): a step writes a marker into
# $CACHE_DIR when it finishes, and re-running is a no-op until either the marker
# is removed or FORCE=1 is set.

set -euo pipefail

PIPELINE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(dirname "$PIPELINE_DIR")"

AREA="${AREA:-dev}"
WORK_DIR="${WORK_DIR:-$PIPELINE_DIR/work/$AREA}"
CACHE_DIR="${CACHE_DIR:-$PIPELINE_DIR/cache/$AREA}"
OUT_DIR="${OUT_DIR:-$REPO_DIR/data}"
FORCE="${FORCE:-0}"

mkdir -p "$WORK_DIR" "$CACHE_DIR" "$OUT_DIR"

# --- area configuration -------------------------------------------------------

area_env="$PIPELINE_DIR/areas/$AREA.env"
if [[ ! -f "$area_env" ]]; then
  echo "error: unknown AREA '$AREA' (expected one of: $(ls "$PIPELINE_DIR/areas" | sed 's/\.env//' | tr '\n' ' '))" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$area_env"

# --- logging ------------------------------------------------------------------

log()  { printf '\033[1;34m[%s]\033[0m %s\n' "${STEP_NAME:-pipeline}" "$*"; }
warn() { printf '\033[1;33m[%s] warning:\033[0m %s\n' "${STEP_NAME:-pipeline}" "$*" >&2; }
die()  { printf '\033[1;31m[%s] error:\033[0m %s\n' "${STEP_NAME:-pipeline}" "$*" >&2; exit 1; }

# --- caching ------------------------------------------------------------------

# marker_path <step-id>
marker_path() { echo "$CACHE_DIR/$1.done"; }

# step_is_done <step-id> — true when the step may be skipped.
step_is_done() {
  [[ "$FORCE" != "1" && -f "$(marker_path "$1")" ]]
}

# step_complete <step-id> — record a successful step.
step_complete() {
  date -u +%Y-%m-%dT%H:%M:%SZ > "$(marker_path "$1")"
}

# --- timing -------------------------------------------------------------------

# Steps append "<step>\t<seconds>\t<status>" so `make data` can print the
# summary of sizes and durations required by SPEC §3.1.
TIMINGS_FILE="$CACHE_DIR/timings.tsv"

record_timing() {
  printf '%s\t%s\t%s\n' "$1" "$2" "$3" >> "$TIMINGS_FILE"
}

# run_step <step-id> <description> <function-name>
run_step() {
  local id="$1" description="$2" fn="$3"
  STEP_NAME="$id"

  if step_is_done "$id"; then
    log "skip — already built (remove $(marker_path "$id") or set FORCE=1)"
    return 0
  fi

  log "$description"
  local started
  started=$(date +%s)

  "$fn"

  local elapsed=$(( $(date +%s) - started ))
  record_timing "$id" "$elapsed" "ok"
  step_complete "$id"
  log "done in ${elapsed}s"
}

# --- tooling ------------------------------------------------------------------

# require_tool <binary> <how-to-get-it>
require_tool() {
  command -v "$1" >/dev/null 2>&1 || die "missing '$1' — $2. Run the step inside the pipeline image: make shell"
}

# human_size <path>
human_size() {
  [[ -e "$1" ]] && du -h "$1" | cut -f1 || echo "-"
}

export AREA WORK_DIR CACHE_DIR OUT_DIR FORCE REPO_DIR PIPELINE_DIR

# --- milestone guards ---------------------------------------------------------

# not_implemented <milestone> — used by step skeletons that land in a later
# milestone. Prints the plan recorded in the script, then stops the run.
not_implemented() {
  warn "this step is scheduled for $1 and is not implemented yet."
  warn "see docs/pipeline.md for the planned commands."
  exit 78
}
