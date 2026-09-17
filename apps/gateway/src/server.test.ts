import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from './server';

interface ErrorBody {
  error: { code: string; message: string; details?: { index?: number } };
}

interface HealthBody {
  status: string;
  version: string;
  services: Record<string, string>;
  data: unknown;
}

interface CoverageBody {
  type: string;
  properties: { exact: boolean; maxBounds: number[] };
  features: { geometry: { type: string } }[];
}

let app: FastifyInstance;

/** Canazei — inside the dev area, and inside the Italy bbox fallback. */
const INSIDE = { lat: 46.48, lon: 11.77 };
/** Innsbruck — outside Italian coverage. */
const OUTSIDE = { lat: 47.27, lon: 11.4 };

beforeAll(async () => {
  app = await buildServer({ logger: false });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/health', () => {
  it('answers with the service rollup', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);

    const body = response.json<HealthBody>();
    expect(body).toMatchObject({
      status: 'degraded', // upstreams are not running in tests
      services: { tiles: 'down', routing: 'down', geocoding: 'down' },
      data: null,
    });
    expect(typeof body.version).toBe('string');
  });
});

describe('GET /api/coverage', () => {
  it('returns a FeatureCollection flagged inexact before the pipeline runs', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/coverage' });
    expect(response.statusCode).toBe(200);

    const body = response.json<CoverageBody>();
    expect(body.type).toBe('FeatureCollection');
    expect(body.properties.exact).toBe(false);
    expect(body.properties.maxBounds).toHaveLength(4);
    expect(body.features[0]?.geometry.type).toBe('Polygon');
  });

  it('is cacheable', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/coverage' });
    expect(response.headers['cache-control']).toContain('max-age=3600');
  });
});

describe('GET /api/search', () => {
  it('rejects a missing query', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/search' });
    expect(response.statusCode).toBe(400);
    expect(response.json<ErrorBody>().error.code).toBe('BAD_REQUEST');
  });

  it('rejects a blank query', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/search?q=%20%20' });
    expect(response.statusCode).toBe(400);
  });

  it('accepts a valid query and reports the milestone that will serve it', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/search?q=Rifugio%20Vajolet' });
    expect(response.statusCode).toBe(501);
    expect(response.json<ErrorBody>().error.code).toBe('NOT_IMPLEMENTED');
    expect(response.json<ErrorBody>().error.message).toContain('M4');
  });
});

describe('GET /api/reverse', () => {
  it('requires both coordinates', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/reverse?lat=46.48' });
    expect(response.statusCode).toBe(400);
  });

  it('rejects non-numeric coordinates', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/reverse?lat=nord&lon=est' });
    expect(response.statusCode).toBe(400);
  });

  it('rejects a point outside the coverage', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/reverse?lat=${OUTSIDE.lat}&lon=${OUTSIDE.lon}`,
    });
    expect(response.statusCode).toBe(422);
    expect(response.json<ErrorBody>().error.code).toBe('OUT_OF_COVERAGE');
    expect(response.json<ErrorBody>().error.message).toContain('Fuori dall');
  });

  it('passes the coverage check for a point inside Italy', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/reverse?lat=${INSIDE.lat}&lon=${INSIDE.lon}`,
    });
    expect(response.statusCode).toBe(501);
  });
});

describe('GET /api/place/:osmType/:osmId', () => {
  it('rejects an unknown element type', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/place/chunk/1234' });
    expect(response.statusCode).toBe(400);
  });

  it('rejects a non-numeric id', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/place/node/abc' });
    expect(response.statusCode).toBe(400);
  });

  it('accepts a well-formed reference', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/place/relation/42' });
    expect(response.statusCode).toBe(501);
  });
});

describe('POST /api/route', () => {
  const waypoint = (lon: number, lat: number, id: string) => ({ id, location: [lon, lat] });

  it('rejects an unknown mode', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/route',
      payload: {
        mode: 'teleport',
        waypoints: [waypoint(11.77, 46.48, 'a'), waypoint(11.8, 46.5, 'b')],
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it('requires at least two waypoints', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/route',
      payload: { mode: 'hiking', waypoints: [waypoint(11.77, 46.48, 'a')] },
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects a malformed location', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/route',
      payload: {
        mode: 'hiking',
        waypoints: [{ id: 'a', location: 'somewhere' }, waypoint(11.8, 46.5, 'b')],
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects a waypoint outside the coverage and says which one', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/route',
      payload: {
        mode: 'hiking',
        waypoints: [waypoint(11.77, 46.48, 'a'), waypoint(OUTSIDE.lon, OUTSIDE.lat, 'b')],
      },
    });
    expect(response.statusCode).toBe(422);

    const body = response.json<ErrorBody>();
    expect(body.error.code).toBe('OUT_OF_COVERAGE');
    expect(body.error.details?.index).toBe(1);
  });

  it('accepts a valid in-coverage request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/route',
      payload: {
        mode: 'hiking',
        waypoints: [waypoint(11.77, 46.48, 'a'), waypoint(11.8, 46.5, 'b')],
      },
    });
    expect(response.statusCode).toBe(501);
    expect(response.json<ErrorBody>().error.message).toContain('M5');
  });
});

describe('POST /api/elevation', () => {
  it('rejects an empty coordinate list', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/elevation',
      payload: { coordinates: [] },
    });
    expect(response.statusCode).toBe(400);
  });

  it('caps the batch size', async () => {
    const coordinates = Array.from({ length: 2001 }, () => [11.77, 46.48]);
    const response = await app.inject({
      method: 'POST',
      url: '/api/elevation',
      payload: { coordinates },
    });
    expect(response.statusCode).toBe(400);
  });

  it('accepts a well-formed batch', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/elevation',
      payload: {
        coordinates: [
          [11.77, 46.48],
          [11.8, 46.5],
        ],
      },
    });
    expect(response.statusCode).toBe(501);
  });
});

describe('unknown routes', () => {
  it('return a structured 404', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/nope' });
    expect(response.statusCode).toBe(404);
    expect(response.json<ErrorBody>().error.code).toBe('NOT_FOUND');
  });
});
