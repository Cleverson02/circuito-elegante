/**
 * Types for the Human-Typing Simulation system.
 * Story 4.3 — FR21 (Human-Typing Simulation & Chunking)
 */

/** A single chunk of text with its calculated typing delay. */
export interface TypingChunk {
  text: string;
  delay: number;
  isMedia: boolean;
  /** 1-indexed position of the curated option this image represents (Story 4.5). */
  curatedPosition?: number;
}

/** Job data enqueued into the BullMQ typing queue. */
export interface TypingJobData {
  sessionId: string;
  phone: string;
  text: string;
  isMedia: boolean;
  channel: 'whatsapp' | 'website';
  chunkIndex: number;
  totalChunks: number;
  /** 1-indexed position of the curated option this image represents (Story 4.5). */
  curatedPosition?: number;
}
