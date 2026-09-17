import { type Area, isArea } from '@mappa/shared';

function str(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got "${raw}"`);
  }
  return parsed;
}

function area(name: string, fallback: Area): Area {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  if (!isArea(raw)) {
    throw new Error(`Environment variable ${name} must be "dev" or "italy", got "${raw}"`);
  }
  return raw;
}

/** Runtime configuration. Everything is overridable by environment (SPEC §2.2). */
export const config = {
  /** Product name placeholder — SPEC §0.2 forbids a real brand name for now. */
  appName: str('APP_NAME', 'Mappa'),
  version: str('APP_VERSION', '0.0.0-m0'),
  host: str('HOST', '0.0.0.0'),
  port: int('PORT', 8080),
  logLevel: str('LOG_LEVEL', 'info'),
  area: area('AREA', 'dev'),

  /** Directory holding pipeline output (coverage.geojson, manifest.json). */
  dataDir: str('DATA_DIR', '../../data'),

  /** Upstream services proxied and normalised by the gateway (SPEC §2.2). */
  upstream: {
    tiles: str('TILES_URL', 'http://localhost:8081'),
    routing: str('VALHALLA_URL', 'http://localhost:8002'),
    geocoding: str('PHOTON_URL', 'http://localhost:2322'),
  },

  /** Comma-separated list of allowed browser origins; `*` in dev. */
  corsOrigins: str('CORS_ORIGINS', '*'),

  rateLimit: {
    max: int('RATE_LIMIT_MAX', 120),
    windowMs: int('RATE_LIMIT_WINDOW_MS', 60_000),
  },
} as const;

export type Config = typeof config;
