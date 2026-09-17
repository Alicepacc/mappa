import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { MASK_OPACITY, carto, fontStack } from '../tokens';
import { type StyleContext, OSM_ATTRIBUTION } from '../context';

/**
 * The "Base" layer (SPEC §4.2).
 *
 * M0 scope: this is the scaffold proving the generate-from-TypeScript and
 * validate-in-CI loop described in SPEC §4. It renders the land background and
 * the out-of-coverage mask (SPEC §1.0) — the two things that are fully
 * specified before any tiles exist. Roads, buildings, POIs and labels arrive in
 * M2 once `basemap.pmtiles` has a schema to bind to.
 */
export function buildBaseStyle(ctx: StyleContext): StyleSpecification {
  return {
    version: 8,
    name: 'Base',
    metadata: {
      'mappa:variant': 'base',
      'mappa:milestone': 'M0 scaffold',
    },
    glyphs: ctx.glyphsUrl,
    sprite: ctx.spriteUrl,
    sources: {
      /**
       * The inverted coverage polygon. The pipeline emits `coverage.geojson`
       * (SPEC §3.1 step 2); the gateway serves it and the client derives the
       * inverted ring used for masking.
       */
      coverage: {
        type: 'geojson',
        data: ctx.coverageUrl,
        attribution: OSM_ATTRIBUTION,
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': carto.land,
        },
      },
      {
        /**
         * Everything outside Italy is flattened to neutral grey. Sea colour is
         * handled by the water layers underneath once they exist, so the mask
         * deliberately does not paint over water (SPEC §1.0).
         */
        id: 'coverage-mask',
        type: 'fill',
        source: 'coverage',
        filter: ['==', ['get', 'role'], 'mask'],
        paint: {
          'fill-color': carto.mask,
          'fill-opacity': MASK_OPACITY,
        },
      },
      {
        id: 'coverage-outline',
        type: 'line',
        source: 'coverage',
        filter: ['==', ['get', 'role'], 'boundary'],
        layout: {
          visibility: 'none',
          'line-join': 'round',
        },
        paint: {
          'line-color': carto.coastline,
          'line-width': 1.2,
          'line-dasharray': [3, 2],
        },
      },
      {
        /**
         * Placeholder label layer: it binds the glyph stack and the label
         * colour tokens so a missing or misconfigured glyph host fails loudly
         * in M0 rather than silently in M3.
         */
        id: 'coverage-label',
        type: 'symbol',
        source: 'coverage',
        filter: ['==', ['get', 'role'], 'label'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': [fontStack.mapRegular],
          'text-size': 12,
        },
        paint: {
          'text-color': carto.label,
          'text-halo-color': carto.labelHalo,
          'text-halo-width': 1.2,
        },
      },
    ],
  };
}
