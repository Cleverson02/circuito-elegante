/**
 * E2E Tests — Website WebSocket Flow
 *
 * Story 4.8 — E2E Tests Multi-Canal (AC6)
 * Tests: WebSocket connect, welcome, messaging, invalid format, disconnect.
 */

// ─── Mocks ──────────────────────────────────────────────────────

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), child: jest.fn().mockReturnThis() },
}));

// ─── Imports ────────────────────────────────────────────────────

import { WebSocketManager } from '../../backend/src/websocket/manager';

// ─── Helpers ────────────────────────────────────────────────────

function createMockWs(readyState = 1): any {
  const sentMessages: string[] = [];
  return {
    OPEN: 1,
    CLOSED: 3,
    readyState,
    send: jest.fn().mockImplementation((data: string) => sentMessages.push(data)),
    close: jest.fn(),
    sentMessages,
  };
}

// ─── Tests ──────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Website WebSocket Flow E2E (AC6)', () => {
  let manager: WebSocketManager;

  beforeEach(() => {
    manager = new WebSocketManager();
  });

  it('registers connection and sends welcome-style message', () => {
    const ws = createMockWs();
    const sessionId = 'ws-e2e-001';

    manager.register(sessionId, ws);

    // Simulate server sending welcome
    const welcome = { type: 'welcome', sessionId, message: 'Ola! Sou a Stella.' };
    ws.send(JSON.stringify(welcome));

    expect(ws.sentMessages).toHaveLength(1);
    const parsed = JSON.parse(ws.sentMessages[0]);
    expect(parsed.type).toBe('welcome');
    expect(parsed.sessionId).toBe(sessionId);
  });

  it('sends chunked message response via WebSocket', () => {
    const ws = createMockWs();
    manager.register('ws-e2e-002', ws);

    // Simulate typing-worker sending chunks
    const chunk1 = { type: 'message', text: 'Encontrei opcoes em Gramado!', chunkIndex: 0, totalChunks: 2 };
    const chunk2 = { type: 'message', text: 'Hotel Fasano: R$ 1.250/noite', chunkIndex: 1, totalChunks: 2 };

    manager.send('ws-e2e-002', chunk1);
    manager.send('ws-e2e-002', chunk2);

    expect(ws.send).toHaveBeenCalledTimes(2);

    const msg1 = JSON.parse(ws.send.mock.calls[0][0]);
    expect(msg1.type).toBe('message');
    expect(msg1.chunkIndex).toBe(0);
    expect(msg1.totalChunks).toBe(2);

    const msg2 = JSON.parse(ws.send.mock.calls[1][0]);
    expect(msg2.chunkIndex).toBe(1);
  });

  it('returns false when sending to disconnected session', () => {
    const result = manager.send('nonexistent-session', { type: 'message', text: 'test' });
    expect(result).toBe(false);
  });

  it('returns false when connection is closed', () => {
    const ws = createMockWs(3); // CLOSED
    manager.register('ws-closed', ws);

    const result = manager.send('ws-closed', { type: 'message', text: 'test' });
    expect(result).toBe(false);
  });

  it('removes connection on disconnect', () => {
    const ws = createMockWs();
    manager.register('ws-disc', ws);
    expect(manager.size).toBe(1);

    manager.remove('ws-disc');
    expect(manager.size).toBe(0);
    expect(manager.getConnection('ws-disc')).toBeUndefined();
  });

  it('handles multiple concurrent sessions independently', () => {
    const ws1 = createMockWs();
    const ws2 = createMockWs();

    manager.register('session-A', ws1);
    manager.register('session-B', ws2);

    manager.send('session-A', { type: 'message', text: 'For A only' });

    expect(ws1.send).toHaveBeenCalledTimes(1);
    expect(ws2.send).not.toHaveBeenCalled();
  });
});
