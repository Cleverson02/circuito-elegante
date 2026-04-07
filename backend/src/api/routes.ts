import type { FastifyInstance } from 'fastify';
import type { MessageBuffer } from '../buffer/message-buffer.js';
import { registerHealthRoutes } from './health.js';
import { registerChatRoute } from './chat.js';
import { registerElevareWebhookRoute } from '../webhooks/elevare-handler.js';
import { registerWhatsAppWebhookRoute } from '../webhooks/whatsapp-handler.js';
import { getRedisClient } from '../state/redis-client.js';
import { logger } from '../middleware/logging.js';

export interface RoutesDeps {
  buffer?: MessageBuffer;
}

export async function registerRoutes(app: FastifyInstance, deps?: RoutesDeps): Promise<void> {
  await registerHealthRoutes(app);

  // Chat endpoint — test Stella pipeline interactively
  await registerChatRoute(app);

  // Elevare webhook listener — FR25 (Story 3.7)
  await registerElevareWebhookRoute(app, {
    redis: getRedisClient(),
    logger,
    webhookSecret: process.env['ELEVARE_WEBHOOK_SECRET'],
  });

  // WhatsApp webhook listener — FR33 (Story 4.1) + Buffer 20s (Story 4.2)
  await registerWhatsAppWebhookRoute(app, {
    redis: getRedisClient(),
    logger,
    webhookSecret: process.env['EVOLUTION_WEBHOOK_SECRET'],
    buffer: deps?.buffer,
  });
}
