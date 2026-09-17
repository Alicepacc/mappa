import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The gateway reads its config at import time, so upstreams are pointed at
    // a closed port: probes fail immediately and deterministically instead of
    // waiting on a timeout.
    env: {
      TILES_URL: 'http://127.0.0.1:1',
      VALHALLA_URL: 'http://127.0.0.1:1',
      PHOTON_URL: 'http://127.0.0.1:1',
      DATA_DIR: '/nonexistent/mappa-data',
      LOG_LEVEL: 'silent',
      RATE_LIMIT_MAX: '100000',
    },
  },
});
