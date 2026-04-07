/**
 * WhatsApp Webhook — Types and message parser for Evolution API events.
 *
 * Story 4.1 — WhatsApp Business API — Recepcao de Mensagens
 *
 * Normalises any Evolution API message payload into a flat `ParsedMessage`
 * that downstream consumers (buffer, pipeline, coreference) can use without
 * knowing the raw Evolution API structure.
 *
 * [Source: architecture.md#section-6.2 — Webhook payload structure]
 */

import type {
  EvolutionWebhookPayload,
  EvolutionMessageData,
  EvolutionConnectionData,
  ParsedMessage,
} from '../integrations/evolution/types.js';

// ─── Supported Webhook Events ──────────────────────────────────

export const WHATSAPP_EVENT_TYPES = [
  'messages.upsert',
  'messages.update',
  'connection.update',
] as const;

export type WhatsAppEventType = typeof WHATSAPP_EVENT_TYPES[number];

// ─── Type Guards ───────────────────────────────────────────────

export function isMessageEvent(
  payload: EvolutionWebhookPayload,
): payload is EvolutionWebhookPayload & { data: EvolutionMessageData } {
  return payload.event === 'messages.upsert' && 'key' in payload.data;
}

export function isConnectionEvent(
  payload: EvolutionWebhookPayload,
): payload is EvolutionWebhookPayload & { data: EvolutionConnectionData } {
  return payload.event === 'connection.update' && 'state' in payload.data;
}

// ─── Phone Number Extraction ───────────────────────────────────

/**
 * Extract E.164 phone number from WhatsApp remoteJid.
 *
 * Input:  '5521999999999@s.whatsapp.net'
 * Output: '+5521999999999'
 *
 * Returns null if format is invalid (group chats, status broadcasts).
 */
export function extractPhoneFromJid(remoteJid: string): string | null {
  const match = remoteJid.match(/^(\d+)@s\.whatsapp\.net$/);
  if (!match?.[1]) return null;
  return `+${match[1]}`;
}

// ─── Message Parser ────────────────────────────────────────────

/**
 * Parse an Evolution API message payload into a normalised `ParsedMessage`.
 *
 * Supports three primary types: text, audio, image.
 * Document and sticker are logged as unsupported and return null.
 *
 * AC6: Parse de mensagens suporta 3 tipos primarios.
 */
export function parseEvolutionMessage(
  data: EvolutionMessageData,
): ParsedMessage | null {
  const phone = extractPhoneFromJid(data.key.remoteJid);
  if (!phone) return null;

  // Skip messages sent by us (fromMe)
  if (data.key.fromMe) return null;

  const messageId = data.key.id;
  const timestamp = data.messageTimestamp;
  const msg = data.message;

  // Check for reply context (extendedTextMessage with contextInfo)
  const contextInfo = msg.extendedTextMessage?.contextInfo;
  const isReply = contextInfo?.stanzaId != null;
  const quotedMessageId = contextInfo?.stanzaId;

  // ─── Text message (conversation or extendedTextMessage) ────
  if (msg.conversation != null) {
    return {
      type: 'text',
      content: msg.conversation,
      phone,
      messageId,
      timestamp,
      isReply: false,
      quotedMessageId: undefined,
    };
  }

  if (msg.extendedTextMessage?.text != null) {
    return {
      type: 'text',
      content: msg.extendedTextMessage.text,
      phone,
      messageId,
      timestamp,
      isReply,
      quotedMessageId,
    };
  }

  // ─── Image message ─────────────────────────────────────────
  if (msg.imageMessage != null) {
    return {
      type: 'image',
      content: msg.imageMessage.caption ?? '',
      mediaUrl: msg.imageMessage.url,
      phone,
      messageId,
      timestamp,
      isReply,
      quotedMessageId,
    };
  }

  // ─── Audio message ─────────────────────────────────────────
  if (msg.audioMessage != null) {
    return {
      type: 'audio',
      content: '', // Audio content requires transcription (future story)
      mediaUrl: msg.audioMessage.url,
      phone,
      messageId,
      timestamp,
      isReply,
      quotedMessageId,
    };
  }

  // ─── Unsupported types (document, sticker) ─────────────────
  // Defined in type union but not processed in this story (AC6).
  return null;
}
