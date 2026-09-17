# Data pipeline (SPEC §3). Entry point is the repo-root Makefile:
#
#   make data AREA=dev
#   make data AREA=italy
#
# Each step is cached: re-running skips work already done. Force a rebuild of
# one step with `make basemap FORCE=1`, or of everything with `make rebuild`.

SHELL := /usr/bin/env bash
AREA ?= dev
FORCE ?= 0
export AREA FORCE

SCRIPTS := scripts
REPO_DIR := $(abspath ..)
DATA_DIR := $(REPO_DIR)/data

.PHONY: all download coverage basemap terrain glyphs sprites aerial routing geocoding manifest \
        summary clean rebuild shell image

# Order matters: coverage clips the tiles, the DEM feeds routing elevation.
all: download coverage basemap terrain glyphs sprites aerial routing geocoding manifest summary

download:   ; @$(SCRIPTS)/10-download.sh
coverage:   ; @$(SCRIPTS)/20-coverage.sh
basemap:    ; @$(SCRIPTS)/30-basemap.sh
terrain:    ; @$(SCRIPTS)/40-terrain.sh
glyphs:     ; @$(SCRIPTS)/50-glyphs.sh
sprites:    ; @$(SCRIPTS)/60-sprites.sh
aerial:     ; @$(SCRIPTS)/70-aerial.sh
routing:    ; @$(SCRIPTS)/80-routing.sh
geocoding:  ; @$(SCRIPTS)/90-geocoding.sh
manifest:   ; @$(SCRIPTS)/99-manifest.sh

## Print sizes and durations for the current area (SPEC §3.1).
summary:
	@echo ""
	@echo "Build summary — AREA=$(AREA)"
	@echo "-----------------------------------------"
	@if [[ -f cache/$(AREA)/timings.tsv ]]; then \
		printf "%-14s %10s\n" "STEP" "SECONDS"; \
		awk -F'\t' '{ printf "%-14s %10s\n", $$1, $$2 }' cache/$(AREA)/timings.tsv; \
	else \
		echo "(no steps have run yet)"; \
	fi
	@echo ""
	@if [[ -d $(DATA_DIR) ]]; then du -sh $(DATA_DIR)/* 2>/dev/null || true; fi

## Drop cache markers so every step reruns, keeping downloaded sources.
rebuild:
	@rm -rf cache/$(AREA)
	@$(MAKE) all

## Remove all intermediate and output data for this area.
clean:
	@rm -rf work/$(AREA) cache/$(AREA)
	@echo "cleaned work/ and cache/ for AREA=$(AREA) (data/ left alone)"

## Build the toolchain image (osmium, GDAL, tippecanoe, Planetiler, Valhalla).
image:
	docker build -t mappa-pipeline:local .

## Open a shell in the toolchain image with the repo mounted.
shell: image
	docker run --rm -it \
		-v $(REPO_DIR):/repo \
		-w /repo/pipeline \
		-e AREA=$(AREA) \
		mappa-pipeline:local bash
