import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import type { DataManifest, HealthResponse, ServiceStatus } from '@mappa/shared';
import { config } from '../config';

const PROBE_TIMEOUT_MS = 1000;

/** A liveness probe that never throws: any failure is reported as `down`. */
async function probe(url: string, path: string): Promise<ServiceStatus> {
  try {
    const response = await fetch(new URL(path, url), {
      method: 'GET',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return response.ok ? 'ok' : 'degraded';
  } catch {
    return 'down';
  }
}

async function readManifest(dataDir: string): Promise<HealthResponse['data']> {
  try {
    const raw = await readFile(join(dataDir, 'manifest.json'), 'utf8');
    const manifest = JSON.parse(raw) as DataManifest;
    return { area: manifest.area, osmTimestamp: manifest.osmTimestamp };
  } catch {
    return null;
  }
}

export function registerHealth(app: FastifyInstance): void {
  app.get('/api/health', async (): Promise<HealthResponse> => {
    const [tiles, routing, geocoding, data] = await Promise.all([
      probe(config.upstream.tiles, '/'),
      probe(config.upstream.routing, '/status'),
      probe(config.upstream.geocoding, '/status'),
      readManifest(config.dataDir),
    ]);

    const services = { tiles, routing, geocoding };
    // The gateway itself is up if it answered; upstreams degrade the rollup.
    const anyDown = Object.values(services).some((s) => s !== 'ok');

    return {
      status: anyDown ? 'degraded' : 'ok',
      version: config.version,
      services,
      data,
    };
  });
}
