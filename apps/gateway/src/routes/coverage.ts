import type { FastifyInstance } from 'fastify';
import { ITALY_BBOX, ITALY_MAX_BOUNDS } from '@mappa/shared';
import type { CoverageService } from '../coverage';

export function registerCoverage(app: FastifyInstance, coverage: CoverageService): void {
  /**
   * `GET /api/coverage` — the coverage polygon consumed by the render mask
   * (SPEC §1.0, §2.2).
   *
   * Before the pipeline has run there is no polygon, so we answer with the
   * bbox rectangle and flag it: the client shows the map rather than failing,
   * and the `exact: false` property makes the degraded state visible.
   */
  app.get('/api/coverage', async (_request, reply) => {
    const geojson = coverage.toGeoJSON();
    reply.header('cache-control', 'public, max-age=3600');

    if (geojson !== null) {
      return { ...geojson, properties: { exact: true, maxBounds: ITALY_MAX_BOUNDS } };
    }

    const [west, south, east, north] = ITALY_BBOX;
    return {
      type: 'FeatureCollection',
      properties: { exact: false, maxBounds: ITALY_MAX_BOUNDS },
      features: [
        {
          type: 'Feature',
          properties: { role: 'boundary', note: 'bbox fallback — run the pipeline' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [west, south],
                [east, south],
                [east, north],
                [west, north],
                [west, south],
              ],
            ],
          },
        },
      ],
    };
  });
}
