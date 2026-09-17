import { describe, expect, it } from 'vitest';
import {
  AREAS,
  DEV_BBOX,
  ITALY_BBOX,
  ITALY_MAX_BOUNDS,
  bboxForArea,
  isArea,
  isPlausiblyInsideCoverage,
} from './coverage';
import { type LngLat, bboxContains } from './geo';

/** Extreme points of Italian territory — the bbox must contain all of them. */
const EXTREMES: Record<string, LngLat> = {
  'Vetta d’Italia (N)': [12.2, 47.09],
  'Isola di Lampedusa (S)': [12.57, 35.49],
  'Rocca Bernauda (W)': [6.63, 45.09],
  'Capo d’Otranto (E)': [18.52, 40.12],
  'San Marino (enclave)': [12.45, 43.94],
  'Vatican City (enclave)': [12.45, 41.9],
  "Campione d'Italia (exclave)": [8.97, 45.97],
  Pantelleria: [11.95, 36.79],
  'Sardinia — Cagliari': [9.12, 39.22],
};

describe('ITALY_BBOX', () => {
  for (const [name, point] of Object.entries(EXTREMES)) {
    it(`contains ${name}`, () => {
      expect(isPlausiblyInsideCoverage(point)).toBe(true);
    });
  }

  it('rejects points well outside Italian territory', () => {
    expect(isPlausiblyInsideCoverage([2.35, 48.86])).toBe(false); // Paris
    expect(isPlausiblyInsideCoverage([23.73, 37.98])).toBe(false); // Athens
    expect(isPlausiblyInsideCoverage([10.75, 59.91])).toBe(false); // Oslo
    expect(isPlausiblyInsideCoverage([13.19, 32.89])).toBe(false); // Tripoli
  });

  it('is a well-formed bbox', () => {
    const [west, south, east, north] = ITALY_BBOX;
    expect(west).toBeLessThan(east);
    expect(south).toBeLessThan(north);
  });
});

describe('ITALY_MAX_BOUNDS', () => {
  it('strictly contains the coverage bbox', () => {
    const [west, south, east, north] = ITALY_MAX_BOUNDS;
    const [cWest, cSouth, cEast, cNorth] = ITALY_BBOX;
    expect(west).toBeLessThan(cWest);
    expect(south).toBeLessThan(cSouth);
    expect(east).toBeGreaterThan(cEast);
    expect(north).toBeGreaterThan(cNorth);
  });

  it('adds roughly 50 km of latitude margin', () => {
    const [, south] = ITALY_MAX_BOUNDS;
    expect(ITALY_BBOX[1] - south).toBeCloseTo(0.4495, 2);
  });
});

describe('DEV_BBOX', () => {
  it('is the Sella / Val Gardena / Val di Fassa window from the spec', () => {
    expect(DEV_BBOX).toEqual([11.55, 46.35, 11.95, 46.65]);
  });

  it('lies entirely inside the Italy bbox', () => {
    const [west, south, east, north] = DEV_BBOX;
    expect(bboxContains(ITALY_BBOX, [west, south])).toBe(true);
    expect(bboxContains(ITALY_BBOX, [east, north])).toBe(true);
  });

  it('contains Canazei', () => {
    expect(bboxContains(DEV_BBOX, [11.77, 46.48])).toBe(true);
  });
});

describe('areas', () => {
  it('recognises the two supported areas', () => {
    expect(AREAS).toEqual(['dev', 'italy']);
    expect(isArea('dev')).toBe(true);
    expect(isArea('italy')).toBe(true);
    expect(isArea('france')).toBe(false);
  });

  it('maps each area to its bbox', () => {
    expect(bboxForArea('dev')).toBe(DEV_BBOX);
    expect(bboxForArea('italy')).toBe(ITALY_BBOX);
  });
});
