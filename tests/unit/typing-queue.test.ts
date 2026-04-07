/**
 * Unit tests — Typing Queue & Worker
 *
 * Story 4.3 — Human-Typing Simulation (FR21)
 * Tests: enqueueResponse (delays, NFR7), worker processor logic
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
    // Capture the processor for testing
    (Worker as any).__lastProcessor = processor;
    return {
      on: mockWorkerOn,
      close: mockWorkerClose,
    };
  }),
}));

// Must import after mocks
import { Queue, Worker } from 'bullmq';

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
    child: jest.fn().mockReturnThis(),
  },
}));

// ─── Imports ────────────────────────────────────────────────────

import { initTypingQueue, enqueueResponse, closeTypingQueue, getTypingQueue } from '../../backend/src/queue/typing-queue';
import { initTypingWorker, closeTypingWorker } from '../../backend/src/queue/typing-worker';
import type { TypingChunk } from '../../backend/src/queue/types';

// ─── Mock EvolutionClient ───────────────────────────────────────

const mockSendText = jest.fn().mockResolvedValue({});
const mockSendComposingEvent = jest.fn().mockResolvedValue(undefined);
const mockEvolutionClient = {
  sendText: mockSendText,
  sendComposingEvent: mockSendComposingEvent,
} as any;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
} as any;

// ─── Setup / Teardown ──────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Reset module state by closing
});

// ─── enqueueResponse ────────────────────────────────────────────

describe('enqueueResponse', () => {
  beforeEach(async () => {
    // Ensure queue is closed before re-init
    await closeTypingQueue();
    initTypingQueue();
  });

  afterEach(async () => {
    await closeTypingQueue();
  });

  it('throws if queue not initialized', async () => {
    await closeTypingQueue();
    const chunks: TypingChunk[] = [{ text: 'Hello', delay: 0, isMedia: false }];
    await expect(enqueueResponse('s1', '+55219', chunks, 'whatsapp'))
      .rejects.toThrow('Typing queue not initialized');
  });

  it('enqueues N jobs for N chunks', async () => {
    const chunks: TypingChunk[] = [
      { text: 'Chunk 1', delay: 0, isMedia: false },
      { text: 'Chunk 2', delay: 5000, isMedia: false },
      { text: 'Chunk 3', delay: 3000, isMedia: false },
    ];

    await enqueueResponse('session-1', '+5521999', chunks, 'whatsapp');
    expect(mockQueueAdd).toHaveBeenCalledTimes(3);
  });

  it('first chunk has delay 0 (NFR7 compliance)', async () => {
    const chunks: TypingChunk[] = [
      { text: 'First chunk', delay: 5000, isMedia: false },
      { text: 'Second chunk', delay: 3000, isMedia: false },
    ];

    await enqueueResponse('session-1', '+5521999', chunks, 'whatsapp');

    const firstCall = mockQueueAdd.mock.calls[0];
    const firstJobOptions = firstCall[2]; // third arg = options
    expect(firstJobOptions.delay).toBe(0);
  });

  it('cumulative delays include inter-chunk pause of 1500ms', async () => {
    const chunks: TypingChunk[] = [
      { text: 'Chunk 1', delay: 0, isMedia: false },
      { text: 'Chunk 2', delay: 5000, isMedia: false },
      { text: 'Chunk 3', delay: 3000, isMedia: false },
    ];

    await enqueueResponse('session-1', '+5521999', chunks, 'whatsapp');

    // First: delay = 0 (cumulative starts at 0)
    expect(mockQueueAdd.mock.calls[0][2].delay).toBe(0);

    // Second: cumulative = 0 + 0 (first chunk delay) + 1500 = 1500
    expect(mockQueueAdd.mock.calls[1][2].delay).toBe(1500);

    // Third: cumulative = 1500 + 5000 (second chunk delay) + 1500 = 8000
    expect(mockQueueAdd.mock.calls[2][2].delay).toBe(8000);
  });

  it('each job has 3 attempts with exponential backoff', async () => {
    const chunks: TypingChunk[] = [
      { text: 'Test', delay: 0, isMedia: false },
    ];

    await enqueueResponse('s1', '+55219', chunks, 'whatsapp');

    const jobOptions = mockQueueAdd.mock.calls[0][2];
    expect(jobOptions.attempts).toBe(3);
    expect(jobOptions.backoff).toEqual({ type: 'exponential', delay: 1000 });
  });

  it('passes correct job data', async () => {
    const chunks: TypingChunk[] = [
      { text: 'Hello world', delay: 0, isMedia: false },
    ];

    await enqueueResponse('session-42', '+5521999', chunks, 'whatsapp');

    const jobData = mockQueueAdd.mock.calls[0][1];
    expect(jobData).toEqual({
      sessionId: 'session-42',
      phone: '+5521999',
      text: 'Hello world',
      isMedia: false,
      channel: 'whatsapp',
      chunkIndex: 0,
      totalChunks: 1,
    });
  });

  it('passes website channel correctly', async () => {
    const chunks: TypingChunk[] = [
      { text: 'Web message', delay: 0, isMedia: false },
    ];

    await enqueueResponse('s1', '+55219', chunks, 'website');

    const jobData = mockQueueAdd.mock.calls[0][1];
    expect(jobData.channel).toBe('website');
  });
});

// ─── Worker Processor ───────────────────────────────────────────

describe('typingWorker processor', () => {
  let processor: (job: any) => Promise<void>;

  beforeAll(async () => {
    await closeTypingWorker();
    initTypingWorker(mockEvolutionClient, mockLogger);
    processor = (Worker as any).__lastProcessor;
  });

  afterAll(async () => {
    await closeTypingWorker();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends composing event + text for WhatsApp text chunks', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'Hello',
        isMedia: false,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 0 },
    });

    expect(mockSendComposingEvent).toHaveBeenCalledWith('+5521999');
    expect(mockSendText).toHaveBeenCalledWith('+5521999', 'Hello');
  });

  it('does not send composing event for media chunks (isMedia=true)', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'image caption',
        isMedia: true,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 0 },
    });

    expect(mockSendComposingEvent).not.toHaveBeenCalled();
    expect(mockSendText).toHaveBeenCalledWith('+5521999', 'image caption');
  });

  it('does not call Evolution API for website channel', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'Web message',
        isMedia: false,
        channel: 'website',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 0 },
    });

    expect(mockSendComposingEvent).not.toHaveBeenCalled();
    expect(mockSendText).not.toHaveBeenCalled();
  });

  it('logs typing_chunk_website for website channel', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'Web message',
        isMedia: false,
        channel: 'website',
        chunkIndex: 0,
        totalChunks: 2,
      },
      opts: { delay: 0 },
    });

    expect(mockLogger.info).toHaveBeenCalledWith('typing_chunk_website', expect.objectContaining({
      event: 'typing_chunk_website',
      sessionId: 's1',
      channel: 'website',
    }));
  });

  it('logs typing_chunk_sent for WhatsApp delivery', async () => {
    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'Hello',
        isMedia: false,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 500 },
    });

    expect(mockLogger.info).toHaveBeenCalledWith('typing_chunk_sent', expect.objectContaining({
      event: 'typing_chunk_sent',
      sessionId: 's1',
      phone: '+5521999',
      chunkIndex: 0,
      totalChunks: 1,
      channel: 'whatsapp',
    }));
  });

  it('propagates errors from sendText for BullMQ retry', async () => {
    mockSendText.mockRejectedValueOnce(new Error('Evolution API timeout'));

    await expect(processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'Hello',
        isMedia: false,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 0 },
    })).rejects.toThrow('Evolution API timeout');
  });
});

// ─── Queue Lifecycle ────────────────────────────────────────────

describe('queue lifecycle', () => {
  it('initTypingQueue creates a Queue instance', () => {
    initTypingQueue();
    expect(Queue).toHaveBeenCalledWith('typing', expect.objectContaining({
      connection: expect.anything(),
    }));
    closeTypingQueue();
  });

  it('closeTypingQueue calls queue.close()', async () => {
    initTypingQueue();
    await closeTypingQueue();
    expect(mockQueueClose).toHaveBeenCalled();
  });

  it('getTypingQueue returns null before init', async () => {
    await closeTypingQueue();
    expect(getTypingQueue()).toBeNull();
  });
});
