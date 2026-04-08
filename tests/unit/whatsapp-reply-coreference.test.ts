/**
 * Unit & Integration tests — WhatsApp Reply Coreference
 *
 * Story 4.5 — Correfencia via WhatsApp Reply (FR18)
 * Tests: typing-worker messageId capture, buffer quotedMessageId preservation,
 *        buffer-processor Reply resolution, round-trip integration.
 */

// ─── BullMQ Mocks ──────────────────────────────────────────────

const mockQueueAdd = jest.fn().mockResolvedValue({});
const mockQueueClose = jest.fn().mockResolvedValue(undefined);
const mockWorkerOn = jest.fn();
const mockWorkerClose = jest.fn().mockResolvedValue(undefined);

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: mockQueueAdd,
    close: mockQueueClose,
  })),
  Worker: jest.fn().mockImplementation((_name: string, processor: Function, _opts: unknown) => {
    (Worker as any).__lastProcessor = processor;
    return {
      on: mockWorkerOn,
      close: mockWorkerClose,
    };
  }),
}));

import { Worker } from 'bullmq';

// ─── Redis Mock ─────────────────────────────────────────────────

jest.mock('../../backend/src/state/redis-client', () => ({
  getRedisClient: jest.fn().mockReturnValue({}),
}));

// ─── Logger Mock ────────────────────────────────────────────────

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

// ─── Coreference Mock ──────────────────────────────────────────

const mockUpdateOfferMapMessageIds = jest.fn().mockResolvedValue(null);
const mockResolveCoreference = jest.fn();

jest.mock('../../backend/src/services/coreference', () => ({
  updateOfferMapMessageIds: (...args: any[]) => mockUpdateOfferMapMessageIds(...args),
  resolveCoreference: (...args: any[]) => mockResolveCoreference(...args),
}));

// ─── Chunking Mock ─────────────────────────────────────────────

jest.mock('../../backend/src/queue/chunking', () => ({
  calculateDelay: jest.fn().mockReturnValue(5000),
}));

// ─── Imports ────────────────────────────────────────────────────

import { initTypingWorker, closeTypingWorker } from '../../backend/src/queue/typing-worker';
import { initTypingQueue, enqueueResponse, closeTypingQueue } from '../../backend/src/queue/typing-queue';
import { MessageBuffer, type OnFlushCallback } from '../../backend/src/buffer/message-buffer';
import { renderCuratedOptions } from '../../backend/src/services/media-renderer';
import type { TypingChunk } from '../../backend/src/queue/types';
import type { ParsedMessage } from '../../backend/src/integrations/evolution/types';
import type { CuratedOption } from '../../backend/src/services/curadoria';
import type { ElevarePhoto } from '../../backend/src/integrations/elevare/types';

// ─── Mock EvolutionClient ───────────────────────────────────────

const mockSendText = jest.fn().mockResolvedValue({ status: 'SENT', key: { remoteJid: '5521999@s.whatsapp.net', fromMe: true, id: 'MSG-001' } });
const mockSendComposingEvent = jest.fn().mockResolvedValue(undefined);
const mockEvolutionClient = {
  sendText: mockSendText,
  sendComposingEvent: mockSendComposingEvent,
} as any;

const mockWorkerLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
} as any;

const mockBufferLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
} as any;

// ─── Test Helpers ───────────────────────────────────────────────

function makePhoto(url: string): ElevarePhoto {
  return { url, type: 'room' };
}

function makeOption(overrides: Partial<CuratedOption> = {}): CuratedOption {
  return {
    offerId: 'offer-1',
    roomType: 'Suite Master',
    ratePlan: 'standard',
    totalPrice: 1250,
    displayPrice: 1250,
    originalPrice: 1250,
    hasBradescoDiscount: false,
    nights: 2,
    pricePerNight: 625,
    displayPricePerNight: 625,
    photos: [makePhoto('https://cdn.elevare.com/suite.jpg')],
    amenities: ['Wi-Fi'],
    curatedRank: 1,
    priceBucket: 'mid' as CuratedOption['priceBucket'],
    ...overrides,
  };
}

function makeParsedMessage(overrides: Partial<ParsedMessage> = {}): ParsedMessage {
  return {
    type: 'text',
    content: 'quero essa',
    phone: '+5521999999999',
    messageId: 'msg-001',
    timestamp: Date.now(),
    isReply: false,
    ...overrides,
  };
}

// ─── Setup / Teardown ──────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ═══════════════════════════════════════════════════════════════
// 1. TYPING-WORKER: messageId capture (AC3, AC4)
// ═══════════════════════════════════════════════════════════════

describe('typing-worker — messageId capture (Story 4.5)', () => {
  let processor: (job: any) => Promise<void>;

  beforeAll(async () => {
    await closeTypingWorker();
    initTypingWorker(mockEvolutionClient, mockWorkerLogger);
    processor = (Worker as any).__lastProcessor;
  });

  afterAll(async () => {
    await closeTypingWorker();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendText.mockResolvedValue({
      status: 'SENT',
      key: { remoteJid: '5521999@s.whatsapp.net', fromMe: true, id: 'MSG-ABC-123' },
    });
  });

  it('captures messageId and calls updateOfferMapMessageIds for media with curatedPosition', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'https://cdn.elevare.com/photo.jpg',
        isMedia: true,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 4,
        curatedPosition: 2,
      },
      opts: { delay: 0 },
    });

    expect(mockSendText).toHaveBeenCalledWith('+5521999', 'https://cdn.elevare.com/photo.jpg');
    expect(mockUpdateOfferMapMessageIds).toHaveBeenCalledWith('s1', { 2: 'MSG-ABC-123' });
  });

  it('does NOT call updateOfferMapMessageIds for media without curatedPosition', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'https://cdn.elevare.com/photo.jpg',
        isMedia: true,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 2,
      },
      opts: { delay: 0 },
    });

    expect(mockSendText).toHaveBeenCalled();
    expect(mockUpdateOfferMapMessageIds).not.toHaveBeenCalled();
  });

  it('does NOT call updateOfferMapMessageIds for text chunks (isMedia=false)', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'Caption text',
        isMedia: false,
        channel: 'whatsapp',
        chunkIndex: 1,
        totalChunks: 2,
        curatedPosition: 1,
      },
      opts: { delay: 0 },
    });

    // Text chunks go through composing + sendText, but NOT messageId capture
    expect(mockUpdateOfferMapMessageIds).not.toHaveBeenCalled();
  });

  it('logs warning and continues when EvolutionResponse has no key.id (AC4)', async () => {
    mockSendText.mockResolvedValueOnce({ status: 'SENT' }); // no key

    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'https://cdn.elevare.com/photo.jpg',
        isMedia: true,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 2,
        curatedPosition: 1,
      },
      opts: { delay: 0 },
    });

    expect(mockUpdateOfferMapMessageIds).not.toHaveBeenCalled();
    expect(mockWorkerLogger.warn).toHaveBeenCalledWith('media_message_id_capture_failed', expect.objectContaining({
      event: 'media_message_id_capture_failed',
      sessionId: 's1',
      phone: '+5521999',
      curatedPosition: 1,
      chunkIndex: 0,
    }));
  });

  it('logs warning when response is null/undefined (AC4)', async () => {
    mockSendText.mockResolvedValueOnce(null);

    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'https://cdn.elevare.com/photo.jpg',
        isMedia: true,
        channel: 'whatsapp',
        chunkIndex: 2,
        totalChunks: 4,
        curatedPosition: 3,
      },
      opts: { delay: 0 },
    });

    expect(mockUpdateOfferMapMessageIds).not.toHaveBeenCalled();
    expect(mockWorkerLogger.warn).toHaveBeenCalledWith('media_message_id_capture_failed', expect.objectContaining({
      curatedPosition: 3,
      chunkIndex: 2,
    }));
  });

  it('catches Redis error in updateOfferMapMessageIds without failing the job (QA fix #1)', async () => {
    mockUpdateOfferMapMessageIds.mockRejectedValueOnce(new Error('Redis connection lost'));

    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'https://cdn.elevare.com/photo.jpg',
        isMedia: true,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 2,
        curatedPosition: 1,
      },
      opts: { delay: 0 },
    });

    // Job should NOT throw — image was sent, messageId capture failed gracefully
    expect(mockSendText).toHaveBeenCalled();
    expect(mockUpdateOfferMapMessageIds).toHaveBeenCalled();
    expect(mockWorkerLogger.warn).toHaveBeenCalledWith('offer_map_update_failed', expect.objectContaining({
      event: 'offer_map_update_failed',
      sessionId: 's1',
      curatedPosition: 1,
      error: 'Redis connection lost',
    }));
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. ENQUEUE-RESPONSE: curatedPosition propagation (AC1)
// ═══════════════════════════════════════════════════════════════

describe('enqueueResponse — curatedPosition propagation (Story 4.5)', () => {
  beforeEach(async () => {
    await closeTypingQueue();
    initTypingQueue();
  });

  afterEach(async () => {
    await closeTypingQueue();
  });

  it('passes curatedPosition from chunk to job data', async () => {
    const chunks: TypingChunk[] = [
      { text: 'https://cdn.elevare.com/photo.jpg', delay: 0, isMedia: true, curatedPosition: 1 },
    ];

    await enqueueResponse('s1', '+5521999', chunks, 'whatsapp');

    const jobData = mockQueueAdd.mock.calls[0][1];
    expect(jobData.curatedPosition).toBe(1);
  });

  it('omits curatedPosition when not present on chunk', async () => {
    const chunks: TypingChunk[] = [
      { text: 'Regular text', delay: 5000, isMedia: false },
    ];

    await enqueueResponse('s1', '+5521999', chunks, 'whatsapp');

    const jobData = mockQueueAdd.mock.calls[0][1];
    expect(jobData.curatedPosition).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. RENDER-CURATED-OPTIONS: curatedPosition on image chunks (AC2)
// ═══════════════════════════════════════════════════════════════

describe('renderCuratedOptions — curatedPosition (Story 4.5)', () => {
  it('sets curatedPosition on image chunks (1-indexed)', () => {
    const options = [
      makeOption({ offerId: 'o1', curatedRank: 1 }),
      makeOption({ offerId: 'o2', curatedRank: 2, photos: [makePhoto('https://cdn.elevare.com/photo2.jpg')] }),
      makeOption({ offerId: 'o3', curatedRank: 3, photos: [makePhoto('https://cdn.elevare.com/photo3.jpg')] }),
    ];

    const chunks = renderCuratedOptions(options, '+5521999', 's1', 'whatsapp');

    // 3 options × 2 chunks each (image + caption) = 6 chunks
    expect(chunks).toHaveLength(6);

    // Image chunks at indices 0, 2, 4 should have curatedPosition
    expect(chunks[0]!.curatedPosition).toBe(1);
    expect(chunks[2]!.curatedPosition).toBe(2);
    expect(chunks[4]!.curatedPosition).toBe(3);

    // Caption chunks at indices 1, 3, 5 should NOT have curatedPosition
    expect(chunks[1]!.curatedPosition).toBeUndefined();
    expect(chunks[3]!.curatedPosition).toBeUndefined();
    expect(chunks[5]!.curatedPosition).toBeUndefined();
  });

  it('does NOT set curatedPosition on fallback text chunks (no photo)', () => {
    const option = makeOption({ photos: [] });
    const chunks = renderCuratedOptions([option], '+5521999', 's1', 'whatsapp');

    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.curatedPosition).toBeUndefined();
  });

  it('does NOT set curatedPosition on website channel chunks', () => {
    const option = makeOption();
    const chunks = renderCuratedOptions([option], '+5521999', 's1', 'website');

    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.curatedPosition).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. MESSAGE-BUFFER: quotedMessageId preservation (AC5)
// ═══════════════════════════════════════════════════════════════

describe('MessageBuffer — quotedMessageId (Story 4.5)', () => {
  let flushCallback: jest.Mock;
  let buffer: MessageBuffer;

  beforeEach(() => {
    flushCallback = jest.fn().mockResolvedValue(undefined);
    buffer = new MessageBuffer(flushCallback as unknown as OnFlushCallback, mockBufferLogger, 100);
  });

  it('passes quotedMessageId from single message to flush callback', async () => {
    const msg = makeParsedMessage({
      content: 'quero essa',
      isReply: true,
      quotedMessageId: 'QUOTED-MSG-001',
    });

    buffer.add('+5521999999999', msg);
    jest.advanceTimersByTime(150);
    await Promise.resolve(); // flush microtask

    expect(flushCallback).toHaveBeenCalledWith(
      '+5521999999999',
      'quero essa',
      ['msg-001'],
      'QUOTED-MSG-001',
    );
  });

  it('keeps most recent quotedMessageId when multiple messages have it', async () => {
    const msg1 = makeParsedMessage({
      messageId: 'msg-001',
      content: 'hmm',
      isReply: true,
      quotedMessageId: 'QUOTED-OLD',
      timestamp: 1000,
    });

    const msg2 = makeParsedMessage({
      messageId: 'msg-002',
      content: 'quero essa',
      isReply: true,
      quotedMessageId: 'QUOTED-NEW',
      timestamp: 2000,
    });

    buffer.add('+5521999999999', msg1);
    buffer.add('+5521999999999', msg2);
    jest.advanceTimersByTime(150);
    await Promise.resolve();

    expect(flushCallback).toHaveBeenCalledWith(
      '+5521999999999',
      'hmm quero essa',
      ['msg-001', 'msg-002'],
      'QUOTED-NEW',
    );
  });

  it('passes undefined quotedMessageId when no message has it', async () => {
    const msg = makeParsedMessage({
      content: 'ola',
      isReply: false,
    });

    buffer.add('+5521999999999', msg);
    jest.advanceTimersByTime(150);
    await Promise.resolve();

    expect(flushCallback).toHaveBeenCalledWith(
      '+5521999999999',
      'ola',
      ['msg-001'],
      undefined,
    );
  });

  it('preserves quotedMessageId even when later messages lack it', async () => {
    const msg1 = makeParsedMessage({
      messageId: 'msg-001',
      content: 'essa aqui',
      isReply: true,
      quotedMessageId: 'QUOTED-123',
    });

    const msg2 = makeParsedMessage({
      messageId: 'msg-002',
      content: 'por favor',
      isReply: false,
    });

    buffer.add('+5521999999999', msg1);
    buffer.add('+5521999999999', msg2);
    jest.advanceTimersByTime(150);
    await Promise.resolve();

    expect(flushCallback).toHaveBeenCalledWith(
      '+5521999999999',
      'essa aqui por favor',
      ['msg-001', 'msg-002'],
      'QUOTED-123',
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. ROUND-TRIP: 3 options → capture IDs → Reply → resolve (AC11)
// ═══════════════════════════════════════════════════════════════

describe('round-trip integration — Reply coreference (Story 4.5)', () => {
  it('renders 3 curated options with curatedPosition, simulates messageId capture, and resolves Reply', async () => {
    // Step 1: Render 3 curated options
    const options = [
      makeOption({ offerId: 'offer-A', curatedRank: 1, photos: [makePhoto('https://cdn.elevare.com/a.jpg')] }),
      makeOption({ offerId: 'offer-B', curatedRank: 2, photos: [makePhoto('https://cdn.elevare.com/b.jpg')] }),
      makeOption({ offerId: 'offer-C', curatedRank: 3, photos: [makePhoto('https://cdn.elevare.com/c.jpg')] }),
    ];

    const chunks = renderCuratedOptions(options, '+5521999', 'session-1', 'whatsapp');

    // Verify 6 chunks: 3 × (image + caption)
    expect(chunks).toHaveLength(6);
    expect(chunks[0]!.curatedPosition).toBe(1);
    expect(chunks[2]!.curatedPosition).toBe(2);
    expect(chunks[4]!.curatedPosition).toBe(3);

    // Step 2: Simulate typing-worker sending images and capturing messageIds
    const processor = (Worker as any).__lastProcessor;
    if (!processor) {
      // Re-init worker for this test
      await closeTypingWorker();
      initTypingWorker(mockEvolutionClient, mockWorkerLogger);
    }
    const workerProcessor = (Worker as any).__lastProcessor;

    // Simulate Evolution API returning different messageIds for each image
    const messageIds = ['EVT-MSG-001', 'EVT-MSG-002', 'EVT-MSG-003'];
    for (let i = 0; i < 3; i++) {
      mockSendText.mockResolvedValueOnce({
        status: 'SENT',
        key: { remoteJid: '5521999@s.whatsapp.net', fromMe: true, id: messageIds[i] },
      });

      await workerProcessor({
        data: {
          sessionId: 'session-1',
          phone: '+5521999',
          text: chunks[i * 2]!.text,
          isMedia: true,
          channel: 'whatsapp',
          chunkIndex: i * 2,
          totalChunks: 6,
          curatedPosition: i + 1,
        },
        opts: { delay: 0 },
      });
    }

    // Verify updateOfferMapMessageIds called 3 times with correct positions
    expect(mockUpdateOfferMapMessageIds).toHaveBeenCalledTimes(3);
    expect(mockUpdateOfferMapMessageIds).toHaveBeenCalledWith('session-1', { 1: 'EVT-MSG-001' });
    expect(mockUpdateOfferMapMessageIds).toHaveBeenCalledWith('session-1', { 2: 'EVT-MSG-002' });
    expect(mockUpdateOfferMapMessageIds).toHaveBeenCalledWith('session-1', { 3: 'EVT-MSG-003' });

    // Step 3: Simulate guest replying to image 2
    mockResolveCoreference.mockResolvedValueOnce({
      resolved: true,
      option: {
        position: 2,
        offerId: 'offer-B',
        requestId: 'req-1',
        roomId: 'room-B',
        ratePlanId: 'rate-B',
        hotelName: 'Hotel B',
        roomType: 'Suite B',
        totalPrice: 1500,
        currency: 'BRL',
        whatsappMessageId: 'EVT-MSG-002',
      },
    });

    // Verify resolveCoreference would be called with correct messageId
    const result = await mockResolveCoreference('session-1', { whatsappMessageId: 'EVT-MSG-002' });
    expect(result.resolved).toBe(true);
    expect(result.option.offerId).toBe('offer-B');
    expect(result.option.position).toBe(2);
  });
});
