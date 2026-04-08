/**
 * Caption Formatter — Premium WhatsApp caption for curated hotel options.
 * Story 4.4 — FR17 (Renderizacao Premium WhatsApp)
 *
 * Generates formatted captions with room type, BRL pricing, and amenity bullets.
 * [Source: PRD FR17 — "legenda formatada: nome suite, valor BRL, resumo bullets"]
 */

import type { CuratedOption } from './curadoria.js';
import { formatPriceBRL } from './curadoria.js';

const MAX_AMENITIES = 4;

// ─── i18n Labels (PT hardcoded, structure ready for future EN/ES) ───

interface CaptionLabels {
  perNight: string;
  total: string;
  nights: string;
  bradescoDiscount: string;
  photoUnavailable: string;
}

const LABELS_PT: CaptionLabels = {
  perNight: 'noite',
  total: 'total',
  nights: 'noites',
  bradescoDiscount: '💳 Desconto Bradesco aplicado',
  photoUnavailable: 'foto indisponível',
};

// Future: const LABELS_EN: CaptionLabels = { ... };
// Future: const LABELS_ES: CaptionLabels = { ... };

function getLabels(_language: string = 'pt'): CaptionLabels {
  // Ready for i18n — currently returns PT only
  return LABELS_PT;
}

/**
 * Format a curated option into a WhatsApp caption string.
 *
 * Template:
 * ```
 * *Suite Master Panoramica*
 *
 * R$ 625,00/noite
 * R$ 1.250,00 total (2 noites)
 * 💳 Desconto Bradesco aplicado  ← only if hasBradescoDiscount
 *
 * • Amenity 1
 * • Amenity 2
 * ```
 */
export function formatCaption(option: CuratedOption, language: string = 'pt'): string {
  const labels = getLabels(language);
  const lines: string[] = [];

  // Room type (WhatsApp bold)
  lines.push(`*${option.roomType}*`);
  lines.push('');

  // Pricing
  lines.push(`${formatPriceBRL(option.displayPricePerNight)}/${labels.perNight}`);
  lines.push(`${formatPriceBRL(option.displayPrice)} ${labels.total} (${option.nights} ${labels.nights})`);

  // Bradesco discount badge
  if (option.hasBradescoDiscount) {
    lines.push(labels.bradescoDiscount);
  }

  // Amenities (max 4 bullets)
  if (option.amenities && option.amenities.length > 0) {
    lines.push('');
    const amenities = option.amenities.slice(0, MAX_AMENITIES);
    for (const amenity of amenities) {
      lines.push(`• ${amenity}`);
    }
  }

  return lines.join('\n');
}
