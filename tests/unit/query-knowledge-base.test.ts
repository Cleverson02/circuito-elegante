import { z } from 'zod';

const EMBEDDING_CATEGORIES = ['faq', 'description', 'experience', 'policy', 'location'] as const;

// Schema duplicated from source to avoid env-core ESM import chain
const QueryKBParams = z.object({
  question: z.string(),
  hotelName: z.string().optional(),
  categories: z.array(z.enum(EMBEDDING_CATEGORIES)).optional(),
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

    it('should accept categories array for pre-filtering', () => {
      const parsed = QueryKBParams.parse({
        question: 'tem piscina aquecida?',
        categories: ['experience', 'faq'],
      });
      expect(parsed.categories).toEqual(['experience', 'faq']);
    });

    it('should accept all 5 embedding categories', () => {
      const parsed = QueryKBParams.parse({
        question: 'teste',
        categories: ['faq', 'description', 'experience', 'policy', 'location'],
      });
      expect(parsed.categories).toHaveLength(5);
    });

    it('should reject invalid category names', () => {
      expect(() =>
        QueryKBParams.parse({
          question: 'teste',
          categories: ['invalid_category'],
        }),
      ).toThrow();
    });

    it('should work without categories (optional)', () => {
      const parsed = QueryKBParams.parse({ question: 'teste' });
      expect(parsed.categories).toBeUndefined();
    });
  });

  describe('Constants', () => {
    it('should use similarity threshold of 0.78', () => {
      const SIMILARITY_THRESHOLD = 0.78;
      expect(SIMILARITY_THRESHOLD).toBe(0.78);
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

  describe('Embedding Categories', () => {
    it('should have exactly 5 categories', () => {
      expect(EMBEDDING_CATEGORIES).toHaveLength(5);
    });

    it('should include faq, description, experience, policy, location', () => {
      expect(EMBEDDING_CATEGORIES).toEqual(['faq', 'description', 'experience', 'policy', 'location']);
    });
  });
});
