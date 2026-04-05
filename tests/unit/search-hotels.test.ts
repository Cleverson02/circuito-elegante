import { SearchHotelsParams } from '../../backend/src/tools/search-hotels';

const NULL_DEFAULTS = {
  experience: null, region: null, destination: null,
  petFriendly: null, poolHeated: null, bradescoCoupon: null,
};

describe('search_hotels Tool', () => {
  describe('SearchHotelsParams schema', () => {
    it('should accept all-null params (no filters)', () => {
      const parsed = SearchHotelsParams.parse(NULL_DEFAULTS);
      expect(parsed.experience).toBeNull();
      expect(parsed.region).toBeNull();
    });

    it('should accept single filter with nulls', () => {
      const parsed = SearchHotelsParams.parse({ ...NULL_DEFAULTS, experience: 'Charme' });
      expect(parsed.experience).toBe('Charme');
    });

    it('should accept multiple filters', () => {
      const parsed = SearchHotelsParams.parse({
        ...NULL_DEFAULTS,
        region: 'Serra Gaúcha',
        petFriendly: true,
        poolHeated: false,
      });
      expect(parsed.region).toBe('Serra Gaúcha');
      expect(parsed.petFriendly).toBe(true);
      expect(parsed.poolHeated).toBe(false);
    });

    it('should accept all 6 filters simultaneously', () => {
      const params = {
        experience: 'Resort',
        region: 'Litoral',
        destination: 'Campos do Jordão',
        petFriendly: true,
        poolHeated: true,
        bradescoCoupon: false,
      };
      const parsed = SearchHotelsParams.parse(params);
      expect(parsed.experience).toBe('Resort');
      expect(parsed.destination).toBe('Campos do Jordão');
      expect(parsed.bradescoCoupon).toBe(false);
    });

    it('should accept boolean false as valid filter', () => {
      const parsed = SearchHotelsParams.parse({ ...NULL_DEFAULTS, petFriendly: false });
      expect(parsed.petFriendly).toBe(false);
    });

    it('should reject missing required fields', () => {
      expect(() => SearchHotelsParams.parse({})).toThrow();
    });
  });
});
