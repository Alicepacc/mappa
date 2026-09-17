/**
 * Base layers are mutually exclusive (SPEC §1.3). The id is user-visible: it is
 * the `l` parameter of the shareable URL (SPEC §1.4).
 */
export const BASE_LAYERS = ['base', 'turistica', 'invernale', 'aerea'] as const;
export type BaseLayerId = (typeof BASE_LAYERS)[number];

export const DEFAULT_BASE_LAYER: BaseLayerId = 'turistica';

export function isBaseLayerId(value: string): value is BaseLayerId {
  return (BASE_LAYERS as readonly string[]).includes(value);
}

/** Toggleable overlays drawn on top of the active base layer (SPEC §1.3). */
export const OVERLAYS = [
  'hiking_routes',
  'cycle_routes',
  'contours',
  'hillshade',
  'terrain_3d',
  'aerial_labels',
  'coverage_outline',
] as const;
export type OverlayId = (typeof OVERLAYS)[number];

export function isOverlayId(value: string): value is OverlayId {
  return (OVERLAYS as readonly string[]).includes(value);
}

/** Camera state carried in the URL (SPEC §1.4). */
export interface MapView {
  lon: number;
  lat: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

/** Whole-Italy default view (SPEC §1.0). */
export const DEFAULT_VIEW: MapView = {
  lon: 12.5,
  lat: 42.5,
  zoom: 5.2,
  bearing: 0,
  pitch: 0,
};

/** Dev default view — the Sella group (SPEC §1.0, §3.0). */
export const DEV_VIEW: MapView = {
  lon: 11.75,
  lat: 46.5,
  zoom: 12,
  bearing: 0,
  pitch: 0,
};
