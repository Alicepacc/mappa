import { config } from './config';
import { buildServer } from './server';

const app = await buildServer();

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info(
    { area: config.area, upstream: config.upstream },
    `${config.appName} gateway listening`,
  );
} catch (error) {
  app.log.error({ err: error }, 'failed to start');
  process.exit(1);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    app.log.info({ signal }, 'shutting down');
    void app.close().then(() => process.exit(0));
  });
}
