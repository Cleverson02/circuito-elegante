import {
  extractPetFriendly,
  extractPoolHeated,
  extractBradescoCoupon,
  mapToTaxonomy,
} from '../../data/scripts/ingest-enrichment';

describe('Ingest Enrichment v2 — Boolean Extraction', () => {
  describe('extractPetFriendly', () => {
    it('should return true for direct boolean', () => {
      expect(extractPetFriendly({ pet_friendly: true })).toBe(true);
    });

    it('should return false for direct boolean', () => {
      expect(extractPetFriendly({ pet_friendly: false })).toBe(false);
    });

    it('should return false for "Não aceita pets"', () => {
      expect(extractPetFriendly({ pet_policy: 'Não aceita pets' })).toBe(false);
    });

    it('should return false for "Nao aceita pets"', () => {
      expect(extractPetFriendly({ pet_policy: 'Nao aceita pets' })).toBe(false);
    });

    it('should return true for "Aceita pets de pequeno porte com taxa de R$50"', () => {
      expect(extractPetFriendly({ pet_policy: 'Aceita pets de pequeno porte com taxa de R$50' })).toBe(true);
    });

    it('should return true for "pet-friendly hotel"', () => {
      expect(extractPetFriendly({ pet_policy: 'Hotel é pet-friendly' })).toBe(true);
    });

    it('should return true for object with accepts_pets: true', () => {
      expect(extractPetFriendly({ pet_policy: { accepts_pets: true, details: 'Até 10kg' } })).toBe(true);
    });

    it('should return false for object with accepts_pets: false', () => {
      expect(extractPetFriendly({ pet_policy: { accepts_pets: false, details: 'Não permitido' } })).toBe(false);
    });

    it('should return null for empty enrichment', () => {
      expect(extractPetFriendly({})).toBeNull();
    });

    it('should return null for ambiguous text', () => {
      expect(extractPetFriendly({ pet_policy: 'Consultar recepção' })).toBeNull();
    });
  });

  describe('extractPoolHeated', () => {
    it('should return true for direct boolean', () => {
      expect(extractPoolHeated({ pool_heated: true })).toBe(true);
    });

    it('should return false for direct boolean', () => {
      expect(extractPoolHeated({ pool_heated: false })).toBe(false);
    });

    it('should return true for "Piscina aquecida"', () => {
      expect(extractPoolHeated({ pool_description: 'Piscina aquecida com vista para a serra' })).toBe(true);
    });

    it('should return false for "não aquecida"', () => {
      expect(extractPoolHeated({ pool_description: 'Piscina não aquecida, natural' })).toBe(false);
    });

    it('should return null for no pool info', () => {
      expect(extractPoolHeated({})).toBeNull();
    });

    it('should return null for pool without heating mention', () => {
      expect(extractPoolHeated({ pool_description: 'Piscina de borda infinita no rooftop' })).toBeNull();
    });
  });

  describe('extractBradescoCoupon', () => {
    it('should return true from enrichment field', () => {
      expect(extractBradescoCoupon({ bradesco_coupon: true }, undefined)).toBe(true);
    });

    it('should return false from enrichment field', () => {
      expect(extractBradescoCoupon({ bradesco_coupon: false }, undefined)).toBe(false);
    });

    it('should return true from _meta field', () => {
      expect(extractBradescoCoupon({}, { bradesco_coupon: true })).toBe(true);
    });

    it('should return null when absent', () => {
      expect(extractBradescoCoupon({}, undefined)).toBeNull();
    });

    it('should prefer enrichment over meta', () => {
      expect(extractBradescoCoupon({ bradesco_coupon: false }, { bradesco_coupon: true })).toBe(false);
    });
  });
});

describe('Ingest Enrichment v2 — Taxonomy Mapping', () => {
  describe('mapToTaxonomy', () => {
    it('should map identity fields correctly', () => {
      const enrichment = {
        website_url: 'https://example.com',
        description: 'A beautiful hotel',
        lodging_type: 'Hotel de luxo',
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        identity: {
          website: 'https://example.com',
          description: 'A beautiful hotel',
          lodging_type: 'Hotel de luxo',
        },
      });
    });

    it('should map gastronomy fields correctly', () => {
      const enrichment = {
        restaurants: [{ name: 'Gero', cuisine: 'Italian' }],
        meals_included: 'Café da manhã',
        room_service: 'Disponível 24h',
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        gastronomy: {
          restaurants: [{ name: 'Gero', cuisine: 'Italian' }],
          meals_included: 'Café da manhã',
          room_service: 'Disponível 24h',
        },
      });
    });

    it('should map infrastructure fields correctly', () => {
      const enrichment = {
        parking: { has_parking: true, is_free: false },
        pool_description: 'Piscina aquecida',
        pool_heated: true,
        gym: 'Academia completa',
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        infrastructure: {
          parking: { has_parking: true, is_free: false },
          pool_description: 'Piscina aquecida',
          pool_heated: true,
          gym: 'Academia completa',
        },
      });
    });

    it('should handle alias fields (highlights → reputation.differentials)', () => {
      const enrichment = {
        highlights: ['Vista panorâmica', 'Spa exclusivo'],
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        reputation: {
          differentials: ['Vista panorâmica', 'Spa exclusivo'],
        },
      });
    });

    it('should handle alias fields (price_tier → reputation.price_range)', () => {
      const enrichment = { price_tier: '$$$' };
      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        reputation: { price_range: '$$$' },
      });
    });

    it('should skip null and undefined values', () => {
      const enrichment = {
        description: 'Test',
        website_url: null,
        lodging_type: undefined,
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        identity: {
          description: 'Test',
        },
      });
    });

    it('should skip empty strings', () => {
      const enrichment = {
        description: '',
        lodging_type: 'Hotel',
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        identity: { lodging_type: 'Hotel' },
      });
    });

    it('should skip _meta and hotel_name keys', () => {
      const enrichment = {
        hotel_name: 'Fasano',
        municipality: 'Rio de Janeiro',
        _meta: { status: 'P3' },
        description: 'Test',
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        identity: { description: 'Test' },
      });
    });

    it('should map multiple categories from a full enrichment', () => {
      const enrichment = {
        description: 'Hotel de luxo',
        lodging_type: '5 estrelas',
        restaurants: [{ name: 'Main' }],
        check_in_time: '15:00',
        check_out_time: '12:00',
        airport_distance: '15km',
        star_rating: 5,
        activities_tours: ['Surf', 'Yoga'],
        ce_page_url: 'https://ce.com/hotel',
      };

      const result = mapToTaxonomy(enrichment);

      expect(result['identity']).toBeDefined();
      expect(result['gastronomy']).toBeDefined();
      expect(result['policies']).toBeDefined();
      expect(result['transport']).toBeDefined();
      expect(result['reputation']).toBeDefined();
      expect(result['experiences']).toBeDefined();
      expect(result['integration']).toBeDefined();
    });

    it('should handle check_in_out object format', () => {
      const enrichment = {
        check_in_out: { check_in: '15:00', check_out: '12:00' },
      };

      const result = mapToTaxonomy(enrichment);
      expect(result).toEqual({
        policies: {
          check_in_out: { check_in: '15:00', check_out: '12:00' },
        },
      });
    });
  });
});
