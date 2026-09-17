/**
 * Generate the MapLibre style JSON files into `dist/`.
 *
 * Endpoints come from the environment so one codebase produces both the local
 * compose stack's styles and a deployed site's (SPEC §2.2).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONTEXT, type StyleContext, buildAllStyles } from '../src/index';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'dist');

const ctx: StyleContext = {
  tileBaseUrl: process.env.TILE_BASE_URL ?? DEFAULT_CONTEXT.tileBaseUrl,
  glyphsUrl: process.env.GLYPHS_URL ?? DEFAULT_CONTEXT.glyphsUrl,
  spriteUrl: process.env.SPRITE_URL ?? DEFAULT_CONTEXT.spriteUrl,
  coverageUrl: process.env.COVERAGE_URL ?? DEFAULT_CONTEXT.coverageUrl,
};

const styles = buildAllStyles(ctx);

await mkdir(outDir, { recursive: true });

for (const [id, style] of Object.entries(styles)) {
  const file = join(outDir, `${id}.json`);
  await writeFile(file, `${JSON.stringify(style, null, 2)}\n`, 'utf8');
  console.log(`wrote ${file} (${style.layers.length} layers)`);
}

console.log(`\n${Object.keys(styles).length} style(s) built against ${ctx.tileBaseUrl}`);
