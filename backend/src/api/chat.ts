import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { queryKnowledgeBase } from '../tools/query-knowledge-base.js';
import { logger } from '../middleware/logging.js';

const ChatRequestSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  hotelName: z.string().nullable().optional(),
});

type ChatRequest = z.infer<typeof ChatRequestSchema>;

interface ChatResponse {
  success: boolean;
  question: string;
  results: Array<{
    sectionTitle: string;
    content: string;
    similarity: number;
  }>;
  suggestion?: string;
  error?: string;
}

export async function registerChatRoute(app: FastifyInstance): Promise<void> {
  // Test endpoint for Stella KB
  app.post<{ Body: ChatRequest }>('/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parsed = ChatRequestSchema.parse(request.body);

      logger.info({
        message: 'chat_request',
        question: parsed.question,
        hotelName: parsed.hotelName,
      });

      const result = await queryKnowledgeBase({
        question: parsed.question,
        hotelName: parsed.hotelName ?? null,
      });

      const response: ChatResponse = {
        success: true,
        question: parsed.question,
        results: result.results,
        suggestion: result.suggestion,
      };

      return reply.send(response);
    } catch (error) {
      logger.error({
        message: 'chat_error',
        error: error instanceof Error ? error.message : String(error),
      });

      const response: ChatResponse = {
        success: false,
        question: (request.body as Record<string, unknown>).question as string || 'Unknown',
        results: [],
        error: error instanceof Error ? error.message : 'An error occurred',
      };

      return reply.status(400).send(response);
    }
  });

  logger.info('Chat endpoint registered at POST /chat');
}
