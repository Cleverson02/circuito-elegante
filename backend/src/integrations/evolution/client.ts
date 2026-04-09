/**
 * Evolution API Client — HTTP wrapper for WhatsApp operations.
 *
 * Story 4.1 — WhatsApp Business API — Recepcao de Mensagens
 * FR33 (Evolution API Gateway), FR34 (Read Receipts), FR35 (Presenca Online)
 *
 * Follows the same structural pattern as ElevareClient but without circuit
 * breaker / retry (Evolution API runs locally in Docker — failures are infra
 * issues, not transient API errors). Can be added later if needed.
 *
 * [Source: architecture.md#section-6.2 — Evolution API endpoints]
 */

import type { Logger } from 'winston';
import type { EvolutionConfig, EvolutionResponse } from './types.js';

export class EvolutionClient {
  private readonly config: EvolutionConfig;
  private readonly logger: Logger;

  constructor(config: EvolutionConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ module: 'evolution' });
  }

  // ─── Public API ──────────────────────────────────────────────

  /**
   * Send a text message via WhatsApp.
   * POST /message/sendText/{instance}
   */
  async sendText(phone: string, text: string): Promise<EvolutionResponse> {
    return this.request<EvolutionResponse>(
      `/message/sendText/${this.config.instanceName}`,
      'POST',
      { number: phone, text },
    );
  }

  /**
   * Send media (image/audio/document) via WhatsApp.
   * POST /message/sendMedia/{instance}
   */
  async sendMedia(
    phone: string,
    mediaUrl: string,
    caption?: string,
  ): Promise<EvolutionResponse> {
    return this.request<EvolutionResponse>(
      `/message/sendMedia/${this.config.instanceName}`,
      'POST',
      { number: phone, mediatype: 'image', media: mediaUrl, caption: caption ?? '' },
    );
  }

  /**
   * Update WhatsApp presence status (FR35 — Dynamic Online Presence).
   * PUT /chat/updatePresence/{instance}
   *
   * 'available' = Online, 'unavailable' = Offline.
   * Stella defaults to offline and only goes online during active processing.
   */
  async updatePresence(status: 'available' | 'unavailable'): Promise<void> {
    await this.request(
      `/chat/updatePresence/${this.config.instanceName}`,
      'PUT',
      { presence: status },
    );
  }

  /**
   * Mark a message as read (FR34 — Intelligent Read Receipts).
   * POST /chat/markMessageAsRead/{instance}
   *
   * IMPORTANT: Must be called AFTER the 20s buffer (Story 4.2), NOT on receipt.
   * Use the `markAsReadDeferred` convenience wrapper for correct lifecycle.
   */
  async markAsRead(remoteJid: string, messageId: string): Promise<void> {
    await this.request(
      `/chat/markMessageAsRead/${this.config.instanceName}`,
      'POST',
      { readMessages: [{ remoteJid, id: messageId }] },
    );
  }

  /**
   * Send "typing..." composing event to WhatsApp.
   * PUT /chat/updateStatus/{instance}
   */
  async sendComposingEvent(phone: string): Promise<void> {
    await this.request(
      `/chat/updateStatus/${this.config.instanceName}`,
      'PUT',
      { remoteJid: `${phone.replace('+', '')}@s.whatsapp.net`, status: 'composing' },
    );
  }

  /**
   * Send a template message via WhatsApp (FR37 — Story 4.9).
   * POST /message/sendTemplate/{instance}
   *
   * If Evolution API returns error 470 (template not approved by Meta),
   * returns a skipped response instead of throwing (AC5).
   */
  async sendTemplate(
    phone: string,
    templateName: string,
    language: string,
    parameters: Array<{ type: 'text'; text: string }>,
  ): Promise<import('./types.js').EvolutionResponse> {
    const payload = {
      number: phone,
      template: {
        name: templateName,
        language: { code: language },
        components: [{
          type: 'body',
          parameters,
        }],
      },
    };

    try {
      return await this.request<import('./types.js').EvolutionResponse>(
        `/message/sendTemplate/${this.config.instanceName}`,
        'POST',
        payload,
      );
    } catch (error) {
      // AC5: Handle template not approved (470) gracefully
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('470') || errMsg.includes('template')) {
        this.logger.warn('template_not_approved', {
          event: 'template_not_approved',
          templateName,
          phone,
          error: errMsg,
        });
        return { status: 'skipped', message: 'template_not_approved' };
      }
      throw error;
    }
  }

  /**
   * Send "recording..." event to WhatsApp.
   * PUT /chat/updateStatus/{instance}
   */
  async sendRecordingEvent(phone: string): Promise<void> {
    await this.request(
      `/chat/updateStatus/${this.config.instanceName}`,
      'PUT',
      { remoteJid: `${phone.replace('+', '')}@s.whatsapp.net`, status: 'recording' },
    );
  }

  // ─── Internal HTTP ───────────────────────────────────────────

  private async request<T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const startMs = Date.now();

    this.logger.info('evolution_request', {
      method,
      endpoint,
    });

    const headers: Record<string, string> = {
      'apikey': this.config.apiKey,
      'Content-Type': 'application/json',
    };

    const init: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(10_000), // 10s timeout
    };

    if (body !== undefined && method !== 'GET') {
      init.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, init);
      const durationMs = Date.now() - startMs;

      if (!response.ok) {
        let responseBody: unknown = null;
        try {
          responseBody = await response.json();
        } catch {
          // may not be JSON
        }

        this.logger.error('evolution_response_error', {
          endpoint,
          statusCode: response.status,
          durationMs,
          body: responseBody,
        });

        throw new Error(
          `Evolution API returned ${response.status} for ${method} ${endpoint}`,
        );
      }

      const data = (await response.json()) as T;

      this.logger.info('evolution_response', {
        endpoint,
        statusCode: response.status,
        durationMs,
      });

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        const durationMs = Date.now() - startMs;
        this.logger.error('evolution_timeout', {
          endpoint,
          timeoutMs: 10_000,
          durationMs,
        });
      }
      throw error;
    }
  }
}
