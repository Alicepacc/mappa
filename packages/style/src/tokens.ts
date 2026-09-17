/**
 * Design tokens — the single source of truth for both the UI chrome and the
 * cartography (SPEC §4, §5).
 *
 * Nothing here is derived from any existing map product. The palette is an
 * original selection chosen to satisfy the descriptive brief in SPEC §4.1
 * (warm off-white land, soft medium green forest, calm blue water) while
 * keeping label/halo contrast inside WCAG 2.2 AA on the map surface.
 */

/* -------------------------------------------------------------------------- */
/* Brand                                                                      */
/* -------------------------------------------------------------------------- */

/** Accent green scale, 50→900 (SPEC §5: "own accent green scale"). */
export const accent = {
  50: '#f1f8f2',
  100: '#dcecdf',
  200: '#bbd9c2',
  300: '#8fbf9c',
  400: '#5fa072',
  500: '#3d8556',
  600: '#2c6b43',
  700: '#245537',
  800: '#1e442d',
  900: '#183624',
} as const;

/** Neutral grey scale for UI surfaces and text. */
export const neutral = {
  0: '#ffffff',
  50: '#f7f7f6',
  100: '#eeeeec',
  200: '#dcdcd6',
  300: '#c4c4bf',
  400: '#9c9c96',
  500: '#74746e',
  600: '#575751',
  700: '#3f3f3a',
  800: '#2a2a26',
  900: '#191917',
} as const;

/** Semantic colours for warnings, errors and difficulty emphasis. */
export const semantic = {
  danger: '#b3261e',
  warning: '#9a6700',
  info: '#1b5e9c',
  success: accent[600],
} as const;

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

/** 8px spacing grid (SPEC §5). Index = multiples of the base step. */
export const space = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '40px',
  8: '48px',
} as const;

/** 12–16px radii (SPEC §5). */
export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  pill: '999px',
} as const;

export const shadow = {
  panel: '0 2px 16px rgba(25, 25, 23, 0.12), 0 0 1px rgba(25, 25, 23, 0.24)',
  control: '0 1px 4px rgba(25, 25, 23, 0.18)',
} as const;

/** Desktop layout breakpoint (SPEC §1.1 / §1.2). */
export const BREAKPOINT_DESKTOP_PX = 1024;

/** Left panel width on desktop (SPEC §1.1). */
export const PANEL_WIDTH_PX = 400;

/** Panel/sheet transition duration (SPEC §5: "200ms panels"). */
export const MOTION_PANEL_MS = 200;

export const fontStack = {
  /** System stack for UI (SPEC §5). */
  ui: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  /** Glyph set baked into the tiles (SPEC §3.1 step 5). */
  mapRegular: 'Noto Sans Regular',
  mapBold: 'Noto Sans Bold',
  mapItalic: 'Noto Sans Italic',
} as const;

/* -------------------------------------------------------------------------- */
/* Cartographic palette (SPEC §4.1)                                           */
/* -------------------------------------------------------------------------- */

export const carto = {
  /** Warm off-white land. */
  land: '#f6f3ec',
  /** Calm blue sea and lakes. */
  water: '#a8c9dd',
  waterDeep: '#93b9d1',
  coastline: '#7fa6bf',
  /** Soft medium green forest. */
  forest: '#c3d9b4',
  meadow: '#e2ecd2',
  scrub: '#d6e2c2',
  vineyard: '#ddd9bd',
  oliveGrove: '#d9dcc0',
  orchard: '#dde3c4',
  rock: '#ded9d2',
  scree: '#e5e1da',
  /** Pale blue glacier. */
  glacier: '#dcebf2',
  wetland: '#cfe0d6',
  /** Thin brown contours. */
  contour: '#a98a63',
  contourIndex: '#8f7150',
  /** Out-of-coverage mask (SPEC §1.0: "neutral light-grey"). */
  mask: '#e6e6e3',
  /** CAI waymark red (SPEC §4.1: mostly red bands). */
  caiRed: '#c8342b',
  caiCasing: '#ffffff',
  /** Cycle route bands. */
  cycle: '#9c3fa0',
  /** Label ink and halo. */
  label: '#2a2a26',
  labelHalo: '#f6f3ec',
  labelWater: '#33698c',
} as const;

/** Opacity of the out-of-coverage mask. Terrain fades beneath it (SPEC §1.0). */
export const MASK_OPACITY = 0.82;
