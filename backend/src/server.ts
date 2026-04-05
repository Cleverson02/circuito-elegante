import Fastify from 'fastify';
import * as Sentry from '@sentry/node';
import { env } from '../../config/env.js';
import { logger } from './middleware/logging.js';
import { registerLogging } from './middleware/logging.js';
import { registerRateLimiting } from './middleware/rate-limit.js';
import { registerRoutes } from './api/routes.js';
import { getRedisClient, disconnectRedis } from './state/redis-client.js';
import { registerVectordbHealthChecker } from './vectordb/faq-store.js';

async function bootstrap(): Promise<void> {
  // Initialize Sentry
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
    logger.info('Sentry initialized');
  }

  // Initialize Redis (registers health checker)
  getRedisClient();

  // Register vectordb health checker
  registerVectordbHealthChecker();

  const app = Fastify({
    logger: false, // Using Winston instead
    genReqId: () => crypto.randomUUID(),
  });

  // Register middleware
  await registerLogging(app);
  await registerRateLimiting(app);

  // Register routes
  await registerRoutes(app);

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      await disconnectRedis();
      await app.close();
      process.exit(0);
    });
  }

  // Start server
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`Stella server listening on port ${env.PORT}`, {
      env: env.NODE_ENV,
      port: env.PORT,
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();
