import { describe, expect, it } from 'vitest';
import { CoverageService, pointInGeometry } from './coverage';

/** A 10×10 square with a 2×2 hole in the middle. */
const squareWithHole = {
  type: 'Polygon' as const,
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
    [
      [4, 4],
      [6, 4],
      [6, 6],
      [4, 6],
      [4, 4],
    ],
  ],
};

describe('pointInGeometry', () => {
  it('accepts a point inside the outer ring', () => {
    expect(pointInGeometry([2, 2], squareWithHole)).toBe(true);
  });

  it('rejects a point inside a hole', () => {
    expect(pointInGeometry([5, 5], squareWithHole)).toBe(false);
  });

  it('rejects a point outside entirely', () => {
    expect(pointInGeometry([20, 20], squareWithHole)).toBe(false);
  });

  it('handles multipolygons', () => {
    const multi = {
      type: 'MultiPolygon' as const,
      coordinates: [
        squareWithHole.coordinates,
        [
          [
            [20, 20],
            [22, 20],
            [22, 22],
            [20, 22],
            [20, 20],
          ],
        ],
      ],
    };
    expect(pointInGeometry([2, 2], multi)).toBe(true);
    expect(pointInGeometry([21, 21], multi)).toBe(true);
    expect(pointInGeometry([15, 15], multi)).toBe(false);
    expect(pointInGeometry([5, 5], multi)).toBe(false);
  });
});

describe('CoverageService without a built polygon', () => {
  it('degrades to the Italy bbox and reports that it is inexact', async () => {
    const service = new CoverageService();
    const loaded = await service.load('/nonexistent/mappa-data');

    expect(loaded).toBe(false);
    expect(service.isExact).toBe(false);
    expect(service.toGeoJSON()).toBeNull();

    // Canazei, in the dev area.
    expect(service.contains([11.77, 46.48])).toBe(true);
    // Innsbruck, just over the Austrian border.
    expect(service.contains([11.4, 47.27])).toBe(false);
    // Paris.
    expect(service.contains([2.35, 48.86])).toBe(false);
  });
});
