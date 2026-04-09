/**
 * Shared mocks for E2E tests — Story 4.8
 *
 * Provides mock factories for Evolution API, Elevare API, and pipeline.
 */

import type { EvolutionResponse } from '../../../backend/src/integrations/evolution/types';

// ─── Evolution API Mock ─────────────────────────────────────────

let messageCounter = 0;

export function createMockEvolutionClient() {
  messageCounter = 0;
  const sentMessages: Array<{ phone: string; text: string; messageId: string }> = [];
  const sentTemplates: Array<{ phone: string; templateName: string }> = [];

  const mockSendText = jest.fn().mockImplementation((phone: string, text: string): EvolutionResponse => {
    const messageId = `MSG-${++messageCounter}`;
    sentMessages.push({ phone, text, messageId });
    return { status: 'SENT', key: { remoteJid: `${phone}@s.whatsapp.net`, fromMe: true, id: messageId } };
  });

  const mockSendComposingEvent = jest.fn().mockResolvedValue(undefined);
  const mockSendTemplate = jest.fn().mockImplementation((_phone: string, templateName: string) => {
    sentTemplates.push({ phone: _phone, templateName });
    return { status: 'SENT', key: { remoteJid: `${_phone}@s.whatsapp.net`, fromMe: true, id: `TPL-${++messageCounter}` } };
  });

  return {
    client: {
      sendText: mockSendText,
      sendComposingEvent: mockSendComposingEvent,
      sendTemplate: mockSendTemplate,
      updatePresence: jest.fn().mockResolvedValue(undefined),
      markAsRead: jest.fn().mockResolvedValue(undefined),
    } as any,
    sentMessages,
    sentTemplates,
    mockSendText,
  };
}

// ─── Mock Logger ────────────────────────────────────────────────

export function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  } as any;
}

// ─── Test Data Factories ────────────────────────────────────────

export function createParsedMessage(overrides: Record<string, unknown> = {}) {
  return {
    type: 'text',
    content: 'Quero um hotel em Gramado',
    phone: '+5521999999999',
    messageId: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    isReply: false,
    ...overrides,
  };
}
