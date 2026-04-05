import { slugify, parseXlsx, validateAndMap } from '../../data/scripts/ingest-hotels';
import type { ValidationResult } from '../../data/scripts/ingest-hotels';
import { join } from 'node:path';

const XLSX_PATH = join(__dirname, '..', '..', 'data', 'lista-hoteis-circuito-elegante.xlsx');

describe('Hotel Ingestion — Parsing & Mapping', () => {
  describe('slugify', () => {
    it('should convert name to slug', () => {
      expect(slugify('Pousada Alma Charme Atins')).toBe('pousada-alma-charme-atins');
    });

    it('should handle accented characters', () => {
      expect(slugify('Fasano - São Paulo')).toBe('fasano-sao-paulo');
    });

    it('should handle special characters', () => {
      expect(slugify('Hotel D\'Ozio & SPA')).toBe('hotel-d-ozio-spa');
    });

    it('should trim leading/trailing hyphens', () => {
      expect(slugify('  Hotel Test  ')).toBe('hotel-test');
    });
  });

  describe('parseXlsx', () => {
    let rows: ReturnType<typeof parseXlsx>;

    beforeAll(() => {
      rows = parseXlsx(XLSX_PATH);
    });

    it('should parse all 92 hotels', () => {
      expect(rows.length).toBe(92);
    });

    it('should have 32 hotels with API', () => {
      const withApi = rows.filter((r) => r.hasApi);
      expect(withApi.length).toBe(32);
    });

    it('should have 60 hotels without API', () => {
      const withoutApi = rows.filter((r) => !r.hasApi);
      expect(withoutApi.length).toBe(60);
    });

    it('should parse first hotel correctly', () => {
      const first = rows[0]!;
      expect(first.name).toBe('Pousada Alma Charme Atins');
      expect(first.municipality).toBe('Barreirinhas');
      expect(first.uf).toBe('MA');
      expect(first.hasApi).toBe(true);
      expect(first.bradescoCoupon).toBe(true);
      expect(first.elevareHotelId).toBe('21992');
      expect(first.region).toBe('nordeste');
      expect(first.experience).toBe('praia');
    });

    it('should parse non-API hotel correctly (section 2)', () => {
      // First hotel in section 2
      const nonApiHotel = rows.find((r) => r.name === 'Baia das Caraubas');
      expect(nonApiHotel).toBeDefined();
      expect(nonApiHotel!.hasApi).toBe(false);
      expect(nonApiHotel!.elevareHotelId).toBeNull();
    });

    it('should have elevare_hotel_id only for API hotels', () => {
      const apiHotels = rows.filter((r) => r.hasApi);
      const nonApiHotels = rows.filter((r) => !r.hasApi);

      for (const h of apiHotels) {
        expect(h.elevareHotelId).not.toBeNull();
      }
      for (const h of nonApiHotels) {
        expect(h.elevareHotelId).toBeNull();
      }
    });
  });

  describe('validateAndMap', () => {
    let result: ValidationResult;

    beforeAll(() => {
      const rows = parseXlsx(XLSX_PATH);
      result = validateAndMap(rows);
    });

    it('should validate all 92 hotels as valid', () => {
      expect(result.valid.length).toBe(92);
      expect(result.rejected.length).toBe(0);
    });

    it('should generate correct slugs', () => {
      const first = result.valid[0]!;
      expect(first.slug).toBe('pousada-alma-charme-atins');
    });

    it('should normalize region to lowercase', () => {
      for (const hotel of result.valid) {
        expect(hotel.region).toMatch(/^(nordeste|sudeste|sul|centro-oeste|norte)$/);
      }
    });

    it('should normalize experience to lowercase', () => {
      for (const hotel of result.valid) {
        expect(hotel.experience).toMatch(/^(praia|campo|serra|cidade)$/);
      }
    });

    it('should set pet_friendly and pool_heated to false', () => {
      for (const hotel of result.valid) {
        expect(hotel.pet_friendly).toBe(false);
        expect(hotel.pool_heated).toBe(false);
      }
    });

    it('should populate data JSONB with source', () => {
      for (const hotel of result.valid) {
        expect(hotel.data).toHaveProperty('source', 'xlsx-ingest');
        expect(hotel.data).toHaveProperty('ingestedAt');
      }
    });

    it('should map bradesco_coupon correctly', () => {
      const withCoupon = result.valid.filter((h) => h.bradesco_coupon);
      // Section 1: SIM count + Section 2: SIM count
      expect(withCoupon.length).toBeGreaterThan(0);
    });

    it('should reject rows with missing required fields', () => {
      const { rejected } = validateAndMap([
        {
          name: '',
          municipality: 'Test',
          uf: 'SP',
          hasApi: false,
          bradescoCoupon: false,
          elevareHotelId: null,
          region: 'sudeste',
          experience: 'praia',
          destination: 'Test',
        },
      ]);
      expect(rejected.length).toBe(1);
      expect(rejected[0]!.reasons).toContain('Missing required field: name');
    });

    it('should count 32 hotels with has_api=true', () => {
      const apiCount = result.valid.filter((h) => h.has_api).length;
      expect(apiCount).toBe(32);
    });
  });
});
