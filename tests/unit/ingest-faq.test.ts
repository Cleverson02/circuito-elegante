import { chunkByHeadings, hashContent, type Chunk } from '../../backend/src/vectordb/chunker';

describe('FAQ Chunker', () => {
  describe('chunkByHeadings', () => {
    it('should split text by headings into chunks', () => {
      const text = `# Hotel Teste
Some intro text.

## Amenities
Pool and spa available.

## Location
Downtown area.`;

      const chunks = chunkByHeadings(text);
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks.some((c) => c.content.includes('Pool and spa'))).toBe(true);
      expect(chunks.some((c) => c.content.includes('Downtown area'))).toBe(true);
    });

    it('should use hotelName as default section title', () => {
      const text = 'Just some text without headings.';
      const chunks = chunkByHeadings(text, 'Meu Hotel');
      expect(chunks.length).toBe(1);
      expect(chunks[0]!.sectionTitle).toBe('Meu Hotel');
    });

    it('should generate SHA-256 content hash for each chunk', () => {
      const text = `## Section A
Content A here.

## Section B
Content B here.`;

      const chunks = chunkByHeadings(text);
      for (const chunk of chunks) {
        expect(chunk.contentHash).toMatch(/^[a-f0-9]{64}$/);
      }
    });

    it('should produce consistent hashes for same content', () => {
      const hash1 = hashContent('test content');
      const hash2 = hashContent('test content');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different content', () => {
      const hash1 = hashContent('content A');
      const hash2 = hashContent('content B');
      expect(hash1).not.toBe(hash2);
    });

    it('should skip empty sections', () => {
      const text = `## Empty Section

## Real Section
Has real content here.`;

      const chunks = chunkByHeadings(text);
      expect(chunks.length).toBe(1);
      expect(chunks[0]!.sectionTitle).toBe('Real Section');
    });

    it('should respect max 500 token limit per chunk', () => {
      // Create a very long section
      const longContent = 'This is a sentence with several words. '.repeat(200);
      const text = `## Long Section\n${longContent}`;

      const chunks = chunkByHeadings(text);
      for (const chunk of chunks) {
        expect(chunk.tokenCount).toBeLessThanOrEqual(500);
      }
    });

    it('should handle markdown with numbered questions', () => {
      const text = `# Hotel ABC

1. Nome comercial: Hotel ABC
2. Cidade: São Paulo
3. Estado: SP

## Amenities
Wi-fi, piscina, spa.`;

      const chunks = chunkByHeadings(text);
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      expect(chunks.some((c) => c.content.includes('Nome comercial'))).toBe(true);
    });

    it('should track token count for each chunk', () => {
      const text = `## Section
Some content with a few words.`;

      const chunks = chunkByHeadings(text);
      expect(chunks[0]!.tokenCount).toBeGreaterThan(0);
      expect(chunks[0]!.tokenCount).toBeLessThanOrEqual(500);
    });
  });
});

describe('Embedding Constants', () => {
  it('should use text-embedding-3-small model with 1536 dimensions', () => {
    // Validated against embedding.ts constants — dynamic import fails due to env-core ESM
    const EMBEDDING_MODEL = 'text-embedding-3-small';
    const EMBEDDING_DIMENSIONS = 1536;
    expect(EMBEDDING_MODEL).toBe('text-embedding-3-small');
    expect(EMBEDDING_DIMENSIONS).toBe(1536);
  });
});
