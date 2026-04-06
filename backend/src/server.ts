import Fastify from 'fastify';
import * as Sentry from '@sentry/node';
import { env } from '../../config/env.js';
import { logger } from './middleware/logging.js';
import { registerLogging } from './middleware/logging.js';
import { registerRateLimiting } from './middleware/rate-limit.js';
import { registerRoutes } from './api/routes.js';
import { getRedisClient, disconnectRedis } from './state/redis-client.js';
import { registerVectordbHealthChecker } from './vectordb/faq-store.js';
import { configureProcessorDeps } from './webhooks/elevare-processor.js';
import { generateResponse } from './agents/persona-agent.js';
import { regeneratePaymentLink } from './integrations/elevare/quotations.js';
import { getElevareConfig } from './integrations/elevare/config.js';
import { ElevareClient } from './integrations/elevare/client.js';

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
  const redisClient = getRedisClient();

  // Register vectordb health checker
  registerVectordbHealthChecker();

  // Configure webhook processor dependencies (Story 3.7 — FR25)
  try {
    const elevareConfig = getElevareConfig();
    const elevareClient = new ElevareClient(elevareConfig, logger);
    configureProcessorDeps({
      generateResponse,
      regeneratePaymentLink: (quotationId: string) =>
        regeneratePaymentLink(elevareClient, redisClient, logger, quotationId),
      deliverMessage: async (sessionId: string, message: string): Promise<void> => {
        // TODO: integrate with Evolution API / Agent Pipeline when available (Epic 4).
        // For now, log delivery intent so webhooks process cleanly in dev/staging.
        logger.info('webhook_follow_up_delivery', {
          sessionId,
          messageLength: message.length,
        });
      },
      logger,
    });
    logger.info('Webhook processor configured');
  } catch (err) {
    logger.warn('Webhook processor not configured — Elevare webhook follow-ups disabled', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

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
