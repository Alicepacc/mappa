import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { type BaseLayerId } from '@mappa/shared';
import { type StyleContext } from './context';
import { buildBaseStyle } from './styles/base';

export * from './context';
export * from './tokens';
export { buildBaseStyle };

/** Base layers that have a generator today. Grows through M3 and M6. */
export const IMPLEMENTED_STYLES = ['base'] as const satisfies readonly BaseLayerId[];
export type ImplementedStyleId = (typeof IMPLEMENTED_STYLES)[number];

export function isImplementedStyle(id: BaseLayerId): id is ImplementedStyleId {
  return (IMPLEMENTED_STYLES as readonly BaseLayerId[]).includes(id);
}

/** Build one style by id. Throws for ids not yet implemented. */
export function buildStyle(id: ImplementedStyleId, ctx: StyleContext): StyleSpecification {
  switch (id) {
    case 'base':
      return buildBaseStyle(ctx);
  }
}

/** Build every implemented style, keyed by id. */
export function buildAllStyles(ctx: StyleContext): Record<ImplementedStyleId, StyleSpecification> {
  return Object.fromEntries(IMPLEMENTED_STYLES.map((id) => [id, buildStyle(id, ctx)])) as Record<
    ImplementedStyleId,
    StyleSpecification
  >;
}
