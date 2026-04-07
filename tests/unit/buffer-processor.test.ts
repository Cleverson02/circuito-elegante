/**
 * Tests for BufferProcessor — pipeline integration after buffer flush.
 * Story 4.2 — Buffer de Concatenacao (AC15)
 */

import { createBufferProcessor } from '../../backend/src/buffer/buffer-processor.js';

// ─── Mocks ──────────────────────────────────────────────────────

// Pipeline
const mockProcessMessage = jest.fn();
jest.mock('../../backend/src/agents/pipeline.js', () => ({
  processMessage: (...args: unknown[]) => mockProcessMessage(...args),
}));

// Session manager
const mockGetSession = jest.fn();
const mockSetSession = jest.fn();
jest.mock('../../backend/src/state/session-manager.js', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  setSession: (...args: unknown[]) => mockSetSession(...args),
}));

// Presence helpers
const mockMarkAsReadDeferred = jest.fn();
const mockSetPresenceOnline = jest.fn();
const mockSetPresenceOffline = jest.fn();
jest.mock('../../backend/src/integrations/evolution/presence.js', () => ({
  markAsReadDeferred: (...args: unknown[]) => mockMarkAsReadDeferred(...args),
  setPresenceOnline: (...args: unknown[]) => mockSetPresenceOnline(...args),
  setPresenceOffline: (...args: unknown[]) => mockSetPresenceOffline(...args),
}));

// Sanitize
const mockSanitizeInput = jest.fn();
jest.mock('../../backend/src/middleware/sanitize.js', () => ({
  sanitizeInput: (...args: unknown[]) => mockSanitizeInput(...args),
}));

// Queue (Story 4.3 — typing simulation)
const mockChunkResponse = jest.fn();
const mockEnqueueResponse = jest.fn();
const mockGetTypingQueue = jest.fn();
jest.mock('../../backend/src/queue/index.js', () => ({
  chunkResponse: (...args: unknown[]) => mockChunkResponse(...args),
  enqueueResponse: (...args: unknown[]) => mockEnqueueResponse(...args),
  getTypingQueue: () => mockGetTypingQueue(),
}));

// ─── Helpers ────────────────────────────────────────────────────

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as import('winston').Logger;

const mockEvolutionClient = {
  sendText: jest.fn().mockResolvedValue({ status: 'sent' }),
  sendMedia: jest.fn().mockResolvedValue({ status: 'sent' }),
  updatePresence: jest.fn().mockResolvedValue(undefined),
  markAsRead: jest.fn().mockResolvedValue(undefined),
  sendComposingEvent: jest.fn().mockResolvedValue(undefined),
  sendRecordingEvent: jest.fn().mockResolvedValue(undefined),
} as unknown as import('../../backend/src/integrations/evolution/client.js').EvolutionClient;

// ─── Test Suite ─────────────────────────────────────────────────

describe('BufferProcessor', () => {
  let onFlush: (phone: string, consolidated: string, messageIds: string[]) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockProcessMessage.mockResolvedValue({
      response: 'Olá! Posso ajudar com hotéis.',
      intent: { intent: 'GREETING', confidence: 0.95, language: 'pt' },
      safetyApproved: true,
      multiIntent: false,
      latencyMs: 1200,
    });

    mockGetSession.mockResolvedValue(null);
    mockSetSession.mockResolvedValue(undefined);
    mockMarkAsReadDeferred.mockResolvedValue(undefined);
    mockSetPresenceOnline.mockResolvedValue(undefined);
    mockSetPresenceOffline.mockResolvedValue(undefined);
    mockSanitizeInput.mockImplementation((input: string) => ({
      sanitized: input,
      original: input,
      wasModified: false,
      wasTruncated: false,
      injection: { isInjection: false, matchedPattern: null },
    }));

    onFlush = createBufferProcessor({
      evolutionClient: mockEvolutionClient,
      logger: mockLogger,
    });
  });

  // ── AC5: Session resolution from phone ────────────────────────

  it('should resolve sessionId from phone number', async () => {
    mockGetSession.mockResolvedValue({
      hotelId: '',
      guestPhone: '+5521999999999',
      language: 'pt',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    });

    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    // sessionId should be phone without '+'
    expect(mockProcessMessage).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: '5521999999999' }),
    );
  });

  // ── AC5: Creates new session if not exists ────────────────────

  it('should create a new session if none exists', async () => {
    mockGetSession.mockResolvedValue(null);

    await onFlush('+5521888888888', 'Hello', ['msg-2']);

    expect(mockSetSession).toHaveBeenCalledWith(
      '5521888888888',
      expect.objectContaining({
        guestPhone: '+5521888888888',
        language: 'pt',
        hotelId: '',
      }),
    );
  });

  // ── AC4 step 2: Calls markAsReadDeferred for each messageId ──

  it('should mark each message as read (FR34)', async () => {
    await onFlush('+5521999999999', 'Oi tudo bem?', ['msg-a', 'msg-b', 'msg-c']);

    expect(mockMarkAsReadDeferred).toHaveBeenCalledTimes(3);
    expect(mockMarkAsReadDeferred).toHaveBeenCalledWith(
      mockEvolutionClient,
      '5521999999999@s.whatsapp.net',
      'msg-a',
      mockLogger,
    );
    expect(mockMarkAsReadDeferred).toHaveBeenCalledWith(
      mockEvolutionClient,
      '5521999999999@s.whatsapp.net',
      'msg-b',
      mockLogger,
    );
    expect(mockMarkAsReadDeferred).toHaveBeenCalledWith(
      mockEvolutionClient,
      '5521999999999@s.whatsapp.net',
      'msg-c',
      mockLogger,
    );
  });

  // ── AC4 step 3: Sets presence online before pipeline ──────────

  it('should set presence online before pipeline (FR35)', async () => {
    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    expect(mockSetPresenceOnline).toHaveBeenCalledWith(mockEvolutionClient, mockLogger);

    // Verify order: presence online called BEFORE processMessage
    const presenceCallOrder = mockSetPresenceOnline.mock.invocationCallOrder[0];
    const processCallOrder = mockProcessMessage.mock.invocationCallOrder[0];
    expect(presenceCallOrder).toBeLessThan(processCallOrder!);
  });

  // ── AC4 step 5: Calls processMessage with sanitized text ──────

  it('should call processMessage with consolidated message', async () => {
    await onFlush('+5521999999999', 'quero hotel praia casal', ['msg-1']);

    expect(mockSanitizeInput).toHaveBeenCalledWith('quero hotel praia casal');
    expect(mockProcessMessage).toHaveBeenCalledWith({
      message: 'quero hotel praia casal',
      sessionId: '5521999999999',
    });
  });

  // ── AC4 step 6: Delivers response via sendText ────────────────

  it('should deliver pipeline response via Evolution API', async () => {
    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    expect(mockEvolutionClient.sendText).toHaveBeenCalledWith(
      '+5521999999999',
      'Olá! Posso ajudar com hotéis.',
    );
  });

  // ── AC4 step 7: Sets presence offline after pipeline ──────────

  it('should set presence offline after pipeline (FR35)', async () => {
    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    expect(mockSetPresenceOffline).toHaveBeenCalledWith(mockEvolutionClient, mockLogger);

    // Verify order: processMessage BEFORE presence offline
    const processCallOrder = mockProcessMessage.mock.invocationCallOrder[0];
    const offlineCallOrder = mockSetPresenceOffline.mock.invocationCallOrder[0];
    expect(processCallOrder!).toBeLessThan(offlineCallOrder!);
  });

  // ── AC10: Pipeline error → fallback message, no crash ─────────

  it('should send fallback message on pipeline error', async () => {
    mockProcessMessage.mockRejectedValue(new Error('Pipeline exploded'));

    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    // Should NOT throw
    expect(mockEvolutionClient.sendText).toHaveBeenCalledWith(
      '+5521999999999',
      'Desculpe, tive uma dificuldade momentânea. Poderia repetir?',
    );

    // Should still set presence offline
    expect(mockSetPresenceOffline).toHaveBeenCalled();

    // Should log error
    expect(mockLogger.error).toHaveBeenCalledWith(
      'buffer_processing_error',
      expect.objectContaining({
        phone: '+5521999999999',
        error: 'Pipeline exploded',
      }),
    );
  });

  // ── AC10: Fallback send also fails → logs, no crash ───────────

  it('should handle fallback send failure gracefully', async () => {
    mockProcessMessage.mockRejectedValue(new Error('Pipeline error'));
    (mockEvolutionClient.sendText as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    // Should NOT throw
    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'buffer_fallback_send_failed',
      expect.objectContaining({
        phone: '+5521999999999',
        error: 'Network error',
      }),
    );

    // Presence offline still called (finally block)
    expect(mockSetPresenceOffline).toHaveBeenCalled();
  });

  // ── Story 4.3: Typing simulation queue integration ─────────────

  it('should use typing queue when available', async () => {
    mockGetTypingQueue.mockReturnValue({}); // queue exists
    mockChunkResponse.mockReturnValue([
      { text: 'Chunk 1', delay: 0, isMedia: false },
      { text: 'Chunk 2', delay: 5000, isMedia: false },
    ]);
    mockEnqueueResponse.mockResolvedValue(undefined);

    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    expect(mockChunkResponse).toHaveBeenCalledWith('Olá! Posso ajudar com hotéis.');
    expect(mockEnqueueResponse).toHaveBeenCalledWith(
      '5521999999999',
      '+5521999999999',
      expect.any(Array),
      'whatsapp',
    );
    // Direct sendText should NOT be called when queue works
    expect(mockEvolutionClient.sendText).not.toHaveBeenCalled();
  });

  it('should fallback to direct send when queue enqueue fails', async () => {
    mockGetTypingQueue.mockReturnValue({}); // queue exists
    mockChunkResponse.mockReturnValue([{ text: 'Chunk 1', delay: 0, isMedia: false }]);
    mockEnqueueResponse.mockRejectedValue(new Error('Redis down'));

    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    // Should fallback to direct sendText
    expect(mockEvolutionClient.sendText).toHaveBeenCalledWith(
      '+5521999999999',
      'Olá! Posso ajudar com hotéis.',
    );
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'typing_queue_enqueue_failed_fallback_direct',
      expect.objectContaining({ error: 'Redis down' }),
    );
  });

  it('should fallback to direct send when queue is null', async () => {
    mockGetTypingQueue.mockReturnValue(null); // queue unavailable

    await onFlush('+5521999999999', 'Oi', ['msg-1']);

    expect(mockEvolutionClient.sendText).toHaveBeenCalledWith(
      '+5521999999999',
      'Olá! Posso ajudar com hotéis.',
    );
    expect(mockChunkResponse).not.toHaveBeenCalled();
  });

  // ── Logging: buffer_pipeline_complete ──────────────────────────

  it('should log pipeline completion with metrics', async () => {
    await onFlush('+5521999999999', 'quero praia', ['msg-1', 'msg-2']);

    expect(mockLogger.info).toHaveBeenCalledWith(
      'buffer_pipeline_complete',
      expect.objectContaining({
        sessionId: '5521999999999',
        intent: 'GREETING',
        messageCount: 2,
        safetyApproved: true,
      }),
    );
  });
});
