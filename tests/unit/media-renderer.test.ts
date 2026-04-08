/**
 * Unit tests — Media Renderer & Caption Formatter
 *
 * Story 4.4 — Premium Rendering (FR17, FR22)
 * Tests: formatCaption, validatePhotoUrl, extractPrimaryPhoto, renderCuratedOptions
 */

import { formatCaption } from '../../backend/src/services/caption-formatter';
import {
  validatePhotoUrl,
  extractPrimaryPhoto,
  renderCuratedOptions,
} from '../../backend/src/services/media-renderer';
import type { CuratedOption } from '../../backend/src/services/curadoria';
import type { ElevarePhoto } from '../../backend/src/integrations/elevare/types';

// ─── Mocks ──────────────────────────────────────────────────────

jest.mock('../../backend/src/queue/chunking', () => ({
  calculateDelay: jest.fn().mockReturnValue(5000),
}));

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

// Import mocked logger for assertions
import { logger as mockLogger } from '../../backend/src/middleware/logging';

// ─── Test Data ──────────────────────────────────────────────────

function makePhoto(url: string, type: ElevarePhoto['type'] = 'room'): ElevarePhoto {
  return { url, type };
}

function makeOption(overrides: Partial<CuratedOption> = {}): CuratedOption {
  return {
    offerId: 'offer-1',
    roomType: 'Suite Master Panoramica',
    ratePlan: 'standard',
    totalPrice: 1250,
    displayPrice: 1250,
    originalPrice: 1250,
    hasBradescoDiscount: false,
    nights: 2,
    pricePerNight: 625,
    displayPricePerNight: 625,
    photos: [makePhoto('https://cdn.elevare.com/suite-master.jpg')],
    amenities: ['Teto panoramico com vista de mar', 'Banheira com hidrojet', 'Varanda privativa', 'Wi-Fi premium'],
    curatedRank: 1,
    priceBucket: 'mid' as CuratedOption['priceBucket'],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── formatCaption ──────────────────────────────────────────────

describe('formatCaption', () => {
  it('generates caption with roomType in WhatsApp bold', () => {
    const caption = formatCaption(makeOption());
    expect(caption).toContain('*Suite Master Panoramica*');
  });

  it('includes BRL-formatted pricing per night and total', () => {
    const caption = formatCaption(makeOption());
    expect(caption).toContain('R$ 625,00/noite');
    expect(caption).toContain('R$ 1.250,00 total (2 noites)');
  });

  it('shows Bradesco discount badge when applicable', () => {
    const option = makeOption({
      hasBradescoDiscount: true,
      displayPrice: 1125,
      displayPricePerNight: 562.5,
    });
    const caption = formatCaption(option);
    expect(caption).toContain('Desconto Bradesco aplicado');
  });

  it('does not show Bradesco badge when no discount', () => {
    const caption = formatCaption(makeOption({ hasBradescoDiscount: false }));
    expect(caption).not.toContain('Bradesco');
  });

  it('renders amenities as bullets (max 4)', () => {
    const caption = formatCaption(makeOption());
    expect(caption).toContain('• Teto panoramico com vista de mar');
    expect(caption).toContain('• Banheira com hidrojet');
    expect(caption).toContain('• Varanda privativa');
    expect(caption).toContain('• Wi-Fi premium');
  });

  it('truncates amenities at 4 even if more provided', () => {
    const option = makeOption({
      amenities: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    });
    const caption = formatCaption(option);
    expect(caption).toContain('• A4');
    expect(caption).not.toContain('• A5');
  });

  it('omits amenity section when amenities empty', () => {
    const option = makeOption({ amenities: [] });
    const caption = formatCaption(option);
    expect(caption).not.toContain('•');
  });

  it('formats complete caption matching expected template', () => {
    const caption = formatCaption(makeOption());
    const lines = caption.split('\n');
    expect(lines[0]).toBe('*Suite Master Panoramica*');
    expect(lines[1]).toBe('');
    expect(lines[2]).toContain('R$ 625,00/noite');
    expect(lines[3]).toContain('R$ 1.250,00 total');
  });
});

// ─── validatePhotoUrl ───────────────────────────────────────────

describe('validatePhotoUrl', () => {
  it('accepts valid https URLs', () => {
    expect(validatePhotoUrl('https://cdn.elevare.com/photo.jpg')).toBe(true);
  });

  it('accepts valid http URLs', () => {
    expect(validatePhotoUrl('http://cdn.elevare.com/photo.jpg')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validatePhotoUrl('')).toBe(false);
  });

  it('rejects undefined', () => {
    expect(validatePhotoUrl(undefined)).toBe(false);
  });

  it('rejects null', () => {
    expect(validatePhotoUrl(null)).toBe(false);
  });

  it('rejects non-http URLs', () => {
    expect(validatePhotoUrl('ftp://cdn.elevare.com/photo.jpg')).toBe(false);
    expect(validatePhotoUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(validatePhotoUrl('   ')).toBe(false);
  });
});

// ─── extractPrimaryPhoto ────────────────────────────────────────

describe('extractPrimaryPhoto', () => {
  it('returns first photo URL when valid', () => {
    const option = makeOption();
    expect(extractPrimaryPhoto(option)).toBe('https://cdn.elevare.com/suite-master.jpg');
  });

  it('returns null when photos array is empty', () => {
    const option = makeOption({ photos: [] });
    expect(extractPrimaryPhoto(option)).toBeNull();
  });

  it('returns null when first photo has invalid URL', () => {
    const option = makeOption({ photos: [makePhoto('invalid-url')] });
    expect(extractPrimaryPhoto(option)).toBeNull();
  });

  it('returns null when photos is undefined', () => {
    const option = makeOption({ photos: undefined as unknown as ElevarePhoto[] });
    expect(extractPrimaryPhoto(option)).toBeNull();
  });
});

// ─── renderCuratedOptions ───────────────────────────────────────

describe('renderCuratedOptions', () => {
  describe('WhatsApp channel', () => {
    it('generates image + caption pair per option', () => {
      const options = [makeOption()];
      const chunks = renderCuratedOptions(options, '+5521999', 's1', 'whatsapp');

      expect(chunks).toHaveLength(2);
      // First: image chunk
      expect(chunks[0]!.isMedia).toBe(true);
      expect(chunks[0]!.text).toBe('https://cdn.elevare.com/suite-master.jpg');
      expect(chunks[0]!.delay).toBe(0);
      // Second: caption chunk
      expect(chunks[1]!.isMedia).toBe(false);
      expect(chunks[1]!.text).toContain('*Suite Master Panoramica*');
    });

    it('generates 6 chunks for 3 options (2 per option)', () => {
      const options = [makeOption(), makeOption({ offerId: 'o2' }), makeOption({ offerId: 'o3' })];
      const chunks = renderCuratedOptions(options, '+5521999', 's1', 'whatsapp');
      expect(chunks).toHaveLength(6);
    });

    it('falls back to text when photo unavailable', () => {
      const option = makeOption({ photos: [] });
      const chunks = renderCuratedOptions([option], '+5521999', 's1', 'whatsapp');

      expect(chunks).toHaveLength(1);
      expect(chunks[0]!.isMedia).toBe(false);
      expect(chunks[0]!.text).toContain('Suite Master Panoramica');
      expect(chunks[0]!.text).toContain('R$');
    });

    it('falls back to text when photo URL is invalid', () => {
      const option = makeOption({ photos: [makePhoto('invalid')] });
      const chunks = renderCuratedOptions([option], '+5521999', 's1', 'whatsapp');

      expect(chunks).toHaveLength(1);
      expect(chunks[0]!.isMedia).toBe(false);
    });

    it('logs media_photo_unavailable on fallback', () => {
      const option = makeOption({ photos: [] });
      renderCuratedOptions([option], '+5521999', 's1', 'whatsapp');

      expect(mockLogger.warn).toHaveBeenCalledWith('media_photo_unavailable', expect.objectContaining({
        offerId: 'offer-1',
        sessionId: 's1',
      }));
    });
  });

  describe('website channel', () => {
    it('generates text-only chunks (no isMedia)', () => {
      const options = [makeOption()];
      const chunks = renderCuratedOptions(options, '+5521999', 's1', 'website');

      expect(chunks).toHaveLength(1);
      expect(chunks[0]!.isMedia).toBe(false);
      expect(chunks[0]!.text).toContain('*Suite Master Panoramica*');
    });

    it('generates 1 chunk per option (text only)', () => {
      const options = [makeOption(), makeOption({ offerId: 'o2' })];
      const chunks = renderCuratedOptions(options, '+5521999', 's1', 'website');
      expect(chunks).toHaveLength(2);
    });
  });

  describe('logging', () => {
    it('logs option_rendered for each option', () => {
      const options = [makeOption(), makeOption({ offerId: 'o2' })];
      renderCuratedOptions(options, '+5521999', 's1', 'whatsapp');

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('option_rendered', expect.objectContaining({
        event: 'option_rendered',
        sessionId: 's1',
        offerId: 'offer-1',
        hasPhoto: true,
        channel: 'whatsapp',
      }));
    });
  });
});
