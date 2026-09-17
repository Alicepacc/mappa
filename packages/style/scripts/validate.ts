/**
 * Validate every generated style against the MapLibre style specification
 * (SPEC §4: "validate with the MapLibre style spec validator in CI").
 *
 * Runs on the in-memory styles rather than on `dist/`, so it is meaningful
 * whether or not `pnpm build` has run.
 */
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { DEFAULT_CONTEXT, buildAllStyles } from '../src/index';

const styles = buildAllStyles(DEFAULT_CONTEXT);
let failed = 0;

for (const [id, style] of Object.entries(styles)) {
  const errors = validateStyleMin(style);
  if (errors.length > 0) {
    failed += errors.length;
    console.error(`\n✗ ${id}: ${errors.length} error(s)`);
    for (const err of errors) {
      console.error(`  ${err.message}`);
    }
  } else {
    console.log(`✓ ${id}: valid (${style.layers.length} layers)`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} style validation error(s).`);
  process.exit(1);
}

console.log('\nAll styles valid.');
