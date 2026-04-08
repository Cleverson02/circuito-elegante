import Fastify from 'fastify';
import websocket from '@fastify/websocket';
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
import { EvolutionClient, getEvolutionConfig } from './integrations/evolution/index.js';
import { getSession } from './state/session-manager.js';
import { MessageBuffer, createBufferProcessor } from './buffer/index.js';
import { initTypingQueue, initTypingWorker, closeTypingQueue, closeTypingWorker } from './queue/index.js';
import { getWebSocketManager } from './websocket/manager.js';

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
        // Story 4.1 — Evolution API integration (Epic 4)
        try {
          const evolutionConfig = getEvolutionConfig();
          const evolutionClient = new EvolutionClient(evolutionConfig, logger);
          const session = await getSession(sessionId);
          if (session?.guestPhone) {
            await evolutionClient.sendText(session.guestPhone, message);
            logger.info('webhook_follow_up_delivered', {
              sessionId,
              phone: session.guestPhone,
              messageLength: message.length,
            });
          } else {
            logger.warn('webhook_follow_up_no_phone', {
              sessionId,
              messageLength: message.length,
            });
          }
        } catch (err) {
          // Graceful fallback: log but don't crash if Evolution API unavailable
          logger.warn('webhook_follow_up_delivery_failed', {
            sessionId,
            messageLength: message.length,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      },
      logger,
    });
    logger.info('Webhook processor configured');
  } catch (err) {
    logger.warn('Webhook processor not configured — Elevare webhook follow-ups disabled', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Story 4.2 — Initialize 20s message buffer for WhatsApp (FR12)
  let messageBuffer: MessageBuffer | undefined;
  try {
    const evolutionConfig = getEvolutionConfig();
    const bufferEvolutionClient = new EvolutionClient(evolutionConfig, logger);
    const onFlush = createBufferProcessor({
      evolutionClient: bufferEvolutionClient,
      logger,
    });
    messageBuffer = new MessageBuffer(onFlush, logger);
    logger.info('Message buffer initialized (20s window)');
  } catch (err) {
    logger.warn('Message buffer not initialized — WhatsApp buffer disabled', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Story 4.3 — Initialize typing queue and worker (FR21)
  try {
    initTypingQueue();
    const evolutionConfig = getEvolutionConfig();
    const typingEvolutionClient = new EvolutionClient(evolutionConfig, logger);
    initTypingWorker(typingEvolutionClient, logger);
    logger.info('Typing queue and worker initialized');
  } catch (err) {
    logger.warn('Typing queue not initialized — human-typing simulation disabled', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const app = Fastify({
    logger: false, // Using Winston instead
    genReqId: () => crypto.randomUUID(),
  });

  // Story 4.6 — Register WebSocket plugin (AC1)
  await app.register(websocket);

  // Register middleware
  await registerLogging(app);
  await registerRateLimiting(app);

  // Register routes (pass buffer for WhatsApp webhook — Story 4.2)
  await registerRoutes(app, { buffer: messageBuffer });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      // AC13: Flush all active buffers before shutdown — no messages lost
      if (messageBuffer) {
        logger.info('Flushing message buffers before shutdown...');
        await messageBuffer.flushAll();
      }
      // Story 4.6 — Close all WebSocket connections (AC13)
      getWebSocketManager().closeAll();
      // Story 4.3 — Close typing worker and queue before Redis (AC12)
      await closeTypingWorker();
      await closeTypingQueue();
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
