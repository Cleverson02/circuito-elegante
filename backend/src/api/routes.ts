import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './health.js';
import { registerElevareWebhookRoute } from '../webhooks/elevare-handler.js';
import { getRedisClient } from '../state/redis-client.js';
import { logger } from '../middleware/logging.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await registerHealthRoutes(app);

  // Elevare webhook listener — FR25 (Story 3.7)
  await registerElevareWebhookRoute(app, {
    redis: getRedisClient(),
    logger,
    webhookSecret: process.env['ELEVARE_WEBHOOK_SECRET'],
  });
}
