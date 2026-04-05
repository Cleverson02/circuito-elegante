import { parseOrdinal } from '../../backend/src/services/ordinal-parser';

describe('parseOrdinal', () => {
  describe('Portuguese (PT) — ordinals', () => {
    it('parses "primeira" as position 1', () => {
      expect(parseOrdinal('primeira')).toEqual({ type: 'position', position: 1 });
    });

    it('parses "segundo" as position 2', () => {
      expect(parseOrdinal('segundo')).toEqual({ type: 'position', position: 2 });
    });

    it('parses "3a opcao" (embedded) as position 3', () => {
      expect(parseOrdinal('3a opcao')).toEqual({ type: 'position', position: 3 });
    });

    it('parses "quarta" as position 4', () => {
      expect(parseOrdinal('quarta')).toEqual({ type: 'position', position: 4 });
    });

    it('parses "quero a segunda opcao por favor" (embedded) as position 2', () => {
      expect(parseOrdinal('quero a segunda opcao por favor')).toEqual({
        type: 'position',
        position: 2,
      });
    });
  });

  describe('English (EN) — ordinals', () => {
    it('parses "first" as position 1', () => {
      expect(parseOrdinal('first')).toEqual({ type: 'position', position: 1 });
    });

    it('parses "2nd" as position 2', () => {
      expect(parseOrdinal('2nd')).toEqual({ type: 'position', position: 2 });
    });

    it('parses "third" as position 3', () => {
      expect(parseOrdinal('third')).toEqual({ type: 'position', position: 3 });
    });

    it('parses "4th" as position 4', () => {
      expect(parseOrdinal('4th')).toEqual({ type: 'position', position: 4 });
    });

    it('parses "I want the first one" (embedded) as position 1', () => {
      expect(parseOrdinal('I want the first one')).toEqual({
        type: 'position',
        position: 1,
      });
    });
  });

  describe('Spanish (ES) — ordinals', () => {
    it('parses "primera" as position 1', () => {
      expect(parseOrdinal('primera')).toEqual({ type: 'position', position: 1 });
    });

    it('parses "tercera" as position 3', () => {
      expect(parseOrdinal('tercera')).toEqual({ type: 'position', position: 3 });
    });

    it('parses "cuarta" as position 4', () => {
      expect(parseOrdinal('cuarta')).toEqual({ type: 'position', position: 4 });
    });

    it('parses "quiero la tercera" (embedded) as position 3', () => {
      expect(parseOrdinal('quiero la tercera')).toEqual({
        type: 'position',
        position: 3,
      });
    });
  });

  describe('Superlatives', () => {
    it('parses PT "mais barata" as cheapest', () => {
      expect(parseOrdinal('mais barata')).toEqual({
        type: 'superlative',
        criteria: 'cheapest',
      });
    });

    it('parses PT "a mais em conta" as cheapest', () => {
      expect(parseOrdinal('a mais em conta')).toEqual({
        type: 'superlative',
        criteria: 'cheapest',
      });
    });

    it('parses PT "mais cara" as most_expensive', () => {
      expect(parseOrdinal('mais cara')).toEqual({
        type: 'superlative',
        criteria: 'most_expensive',
      });
    });

    it('parses EN "cheapest" as cheapest', () => {
      expect(parseOrdinal('cheapest')).toEqual({
        type: 'superlative',
        criteria: 'cheapest',
      });
    });

    it('parses EN "most expensive" as most_expensive', () => {
      expect(parseOrdinal('most expensive')).toEqual({
        type: 'superlative',
        criteria: 'most_expensive',
      });
    });

    it('parses EN "priciest" as most_expensive', () => {
      expect(parseOrdinal('priciest')).toEqual({
        type: 'superlative',
        criteria: 'most_expensive',
      });
    });

    it('parses ES "mas cara" as most_expensive', () => {
      expect(parseOrdinal('mas cara')).toEqual({
        type: 'superlative',
        criteria: 'most_expensive',
      });
    });

    it('parses ES "mas economica" as cheapest', () => {
      expect(parseOrdinal('mas economica')).toEqual({
        type: 'superlative',
        criteria: 'cheapest',
      });
    });
  });

  describe('Relative positions', () => {
    it('parses PT "a do meio" as middle', () => {
      expect(parseOrdinal('a do meio')).toEqual({
        type: 'relative',
        criteria: 'middle',
      });
    });

    it('parses EN "the middle one" as middle', () => {
      expect(parseOrdinal('the middle one')).toEqual({
        type: 'relative',
        criteria: 'middle',
      });
    });

    it('parses ES "del medio" as middle', () => {
      expect(parseOrdinal('del medio')).toEqual({
        type: 'relative',
        criteria: 'middle',
      });
    });

    it('parses ES "la del medio" as middle', () => {
      expect(parseOrdinal('la del medio')).toEqual({
        type: 'relative',
        criteria: 'middle',
      });
    });
  });

  describe('Normalization & edge cases', () => {
    it('normalizes case (uppercase)', () => {
      expect(parseOrdinal('SEGUNDA')).toEqual({ type: 'position', position: 2 });
    });

    it('normalizes whitespace (leading/trailing)', () => {
      expect(parseOrdinal('  terceira  ')).toEqual({
        type: 'position',
        position: 3,
      });
    });

    it('strips accents from PT text', () => {
      expect(parseOrdinal('opção')).toEqual({ type: 'none' });
      // accent stripping does not alter positional matching
      expect(parseOrdinal('a terceira')).toEqual({
        type: 'position',
        position: 3,
      });
    });

    it('returns none for unrelated text', () => {
      expect(parseOrdinal('bom dia')).toEqual({ type: 'none' });
    });

    it('returns none for empty string', () => {
      expect(parseOrdinal('')).toEqual({ type: 'none' });
    });

    it('returns none for whitespace-only string', () => {
      expect(parseOrdinal('   ')).toEqual({ type: 'none' });
    });

    it('returns none for non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(parseOrdinal(null as any)).toEqual({ type: 'none' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(parseOrdinal(undefined as any)).toEqual({ type: 'none' });
    });

    it('prefers superlative over contained ordinal when both match', () => {
      // "mais barata" (cheapest) is 11 chars — wins over any 6-char ordinal
      expect(parseOrdinal('a mais barata')).toEqual({
        type: 'superlative',
        criteria: 'cheapest',
      });
    });

    it('prefers longest superlative match (least expensive vs cheapest)', () => {
      expect(parseOrdinal('the least expensive one')).toEqual({
        type: 'superlative',
        criteria: 'cheapest',
      });
    });
  });

  describe('Language-scoped parsing', () => {
    it('with language="pt" only checks PT patterns (EN ordinal still matches if text is ambiguous)', () => {
      // "primeira" is PT — always matches in PT scope
      expect(parseOrdinal('primeira', 'pt')).toEqual({
        type: 'position',
        position: 1,
      });
    });

    it('with language="pt", EN-specific "first" should NOT match', () => {
      expect(parseOrdinal('the first one', 'pt')).toEqual({ type: 'none' });
    });

    it('with language="en", PT-specific "primeira" should NOT match', () => {
      expect(parseOrdinal('a primeira', 'en')).toEqual({ type: 'none' });
    });

    it('with language="es", ES ordinals match', () => {
      expect(parseOrdinal('la cuarta', 'es')).toEqual({
        type: 'position',
        position: 4,
      });
    });

    it('auto-detect (no language param) finds EN ordinals', () => {
      expect(parseOrdinal('the fourth')).toEqual({
        type: 'position',
        position: 4,
      });
    });

    it('auto-detect finds ES superlatives', () => {
      expect(parseOrdinal('la mas cara')).toEqual({
        type: 'superlative',
        criteria: 'most_expensive',
      });
    });
  });
});
