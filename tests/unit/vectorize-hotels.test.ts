import { chunkByHeadings, hashContent } from '../../backend/src/vectordb/chunker';
import { jsonToMarkdown, extractFaqChunks } from '../../backend/src/vectordb/json-to-markdown';

describe('Vectorize Hotels Pipeline', () => {
  describe('processHotel (integration of adapter + chunker)', () => {
    const hotel = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Fasano RJ',
      slug: 'fasano-rj',
      data: {
        _enrichment_version: '2.0',
        _enriched_at: '2026-04-08',
        identity: {
          description: 'Hotel de luxo na praia de Ipanema, com vista para o mar.',
          lodging_type: 'Hotel 5 estrelas',
          website: 'https://fasano.com.br',
        },
        gastronomy: {
          restaurants: [
            { name: 'Gero', cuisine: 'Italiana', hours: '19h-23h' },
            { name: 'Fasano Al Mare', cuisine: 'Frutos do Mar', hours: '12h-22h' },
          ],
          room_service: 'Disponível 24h',
        },
        policies: {
          check_in_time: '15:00',
          check_out_time: '12:00',
          cancellation_policy: 'Cancelamento gratuito até 48h antes',
          pet_policy: { allows_pets: false, details: 'Não aceita animais de estimação' },
        },
        transport: {
          airport_distance: '25km do Aeroporto Tom Jobim',
          transfer: 'Transfer privativo sob consulta',
        },
        concierge: {
          faq: [
            { question: 'O hotel tem spa?', answer: 'Sim, Fasano Spa com tratamentos exclusivos.' },
            { question: 'Aceita pets?', answer: 'Não aceitamos animais de estimação.' },
          ],
          objections: [
            { objection: 'O preço é muito alto', response: 'Oferecemos a melhor experiência de luxo do Rio.' },
          ],
        },
      },
    };

    it('should produce chunks for all taxonomy categories', () => {
      const docs = jsonToMarkdown(hotel.name, hotel.data);
      const categories = new Set(docs.map((d) => d.category));
      expect(categories.has('description')).toBe(true);
      expect(categories.has('experience')).toBe(true);
      expect(categories.has('policy')).toBe(true);
      expect(categories.has('location')).toBe(true);
    });

    it('should produce FAQ chunks from concierge data', () => {
      const faqChunks = extractFaqChunks(hotel.name, hotel.data);
      expect(faqChunks.length).toBe(3); // 2 FAQs + 1 objection
      expect(faqChunks[0]!.fieldName).toBe('faq');
      expect(faqChunks[2]!.fieldName).toBe('objections');
    });

    it('should generate unique content hashes for different chunks', () => {
      const docs = jsonToMarkdown(hotel.name, hotel.data);
      const allChunks = docs.flatMap((doc) => chunkByHeadings(doc.markdown, hotel.name));
      const hashes = allChunks.map((c) => c.contentHash);
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });

    it('should produce same hashes on re-run (idempotency)', () => {
      const docs1 = jsonToMarkdown(hotel.name, hotel.data);
      const docs2 = jsonToMarkdown(hotel.name, hotel.data);

      const chunks1 = docs1.flatMap((doc) => chunkByHeadings(doc.markdown, hotel.name));
      const chunks2 = docs2.flatMap((doc) => chunkByHeadings(doc.markdown, hotel.name));

      expect(chunks1.length).toBe(chunks2.length);
      for (let i = 0; i < chunks1.length; i++) {
        expect(chunks1[i]!.contentHash).toBe(chunks2[i]!.contentHash);
      }
    });

    it('should handle hotel with minimal data (only identity)', () => {
      const minimalHotel = {
        ...hotel,
        data: {
          _enrichment_version: '2.0',
          identity: { description: 'Hotel simples' },
        },
      };

      const docs = jsonToMarkdown(minimalHotel.name, minimalHotel.data);
      expect(docs.length).toBe(1);
      expect(docs[0]!.category).toBe('description');
    });

    it('should handle hotel with many null fields gracefully', () => {
      const sparseHotel = {
        ...hotel,
        data: {
          _enrichment_version: '2.0',
          identity: {
            description: 'Tem descrição',
            lodging_type: null,
            website: null,
          },
          gastronomy: {
            restaurants: null,
            room_service: null,
          },
        },
      };

      const docs = jsonToMarkdown(sparseHotel.name, sparseHotel.data);
      expect(docs.length).toBe(1); // Only identity has non-null data
      expect(docs[0]!.markdown).toContain('Tem descrição');
    });

    it('should handle special PT-BR characters correctly', () => {
      const ptHotel = {
        ...hotel,
        data: {
          identity: {
            description: 'Hotel com piscina aquecida, café da manhã incluído, área de lazer para crianças',
          },
        },
      };

      const docs = jsonToMarkdown(ptHotel.name, ptHotel.data);
      expect(docs[0]!.markdown).toContain('aquecida');
      expect(docs[0]!.markdown).toContain('café');
      expect(docs[0]!.markdown).toContain('crianças');
    });
  });

  describe('Content Hashing', () => {
    it('should generate consistent SHA-256 hashes', () => {
      const content = 'Hotel: Fasano RJ | Categoria: Identidade';
      const hash1 = hashContent(content);
      const hash2 = hashContent(content);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate different hashes for different content', () => {
      const hash1 = hashContent('Content A');
      const hash2 = hashContent('Content B');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Logical-Unit Chunking', () => {
    it('should not split a single restaurant entry across chunks', () => {
      const markdown = `Hotel: Teste | Categoria: Gastronomia

## Restaurants
**Name:** Gero
**Cuisine:** Italiana
**Hours:** 19h-23h

## Room Service
**Room Service:** Disponível 24h`;

      const chunks = chunkByHeadings(markdown, 'Teste');
      const geroChunk = chunks.find((c) => c.content.includes('Gero'));
      expect(geroChunk).toBeDefined();
      expect(geroChunk!.content).toContain('Italiana');
      expect(geroChunk!.content).toContain('19h-23h');
    });

    it('should split by headings into logical units', () => {
      const markdown = `## Check-in
15:00

## Cancelamento
Até 48h antes sem custo

## Pets
Não aceita animais`;

      const chunks = chunkByHeadings(markdown);
      expect(chunks.length).toBe(3);
    });
  });
});
