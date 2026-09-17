import { describe, expect, it } from 'vitest';
import { type BBox, bboxBuffer, bboxContains, haversineMetres, roundCoord } from './geo';

describe('haversineMetres', () => {
  it('returns zero for identical points', () => {
    expect(haversineMetres([11.7, 46.5], [11.7, 46.5])).toBe(0);
  });

  it('measures one degree of latitude as ~111 km', () => {
    const d = haversineMetres([11.7, 46.0], [11.7, 47.0]);
    expect(d).toBeGreaterThan(111_000);
    expect(d).toBeLessThan(111_400);
  });

  it('matches the known Rome–Milan great-circle distance (~477 km)', () => {
    const rome: [number, number] = [12.4964, 41.9028];
    const milan: [number, number] = [9.19, 45.4642];
    const km = haversineMetres(rome, milan) / 1000;
    expect(km).toBeGreaterThan(470);
    expect(km).toBeLessThan(485);
  });

  it('is symmetric', () => {
    const a: [number, number] = [11.85, 46.51];
    const b: [number, number] = [12.1, 46.4];
    expect(haversineMetres(a, b)).toBeCloseTo(haversineMetres(b, a), 6);
  });
});

describe('bboxContains', () => {
  const box: BBox = [11.55, 46.35, 11.95, 46.65];

  it('accepts an interior point', () => {
    expect(bboxContains(box, [11.7, 46.5])).toBe(true);
  });

  it('treats edges as inside', () => {
    expect(bboxContains(box, [11.55, 46.35])).toBe(true);
    expect(bboxContains(box, [11.95, 46.65])).toBe(true);
  });

  it('rejects points outside on each axis', () => {
    expect(bboxContains(box, [11.54, 46.5])).toBe(false);
    expect(bboxContains(box, [11.96, 46.5])).toBe(false);
    expect(bboxContains(box, [11.7, 46.34])).toBe(false);
    expect(bboxContains(box, [11.7, 46.66])).toBe(false);
  });
});

describe('bboxBuffer', () => {
  it('grows latitude by the requested distance', () => {
    const [, south, , north] = bboxBuffer([11.0, 46.0, 12.0, 47.0], 50_000);
    // 50 km ≈ 0.4495° of latitude.
    expect(46.0 - south).toBeCloseTo(0.4495, 3);
    expect(north - 47.0).toBeCloseTo(0.4495, 3);
  });

  it('grows longitude by at least as much as latitude away from the equator', () => {
    const original: BBox = [11.0, 46.0, 12.0, 47.0];
    const [west, south] = bboxBuffer(original, 50_000);
    expect(11.0 - west).toBeGreaterThan(46.0 - south);
  });

  it('uses the pole-most edge so the margin is never too narrow', () => {
    // Widening at lat 47 costs more longitude than at lat 46; we must use 47.
    const [west] = bboxBuffer([11.0, 46.0, 12.0, 47.0], 50_000);
    const lonDeltaAt47 = 0.4495 / Math.cos((47 * Math.PI) / 180);
    expect(11.0 - west).toBeCloseTo(lonDeltaAt47, 3);
  });

  it('clamps to the valid WGS84 domain', () => {
    const [west, south, east, north] = bboxBuffer([-179.9, -89.9, 179.9, 89.9], 500_000);
    expect(west).toBeGreaterThanOrEqual(-180);
    expect(south).toBeGreaterThanOrEqual(-90);
    expect(east).toBeLessThanOrEqual(180);
    expect(north).toBeLessThanOrEqual(90);
  });
});

describe('roundCoord', () => {
  it('rounds to six decimals by default', () => {
    expect(roundCoord(11.123456789)).toBe(11.123457);
  });

  it('honours an explicit precision', () => {
    expect(roundCoord(46.98765, 2)).toBe(46.99);
  });
});
