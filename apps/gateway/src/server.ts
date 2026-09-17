import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import { config } from './config';
import { CoverageService } from './coverage';
import { GatewayError } from './errors';
import { registerCoverage } from './routes/coverage';
import { registerHealth } from './routes/health';
import { registerStubs } from './routes/stubs';

export interface BuildServerOptions {
  /** Suppress request logging in tests. */
  logger?: boolean;
}

export async function buildServer(options: BuildServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger === false ? false : { level: config.logLevel },
    // Trust the reverse proxy in front of us (Caddy) for client IPs.
    trustProxy: true,
  });

  await app.register(cors, {
    origin: config.corsOrigins === '*' ? true : config.corsOrigins.split(',').map((o) => o.trim()),
  });

  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowMs,
  });

  const coverage = new CoverageService();
  const loaded = await coverage.load(config.dataDir);
  if (!loaded) {
    app.log.warn(
      { dataDir: config.dataDir },
      'coverage.geojson not found — falling back to the Italy bounding box. Run `make data` to build it.',
    );
  }
  app.decorate('coverage', coverage);

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof GatewayError) {
      // Expected, contract-defined outcomes: log at debug, not as failures.
      request.log.debug({ code: error.code }, error.message);
      return reply.status(error.status).send(error.toBody());
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Too many requests' },
      });
    }

    if (error.statusCode !== undefined && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        error: { code: 'BAD_REQUEST', message: error.message },
      });
    }

    request.log.error({ err: error }, 'unhandled error');
    return reply.status(500).send({
      error: { code: 'INTERNAL', message: 'Internal server error' },
    });
  });

  app.setNotFoundHandler((request, reply) =>
    reply.status(404).send({
      error: { code: 'NOT_FOUND', message: `No route for ${request.method} ${request.url}` },
    }),
  );

  registerHealth(app);
  registerCoverage(app, coverage);
  registerStubs(app, coverage);

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    coverage: CoverageService;
  }
}
