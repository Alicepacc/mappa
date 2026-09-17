import { type Area } from './coverage';
import { type BBox } from './geo';

/** One artefact produced by the pipeline. */
export interface ManifestArtefact {
  /** Path relative to the data root, e.g. `basemap.pmtiles`. */
  path: string;
  bytes: number;
  /** Seconds the step took, for the build summary (SPEC §3.1). */
  buildSeconds?: number;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * `data/manifest.json` — written by the pipeline (SPEC §3.1 step 10) and read by
 * the frontend "Info" dialog.
 */
export interface DataManifest {
  schemaVersion: 1;
  area: Area;
  bbox: BBox;
  /** ISO 8601 timestamp of the OSM extract the build was made from. */
  osmTimestamp: string;
  /** ISO 8601 timestamp of the build itself. */
  builtAt: string;
  /** Tool name to exact version, so a build is reproducible. */
  toolVersions: Readonly<Record<string, string>>;
  artefacts: ManifestArtefact[];
  /** DEM source actually used, recorded for attribution (SPEC §0.3). */
  demSource?: 'tinitaly' | 'copernicus-glo30';
}
