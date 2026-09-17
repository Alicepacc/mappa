/**
 * Registry of the original POI icon set (SPEC §2, §4.1).
 *
 * Every entry must have a matching `svg/<id>.svg`; `index.test.ts` enforces
 * that in both directions so a forgotten file or a stale entry fails CI rather
 * than showing up as a missing sprite at runtime.
 *
 * The icons are drawn for this project. Nothing here is traced from, derived
 * from or inspired by another product's icon set (SPEC §0.2).
 */

/** Which base layers an icon is used by, for sprite-size budgeting. */
export type IconUsage = 'base' | 'turistica' | 'invernale' | 'aerea';

export interface IconMeta {
  id: string;
  /** Italian label, used in the layer legend and as an a11y name. */
  label: string;
  /** The OSM tagging this icon represents. Informational. */
  osm: string;
  usedBy: readonly IconUsage[];
}

export const ICONS: readonly IconMeta[] = [
  {
    id: 'peak',
    label: 'Cima',
    osm: 'natural=peak',
    usedBy: ['turistica', 'invernale', 'base'],
  },
  {
    id: 'saddle',
    label: 'Passo / Sella',
    osm: 'natural=saddle, mountain_pass=yes',
    usedBy: ['turistica', 'invernale'],
  },
  {
    id: 'rifugio',
    label: 'Rifugio',
    osm: 'tourism=alpine_hut',
    usedBy: ['turistica', 'base'],
  },
  {
    id: 'rifugio-invernale',
    label: 'Rifugio (invernale)',
    osm: 'tourism=alpine_hut',
    usedBy: ['invernale'],
  },
  {
    id: 'bivacco',
    label: 'Bivacco',
    osm: 'tourism=wilderness_hut',
    usedBy: ['turistica', 'invernale'],
  },
  {
    id: 'viewpoint',
    label: 'Punto panoramico',
    osm: 'tourism=viewpoint',
    usedBy: ['turistica', 'base'],
  },
  {
    id: 'fontana',
    label: 'Fontana / Acqua potabile',
    osm: 'amenity=drinking_water, natural=spring',
    usedBy: ['turistica', 'base'],
  },
  {
    id: 'parcheggio',
    label: 'Parcheggio',
    osm: 'amenity=parking',
    usedBy: ['base', 'turistica', 'invernale'],
  },
  {
    id: 'via-ferrata',
    label: 'Via ferrata',
    osm: 'highway=via_ferrata',
    usedBy: ['turistica'],
  },
  {
    id: 'guidepost',
    label: 'Segnavia',
    osm: 'information=guidepost',
    usedBy: ['turistica'],
  },
] as const;

export const ICON_IDS: readonly string[] = ICONS.map((icon) => icon.id);

export function findIcon(id: string): IconMeta | undefined {
  return ICONS.find((icon) => icon.id === id);
}
