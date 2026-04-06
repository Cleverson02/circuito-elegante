/**
 * Evolution API — TypeScript types for WhatsApp integration.
 *
 * Story 4.1 — WhatsApp Business API — Recepcao de Mensagens
 * FR33 (Evolution API Gateway), FR34 (Read Receipts), FR35 (Presenca Online)
 *
 * These types mirror the Evolution API v2 REST contracts.
 * [Source: architecture.md#section-6.2]
 */

// ─── Message Types ─────────────────────────────────────────────

export type EvolutionMessageType = 'text' | 'audio' | 'image' | 'document' | 'sticker';

export type EvolutionPresenceStatus = 'available' | 'unavailable';

export type EvolutionConnectionStatus = 'open' | 'close' | 'connecting';

// ─── API Response ──────────────────────────────────────────────

export interface EvolutionResponse {
  status: string;
  message?: string;
  key?: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
}

// ─── Config ────────────────────────────────────────────────────

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

// ─── Parsed Message (normalised output) ────────────────────────

export interface ParsedMessage {
  type: 'text' | 'audio' | 'image';
  content: string;
  mediaUrl?: string;
  phone: string;
  messageId: string;
  timestamp: number;
  isReply: boolean;
  quotedMessageId?: string;
}

// ─── Webhook Payload (from Evolution API) ──────────────────────

export interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: EvolutionMessageData | EvolutionConnectionData;
}

export interface EvolutionMessageData {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  pushName?: string;
  message: EvolutionMessageContent;
  messageType: string;
  messageTimestamp: number;
}

export interface EvolutionMessageContent {
  conversation?: string;
  extendedTextMessage?: {
    text: string;
    contextInfo?: {
      stanzaId?: string;
      participant?: string;
      quotedMessage?: Record<string, unknown>;
    };
  };
  imageMessage?: {
    url: string;
    mimetype: string;
    caption?: string;
    jpegThumbnail?: string;
  };
  audioMessage?: {
    url: string;
    mimetype: string;
    seconds?: number;
    ptt?: boolean;
  };
  documentMessage?: {
    url: string;
    mimetype: string;
    title?: string;
    fileName?: string;
  };
  stickerMessage?: {
    url: string;
    mimetype: string;
  };
}

export interface EvolutionConnectionData {
  state: EvolutionConnectionStatus;
  statusReason?: number;
}

// ─── Redis Keys ────────────────────────────────────────────────

export const EVOLUTION_REDIS_KEYS = {
  messageDedup: (messageId: string) => `whatsapp:msg:${messageId}`,
  rateLimit: (phone: string) => `whatsapp:rate:${phone}`,
} as const;

export const EVOLUTION_REDIS_TTL = {
  messageDedup: 60 * 60,   // 1h — idempotency window
  rateLimit: 60,           // 1min — sliding window
} as const;
