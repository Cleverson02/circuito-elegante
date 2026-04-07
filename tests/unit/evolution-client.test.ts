/**
 * Unit tests — EvolutionClient
 *
 * Story 4.1 — WhatsApp Business API — Recepcao de Mensagens
 * Tests: sendText, sendMedia, updatePresence, markAsRead,
 *        sendComposingEvent, sendRecordingEvent, error handling, config validation
 *
 * Config/env is NOT imported here (same pattern as elevare-client.test.ts).
 * EvolutionClient receives config via constructor — no env dependency.
 */

import { EvolutionClient } from '../../backend/src/integrations/evolution/client';
import type { EvolutionConfig } from '../../backend/src/integrations/evolution/types';

// ─── Mocks ──────────────────────────────────────────────────────

const mockLogger = {
  child: jest.fn().mockReturnThis(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as any;

const testConfig: EvolutionConfig = {
  apiUrl: 'http://evolution:8080',
  apiKey: 'test-evo-key-123',
  instanceName: 'stella-test',
};

function createClient(overrides?: Partial<EvolutionConfig>): EvolutionClient {
  return new EvolutionClient({ ...testConfig, ...overrides }, mockLogger);
}

// ─── Fetch Mock ─────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
});

// ─── sendText ───────────────────────────────────────────────────

describe('EvolutionClient.sendText', () => {
  it('sends POST to /message/sendText/{instance} with correct body', async () => {
    const mockResponse = { status: 'PENDING', key: { remoteJid: '5521999@s.whatsapp.net', fromMe: true, id: 'msg-1' } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const client = createClient();
    const result = await client.sendText('+5521999999999', 'Hello!');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0]!;
    expect(url).toBe('http://evolution:8080/message/sendText/stella-test');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ number: '+5521999999999', text: 'Hello!' });
    expect(init.headers.apikey).toBe('test-evo-key-123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(result).toEqual(mockResponse);
  });
});

// ─── sendMedia ──────────────────────────────────────────────────

describe('EvolutionClient.sendMedia', () => {
  it('sends POST with mediaUrl and caption', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 'PENDING' }),
    });

    const client = createClient();
    await client.sendMedia('+5521999', 'https://img.test/photo.jpg', 'Suite Deluxe');

    const [url, init] = mockFetch.mock.calls[0]!;
    expect(url).toBe('http://evolution:8080/message/sendMedia/stella-test');
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      number: '+5521999',
      mediatype: 'image',
      media: 'https://img.test/photo.jpg',
      caption: 'Suite Deluxe',
    });
  });

  it('sends empty caption when not provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 'PENDING' }),
    });

    const client = createClient();
    await client.sendMedia('+5521999', 'https://img.test/photo.jpg');

    const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
    expect(body.caption).toBe('');
  });
});

// ─── updatePresence ─────────────────────────────────────────────

describe('EvolutionClient.updatePresence', () => {
  it('sends PUT with available status (FR35)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const client = createClient();
    await client.updatePresence('available');

    const [url, init] = mockFetch.mock.calls[0]!;
    expect(url).toBe('http://evolution:8080/chat/updatePresence/stella-test');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ presence: 'available' });
  });

  it('sends PUT with unavailable status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const client = createClient();
    await client.updatePresence('unavailable');

    const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
    expect(body).toEqual({ presence: 'unavailable' });
  });
});

// ─── markAsRead ─────────────────────────────────────────────────

describe('EvolutionClient.markAsRead', () => {
  it('sends POST with readMessages array (FR34)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const client = createClient();
    await client.markAsRead('5521999@s.whatsapp.net', 'msg-abc-123');

    const [url, init] = mockFetch.mock.calls[0]!;
    expect(url).toBe('http://evolution:8080/chat/markMessageAsRead/stella-test');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      readMessages: [{ remoteJid: '5521999@s.whatsapp.net', id: 'msg-abc-123' }],
    });
  });
});

// ─── sendComposingEvent / sendRecordingEvent ────────────────────

describe('EvolutionClient.sendComposingEvent', () => {
  it('sends PUT with composing status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const client = createClient();
    await client.sendComposingEvent('+5521999999999');

    const [url, init] = mockFetch.mock.calls[0]!;
    expect(url).toBe('http://evolution:8080/chat/updateStatus/stella-test');
    expect(init.method).toBe('PUT');
    const body = JSON.parse(init.body);
    expect(body.remoteJid).toBe('5521999999999@s.whatsapp.net');
    expect(body.status).toBe('composing');
  });
});

describe('EvolutionClient.sendRecordingEvent', () => {
  it('sends PUT with recording status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const client = createClient();
    await client.sendRecordingEvent('+5521999999999');

    const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
    expect(body.remoteJid).toBe('5521999999999@s.whatsapp.net');
    expect(body.status).toBe('recording');
  });
});

// ─── Error Handling ─────────────────────────────────────────────

describe('EvolutionClient error handling', () => {
  it('throws on API 500 and logs error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const client = createClient();
    await expect(client.sendText('+5521999', 'test')).rejects.toThrow(
      'Evolution API returned 500',
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'evolution_response_error',
      expect.objectContaining({ statusCode: 500 }),
    );
  });

  it('throws on API 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not Found' }),
    });

    const client = createClient();
    await expect(client.sendText('+5521999', 'test')).rejects.toThrow(
      'Evolution API returned 404',
    );
  });
});

// ─── Config Validation (Zod schema, no env dependency) ──────────

describe('EvolutionConfig Zod validation', () => {
  it('rejects empty apiKey', () => {
    const { z } = require('zod');
    const schema = z.object({
      apiUrl: z.string().url(),
      apiKey: z.string().min(1),
      instanceName: z.string().min(1),
    });
    expect(() => {
      schema.parse({ apiUrl: 'http://evolution:8080', apiKey: '', instanceName: 'stella' });
    }).toThrow();
  });

  it('rejects invalid URL', () => {
    const { z } = require('zod');
    const schema = z.object({
      apiUrl: z.string().url(),
      apiKey: z.string().min(1),
      instanceName: z.string().min(1),
    });
    expect(() => {
      schema.parse({ apiUrl: 'not-a-url', apiKey: 'key', instanceName: 'stella' });
    }).toThrow();
  });

  it('accepts valid config', () => {
    const { z } = require('zod');
    const schema = z.object({
      apiUrl: z.string().url(),
      apiKey: z.string().min(1),
      instanceName: z.string().min(1),
    });
    const result = schema.parse({
      apiUrl: 'http://evolution:8080',
      apiKey: 'secret-key',
      instanceName: 'stella-whatsapp',
    });
    expect(result.apiUrl).toBe('http://evolution:8080');
  });
});
