import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ICONS, ICON_IDS, findIcon } from './index';

const svgDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'svg');
const files = readdirSync(svgDir).filter((f) => f.endsWith('.svg'));
const fileIds = files.map((f) => f.replace(/\.svg$/, '')).sort();

describe('icon registry', () => {
  it('has an entry for every SVG on disk', () => {
    expect([...ICON_IDS].sort()).toEqual(fileIds);
  });

  it('has no duplicate ids', () => {
    expect(new Set(ICON_IDS).size).toBe(ICON_IDS.length);
  });

  it('uses kebab-case ids that are safe as sprite keys', () => {
    for (const id of ICON_IDS) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it('gives every icon an Italian label and an OSM mapping', () => {
    for (const icon of ICONS) {
      expect(icon.label.length).toBeGreaterThan(0);
      expect(icon.osm).toMatch(/=/);
      expect(icon.usedBy.length).toBeGreaterThan(0);
    }
  });

  it('looks icons up by id', () => {
    expect(findIcon('peak')?.label).toBe('Cima');
    expect(findIcon('does-not-exist')).toBeUndefined();
  });
});

describe('svg sources', () => {
  for (const file of files) {
    describe(file, () => {
      const svg = readFileSync(join(svgDir, file), 'utf8');

      it('is a single well-formed svg root', () => {
        expect(svg.trimStart().startsWith('<svg')).toBe(true);
        expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
        expect(svg.match(/<svg[\s>]/g)).toHaveLength(1);
      });

      it('uses the shared 24x24 viewBox so sprite metrics stay consistent', () => {
        expect(svg).toContain('viewBox="0 0 24 24"');
      });

      it('references nothing external (sprites must build offline)', () => {
        expect(svg).not.toMatch(/xlink:href|<image|url\(http|<use\b/);
      });

      it('carries no baked-in colour, so SDF recolouring works', () => {
        // spreet --sdf ignores colour, but a stray fill signals a non-SDF icon
        // slipped in; SPEC §4.1 recolours water POIs blue at style level.
        expect(svg).not.toMatch(/fill="(?!none)[^"]+"/);
      });
    });
  }
});
