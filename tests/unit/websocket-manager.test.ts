/**
 * Unit tests — WebSocketManager
 *
 * Story 4.6 — Chat Widget Website (FR12)
 * Tests: register, send, remove, getConnection, closeAll
 */

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

import { logger as mockLogger } from '../../backend/src/middleware/logging';

// ─── WebSocket Mock ─────────────────────────────────────────────

function createMockWs(readyState = 1): any {
  return {
    OPEN: 1,
    CLOSED: 3,
    readyState,
    send: jest.fn(),
    close: jest.fn(),
  };
}

// ─── Import after mocks ─────────────────────────────────────────

import { WebSocketManager } from '../../backend/src/websocket/manager';

// ─── Tests ──────────────────────────────────────────────────────

describe('WebSocketManager', () => {
  let manager: WebSocketManager;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create fresh instance for each test (not the singleton)
    manager = new WebSocketManager();
  });

  describe('register', () => {
    it('stores WebSocket connection by sessionId', () => {
      const ws = createMockWs();
      manager.register('s1', ws);

      expect(manager.getConnection('s1')).toBe(ws);
      expect(manager.size).toBe(1);
    });

    it('closes existing connection on re-register (reconnect)', () => {
      const ws1 = createMockWs();
      const ws2 = createMockWs();

      manager.register('s1', ws1);
      manager.register('s1', ws2);

      expect(ws1.close).toHaveBeenCalledWith(1000, 'Replaced by new connection');
      expect(manager.getConnection('s1')).toBe(ws2);
      expect(manager.size).toBe(1);
    });

    it('logs websocket_connected', () => {
      manager.register('s1', createMockWs());

      expect(mockLogger.info).toHaveBeenCalledWith('websocket_connected', expect.objectContaining({
        event: 'websocket_connected',
        sessionId: 's1',
      }));
    });
  });

  describe('send', () => {
    it('sends JSON data to open connection and returns true', () => {
      const ws = createMockWs();
      manager.register('s1', ws);

      const data = { type: 'message', text: 'Hello' };
      const result = manager.send('s1', data);

      expect(result).toBe(true);
      expect(ws.send).toHaveBeenCalledWith(JSON.stringify(data));
    });

    it('returns false when sessionId not found', () => {
      const result = manager.send('unknown', { type: 'message', text: 'test' });
      expect(result).toBe(false);
    });

    it('returns false when connection is closed', () => {
      const ws = createMockWs(3); // CLOSED state
      manager.register('s1', ws);

      const result = manager.send('s1', { type: 'message', text: 'test' });
      expect(result).toBe(false);
      expect(ws.send).not.toHaveBeenCalled();
    });

    it('logs websocket_message_sent on success', () => {
      manager.register('s1', createMockWs());
      manager.send('s1', { type: 'message', text: 'test' });

      expect(mockLogger.info).toHaveBeenCalledWith('websocket_message_sent', expect.objectContaining({
        event: 'websocket_message_sent',
        sessionId: 's1',
      }));
    });
  });

  describe('remove', () => {
    it('removes connection from map', () => {
      manager.register('s1', createMockWs());
      manager.remove('s1');

      expect(manager.getConnection('s1')).toBeUndefined();
      expect(manager.size).toBe(0);
    });

    it('logs websocket_disconnected', () => {
      manager.register('s1', createMockWs());
      jest.clearAllMocks();
      manager.remove('s1');

      expect(mockLogger.info).toHaveBeenCalledWith('websocket_disconnected', expect.objectContaining({
        event: 'websocket_disconnected',
        sessionId: 's1',
      }));
    });
  });

  describe('getConnection', () => {
    it('returns undefined for unknown sessionId', () => {
      expect(manager.getConnection('unknown')).toBeUndefined();
    });
  });

  describe('closeAll', () => {
    it('closes all connections with code 1001', () => {
      const ws1 = createMockWs();
      const ws2 = createMockWs();
      const ws3 = createMockWs();

      manager.register('s1', ws1);
      manager.register('s2', ws2);
      manager.register('s3', ws3);

      manager.closeAll();

      expect(ws1.close).toHaveBeenCalledWith(1001, 'Server shutting down');
      expect(ws2.close).toHaveBeenCalledWith(1001, 'Server shutting down');
      expect(ws3.close).toHaveBeenCalledWith(1001, 'Server shutting down');
      expect(manager.size).toBe(0);
    });

    it('continues even if individual close throws', () => {
      const ws1 = createMockWs();
      ws1.close = jest.fn().mockImplementation(() => { throw new Error('close failed'); });
      const ws2 = createMockWs();

      manager.register('s1', ws1);
      manager.register('s2', ws2);

      expect(() => manager.closeAll()).not.toThrow();
      expect(ws2.close).toHaveBeenCalled();
      expect(manager.size).toBe(0);
    });

    it('logs websocket_all_closed with count', () => {
      manager.register('s1', createMockWs());
      manager.register('s2', createMockWs());
      jest.clearAllMocks();

      manager.closeAll();

      expect(mockLogger.info).toHaveBeenCalledWith('websocket_all_closed', expect.objectContaining({
        event: 'websocket_all_closed',
        closedConnections: 2,
      }));
    });
  });

  describe('size', () => {
    it('tracks active connections count', () => {
      expect(manager.size).toBe(0);
      manager.register('s1', createMockWs());
      expect(manager.size).toBe(1);
      manager.register('s2', createMockWs());
      expect(manager.size).toBe(2);
      manager.remove('s1');
      expect(manager.size).toBe(1);
    });
  });
});
