/**
 * Barrel export for the Human-Typing Simulation queue system.
 * Story 4.3 — FR21
 */

// Types
export type { TypingChunk, TypingJobData } from './types.js';

// Chunking engine
export { chunkResponse, calculateDelay, consolidateChunks } from './chunking.js';

// Queue
export {
  initTypingQueue,
  getTypingQueue,
  enqueueResponse,
  closeTypingQueue,
} from './typing-queue.js';

// Worker
export {
  initTypingWorker,
  getTypingWorker,
  closeTypingWorker,
} from './typing-worker.js';
