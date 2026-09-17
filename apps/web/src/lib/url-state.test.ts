import { DEFAULT_BASE_LAYER, DEFAULT_VIEW } from '@mappa/shared';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_URL_STATE,
  type UrlState,
  parseUrlState,
  serializeUrlState,
  urlStateEquals,
} from './url-state';

describe('parseUrlState', () => {
  it('reads the documented parameter set', () => {
    const state = parseUrlState('?x=11.77&y=46.48&z=14.5&l=invernale&b=45&p=60');
    expect(state.view).toEqual({ lon: 11.77, lat: 46.48, zoom: 14.5, bearing: 45, pitch: 60 });
    expect(state.layer).toBe('invernale');
  });

  it('tolerates a missing leading question mark', () => {
    expect(parseUrlState('x=11.77&y=46.48').view.lon).toBe(11.77);
  });

  it('falls back to defaults for an empty query', () => {
    expect(parseUrlState('')).toEqual(DEFAULT_URL_STATE);
    expect(parseUrlState('?')).toEqual(DEFAULT_URL_STATE);
  });

  it('falls back per-parameter, keeping the valid ones', () => {
    const state = parseUrlState('?x=nord&y=46.48&z=abc');
    expect(state.view.lon).toBe(DEFAULT_VIEW.lon);
    expect(state.view.lat).toBe(46.48);
    expect(state.view.zoom).toBe(DEFAULT_VIEW.zoom);
  });

  it('ignores an unknown layer', () => {
    expect(parseUrlState('?l=catastale').layer).toBe(DEFAULT_BASE_LAYER);
  });

  it('clamps zoom and pitch to the supported range', () => {
    expect(parseUrlState('?z=99').view.zoom).toBe(22);
    expect(parseUrlState('?z=-4').view.zoom).toBe(0);
    expect(parseUrlState('?p=120').view.pitch).toBe(85);
    expect(parseUrlState('?p=-10').view.pitch).toBe(0);
  });

  it('normalises bearing into [0, 360)', () => {
    expect(parseUrlState('?b=450').view.bearing).toBe(90);
    expect(parseUrlState('?b=-90').view.bearing).toBe(270);
    expect(parseUrlState('?b=360').view.bearing).toBe(0);
  });

  it('accepts a custom fallback state', () => {
    const fallback: UrlState = {
      ...DEFAULT_URL_STATE,
      view: { lon: 11.75, lat: 46.5, zoom: 12, bearing: 0, pitch: 0 },
    };
    expect(parseUrlState('', fallback).view.zoom).toBe(12);
  });

  describe('waypoints', () => {
    it('reads a semicolon-separated list of lon,lat pairs', () => {
      expect(parseUrlState('?w=11.77,46.48;11.8,46.5').waypoints).toEqual([
        [11.77, 46.48],
        [11.8, 46.5],
      ]);
    });

    it('is empty when absent or blank', () => {
      expect(parseUrlState('').waypoints).toEqual([]);
      expect(parseUrlState('?w=').waypoints).toEqual([]);
    });

    it('drops malformed or out-of-domain pairs but keeps the rest', () => {
      const state = parseUrlState('?w=11.77,46.48;bad;200,46;11.8,46.5;1,2,3');
      expect(state.waypoints).toEqual([
        [11.77, 46.48],
        [11.8, 46.5],
      ]);
    });
  });

  describe('mode and place', () => {
    it('reads a known routing mode', () => {
      expect(parseUrlState('?m=hiking').mode).toBe('hiking');
      expect(parseUrlState('?m=car_fastest').mode).toBe('car_fastest');
    });

    it('ignores an unknown mode', () => {
      expect(parseUrlState('?m=sci_alpinismo').mode).toBeNull();
    });

    it('accepts a well-formed place reference', () => {
      expect(parseUrlState('?pl=node/12345').place).toBe('node/12345');
      expect(parseUrlState('?pl=relation/9').place).toBe('relation/9');
    });

    it('ignores a malformed place reference', () => {
      expect(parseUrlState('?pl=node').place).toBeNull();
      expect(parseUrlState('?pl=chunk/1').place).toBeNull();
      expect(parseUrlState('?pl=node/abc').place).toBeNull();
    });
  });
});

describe('serializeUrlState', () => {
  it('always writes the camera', () => {
    expect(serializeUrlState(DEFAULT_URL_STATE)).toBe(
      `?x=${DEFAULT_VIEW.lon}&y=${DEFAULT_VIEW.lat}&z=${DEFAULT_VIEW.zoom}`,
    );
  });

  it('omits values equal to their default', () => {
    const query = serializeUrlState({ ...DEFAULT_URL_STATE, layer: DEFAULT_BASE_LAYER });
    expect(query).not.toContain('l=');
    expect(query).not.toContain('b=');
    expect(query).not.toContain('p=');
    expect(query).not.toContain('w=');
    expect(query).not.toContain('m=');
  });

  it('writes a non-default layer', () => {
    expect(serializeUrlState({ ...DEFAULT_URL_STATE, layer: 'aerea' })).toContain('l=aerea');
  });

  it('leaves separators unencoded so links stay readable', () => {
    const query = serializeUrlState({
      ...DEFAULT_URL_STATE,
      waypoints: [
        [11.77, 46.48],
        [11.8, 46.5],
      ],
    });
    expect(query).toContain('w=11.77,46.48;11.8,46.5');
    expect(query).not.toContain('%2C');
    expect(query).not.toContain('%3B');
  });

  it('rounds coordinates to a sane precision', () => {
    const query = serializeUrlState({
      ...DEFAULT_URL_STATE,
      view: { ...DEFAULT_VIEW, lon: 11.123456789, lat: 46.987654321 },
    });
    expect(query).toContain('x=11.123457');
    expect(query).toContain('y=46.987654');
  });
});

describe('round-tripping', () => {
  const cases: Record<string, UrlState> = {
    defaults: DEFAULT_URL_STATE,
    'full camera': {
      ...DEFAULT_URL_STATE,
      view: { lon: 11.77, lat: 46.48, zoom: 15.25, bearing: 32.5, pitch: 55 },
      layer: 'turistica',
    },
    'winter layer with a route': {
      view: { lon: 11.8, lat: 46.5, zoom: 13, bearing: 0, pitch: 0 },
      layer: 'invernale',
      waypoints: [
        [11.77, 46.48],
        [11.79, 46.49],
        [11.81, 46.51],
      ],
      mode: 'hiking',
      place: null,
    },
    'selected place': {
      ...DEFAULT_URL_STATE,
      layer: 'base',
      place: 'way/987654',
    },
  };

  for (const [name, state] of Object.entries(cases)) {
    it(`round-trips ${name}`, () => {
      expect(parseUrlState(serializeUrlState(state))).toEqual(state);
    });
  }
});

describe('urlStateEquals', () => {
  it('treats states with the same URL as equal', () => {
    const a: UrlState = { ...DEFAULT_URL_STATE, view: { ...DEFAULT_VIEW, lon: 11.1234567 } };
    const b: UrlState = { ...DEFAULT_URL_STATE, view: { ...DEFAULT_VIEW, lon: 11.1234568 } };
    expect(urlStateEquals(a, b)).toBe(true);
  });

  it('detects a real difference', () => {
    expect(urlStateEquals(DEFAULT_URL_STATE, { ...DEFAULT_URL_STATE, layer: 'aerea' })).toBe(false);
  });
});
