import { type OUT_OF_COVERAGE } from './coverage';
import { type BBox, type LngLat } from './geo';
import { type Place, type PlaceCategory } from './place';
import { type Route, type RouteMode, type Waypoint } from './route';

/** Languages the geocoder is indexed in (SPEC §3.1 step 9). */
export const LANGUAGES = ['it', 'en', 'de', 'fr'] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export type ApiErrorCode =
  | typeof OUT_OF_COVERAGE
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UPSTREAM_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'NOT_IMPLEMENTED'
  | 'INTERNAL';

/** Every non-2xx gateway response has this shape. */
export interface ApiError {
  error: {
    code: ApiErrorCode;
    /** Human-readable, already localised when a `lang` was supplied. */
    message: string;
    details?: unknown;
  };
}

/* -------------------------------------------------------------------------- */
/* GET /api/search                                                            */
/* -------------------------------------------------------------------------- */

export interface SearchQuery {
  q: string;
  /** Viewport bias (SPEC §1.4). */
  lat?: number;
  lon?: number;
  bbox?: BBox;
  limit?: number;
  lang?: Language;
  /** Restrict to a product category, for "search within visible area". */
  category?: PlaceCategory;
}

export interface SearchResult {
  place: Place;
  /** Relevance score, descending. Ranking rules are the gateway's business. */
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  /** Echoed back so a stale response can be discarded by the client. */
  query: string;
}

/* -------------------------------------------------------------------------- */
/* GET /api/reverse                                                           */
/* -------------------------------------------------------------------------- */

export interface ReverseQuery {
  lat: number;
  lon: number;
  lang?: Language;
}

export interface ReverseResponse {
  place: Place | null;
  /** DEM elevation at the queried point, independent of any matched place. */
  elevation: number | null;
}

/* -------------------------------------------------------------------------- */
/* POST /api/route                                                            */
/* -------------------------------------------------------------------------- */

export interface RouteRequest {
  mode: RouteMode;
  waypoints: Waypoint[];
  /** Number of alternatives to request, 0–2 (SPEC §1.5). */
  alternatives?: number;
  /**
   * Opt in to via ferrata and EE/EEA segments in hiking mode. Defaults to
   * `false`: hiking must never route onto expert terrain unless asked (SPEC §1.5).
   */
  allowExpert?: boolean;
  lang?: Language;
}

export interface RouteResponse {
  /** Primary route first, then up to two alternatives. */
  routes: Route[];
}

/* -------------------------------------------------------------------------- */
/* POST /api/elevation                                                        */
/* -------------------------------------------------------------------------- */

export interface ElevationRequest {
  coordinates: LngLat[];
}

export interface ElevationResponse {
  /** One value per input coordinate; `null` where the DEM has no data. */
  elevations: (number | null)[];
}

/* -------------------------------------------------------------------------- */
/* GET /api/health                                                            */
/* -------------------------------------------------------------------------- */

export type ServiceStatus = 'ok' | 'degraded' | 'down';

export interface HealthResponse {
  status: ServiceStatus;
  version: string;
  /** Per-upstream status, so a partial outage is visible in the UI. */
  services: Record<'tiles' | 'routing' | 'geocoding', ServiceStatus>;
  /** Null until the pipeline has produced a manifest. */
  data: { area: string; osmTimestamp: string } | null;
}
