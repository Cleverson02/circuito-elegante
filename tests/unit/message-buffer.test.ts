/**
 * Tests for MessageBuffer — 20s concatenation buffer.
 * Story 4.2 — Buffer de Concatenacao (AC15)
 */

import { MessageBuffer, type OnFlushCallback } from '../../backend/src/buffer/message-buffer.js';
import type { ParsedMessage } from '../../backend/src/integrations/evolution/types.js';

// ─── Helpers ────────────────────────────────────────────────────

function createParsedMessage(overrides: Partial<ParsedMessage> = {}): ParsedMessage {
  return {
    type: 'text',
    content: 'hello',
    phone: '+5521999999999',
    messageId: `msg-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    isReply: false,
    ...overrides,
  };
}

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as import('winston').Logger;

// ─── Test Suite ─────────────────────────────────────────────────

describe('MessageBuffer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── AC1/AC8: Single message flushes after 20s ────────────────

  it('should flush a single message after 20s window', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);

    const msg = createParsedMessage({ content: 'Oi' });
    buffer.add(msg.phone, msg);

    expect(onFlush).not.toHaveBeenCalled();
    expect(buffer.getBufferSize()).toBe(1);

    jest.advanceTimersByTime(20_000);
    // Allow microtask queue to process
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(
      msg.phone,
      'Oi',
      [msg.messageId],
      undefined,
    );
    expect(buffer.getBufferSize()).toBe(0);
  });

  // ── AC3/AC15(b): 3 messages in 15s → 1 consolidated flush ───

  it('should consolidate 3 messages within 15s into one flush', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);
    const phone = '+5521999999999';

    const msg1 = createParsedMessage({ phone, content: 'Oi', messageId: 'id-1' });
    const msg2 = createParsedMessage({ phone, content: 'quero um hotel', messageId: 'id-2' });
    const msg3 = createParsedMessage({ phone, content: 'na serra gaucha', messageId: 'id-3' });

    buffer.add(phone, msg1);
    jest.advanceTimersByTime(5_000);
    buffer.add(phone, msg2);
    jest.advanceTimersByTime(5_000);
    buffer.add(phone, msg3);

    // Only 10s since last message — should NOT have flushed
    expect(onFlush).not.toHaveBeenCalled();

    // Advance 20s after last message
    jest.advanceTimersByTime(20_000);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(
      phone,
      'Oi quero um hotel na serra gaucha',
      ['id-1', 'id-2', 'id-3'],
      undefined,
    );
  });

  // ── AC2: Timer reset on each new message ─────────────────────

  it('should reset the timer on each new message', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);
    const phone = '+5521888888888';

    buffer.add(phone, createParsedMessage({ phone, content: 'first', messageId: 'a' }));

    // Advance 15s — NOT enough
    jest.advanceTimersByTime(15_000);
    expect(onFlush).not.toHaveBeenCalled();

    // Add another message — resets timer
    buffer.add(phone, createParsedMessage({ phone, content: 'second', messageId: 'b' }));

    // Advance another 15s (30s total) — still not enough (only 15s since last)
    jest.advanceTimersByTime(15_000);
    expect(onFlush).not.toHaveBeenCalled();

    // Advance remaining 5s to reach 20s from last message
    jest.advanceTimersByTime(5_000);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(
      phone,
      'first second',
      ['a', 'b'],
      undefined,
    );
  });

  // ── AC15(d): Different phones have independent buffers ────────

  it('should maintain independent buffers per phone', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);

    const phone1 = '+5521111111111';
    const phone2 = '+5521222222222';

    buffer.add(phone1, createParsedMessage({ phone: phone1, content: 'A', messageId: 'p1-1' }));
    buffer.add(phone2, createParsedMessage({ phone: phone2, content: 'B', messageId: 'p2-1' }));

    expect(buffer.getBufferSize()).toBe(2);

    jest.advanceTimersByTime(20_000);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenCalledWith(phone1, 'A', ['p1-1'], undefined);
    expect(onFlush).toHaveBeenCalledWith(phone2, 'B', ['p2-1'], undefined);
    expect(buffer.getBufferSize()).toBe(0);
  });

  // ── AC7: Audio messages concatenated as [audio] ──────────────

  it('should concatenate audio messages as [audio]', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);
    const phone = '+5521333333333';

    buffer.add(phone, createParsedMessage({ phone, content: 'oi', type: 'text', messageId: 't1' }));
    buffer.add(phone, createParsedMessage({
      phone,
      content: '',
      type: 'audio',
      mediaUrl: 'http://audio.ogg',
      messageId: 'a1',
    }));

    jest.advanceTimersByTime(20_000);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledWith(
      phone,
      'oi [audio]',
      ['t1', 'a1'],
      undefined,
    );
  });

  // ── AC7: Image messages with and without caption ──────────────

  it('should concatenate image with caption as [imagem: caption]', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);
    const phone = '+5521444444444';

    buffer.add(phone, createParsedMessage({
      phone,
      content: 'olha isso',
      type: 'image',
      mediaUrl: 'http://img.jpg',
      messageId: 'i1',
    }));

    jest.advanceTimersByTime(20_000);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledWith(
      phone,
      '[imagem: olha isso]',
      ['i1'],
      undefined,
    );
  });

  it('should concatenate image without caption as [imagem]', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);
    const phone = '+5521555555555';

    buffer.add(phone, createParsedMessage({
      phone,
      content: '',
      type: 'image',
      mediaUrl: 'http://img.jpg',
      messageId: 'i2',
    }));

    jest.advanceTimersByTime(20_000);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledWith(
      phone,
      '[imagem]',
      ['i2'],
      undefined,
    );
  });

  // ── AC11: getBufferSize ───────────────────────────────────────

  it('should return correct buffer size', () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);

    expect(buffer.getBufferSize()).toBe(0);

    buffer.add('+5521111111111', createParsedMessage({ phone: '+5521111111111' }));
    expect(buffer.getBufferSize()).toBe(1);

    buffer.add('+5521222222222', createParsedMessage({ phone: '+5521222222222' }));
    expect(buffer.getBufferSize()).toBe(2);

    // Same phone — still 2
    buffer.add('+5521111111111', createParsedMessage({ phone: '+5521111111111' }));
    expect(buffer.getBufferSize()).toBe(2);
  });

  // ── AC12: Manual flush ────────────────────────────────────────

  it('should flush a specific phone immediately on manual flush', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);
    const phone = '+5521666666666';

    buffer.add(phone, createParsedMessage({ phone, content: 'urgent', messageId: 'u1' }));

    // Flush immediately without waiting 20s
    buffer.flush(phone);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(phone, 'urgent', ['u1'], undefined);
    expect(buffer.getBufferSize()).toBe(0);
  });

  // ── AC13: flushAll for graceful shutdown ───────────────────────

  it('should flush all active buffers on flushAll', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);

    buffer.add('+5521111111111', createParsedMessage({ phone: '+5521111111111', content: 'A', messageId: 'f1' }));
    buffer.add('+5521222222222', createParsedMessage({ phone: '+5521222222222', content: 'B', messageId: 'f2' }));
    buffer.add('+5521333333333', createParsedMessage({ phone: '+5521333333333', content: 'C', messageId: 'f3' }));

    expect(buffer.getBufferSize()).toBe(3);

    await buffer.flushAll();

    expect(onFlush).toHaveBeenCalledTimes(3);
    expect(buffer.getBufferSize()).toBe(0);
  });

  // ── AC9: Structured logging ───────────────────────────────────

  it('should log buffer_message_added and buffer_flushed', async () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);
    const phone = '+5521777777777';

    buffer.add(phone, createParsedMessage({ phone, messageId: 'log-1' }));

    expect(mockLogger.info).toHaveBeenCalledWith('buffer_message_added', expect.objectContaining({
      phone,
      messageId: 'log-1',
      bufferSize: 1,
      isNewBuffer: true,
    }));

    jest.advanceTimersByTime(20_000);
    await Promise.resolve();

    expect(mockLogger.info).toHaveBeenCalledWith('buffer_flushed', expect.objectContaining({
      phone,
      messageCount: 1,
    }));
  });

  // ── Edge: flush non-existent phone is a no-op ─────────────────

  it('should be a no-op when flushing a non-existent phone', () => {
    const onFlush = jest.fn<ReturnType<OnFlushCallback>, Parameters<OnFlushCallback>>()
      .mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush, mockLogger, 20_000);

    buffer.flush('+5521000000000');

    expect(onFlush).not.toHaveBeenCalled();
  });
});
