/**
 * Everything a generated style needs to know about where its data lives.
 * Supplied by the build script from environment variables so the same code
 * produces a dev style and a production style (SPEC §2.2: tile host configurable).
 */
export interface StyleContext {
  /** Base URL of the tile host, no trailing slash. e.g. `http://localhost:8081`. */
  tileBaseUrl: string;
  /** Base URL serving SDF glyph ranges (SPEC §3.1 step 5). */
  glyphsUrl: string;
  /** Base URL of the sprite sheet, without the `.json`/`.png` suffix. */
  spriteUrl: string;
  /** URL of the coverage polygon served by the gateway (SPEC §2.2). */
  coverageUrl: string;
}

export const DEFAULT_CONTEXT: StyleContext = {
  tileBaseUrl: 'http://localhost:8081',
  glyphsUrl: 'http://localhost:8081/glyphs/{fontstack}/{range}.pbf',
  spriteUrl: 'http://localhost:8081/sprites/mappa',
  coverageUrl: 'http://localhost:8080/api/coverage',
};

/**
 * Attribution shown in-app (SPEC §0.3). Every data source that ends up on
 * screen must be named here; the full licence texts live in CREDITS.md.
 */
export const OSM_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">&copy; OpenStreetMap contributors</a> (ODbL)';
