/**
 * Media Renderer — Premium rendering of curated hotel options for WhatsApp.
 * Story 4.4 — FR17 (Renderizacao Premium), FR22 (Renderizacao Transacional de Assets)
 *
 * Transforms CuratedOption[] into TypingChunk[] with image + caption pairs.
 * Uses EvolutionClient.sendMedia() via the typing queue worker (isMedia flag).
 *
 * [Source: architecture.md#section-6.2, #section-8.3]
 */

import type { CuratedOption } from './curadoria.js';
import type { TypingChunk } from '../queue/types.js';
import { calculateDelay } from '../queue/chunking.js';
import { formatCaption } from './caption-formatter.js';
import { formatPriceBRL } from './curadoria.js';
import { logger } from '../middleware/logging.js';

// ─── URL Validation (AC9, AC14) ────────────────────────────────

/**
 * Validate that a photo URL is usable for WhatsApp media sending.
 * Must be non-empty and start with http:// or https://.
 */
export function validatePhotoUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
}

// ─── Photo Extraction (AC3) ────────────────────────────────────

/**
 * Extract the primary photo URL from a CuratedOption.
 * Returns the first valid photo URL, or null if unavailable.
 */
export function extractPrimaryPhoto(option: CuratedOption): string | null {
  if (!option.photos || option.photos.length === 0) {
    return null;
  }
  const firstPhoto = option.photos[0];
  if (!firstPhoto || !validatePhotoUrl(firstPhoto.url)) {
    return null;
  }
  return firstPhoto.url;
}

// ─── Fallback Text (AC6) ───────────────────────────────────────

function buildFallbackText(option: CuratedOption): string {
  return `🏨 ${option.roomType} — ${formatPriceBRL(option.displayPrice)} total`;
}

// ─── Render Service (AC1, AC2, AC6, AC11, AC12) ────────────────

/**
 * Render curated hotel options into TypingChunks for delivery.
 *
 * - **WhatsApp:** Each option → [image chunk (isMedia=true), caption chunk]
 *   If photo unavailable → fallback text chunk
 * - **Website:** Each option → text-only chunk (widget renders images)
 */
export function renderCuratedOptions(
  options: CuratedOption[],
  phone: string,
  sessionId: string,
  channel: 'whatsapp' | 'website',
): TypingChunk[] {
  const chunks: TypingChunk[] = [];

  for (const option of options) {
    const photoUrl = extractPrimaryPhoto(option);
    const caption = formatCaption(option);

    if (channel === 'website') {
      // Website: text-only chunks (widget will render images via metadata)
      chunks.push({
        text: caption,
        delay: calculateDelay(caption),
        isMedia: false,
      });
    } else {
      // WhatsApp channel
      if (photoUrl) {
        // Image chunk: sent instantly by worker (isMedia=true, delay=0)
        chunks.push({
          text: photoUrl,
          delay: 0,
          isMedia: true,
        });
        // Caption chunk: sent with typing simulation
        chunks.push({
          text: caption,
          delay: calculateDelay(caption),
          isMedia: false,
        });
      } else {
        // Fallback: no photo available (AC6)
        const fallback = buildFallbackText(option);
        logger.warn('media_photo_unavailable', {
          sessionId,
          offerId: option.offerId,
          photoUrl: option.photos?.[0]?.url ?? null,
          roomType: option.roomType,
        });
        chunks.push({
          text: fallback,
          delay: calculateDelay(fallback),
          isMedia: false,
        });
      }
    }

    // Structured log for each rendered option (AC12)
    logger.info('option_rendered', {
      event: 'option_rendered',
      sessionId,
      offerId: option.offerId,
      hasPhoto: photoUrl !== null,
      photoUrl: photoUrl ?? null,
      captionLength: caption.length,
      channel,
    });
  }

  return chunks;
}
