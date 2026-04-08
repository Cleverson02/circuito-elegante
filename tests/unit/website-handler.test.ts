/**
 * Unit tests — Website WebSocket Handler & Typing Worker Website Channel
 *
 * Story 4.6 — Chat Widget Website (FR12)
 * Tests: typing-worker website delivery via WebSocketManager
 */

// ─── BullMQ Mocks ──────────────────────────────────────────────

const mockWorkerOn = jest.fn();
const mockWorkerClose = jest.fn().mockResolvedValue(undefined);

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue(undefined),
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

// ─── WebSocketManager Mock ──────────────────────────────────────

const mockWsSend = jest.fn().mockReturnValue(true);

jest.mock('../../backend/src/websocket/manager', () => ({
  getWebSocketManager: jest.fn().mockReturnValue({
    send: (...args: any[]) => mockWsSend(...args),
    register: jest.fn(),
    remove: jest.fn(),
  }),
  WebSocketManager: jest.fn(),
}));

// ─── Coreference Mock ──────────────────────────────────────────

jest.mock('../../backend/src/services/coreference', () => ({
  updateOfferMapMessageIds: jest.fn().mockResolvedValue(null),
}));

// ─── Imports ────────────────────────────────────────────────────

import { initTypingWorker, closeTypingWorker } from '../../backend/src/queue/typing-worker';

// ─── Mock EvolutionClient ───────────────────────────────────────

const mockSendText = jest.fn().mockResolvedValue({ status: 'SENT' });
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

// ─── Tests ──────────────────────────────────────────────────────

describe('typing-worker — website channel (Story 4.6)', () => {
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
    mockWsSend.mockReturnValue(true);
  });

  it('sends message via WebSocketManager for website channel (AC8)', async () => {
    await processor({
      data: {
        sessionId: 'ws-session-1',
        phone: 'ws-session-1',
        text: 'Hello from Stella!',
        isMedia: false,
        channel: 'website',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 0 },
    });

    expect(mockWsSend).toHaveBeenCalledWith('ws-session-1', {
      type: 'message',
      text: 'Hello from Stella!',
      chunkIndex: 0,
      totalChunks: 1,
    });
    expect(mockSendText).not.toHaveBeenCalled();
    expect(mockSendComposingEvent).not.toHaveBeenCalled();
  });

  it('logs warning when WebSocket connection not found', async () => {
    mockWsSend.mockReturnValue(false);

    await processor({
      data: {
        sessionId: 'ws-disconnected',
        phone: 'ws-disconnected',
        text: 'Message to disconnected client',
        isMedia: false,
        channel: 'website',
        chunkIndex: 0,
        totalChunks: 2,
      },
      opts: { delay: 0 },
    });

    expect(mockWorkerLogger.warn).toHaveBeenCalledWith('websocket_send_failed', expect.objectContaining({
      event: 'websocket_send_failed',
      sessionId: 'ws-disconnected',
      reason: 'connection_not_found',
    }));
  });

  it('logs typing_chunk_website with delivered status', async () => {
    await processor({
      data: {
        sessionId: 'ws-session-2',
        phone: 'ws-session-2',
        text: 'Chunk text',
        isMedia: false,
        channel: 'website',
        chunkIndex: 1,
        totalChunks: 3,
      },
      opts: { delay: 0 },
    });

    expect(mockWorkerLogger.info).toHaveBeenCalledWith('typing_chunk_website', expect.objectContaining({
      event: 'typing_chunk_website',
      sessionId: 'ws-session-2',
      chunkIndex: 1,
      totalChunks: 3,
      channel: 'website',
      delivered: true,
    }));
  });

  it('does NOT call Evolution API for website channel', async () => {
    await processor({
      data: {
        sessionId: 'ws-session-3',
        phone: 'ws-session-3',
        text: 'Website only',
        isMedia: false,
        channel: 'website',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 0 },
    });

    expect(mockSendText).not.toHaveBeenCalled();
    expect(mockSendComposingEvent).not.toHaveBeenCalled();
  });

  it('still uses Evolution API for WhatsApp channel (no regression)', async () => {
    mockSendText.mockResolvedValue({ status: 'SENT' });

    await processor({
      data: {
        sessionId: 's1',
        phone: '+5521999',
        text: 'WhatsApp text',
        isMedia: false,
        channel: 'whatsapp',
        chunkIndex: 0,
        totalChunks: 1,
      },
      opts: { delay: 0 },
    });

    expect(mockSendComposingEvent).toHaveBeenCalledWith('+5521999');
    expect(mockSendText).toHaveBeenCalledWith('+5521999', 'WhatsApp text');
    expect(mockWsSend).not.toHaveBeenCalled();
  });
});
