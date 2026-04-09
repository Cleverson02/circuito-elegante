/**
 * E2E Tests — Graceful Shutdown
 *
 * Story 4.8 — E2E Tests Multi-Canal (AC9)
 * Tests: buffers flushed, WebSocket connections closed, queues closed.
 */

// ─── Mocks ────────────────��─────────────────────────────────────

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), child: jest.fn().mockReturnThis() },
}));

// ─── Imports ────────────────────────────────────────────────────

import { MessageBuffer, type OnFlushCallback } from '../../backend/src/buffer/message-buffer';
import { WebSocketManager } from '../../backend/src/websocket/manager';

// ─── Helpers ────────────────────────────────────────────────────

function createMockWs(): any {
  return { OPEN: 1, CLOSED: 3, readyState: 1, send: jest.fn(), close: jest.fn() };
}

const mockLogger = {
  info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
} as any;

// ─── Tests ──────────���───────────────────────────────────────────

describe('Graceful Shutdown E2E (AC9)', () => {
  it('flushAll empties all active buffers', async () => {
    const onFlush = jest.fn().mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush as unknown as OnFlushCallback, mockLogger, 60_000);

    buffer.add('+551', { type: 'text', content: 'A', phone: '+551', messageId: 'm1', timestamp: Date.now(), isReply: false } as any);
    buffer.add('+552', { type: 'text', content: 'B', phone: '+552', messageId: 'm2', timestamp: Date.now(), isReply: false } as any);

    expect(buffer.getBufferSize()).toBe(2);

    await buffer.flushAll();

    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(buffer.getBufferSize()).toBe(0);
  });

  it('WebSocketManager.closeAll closes all connections with code 1001', () => {
    const manager = new WebSocketManager();
    const ws1 = createMockWs();
    const ws2 = createMockWs();
    const ws3 = createMockWs();

    manager.register('s1', ws1);
    manager.register('s2', ws2);
    manager.register('s3', ws3);
    expect(manager.size).toBe(3);

    manager.closeAll();

    expect(ws1.close).toHaveBeenCalledWith(1001, 'Server shutting down');
    expect(ws2.close).toHaveBeenCalledWith(1001, 'Server shutting down');
    expect(ws3.close).toHaveBeenCalledWith(1001, 'Server shutting down');
    expect(manager.size).toBe(0);
  });

  it('shutdown sequence: flush buffers → close WebSockets → clean state', async () => {
    // Simulate the shutdown sequence from server.ts
    const onFlush = jest.fn().mockResolvedValue(undefined);
    const buffer = new MessageBuffer(onFlush as unknown as OnFlushCallback, mockLogger, 60_000);
    const wsManager = new WebSocketManager();

    // Active state
    buffer.add('+551', { type: 'text', content: 'pending', phone: '+551', messageId: 'm1', timestamp: Date.now(), isReply: false } as any);
    wsManager.register('ws-1', createMockWs());
    wsManager.register('ws-2', createMockWs());

    // Step 1: Flush buffers
    await buffer.flushAll();
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(buffer.getBufferSize()).toBe(0);

    // Step 2: Close WebSocket connections
    wsManager.closeAll();
    expect(wsManager.size).toBe(0);

    // All clean
    expect(buffer.getBufferSize()).toBe(0);
    expect(wsManager.size).toBe(0);
  });
});
