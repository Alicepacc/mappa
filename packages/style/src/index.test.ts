import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONTEXT, IMPLEMENTED_STYLES, buildAllStyles, buildStyle } from './index';
import { carto } from './tokens';

describe('generated styles', () => {
  const styles = buildAllStyles(DEFAULT_CONTEXT);

  for (const id of IMPLEMENTED_STYLES) {
    describe(id, () => {
      it('passes the MapLibre style specification validator', () => {
        const errors = validateStyleMin(styles[id]);
        expect(errors.map((e) => e.message)).toEqual([]);
      });

      it('declares every source its layers reference', () => {
        const style = styles[id];
        const declared = new Set(Object.keys(style.sources));
        for (const layer of style.layers) {
          if ('source' in layer && layer.source !== undefined) {
            expect(declared).toContain(layer.source);
          }
        }
      });

      it('gives every layer a unique id', () => {
        const ids = styles[id].layers.map((l) => l.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('attributes OpenStreetMap on at least one source', () => {
        const attributions = Object.values(styles[id].sources)
          .map((s) => ('attribution' in s ? s.attribution : undefined))
          .filter((a): a is string => typeof a === 'string');
        expect(attributions.join(' ')).toContain('OpenStreetMap');
      });
    });
  }
});

describe('buildStyle', () => {
  it('threads the supplied endpoints into the style', () => {
    const style = buildStyle('base', {
      tileBaseUrl: 'https://tiles.example.org',
      glyphsUrl: 'https://tiles.example.org/glyphs/{fontstack}/{range}.pbf',
      spriteUrl: 'https://tiles.example.org/sprites/mappa',
      coverageUrl: 'https://api.example.org/api/coverage',
    });
    expect(style.glyphs).toBe('https://tiles.example.org/glyphs/{fontstack}/{range}.pbf');
    expect(style.sprite).toBe('https://tiles.example.org/sprites/mappa');
    const coverage = style.sources.coverage;
    expect(coverage).toBeDefined();
    expect(coverage && 'data' in coverage ? coverage.data : undefined).toBe(
      'https://api.example.org/api/coverage',
    );
  });

  it('paints land with the warm off-white token', () => {
    const style = buildStyle('base', DEFAULT_CONTEXT);
    const background = style.layers.find((l) => l.id === 'background');
    expect(background?.type).toBe('background');
    expect(background && 'paint' in background ? background.paint : undefined).toMatchObject({
      'background-color': carto.land,
    });
  });
});
