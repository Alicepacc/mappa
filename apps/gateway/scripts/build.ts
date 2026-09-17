/**
 * Bundle the gateway to a single ESM file for the container image.
 *
 * Workspace packages are bundled in (they ship TypeScript source); runtime
 * npm dependencies stay external and are installed in the image.
 */
import { build } from 'esbuild';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { dependencies?: Record<string, string> };

const external = Object.keys(pkg.dependencies ?? {}).filter((dep) => !dep.startsWith('@mappa/'));

const result = await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  minify: false,
  external,
  banner: {
    // Some CJS deps reach for `require` when bundled into ESM.
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
  logLevel: 'info',
});

if (result.errors.length > 0) {
  process.exit(1);
}
console.log(`gateway bundled (external: ${external.join(', ') || 'none'})`);
