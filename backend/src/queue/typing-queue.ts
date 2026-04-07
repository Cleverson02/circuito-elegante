/**
 * BullMQ Queue for Human-Typing Simulation.
 * Story 4.3 — FR21 (Human-Typing Simulation & Chunking)
 *
 * Enqueues text chunks as delayed jobs so the worker sends them
 * with natural human-like cadence.
 * [Source: architecture.md#section-8.3 — Worker BullMQ]
 */

import { Queue } from 'bullmq';
import type { TypingChunk, TypingJobData } from './types.js';
import { getRedisClient } from '../state/redis-client.js';
import { logger } from '../middleware/logging.js';

const QUEUE_NAME = 'typing';
const INTER_CHUNK_PAUSE_MS = 1500;

let typingQueue: Queue<TypingJobData> | null = null;

/** Initialize the typing queue. Call once during server bootstrap. */
export function initTypingQueue(): Queue<TypingJobData> {
  if (typingQueue) return typingQueue;

  const connection = getRedisClient();
  typingQueue = new Queue<TypingJobData>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    },
  });

  logger.info('typing_queue_initialized');
  return typingQueue;
}

/** Get the typing queue instance (must be initialized first). */
export function getTypingQueue(): Queue<TypingJobData> | null {
  return typingQueue;
}

/**
 * Enqueue chunks as delayed BullMQ jobs with cumulative delays.
 *
 * - First chunk: delay = 0 (immediate, for NFR7 <= 5s compliance)
 * - Subsequent chunks: cumulative delay = sum of previous delays + 1500ms inter-chunk pause
 * - Each job has 3 retry attempts with exponential backoff (1000ms base)
 */
export async function enqueueResponse(
  sessionId: string,
  phone: string,
  chunks: TypingChunk[],
  channel: 'whatsapp' | 'website',
): Promise<void> {
  if (!typingQueue) {
    throw new Error('Typing queue not initialized. Call initTypingQueue() first.');
  }

  let cumulativeDelay = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const jobData: TypingJobData = {
      sessionId,
      phone,
      text: chunk.text,
      isMedia: chunk.isMedia,
      channel,
      chunkIndex: i,
      totalChunks: chunks.length,
    };

    await typingQueue.add('send-chunk', jobData, {
      delay: cumulativeDelay,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    // Accumulate: chunk delay + inter-chunk pause for next job
    cumulativeDelay += chunk.delay + INTER_CHUNK_PAUSE_MS;
  }

  logger.info('typing_response_enqueued', {
    sessionId,
    phone,
    channel,
    totalChunks: chunks.length,
    totalDelayMs: cumulativeDelay,
  });
}

/** Graceful shutdown — close the queue. */
export async function closeTypingQueue(): Promise<void> {
  if (typingQueue) {
    await typingQueue.close();
    typingQueue = null;
    logger.info('typing_queue_closed');
  }
}
