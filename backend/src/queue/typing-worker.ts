/**
 * BullMQ Worker for Human-Typing Simulation.
 * Story 4.3 — FR21 (Human-Typing Simulation & Chunking)
 *
 * Processes typing jobs: sends composing event → waits delay → sends text.
 * [Source: architecture.md#section-8.3 — Worker implementation]
 */

import { Worker, type Job } from 'bullmq';
import type { Logger } from 'winston';
import type { TypingJobData } from './types.js';
import type { EvolutionClient } from '../integrations/evolution/client.js';
import { getRedisClient } from '../state/redis-client.js';
import { logger as defaultLogger } from '../middleware/logging.js';
import { updateOfferMapMessageIds } from '../services/coreference.js';

const QUEUE_NAME = 'typing';
const WORKER_CONCURRENCY = 10;

let typingWorker: Worker<TypingJobData> | null = null;

/**
 * Initialize the typing worker. Call once during server bootstrap.
 *
 * @param evolutionClient — EvolutionClient instance for WhatsApp API calls
 * @param log — Optional logger override (defaults to application logger)
 */
export function initTypingWorker(
  evolutionClient: EvolutionClient,
  log?: Logger,
): Worker<TypingJobData> {
  if (typingWorker) return typingWorker;

  const workerLogger = log ?? defaultLogger;
  const connection = getRedisClient();

  typingWorker = new Worker<TypingJobData>(
    QUEUE_NAME,
    async (job: Job<TypingJobData>) => {
      const { sessionId, phone, text, isMedia, channel, chunkIndex, totalChunks, curatedPosition } = job.data;

      // Website channel: placeholder log (WebSocket in Story 4.6)
      if (channel === 'website') {
        workerLogger.info('typing_chunk_website', {
          event: 'typing_chunk_website',
          sessionId,
          chunkIndex,
          totalChunks,
          textLength: text.length,
          channel,
        });
        return;
      }

      // WhatsApp channel
      if (isMedia) {
        // Media: send instantly without typing event (AC9)
        const response = await evolutionClient.sendText(phone, text);

        // Story 4.5 (AC3/AC4): Capture messageId for WhatsApp Reply coreference
        if (curatedPosition !== undefined) {
          if (response?.key?.id) {
            try {
              await updateOfferMapMessageIds(sessionId, { [curatedPosition]: response.key.id });
            } catch (err) {
              workerLogger.warn('offer_map_update_failed', {
                event: 'offer_map_update_failed',
                sessionId,
                phone,
                curatedPosition,
                chunkIndex,
                error: err instanceof Error ? err.message : String(err),
              });
            }
          } else {
            workerLogger.warn('media_message_id_capture_failed', {
              event: 'media_message_id_capture_failed',
              sessionId,
              phone,
              curatedPosition,
              chunkIndex,
            });
          }
        }
      } else {
        // Text: send composing event first, then text
        await evolutionClient.sendComposingEvent(phone);
        await evolutionClient.sendText(phone, text);
      }

      workerLogger.info('typing_chunk_sent', {
        event: 'typing_chunk_sent',
        sessionId,
        phone,
        chunkIndex,
        totalChunks,
        textLength: text.length,
        delayMs: job.opts.delay ?? 0,
        channel,
      });

      // NFR7: Log first chunk latency for monitoring (AC15)
      if (chunkIndex === 0) {
        workerLogger.info('typing_first_chunk_latency', {
          event: 'typing_first_chunk_latency',
          sessionId,
          phone,
          delayMs: job.opts.delay ?? 0,
          channel,
        });
      }
    },
    {
      connection,
      concurrency: WORKER_CONCURRENCY,
    },
  );

  // Log failed jobs (AC14)
  typingWorker.on('failed', (job, err) => {
    workerLogger.error('typing_chunk_failed', {
      event: 'typing_chunk_failed',
      jobId: job?.id,
      sessionId: job?.data.sessionId,
      phone: job?.data.phone,
      chunkIndex: job?.data.chunkIndex,
      totalChunks: job?.data.totalChunks,
      attemptsMade: job?.attemptsMade,
      error: err.message,
    });
  });

  workerLogger.info('typing_worker_initialized', { concurrency: WORKER_CONCURRENCY });
  return typingWorker;
}

/** Get the typing worker instance (must be initialized first). */
export function getTypingWorker(): Worker<TypingJobData> | null {
  return typingWorker;
}

/** Graceful shutdown — close the worker and let in-flight jobs complete. */
export async function closeTypingWorker(): Promise<void> {
  if (typingWorker) {
    await typingWorker.close();
    typingWorker = null;
    defaultLogger.info('typing_worker_closed');
  }
}
