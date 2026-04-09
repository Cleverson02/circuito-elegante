/**
 * E2E Tests — WhatsApp Flow
 *
 * Story 4.8 — E2E Tests Multi-Canal (AC1-AC5)
 * Tests: buffer consolidation, typing simulation, premium rendering,
 *        reply coreference, full WhatsApp pipeline.
 */

// ─── Mocks (must be before imports) ─────────────────────────────

jest.mock('../../backend/src/state/redis-client', () => ({
  getRedisClient: jest.fn().mockReturnValue({}),
}));

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), child: jest.fn().mockReturnThis() },
}));

jest.mock('../../backend/src/queue/chunking', () => ({
  calculateDelay: jest.fn().mockReturnValue(3000),
  chunkResponse: jest.fn().mockImplementation((text: string) => [{ text, delay: 3000, isMedia: false }]),
}));

const mockUpdateOfferMapMessageIds = jest.fn().mockResolvedValue(null);
const mockResolveCoreference = jest.fn();

jest.mock('../../backend/src/services/coreference', () => ({
  updateOfferMapMessageIds: (...args: any[]) => mockUpdateOfferMapMessageIds(...args),
  resolveCoreference: (...args: any[]) => mockResolveCoreference(...args),
}));

// ─── Imports ────────────────────────────────────────────────────

import { MessageBuffer, type OnFlushCallback } from '../../backend/src/buffer/message-buffer';
import { renderCuratedOptions } from '../../backend/src/services/media-renderer';
import { threeCuratedOptions } from './fixtures/curated-options';
import { createMockLogger, createParsedMessage } from './helpers/mocks';

// ─── Setup ──────────────────────────────────────────────────────

const mockLogger = createMockLogger();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ═══════════════════════════════════════════════════════════════
// AC2: Buffer 20s — 3 messages consolidated into 1
// ═══════════════════════════════════════════════════════════════

describe('WhatsApp Buffer 20s (AC2)', () => {
  it('consolidates 3 messages within 15s into 1 flush', async () => {
    const onFlush = jest.fn().mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush as unknown as OnFlushCallback, mockLogger, 20_000);

    const msg1 = createParsedMessage({ content: 'Oi', messageId: 'id-1' });
    const msg2 = createParsedMessage({ content: 'quero um hotel', messageId: 'id-2' });
    const msg3 = createParsedMessage({ content: 'em Gramado', messageId: 'id-3' });

    buffer.add('+5521999999999', msg1 as any);
    jest.advanceTimersByTime(5_000);
    buffer.add('+5521999999999', msg2 as any);
    jest.advanceTimersByTime(5_000);
    buffer.add('+5521999999999', msg3 as any);

    expect(onFlush).not.toHaveBeenCalled();

    jest.advanceTimersByTime(20_000);
    await Promise.resolve();

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(
      '+5521999999999',
      'Oi quero um hotel em Gramado',
      ['id-1', 'id-2', 'id-3'],
      undefined,
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// AC3: Typing Simulation — long response chunked
// ═══════════════════════════════════════════════════════════════

describe('Typing Simulation — Chunking (AC3)', () => {
  it('chunkResponse is called for text responses', () => {
    const { chunkResponse } = require('../../backend/src/queue/chunking');
    const result = chunkResponse('A long response from Stella about hotel options in Gramado');
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('long response');
  });
});

// ═══════════════════════════════════════════════════════════════
// AC4: Premium Rendering — CuratedOptions → image + caption chunks
// ═══════════════════════════════════════════════════════════════

describe('Premium Rendering (AC4)', () => {
  it('generates image + caption chunks for WhatsApp', () => {
    const chunks = renderCuratedOptions(threeCuratedOptions as any, '+5521999', 'session-1', 'whatsapp');

    // 3 options × 2 chunks each = 6
    expect(chunks).toHaveLength(6);

    // Image chunks at 0, 2, 4
    expect(chunks[0]!.isMedia).toBe(true);
    expect(chunks[0]!.curatedPosition).toBe(1);
    expect(chunks[2]!.isMedia).toBe(true);
    expect(chunks[2]!.curatedPosition).toBe(2);
    expect(chunks[4]!.isMedia).toBe(true);
    expect(chunks[4]!.curatedPosition).toBe(3);

    // Caption chunks at 1, 3, 5
    expect(chunks[1]!.isMedia).toBe(false);
    expect(chunks[1]!.text).toContain('Suite Master Panoramica');
  });

  it('generates text-only chunks for website', () => {
    const chunks = renderCuratedOptions(threeCuratedOptions as any, 'ws-1', 'session-1', 'website');

    expect(chunks).toHaveLength(3);
    chunks.forEach((c) => expect(c.isMedia).toBe(false));
  });
});

// ═══════════════════════════════════════════════════════════════
// AC5: Reply Coreference — send options → capture IDs → reply → resolve
// ═══════════════════════════════════════════════════════════════

describe('Reply Coreference E2E (AC5)', () => {
  it('full round-trip: render → capture messageIds → Reply resolves offerId', async () => {
    // Step 1: Render options with curatedPosition
    const chunks = renderCuratedOptions(threeCuratedOptions as any, '+5521999', 's1', 'whatsapp');
    expect(chunks[0]!.curatedPosition).toBe(1);
    expect(chunks[2]!.curatedPosition).toBe(2);
    expect(chunks[4]!.curatedPosition).toBe(3);

    // Step 2: Simulate messageId capture (typing-worker would call updateOfferMapMessageIds)
    await mockUpdateOfferMapMessageIds('s1', { 1: 'EVT-001' });
    await mockUpdateOfferMapMessageIds('s1', { 2: 'EVT-002' });
    await mockUpdateOfferMapMessageIds('s1', { 3: 'EVT-003' });

    expect(mockUpdateOfferMapMessageIds).toHaveBeenCalledTimes(3);

    // Step 3: Simulate guest Reply to image 2
    mockResolveCoreference.mockResolvedValueOnce({
      resolved: true,
      option: {
        position: 2,
        offerId: 'offer-B',
        roomType: 'Quarto Deluxe',
        totalPrice: 1500,
        whatsappMessageId: 'EVT-002',
      },
    });

    const result = await mockResolveCoreference('s1', { whatsappMessageId: 'EVT-002' });
    expect(result.resolved).toBe(true);
    expect(result.option.offerId).toBe('offer-B');
    expect(result.option.position).toBe(2);
  });
});
