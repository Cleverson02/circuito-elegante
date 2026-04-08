/**
 * WebSocketManager — session-to-connection map for website chat.
 *
 * Story 4.6 — Chat Widget Website (FR12)
 *
 * Manages active WebSocket connections keyed by sessionId.
 * Singleton pattern for use by typing-worker and route handler.
 *
 * [Source: architecture.md#section-9.1]
 */

import type { WebSocket } from 'ws';
import { logger } from '../middleware/logging.js';

class WebSocketManager {
  private connections = new Map<string, WebSocket>();

  /** Register a new WebSocket connection for a session. */
  register(sessionId: string, ws: WebSocket): void {
    // Close existing connection if any (reconnect scenario)
    const existing = this.connections.get(sessionId);
    if (existing && existing.readyState === existing.OPEN) {
      existing.close(1000, 'Replaced by new connection');
    }

    this.connections.set(sessionId, ws);
    logger.info('websocket_connected', {
      event: 'websocket_connected',
      sessionId,
      activeConnections: this.connections.size,
    });
  }

  /** Send data to a session's WebSocket connection. Returns true if sent. */
  send(sessionId: string, data: Record<string, unknown>): boolean {
    const ws = this.connections.get(sessionId);
    if (!ws || ws.readyState !== ws.OPEN) {
      return false;
    }

    try {
      ws.send(JSON.stringify(data));
    } catch {
      return false;
    }
    logger.info('websocket_message_sent', {
      event: 'websocket_message_sent',
      sessionId,
    });
    return true;
  }

  /** Remove a session's WebSocket connection. */
  remove(sessionId: string): void {
    this.connections.delete(sessionId);
    logger.info('websocket_disconnected', {
      event: 'websocket_disconnected',
      sessionId,
      activeConnections: this.connections.size,
    });
  }

  /** Get a session's WebSocket connection, or undefined. */
  getConnection(sessionId: string): WebSocket | undefined {
    return this.connections.get(sessionId);
  }

  /** Number of active connections. */
  get size(): number {
    return this.connections.size;
  }

  /** Close all connections (graceful shutdown — AC13). */
  closeAll(): void {
    for (const [, ws] of this.connections) {
      try {
        ws.close(1001, 'Server shutting down');
      } catch {
        // Ignore errors during shutdown
      }
    }
    const count = this.connections.size;
    this.connections.clear();
    logger.info('websocket_all_closed', {
      event: 'websocket_all_closed',
      closedConnections: count,
    });
  }
}

// Singleton instance
const wsManager = new WebSocketManager();

export function getWebSocketManager(): WebSocketManager {
  return wsManager;
}

export { WebSocketManager };
