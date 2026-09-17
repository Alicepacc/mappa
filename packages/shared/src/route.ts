import { type LngLat } from './geo';

/** Routing profiles offered by the planner (SPEC §1.5). */
export const ROUTE_MODES = ['hiking', 'road_bike', 'mtb', 'car_fastest', 'car_shortest'] as const;
export type RouteMode = (typeof ROUTE_MODES)[number];

export function isRouteMode(value: string): value is RouteMode {
  return (ROUTE_MODES as readonly string[]).includes(value);
}

/**
 * CAI hiking difficulty. `T` tourist, `E` excursionist, `EE` expert
 * excursionist, `EEA` expert with equipment (via ferrata).
 * Derived from OSM `cai_scale`, falling back to `sac_scale` (SPEC §1.5).
 */
export const CAI_SCALES = ['T', 'E', 'EE', 'EEA'] as const;
export type CaiScale = (typeof CAI_SCALES)[number];

export interface Waypoint {
  /** Stable id so markers survive reordering. */
  id: string;
  location: LngLat;
  /** Resolved label, when the waypoint came from search or reverse geocoding. */
  name?: string;
}

/** Share of a route falling into one bucket, for the breakdown bars (SPEC §1.5). */
export interface RouteBreakdownEntry<T extends string = string> {
  key: T;
  metres: number;
  /** 0–1, share of total route length. */
  share: number;
}

export interface RouteWarning {
  type: 'via_ferrata' | 'expert_terrain' | 'seasonal' | 'closed';
  message: string;
  /** Index range into the route geometry the warning applies to. */
  fromIndex: number;
  toIndex: number;
}

export interface RouteSummary {
  metres: number;
  seconds: number;
  ascentMetres: number;
  descentMetres: number;
  minElevation: number;
  maxElevation: number;
}

export interface RouteManeuver {
  /** Instruction text, already localised by the gateway. */
  instruction: string;
  metres: number;
  seconds: number;
  /** Index into the route geometry where this maneuver begins. */
  beginIndex: number;
}

export interface Route {
  id: string;
  mode: RouteMode;
  /** `[lon, lat]` positions; elevations are carried separately. */
  geometry: LngLat[];
  /** Metres above sea level, one per geometry position. */
  elevations: number[];
  summary: RouteSummary;
  surfaces: RouteBreakdownEntry[];
  /** Populated for hiking routes only. */
  difficulty?: RouteBreakdownEntry<CaiScale>[];
  warnings: RouteWarning[];
  maneuvers: RouteManeuver[];
  /** True when this is one of the muted alternatives rather than the primary. */
  isAlternative: boolean;
}
