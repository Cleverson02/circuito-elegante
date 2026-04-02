import winston from 'winston';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'stella' },
  transports: [new winston.transports.Console()],
});

export async function registerLogging(app: FastifyInstance): Promise<void> {
  // Attach correlation IDs to every request
  app.addHook('onRequest', async (request: FastifyRequest) => {
    const requestId = request.id;
    const sessionId = (request.headers['x-session-id'] as string) ?? undefined;
    const hotelId = (request.headers['x-hotel-id'] as string) ?? undefined;

    // Store correlation context on request for downstream use
    (request as FastifyRequest & { correlationIds: Record<string, string | undefined> }).correlationIds = {
      requestId,
      sessionId,
      hotelId,
    };
  });

  // Log request completion with correlation IDs
  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const corr = (request as FastifyRequest & { correlationIds?: Record<string, string | undefined> }).correlationIds;
    logger.info('request completed', {
      requestId: corr?.['requestId'] ?? request.id,
      sessionId: corr?.['sessionId'],
      hotelId: corr?.['hotelId'],
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    });
  });
}
