/**
 * MessageBuffer — 20s concatenation buffer for WhatsApp "chopped" messages.
 *
 * Story 4.2 — Buffer de Concatenacao (FR12, NFR7)
 *
 * WhatsApp users frequently send a single thought split across 3-5 rapid
 * messages. This buffer accumulates messages per phone number and flushes
 * them as one consolidated string after 20s of silence.
 *
 * Design: in-memory Map + setTimeout (architecture.md section 9.3).
 * Suitable for single-instance MVP (NFR8: 5,000 msgs/month).
 *
 * [Source: docs/architecture/architecture.md#section-9.3]
 */

import type { Logger } from 'winston';
import type { ParsedMessage } from '../integrations/evolution/types.js';

// ─── Configuration ──────────────────────────────────────────────

/** Buffer window in ms. Configurable via env var for testing. */
export const BUFFER_WINDOW_MS = Number(
  process.env['MESSAGE_BUFFER_WINDOW_MS'] ?? 20_000,
);

// ─── Types ──────────────────────────────────────────────────────

interface BufferEntry {
  messages: ParsedMessage[];
  messageIds: string[];
  timer: ReturnType<typeof setTimeout>;
  startedAt: number;
}

export type OnFlushCallback = (
  phone: string,
  consolidated: string,
  messageIds: string[],
) => Promise<void>;

// ─── Message Content Consolidation (AC7) ────────────────────────

/**
 * Converts a ParsedMessage to its text representation for consolidation.
 * - text  → content as-is
 * - audio → "[audio]"
 * - image → "[imagem: {caption}]" or "[imagem]"
 */
function messageToText(msg: ParsedMessage): string {
  switch (msg.type) {
    case 'text':
      return msg.content;
    case 'audio':
      return '[audio]';
    case 'image':
      return msg.content ? `[imagem: ${msg.content}]` : '[imagem]';
    default:
      return msg.content || '';
  }
}

// ─── MessageBuffer Class ────────────────────────────────────────

export class MessageBuffer {
  private buffers = new Map<string, BufferEntry>();
  private readonly onFlush: OnFlushCallback;
  private readonly logger: Logger;
  private readonly windowMs: number;

  constructor(onFlush: OnFlushCallback, logger: Logger, windowMs?: number) {
    this.onFlush = onFlush;
    this.logger = logger;
    this.windowMs = windowMs ?? BUFFER_WINDOW_MS;
  }

  /**
   * Add a parsed message to the buffer for the given phone number.
   * Resets the 20s flush timer on every call (AC2).
   * Single messages also go through the buffer — no bypass (AC8).
   */
  add(phone: string, message: ParsedMessage): void {
    const existing = this.buffers.get(phone);

    if (existing) {
      // Reset timer (AC2)
      clearTimeout(existing.timer);
      existing.messages.push(message);
      existing.messageIds.push(message.messageId);
    } else {
      this.buffers.set(phone, {
        messages: [message],
        messageIds: [message.messageId],
        timer: undefined!,
        startedAt: Date.now(),
      });
    }

    const entry = this.buffers.get(phone)!;

    // Schedule flush after windowMs of silence
    entry.timer = setTimeout(() => {
      void this.executeFlush(phone);
    }, this.windowMs);

    // AC9: structured log
    this.logger.info('buffer_message_added', {
      phone,
      messageId: message.messageId,
      bufferSize: entry.messages.length,
      isNewBuffer: !existing,
    });
  }

  /** Number of active (unflushed) buffers (AC11). */
  getBufferSize(): number {
    return this.buffers.size;
  }

  /** Flush a specific phone's buffer immediately (AC12). */
  flush(phone: string): void {
    if (this.buffers.has(phone)) {
      const entry = this.buffers.get(phone)!;
      clearTimeout(entry.timer);
      void this.executeFlush(phone);
    }
  }

  /** Flush ALL active buffers — used for graceful shutdown (AC13). */
  async flushAll(): Promise<void> {
    const phones = Array.from(this.buffers.keys());
    const promises = phones.map((phone) => {
      const entry = this.buffers.get(phone);
      if (entry) {
        clearTimeout(entry.timer);
      }
      return this.executeFlush(phone);
    });
    await Promise.allSettled(promises);
  }

  // ─── Internal ─────────────────────────────────────────────────

  private async executeFlush(phone: string): Promise<void> {
    const entry = this.buffers.get(phone);
    if (!entry) return;

    // Remove from map BEFORE async work to prevent double-flush
    this.buffers.delete(phone);

    // Consolidate messages (AC3, AC7)
    const consolidated = entry.messages.map(messageToText).join(' ');
    const bufferDurationMs = Date.now() - entry.startedAt;

    // AC9: structured log
    this.logger.info('buffer_flushed', {
      phone,
      messageCount: entry.messages.length,
      totalChars: consolidated.length,
      bufferDurationMs,
    });

    // Invoke the processor callback
    await this.onFlush(phone, consolidated, entry.messageIds);
  }
}
