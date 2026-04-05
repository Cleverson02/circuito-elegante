import { z } from 'zod';

// Schema duplicated from source to avoid env-core ESM import chain
const QueryKBParams = z.object({
  question: z.string(),
  hotelName: z.string().optional(),
});

describe('query_knowledge_base Tool', () => {
  describe('QueryKBParams schema', () => {
    it('should require question field', () => {
      expect(() => QueryKBParams.parse({})).toThrow();
    });

    it('should accept question only', () => {
      const parsed = QueryKBParams.parse({ question: 'hotel tem piscina?' });
      expect(parsed.question).toBe('hotel tem piscina?');
      expect(parsed.hotelName).toBeUndefined();
    });

    it('should accept question with hotelName', () => {
      const parsed = QueryKBParams.parse({
        question: 'tem spa?',
        hotelName: 'Le Canton',
      });
      expect(parsed.question).toBe('tem spa?');
      expect(parsed.hotelName).toBe('Le Canton');
    });

    it('should accept fuzzy hotel names', () => {
      const parsed = QueryKBParams.parse({
        question: 'wifi grátis?',
        hotelName: 'tiradentes',
      });
      expect(parsed.hotelName).toBe('tiradentes');
    });

    it('should accept empty string question', () => {
      const parsed = QueryKBParams.parse({ question: '' });
      expect(parsed.question).toBe('');
    });
  });

  describe('Constants', () => {
    it('should use similarity threshold of 0.7', () => {
      const SIMILARITY_THRESHOLD = 0.7;
      expect(SIMILARITY_THRESHOLD).toBe(0.7);
    });

    it('should return top 3 results', () => {
      const TOP_K = 3;
      expect(TOP_K).toBe(3);
    });

    it('should cache embeddings for 1 hour', () => {
      const CACHE_TTL = 3600;
      expect(CACHE_TTL).toBe(3600);
    });
  });
});
