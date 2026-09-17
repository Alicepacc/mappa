/** Product name placeholder — SPEC §0.2 keeps the brand configurable. */
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Mappa';

/** Gateway base URL. Empty string means "same origin", which is how Caddy serves it. */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

/** Tile host, separate from the API so it can sit on its own domain or CDN. */
export const TILE_BASE = import.meta.env.VITE_TILE_BASE ?? 'http://localhost:8081';

export const MILESTONE = 'M0';
