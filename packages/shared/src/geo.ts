/** Longitude/latitude pair in WGS84 (EPSG:4326), always `[lon, lat]`. */
export type LngLat = readonly [lon: number, lat: number];

/** `[west, south, east, north]` in WGS84 degrees. */
export type BBox = readonly [west: number, south: number, east: number, north: number];

/** Mean Earth radius in metres (WGS84 authalic). */
const EARTH_RADIUS_M = 6371008.8;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Great-circle distance in metres between two WGS84 points (haversine). */
export function haversineMetres(a: LngLat, b: LngLat): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** True when `point` lies within `bbox` (inclusive edges). */
export function bboxContains(bbox: BBox, point: LngLat): boolean {
  const [west, south, east, north] = bbox;
  const [lon, lat] = point;
  return lon >= west && lon <= east && lat >= south && lat <= north;
}

/**
 * Grow a bbox by `metres` on every side.
 *
 * The longitude delta is computed at the edge latitude nearest the pole, so the
 * margin is never *narrower* than requested anywhere along the box. Results are
 * clamped to the valid WGS84 domain.
 */
export function bboxBuffer(bbox: BBox, metres: number): BBox {
  const [west, south, east, north] = bbox;
  const latDelta = (metres / EARTH_RADIUS_M) * (180 / Math.PI);

  const widestLat = Math.min(Math.max(Math.abs(south), Math.abs(north)), 89.9);
  const cosLat = Math.cos(toRadians(widestLat));
  // Guard against a division blow-up next to the poles.
  const lonDelta = cosLat < 1e-6 ? 180 : latDelta / cosLat;

  return [
    Math.max(-180, west - lonDelta),
    Math.max(-90, south - latDelta),
    Math.min(180, east + lonDelta),
    Math.min(90, north + latDelta),
  ];
}

/** Round a coordinate to a sane precision for URLs (~1 cm at the equator). */
export function roundCoord(value: number, decimals = 6): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
