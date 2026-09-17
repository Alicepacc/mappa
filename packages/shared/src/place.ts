import { type LngLat } from './geo';

/** OSM element type, as used in `/api/place/:osmType/:osmId`. */
export type OsmType = 'node' | 'way' | 'relation';

/**
 * Categories surfaced as panel shortcuts (SPEC §1.1) and used for category
 * search. These are product categories, not OSM tags: the mapping from OSM
 * tags to these values lives in the pipeline profile and the gateway.
 */
export const PLACE_CATEGORIES = [
  'ristoranti',
  'alloggi',
  'rifugi',
  'punti_panoramici',
  'parcheggi',
  'fontane',
  'vie_ferrate',
  'gite',
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

/** Italian-format postal address (SPEC §1.4: "Via Roma 12, 38032 Canazei TN"). */
export interface ItalianAddress {
  /** `addr:street` */
  street?: string;
  /** `addr:housenumber` */
  housenumber?: string;
  /** CAP, `addr:postcode` */
  postcode?: string;
  /** Comune, `addr:city` */
  city?: string;
  /** Two-letter province code, e.g. `TN`. */
  province?: string;
}

/** Names in every language we carry through the pipeline (SPEC §3.1 step 3). */
export interface PlaceNames {
  /** OSM `name`, verbatim. May already be bilingual, e.g. "Bolzano - Bozen". */
  default: string;
  it?: string;
  de?: string;
  fr?: string;
  /** Ladin — significant in the dev area (Val Gardena, Val di Fassa). */
  lld?: string;
  en?: string;
}

export interface Place {
  id: string;
  osmType: OsmType;
  osmId: number;
  names: PlaceNames;
  category?: PlaceCategory;
  /** Raw OSM class/type pair, kept for the "OSM tags" section of the panel. */
  kind?: { class: string; type: string };
  center: LngLat;
  /** Metres above sea level. From OSM `ele` when present, else the DEM. */
  elevation?: number;
  elevationSource?: 'osm' | 'dem';
  address?: ItalianAddress;
  openingHours?: string;
  website?: string;
  phone?: string;
  wheelchair?: 'yes' | 'no' | 'limited' | 'designated';
  /** e.g. the CAI section operating a rifugio. */
  operator?: string;
  capacity?: number;
  /** Remaining OSM tags, shown verbatim in the detail panel. */
  tags?: Readonly<Record<string, string>>;
}
