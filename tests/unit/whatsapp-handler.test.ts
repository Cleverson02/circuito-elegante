/**
 * Unit tests — WhatsApp Webhook Handler + Message Parser
 *
 * Story 4.1 — WhatsApp Business API — Recepcao de Mensagens
 * Tests: message parsing (text, audio, image, reply), phone extraction,
 *        signature validation, idempotency, rate limiting, webhook_events insert
 */

import { createHmac } from 'node:crypto';
import {
  parseEvolutionMessage,
  extractPhoneFromJid,
  isMessageEvent,
  isConnectionEvent,
} from '../../backend/src/webhooks/whatsapp-types';
import {
  validateEvolutionSignature,
  handleWhatsAppWebhook,
} from '../../backend/src/webhooks/whatsapp-handler';
import type { EvolutionMessageData, EvolutionWebhookPayload } from '../../backend/src/integrations/evolution/types';

// ─── Mocks ──────────────────────────────────────────────────────

const mockLogger = {
  child: jest.fn().mockReturnThis(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as any;

const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  incr: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
} as any;

jest.mock('../../backend/src/webhooks/elevare-repository', () => ({
  insertWebhookEvent: jest.fn().mockResolvedValue('evt-uuid-123'),
}));

const { insertWebhookEvent } = require('../../backend/src/webhooks/elevare-repository');

const WEBHOOK_SECRET = 'test-secret-abc-123';

function makeSignature(body: string, secret: string = WEBHOOK_SECRET): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

// ─── Test Data ──────────────────────────────────────────────────

function makeTextMessageData(overrides?: Partial<EvolutionMessageData>): EvolutionMessageData {
  return {
    key: {
      remoteJid: '5521999999999@s.whatsapp.net',
      fromMe: false,
      id: 'msg-text-001',
    },
    pushName: 'Guest Name',
    message: { conversation: 'Boa noite, quero reservar um quarto' },
    messageType: 'conversation',
    messageTimestamp: 1712444800,
    ...overrides,
  };
}

function makeImageMessageData(): EvolutionMessageData {
  return {
    key: {
      remoteJid: '5521888888888@s.whatsapp.net',
      fromMe: false,
      id: 'msg-img-002',
    },
    message: {
      imageMessage: {
        url: 'https://mmg.whatsapp.net/image-abc.jpg',
        mimetype: 'image/jpeg',
        caption: 'Olha essa vista!',
      },
    },
    messageType: 'imageMessage',
    messageTimestamp: 1712444900,
  };
}

function makeAudioMessageData(): EvolutionMessageData {
  return {
    key: {
      remoteJid: '5521777777777@s.whatsapp.net',
      fromMe: false,
      id: 'msg-audio-003',
    },
    message: {
      audioMessage: {
        url: 'https://mmg.whatsapp.net/audio-xyz.ogg',
        mimetype: 'audio/ogg; codecs=opus',
        seconds: 12,
        ptt: true,
      },
    },
    messageType: 'audioMessage',
    messageTimestamp: 1712445000,
  };
}

function makeReplyMessageData(): EvolutionMessageData {
  return {
    key: {
      remoteJid: '5521999999999@s.whatsapp.net',
      fromMe: false,
      id: 'msg-reply-004',
    },
    message: {
      extendedTextMessage: {
        text: 'Quero essa opcao!',
        contextInfo: {
          stanzaId: 'msg-original-abc',
          participant: '5521000000000@s.whatsapp.net',
        },
      },
    },
    messageType: 'extendedTextMessage',
    messageTimestamp: 1712445100,
  };
}

// ─── extractPhoneFromJid ────────────────────────────────────────

describe('extractPhoneFromJid', () => {
  it('extracts E.164 phone from individual chat JID', () => {
    expect(extractPhoneFromJid('5521999999999@s.whatsapp.net')).toBe('+5521999999999');
  });

  it('extracts phone with country code', () => {
    expect(extractPhoneFromJid('14155551234@s.whatsapp.net')).toBe('+14155551234');
  });

  it('returns null for group chats', () => {
    expect(extractPhoneFromJid('120363012345678@g.us')).toBeNull();
  });

  it('returns null for status broadcasts', () => {
    expect(extractPhoneFromJid('status@broadcast')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractPhoneFromJid('')).toBeNull();
  });
});

// ─── parseEvolutionMessage ──────────────────────────────────────

describe('parseEvolutionMessage', () => {
  it('parses text message (conversation) correctly', () => {
    const data = makeTextMessageData();
    const result = parseEvolutionMessage(data);

    expect(result).toEqual({
      type: 'text',
      content: 'Boa noite, quero reservar um quarto',
      phone: '+5521999999999',
      messageId: 'msg-text-001',
      timestamp: 1712444800,
      isReply: false,
      quotedMessageId: undefined,
    });
  });

  it('parses image message with caption', () => {
    const result = parseEvolutionMessage(makeImageMessageData());

    expect(result).toEqual({
      type: 'image',
      content: 'Olha essa vista!',
      mediaUrl: 'https://mmg.whatsapp.net/image-abc.jpg',
      phone: '+5521888888888',
      messageId: 'msg-img-002',
      timestamp: 1712444900,
      isReply: false,
      quotedMessageId: undefined,
    });
  });

  it('parses audio message with mediaUrl', () => {
    const result = parseEvolutionMessage(makeAudioMessageData());

    expect(result).toEqual({
      type: 'audio',
      content: '',
      mediaUrl: 'https://mmg.whatsapp.net/audio-xyz.ogg',
      phone: '+5521777777777',
      messageId: 'msg-audio-003',
      timestamp: 1712445000,
      isReply: false,
      quotedMessageId: undefined,
    });
  });

  it('parses reply (extendedTextMessage) with quotedMessageId', () => {
    const result = parseEvolutionMessage(makeReplyMessageData());

    expect(result).toEqual({
      type: 'text',
      content: 'Quero essa opcao!',
      phone: '+5521999999999',
      messageId: 'msg-reply-004',
      timestamp: 1712445100,
      isReply: true,
      quotedMessageId: 'msg-original-abc',
    });
  });

  it('returns null for fromMe messages', () => {
    const data = makeTextMessageData({
      key: { remoteJid: '5521999@s.whatsapp.net', fromMe: true, id: 'msg-5' },
    });
    expect(parseEvolutionMessage(data)).toBeNull();
  });

  it('returns null for group chat messages', () => {
    const data = makeTextMessageData({
      key: { remoteJid: '120363012345@g.us', fromMe: false, id: 'msg-6' },
    });
    expect(parseEvolutionMessage(data)).toBeNull();
  });

  it('returns null for unsupported types (document)', () => {
    const data: EvolutionMessageData = {
      key: { remoteJid: '5521999@s.whatsapp.net', fromMe: false, id: 'msg-7' },
      message: {
        documentMessage: {
          url: 'https://example.com/file.pdf',
          mimetype: 'application/pdf',
          title: 'Contract',
        },
      },
      messageType: 'documentMessage',
      messageTimestamp: 1712446000,
    };
    expect(parseEvolutionMessage(data)).toBeNull();
  });
});

// ─── validateEvolutionSignature ─────────────────────────────────

describe('validateEvolutionSignature', () => {
  const body = '{"event":"messages.upsert","data":{}}';

  it('returns true for valid signature', () => {
    const signature = makeSignature(body);
    expect(validateEvolutionSignature(body, signature, WEBHOOK_SECRET)).toBe(true);
  });

  it('returns false for invalid signature', () => {
    expect(validateEvolutionSignature(body, 'wrong-sig', WEBHOOK_SECRET)).toBe(false);
  });

  it('returns false for empty signature', () => {
    expect(validateEvolutionSignature(body, '', WEBHOOK_SECRET)).toBe(false);
  });

  it('returns false for tampered body', () => {
    const signature = makeSignature(body);
    const tampered = body.replace('upsert', 'tampered');
    expect(validateEvolutionSignature(tampered, signature, WEBHOOK_SECRET)).toBe(false);
  });
});

// ─── handleWhatsAppWebhook ──────────────────────────────────────

describe('handleWhatsAppWebhook', () => {
  function makeRequest(payload: unknown, secret: string = WEBHOOK_SECRET) {
    const bodyStr = JSON.stringify(payload);
    const signature = makeSignature(bodyStr, secret);
    return {
      body: payload,
      rawBody: bodyStr,
      headers: { 'x-evolution-signature': signature },
      ip: '127.0.0.1',
    } as any;
  }

  function makeReply() {
    const reply: any = {
      statusCode: 200,
      body: null,
      status(code: number) { reply.statusCode = code; return reply; },
      send(body: unknown) { reply.body = body; return reply; },
    };
    return reply;
  }

  const deps = {
    redis: mockRedis,
    logger: mockLogger,
    webhookSecret: WEBHOOK_SECRET,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    (insertWebhookEvent as jest.Mock).mockResolvedValue('evt-uuid-123');
  });

  it('returns 200 for valid text message', async () => {
    const payload: EvolutionWebhookPayload = {
      event: 'messages.upsert',
      instance: 'stella-test',
      data: makeTextMessageData(),
    };

    const reply = makeReply();
    await handleWhatsAppWebhook(makeRequest(payload), reply, deps);

    expect(reply.statusCode).toBe(200);
    expect(reply.body.status).toBe('received');
    expect(insertWebhookEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'evolution',
        eventType: 'messages.upsert',
      }),
    );
  });

  it('returns 401 for invalid signature', async () => {
    const payload = {
      event: 'messages.upsert',
      instance: 'stella-test',
      data: makeTextMessageData(),
    };

    const request = {
      body: payload,
      rawBody: JSON.stringify(payload),
      headers: { 'x-evolution-signature': 'invalid-sig' },
      ip: '127.0.0.1',
    } as any;

    const reply = makeReply();
    await handleWhatsAppWebhook(request, reply, deps);

    expect(reply.statusCode).toBe(401);
    expect(insertWebhookEvent).not.toHaveBeenCalled();
  });

  it('returns 200 (duplicate) for repeated messageId', async () => {
    mockRedis.set.mockResolvedValue(null); // key already exists = duplicate

    const payload: EvolutionWebhookPayload = {
      event: 'messages.upsert',
      instance: 'stella-test',
      data: makeTextMessageData(),
    };

    const reply = makeReply();
    await handleWhatsAppWebhook(makeRequest(payload), reply, deps);

    expect(reply.statusCode).toBe(200);
    expect(reply.body.status).toBe('duplicate');
    expect(insertWebhookEvent).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockRedis.set.mockResolvedValue('OK'); // not duplicate
    mockRedis.incr.mockResolvedValue(31);  // over 30/min limit

    const payload: EvolutionWebhookPayload = {
      event: 'messages.upsert',
      instance: 'stella-test',
      data: makeTextMessageData(),
    };

    const reply = makeReply();
    await handleWhatsAppWebhook(makeRequest(payload), reply, deps);

    expect(reply.statusCode).toBe(429);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'whatsapp_rate_limit_exceeded',
      expect.objectContaining({ phone: '+5521999999999' }),
    );
  });

  it('returns 200 for connection.update event', async () => {
    const payload: EvolutionWebhookPayload = {
      event: 'connection.update',
      instance: 'stella-test',
      data: { state: 'open' } as any,
    };

    const reply = makeReply();
    await handleWhatsAppWebhook(makeRequest(payload), reply, deps);

    expect(reply.statusCode).toBe(200);
  });

  it('logs warn for connection.update with state != open (AC15)', async () => {
    const payload: EvolutionWebhookPayload = {
      event: 'connection.update',
      instance: 'stella-test',
      data: { state: 'close', statusReason: 408 } as any,
    };

    const reply = makeReply();
    await handleWhatsAppWebhook(makeRequest(payload), reply, deps);

    expect(reply.statusCode).toBe(200);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'whatsapp_connection_status',
      expect.objectContaining({ state: 'close' }),
    );
  });

  it('returns 503 when webhook secret not configured', async () => {
    const reply = makeReply();
    await handleWhatsAppWebhook(
      makeRequest({}),
      reply,
      { ...deps, webhookSecret: undefined },
    );

    expect(reply.statusCode).toBe(503);
  });

  it('stores event in webhook_events with source=evolution (AC10)', async () => {
    const msgData = makeTextMessageData();
    const payload: EvolutionWebhookPayload = {
      event: 'messages.upsert',
      instance: 'stella-test',
      data: msgData,
    };

    const reply = makeReply();
    await handleWhatsAppWebhook(makeRequest(payload), reply, deps);

    expect(insertWebhookEvent).toHaveBeenCalledWith({
      source: 'evolution',
      eventType: 'messages.upsert',
      payload: expect.objectContaining({ key: msgData.key }),
      sessionId: null,
      guestId: null,
    });
  });
});
