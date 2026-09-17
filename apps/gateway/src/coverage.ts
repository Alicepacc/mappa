import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ITALY_BBOX, type LngLat, bboxContains } from '@mappa/shared';

/* Minimal GeoJSON shapes — enough for the coverage polygon, no dependency. */
type Position = readonly number[];
type LinearRing = readonly Position[];
type PolygonCoords = readonly LinearRing[];
type MultiPolygonCoords = readonly PolygonCoords[];

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: PolygonCoords;
}
interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: MultiPolygonCoords;
}
type CoverageGeometry = PolygonGeometry | MultiPolygonGeometry;

interface CoverageFeature {
  type: 'Feature';
  geometry: CoverageGeometry;
  properties?: Record<string, unknown> | null;
}

export interface CoverageCollection {
  type: 'FeatureCollection';
  features: CoverageFeature[];
}

/**
 * Ray-casting point-in-ring test. Returns true for points strictly inside;
 * points exactly on an edge are not guaranteed either way, which is fine for a
 * national boundary.
 */
function pointInRing(point: LngLat, ring: LinearRing): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a === undefined || b === undefined) continue;
    const xi = a[0];
    const yi = a[1];
    const xj = b[0];
    const yj = b[1];
    if (xi === undefined || yi === undefined || xj === undefined || yj === undefined) continue;

    const straddles = yi > y !== yj > y;
    if (straddles && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** A polygon contains a point when it is in the outer ring and in no hole. */
function pointInPolygon(point: LngLat, polygon: PolygonCoords): boolean {
  const [outer, ...holes] = polygon;
  if (outer === undefined || !pointInRing(point, outer)) return false;
  return !holes.some((hole) => pointInRing(point, hole));
}

export function pointInGeometry(point: LngLat, geometry: CoverageGeometry): boolean {
  return geometry.type === 'Polygon'
    ? pointInPolygon(point, geometry.coordinates)
    : geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
}

/**
 * Coverage enforcement (SPEC §1.0). Search, reverse geocoding and routing all
 * go through `contains()` before touching an upstream service.
 *
 * Until the pipeline has produced `data/coverage.geojson` the service degrades
 * to the Italy bounding box and says so, so an M0 stack still runs end to end.
 */
export class CoverageService {
  private geojson: CoverageCollection | null = null;

  get isExact(): boolean {
    return this.geojson !== null;
  }

  async load(dataDir: string): Promise<boolean> {
    try {
      const raw = await readFile(join(dataDir, 'coverage.geojson'), 'utf8');
      const parsed: unknown = JSON.parse(raw);
      if (!isCoverageCollection(parsed)) {
        throw new Error('coverage.geojson is not a FeatureCollection of polygons');
      }
      this.geojson = parsed;
      return true;
    } catch {
      this.geojson = null;
      return false;
    }
  }

  /** True when the point is inside the covered area. */
  contains(point: LngLat): boolean {
    if (this.geojson === null) {
      return bboxContains(ITALY_BBOX, point);
    }
    return this.geojson.features.some((feature) => pointInGeometry(point, feature.geometry));
  }

  /** The raw GeoJSON for `GET /api/coverage`, or null when unbuilt. */
  toGeoJSON(): CoverageCollection | null {
    return this.geojson;
  }
}

function isCoverageCollection(value: unknown): value is CoverageCollection {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as { type?: unknown; features?: unknown };
  if (candidate.type !== 'FeatureCollection' || !Array.isArray(candidate.features)) return false;
  return candidate.features.every((feature: unknown) => {
    if (typeof feature !== 'object' || feature === null) return false;
    const geometry = (feature as { geometry?: unknown }).geometry;
    if (typeof geometry !== 'object' || geometry === null) return false;
    const type = (geometry as { type?: unknown }).type;
    return type === 'Polygon' || type === 'MultiPolygon';
  });
}
