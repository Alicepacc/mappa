import {
  DEFAULT_BASE_LAYER,
  DEFAULT_VIEW,
  type BaseLayerId,
  type LngLat,
  type MapView,
  type RouteMode,
  isBaseLayerId,
  isRouteMode,
  roundCoord,
} from '@mappa/shared';

/**
 * The shareable URL contract (SPEC §1.4):
 *
 *   ?x=<lon>&y=<lat>&z=<zoom>&l=<layer>&b=<bearing>&p=<pitch>
 *
 * plus waypoints (`w`), routing mode (`m`) and the selected place (`pl`).
 *
 * Round-tripping is the invariant that matters: `parse(serialize(s)) === s`
 * for any state the app can produce, and any malformed parameter falls back to
 * its default rather than throwing, because URLs are user-editable.
 */
export interface UrlState {
  view: MapView;
  layer: BaseLayerId;
  /** Route planner waypoints in order. */
  waypoints: LngLat[];
  /** Active routing mode, or null when the planner is closed. */
  mode: RouteMode | null;
  /** Selected place as `<osmType>/<osmId>`, or null. */
  place: string | null;
}

export const DEFAULT_URL_STATE: UrlState = {
  view: DEFAULT_VIEW,
  layer: DEFAULT_BASE_LAYER,
  waypoints: [],
  mode: null,
  place: null,
};

const ZOOM_MIN = 0;
const ZOOM_MAX = 22;
const PITCH_MAX = 85;

/** Coordinates keep 6 decimals (~11 cm); zoom/bearing/pitch keep 2. */
const COORD_DECIMALS = 6;
const ANGLE_DECIMALS = 2;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Normalise a bearing into [0, 360). */
const normaliseBearing = (value: number): number => ((value % 360) + 360) % 360;

function num(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === '') return null;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePlace(raw: string | null): string | null {
  if (raw === null) return null;
  return /^(node|way|relation)\/\d+$/.test(raw) ? raw : null;
}

function parseWaypoints(raw: string | null): LngLat[] {
  if (raw === null || raw.trim() === '') return [];

  const waypoints: LngLat[] = [];
  for (const pair of raw.split(';')) {
    const [lonRaw, latRaw, ...rest] = pair.split(',');
    if (lonRaw === undefined || latRaw === undefined || rest.length > 0) continue;

    const lon = Number.parseFloat(lonRaw);
    const lat = Number.parseFloat(latRaw);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;

    waypoints.push([roundCoord(lon, COORD_DECIMALS), roundCoord(lat, COORD_DECIMALS)]);
  }
  return waypoints;
}

/**
 * Read state out of a query string. Never throws: every malformed value falls
 * back to the corresponding default.
 */
export function parseUrlState(search: string, defaults: UrlState = DEFAULT_URL_STATE): UrlState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const lon = num(params, 'x');
  const lat = num(params, 'y');
  const zoom = num(params, 'z');
  const bearing = num(params, 'b');
  const pitch = num(params, 'p');

  const layerRaw = params.get('l');
  const modeRaw = params.get('m');

  return {
    view: {
      lon: lon === null ? defaults.view.lon : clamp(lon, -180, 180),
      lat: lat === null ? defaults.view.lat : clamp(lat, -90, 90),
      zoom: zoom === null ? defaults.view.zoom : clamp(zoom, ZOOM_MIN, ZOOM_MAX),
      bearing: bearing === null ? defaults.view.bearing : normaliseBearing(bearing),
      pitch: pitch === null ? defaults.view.pitch : clamp(pitch, 0, PITCH_MAX),
    },
    layer: layerRaw !== null && isBaseLayerId(layerRaw) ? layerRaw : defaults.layer,
    waypoints: parseWaypoints(params.get('w')),
    mode: modeRaw !== null && isRouteMode(modeRaw) ? modeRaw : defaults.mode,
    place: parsePlace(params.get('pl')),
  };
}

/**
 * Write state into a query string, omitting anything that equals the default so
 * shared links stay short and readable.
 */
export function serializeUrlState(state: UrlState, defaults: UrlState = DEFAULT_URL_STATE): string {
  const params = new URLSearchParams();

  const round = (value: number, decimals: number): string => String(roundCoord(value, decimals));

  // The camera is always present: a link without it is not shareable.
  params.set('x', round(state.view.lon, COORD_DECIMALS));
  params.set('y', round(state.view.lat, COORD_DECIMALS));
  params.set('z', round(state.view.zoom, ANGLE_DECIMALS));

  if (state.layer !== defaults.layer) {
    params.set('l', state.layer);
  }
  if (roundCoord(state.view.bearing, ANGLE_DECIMALS) !== 0) {
    params.set('b', round(normaliseBearing(state.view.bearing), ANGLE_DECIMALS));
  }
  if (roundCoord(state.view.pitch, ANGLE_DECIMALS) !== 0) {
    params.set('p', round(state.view.pitch, ANGLE_DECIMALS));
  }
  if (state.waypoints.length > 0) {
    params.set(
      'w',
      state.waypoints
        .map(([lon, lat]) => `${round(lon, COORD_DECIMALS)},${round(lat, COORD_DECIMALS)}`)
        .join(';'),
    );
  }
  if (state.mode !== null) {
    params.set('m', state.mode);
  }
  if (state.place !== null) {
    params.set('pl', state.place);
  }

  // URLSearchParams percent-encodes `,` and `;`, which makes shared links ugly
  // and harder to read. Both are legal unencoded in a query string.
  return `?${params.toString().replace(/%2C/g, ',').replace(/%3B/g, ';')}`;
}

/** True when two states would produce the same URL. */
export function urlStateEquals(a: UrlState, b: UrlState): boolean {
  return serializeUrlState(a) === serializeUrlState(b);
}
