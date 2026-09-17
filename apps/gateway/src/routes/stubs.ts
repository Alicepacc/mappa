import type { FastifyInstance } from 'fastify';
import { type LngLat, type RouteRequest, isRouteMode } from '@mappa/shared';
import type { CoverageService } from '../coverage';
import { badRequest, notImplemented, outOfCoverage } from '../errors';

/**
 * The endpoints whose upstreams arrive in M4 (Photon) and M5 (Valhalla).
 *
 * They are wired now, with their real request validation and coverage checks,
 * so the API contract in SPEC §2.2 is testable from M0: a malformed request
 * gets 400 and an out-of-coverage one gets 422 today. Only the upstream call
 * is missing, and that returns 501 naming the milestone.
 */
export function registerStubs(app: FastifyInstance, coverage: CoverageService): void {
  /* ---------------------------------------------------------------- search */

  app.get('/api/search', (request) => {
    const query = request.query as Record<string, string | undefined>;
    const q = query.q?.trim();
    if (q === undefined || q === '') {
      throw badRequest('Query parameter "q" is required');
    }

    // Viewport bias is optional, but if given it must be a usable coordinate.
    if (query.lat !== undefined || query.lon !== undefined) {
      parsePoint(query.lat, query.lon);
    }

    throw notImplemented('M4 (Photon + gateway search)');
  });

  /* --------------------------------------------------------------- reverse */

  app.get('/api/reverse', (request) => {
    const query = request.query as Record<string, string | undefined>;
    const point = parsePoint(query.lat, query.lon);
    requireCovered(coverage, [point]);
    throw notImplemented('M4 (reverse geocoding)');
  });

  /* ----------------------------------------------------------------- place */

  app.get('/api/place/:osmType/:osmId', (request) => {
    const params = request.params as { osmType?: string; osmId?: string };
    if (!['node', 'way', 'relation'].includes(params.osmType ?? '')) {
      throw badRequest('osmType must be one of node, way, relation');
    }
    if (!/^\d+$/.test(params.osmId ?? '')) {
      throw badRequest('osmId must be a positive integer');
    }
    throw notImplemented('M4 (place detail)');
  });

  /* ----------------------------------------------------------------- route */

  app.post('/api/route', (request) => {
    const body = request.body as Partial<RouteRequest> | undefined;
    if (body === undefined || typeof body !== 'object') {
      throw badRequest('A JSON body is required');
    }
    if (typeof body.mode !== 'string' || !isRouteMode(body.mode)) {
      throw badRequest('mode must be one of hiking, road_bike, mtb, car_fastest, car_shortest');
    }
    if (!Array.isArray(body.waypoints) || body.waypoints.length < 2) {
      throw badRequest('At least two waypoints are required');
    }

    const points = body.waypoints.map((waypoint, index) => {
      const location = waypoint?.location;
      if (!Array.isArray(location) || location.length !== 2) {
        throw badRequest(`waypoints[${index}].location must be [lon, lat]`);
      }
      const [lon, lat] = location;
      if (typeof lon !== 'number' || typeof lat !== 'number') {
        throw badRequest(`waypoints[${index}].location must be numeric`);
      }
      return assertFinitePoint(lon, lat);
    });

    requireCovered(coverage, points);
    throw notImplemented('M5 (Valhalla routing)');
  });

  /* ------------------------------------------------------------- elevation */

  app.post('/api/elevation', (request) => {
    const body = request.body as { coordinates?: unknown } | undefined;
    const coordinates = body?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      throw badRequest('coordinates must be a non-empty array of [lon, lat]');
    }
    if (coordinates.length > 2000) {
      throw badRequest('At most 2000 coordinates per request');
    }
    for (const [index, entry] of coordinates.entries()) {
      if (!Array.isArray(entry) || entry.length !== 2) {
        throw badRequest(`coordinates[${index}] must be [lon, lat]`);
      }
      assertFinitePoint(entry[0] as number, entry[1] as number);
    }
    throw notImplemented('M5 (elevation from the DEM)');
  });
}

/* ------------------------------------------------------------------ helpers */

function parsePoint(latRaw: string | undefined, lonRaw: string | undefined): LngLat {
  if (latRaw === undefined || lonRaw === undefined) {
    throw badRequest('Both "lat" and "lon" are required');
  }
  const lat = Number.parseFloat(latRaw);
  const lon = Number.parseFloat(lonRaw);
  return assertFinitePoint(lon, lat);
}

function assertFinitePoint(lon: number, lat: number): LngLat {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    throw badRequest('Coordinates must be finite numbers');
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw badRequest('Coordinates must be within the WGS84 domain');
  }
  return [lon, lat];
}

/** SPEC §1.0: nothing outside the coverage reaches an upstream service. */
function requireCovered(coverage: CoverageService, points: readonly LngLat[]): void {
  const offending = points.findIndex((point) => !coverage.contains(point));
  if (offending !== -1) {
    throw outOfCoverage({ index: offending, location: points[offending] });
  }
}
