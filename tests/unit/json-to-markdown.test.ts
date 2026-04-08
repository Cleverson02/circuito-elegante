import {
  jsonToMarkdown,
  extractFaqChunks,
  type EmbeddingCategory,
} from '../../backend/src/vectordb/json-to-markdown';

describe('JSON-to-Markdown Adapter', () => {
  const hotelName = 'Hotel Teste';

  describe('jsonToMarkdown', () => {
    it('should convert identity category to description embedding', () => {
      const data = {
        identity: {
          description: 'Hotel de luxo na praia de Ipanema',
          lodging_type: 'Resort',
          website: 'https://example.com',
        },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs.length).toBe(1);
      expect(docs[0]!.category).toBe('description');
      expect(docs[0]!.taxonomyCategory).toBe('identity');
      expect(docs[0]!.markdown).toContain('Hotel Teste');
      expect(docs[0]!.markdown).toContain('Hotel de luxo na praia de Ipanema');
      expect(docs[0]!.markdown).toContain('Resort');
    });

    it('should convert gastronomy to experience embedding', () => {
      const data = {
        gastronomy: {
          restaurants: [
            { name: 'Gero', cuisine: 'Italiana', hours: '19h-23h' },
          ],
          room_service: 'Disponível 24h',
        },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs.length).toBe(1);
      expect(docs[0]!.category).toBe('experience');
      expect(docs[0]!.markdown).toContain('Gero');
      expect(docs[0]!.markdown).toContain('Italiana');
    });

    it('should convert policies to policy embedding', () => {
      const data = {
        policies: {
          check_in_time: '15:00',
          check_out_time: '12:00',
          cancellation_policy: 'Até 48h antes sem custo',
          pet_policy: { allows_pets: true, details: 'Aceita pets de pequeno porte' },
        },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs.length).toBe(1);
      expect(docs[0]!.category).toBe('policy');
      expect(docs[0]!.markdown).toContain('15:00');
      expect(docs[0]!.markdown).toContain('Aceita pets');
    });

    it('should convert transport to location embedding', () => {
      const data = {
        transport: {
          airport_distance: '25km do Galeão',
          transfer: 'Transfer privativo disponível',
          nearby_attractions: ['Cristo Redentor', 'Pão de Açúcar'],
        },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs.length).toBe(1);
      expect(docs[0]!.category).toBe('location');
      expect(docs[0]!.markdown).toContain('25km');
      expect(docs[0]!.markdown).toContain('Cristo Redentor');
    });

    it('should handle multiple taxonomy categories producing multiple documents', () => {
      const data = {
        identity: { description: 'Hotel boutique' },
        gastronomy: { restaurants: ['Restaurante A'] },
        policies: { check_in_time: '14:00' },
        transport: { airport_distance: '10km' },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs.length).toBe(4);

      const categories = docs.map((d) => d.category);
      expect(categories).toContain('description');
      expect(categories).toContain('experience');
      expect(categories).toContain('policy');
      expect(categories).toContain('location');
    });

    it('should skip metadata keys (prefixed with _)', () => {
      const data = {
        _enrichment_version: '2.0',
        _enriched_at: '2026-04-08',
        identity: { description: 'Hotel teste' },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs.length).toBe(1);
      expect(docs[0]!.taxonomyCategory).toBe('identity');
    });

    it('should skip empty categories', () => {
      const data = {
        identity: { description: 'Algo' },
        gastronomy: {},
        policies: { check_in_time: null },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs.length).toBe(1);
    });

    it('should format boolean values as Sim/Não', () => {
      const data = {
        infrastructure: { pool_heated: true, gym: false },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs[0]!.markdown).toContain('Sim');
      expect(docs[0]!.markdown).toContain('Não');
    });

    it('should format arrays of primitives as bullet list', () => {
      const data = {
        infrastructure: {
          leisure_items: ['Piscina', 'Sauna', 'Quadra de tênis'],
        },
      };

      const docs = jsonToMarkdown(hotelName, data);
      expect(docs[0]!.markdown).toContain('- Piscina');
      expect(docs[0]!.markdown).toContain('- Sauna');
    });

    it('should include hotel name prefix in each document', () => {
      const data = { identity: { description: 'teste' } };
      const docs = jsonToMarkdown('Fasano RJ', data);
      expect(docs[0]!.markdown).toContain('Hotel: Fasano RJ');
    });

    it('should return empty array for hotel with no taxonomy data', () => {
      const data = { _enrichment_version: '2.0', _enriched_at: '2026-04-08' };
      const docs = jsonToMarkdown(hotelName, data);
      expect(docs).toEqual([]);
    });
  });

  describe('extractFaqChunks', () => {
    it('should extract Q+A pairs as individual chunks', () => {
      const data = {
        concierge: {
          faq: [
            { question: 'O hotel tem spa?', answer: 'Sim, temos spa completo.' },
            { question: 'Aceita pets?', answer: 'Sim, pets de pequeno porte.' },
          ],
        },
      };

      const chunks = extractFaqChunks(hotelName, data);
      expect(chunks.length).toBe(2);
      expect(chunks[0]!.content).toContain('Pergunta: O hotel tem spa?');
      expect(chunks[0]!.content).toContain('Resposta: Sim, temos spa completo.');
      expect(chunks[0]!.fieldName).toBe('faq');
    });

    it('should extract Portuguese key format (pergunta/resposta)', () => {
      const data = {
        concierge: {
          faq: [{ pergunta: 'Tem piscina?', resposta: 'Sim.' }],
        },
      };

      const chunks = extractFaqChunks(hotelName, data);
      expect(chunks.length).toBe(1);
      expect(chunks[0]!.content).toContain('Pergunta: Tem piscina?');
    });

    it('should extract objections as FAQ-like chunks', () => {
      const data = {
        concierge: {
          faq: [],
          objections: [
            { objection: 'O preço é alto', response: 'Oferecemos experiências exclusivas.' },
          ],
        },
      };

      const chunks = extractFaqChunks(hotelName, data);
      expect(chunks.length).toBe(1);
      expect(chunks[0]!.content).toContain('Objeção comum');
      expect(chunks[0]!.fieldName).toBe('objections');
    });

    it('should handle string FAQ entries', () => {
      const data = {
        concierge: {
          faq: ['O hotel oferece transfer gratuito do aeroporto'],
        },
      };

      const chunks = extractFaqChunks(hotelName, data);
      expect(chunks.length).toBe(1);
      expect(chunks[0]!.content).toContain('transfer gratuito');
    });

    it('should return empty array when no concierge data', () => {
      const chunks = extractFaqChunks(hotelName, {});
      expect(chunks).toEqual([]);
    });

    it('should include hotel name in each chunk', () => {
      const data = {
        concierge: {
          faq: [{ question: 'Teste?', answer: 'Sim.' }],
        },
      };

      const chunks = extractFaqChunks('Fasano SP', data);
      expect(chunks[0]!.content).toContain('Hotel: Fasano SP');
    });
  });
});
