/**
 * OrdinalParser — Multi-language deterministic parser for guest selection expressions.
 *
 * Story 3.5 — Correferencia. Supports Portuguese (PT), English (EN), and Spanish (ES).
 *
 * Three kinds of expressions are recognized:
 *   1. Position (ordinal): "primeira", "second", "3a", "fourth", "1st", ...
 *   2. Superlative (price-based): "mais barata", "most expensive", "priciest", ...
 *   3. Relative (position-based): "a do meio", "the middle one", "del medio", ...
 *
 * The parser is intentionally deterministic — no NLP/LLM is used. Patterns are
 * finite (4 positions * 3 languages + superlatives + relatives) and normalized
 * with accent-stripping and case-folding.
 */

// ─── Types ──────────────────────────────────────────────────────

export type OrdinalParseResult =
  | { type: 'position'; position: number }
  | { type: 'superlative'; criteria: 'cheapest' | 'most_expensive' }
  | { type: 'relative'; criteria: 'middle' }
  | { type: 'none' };

export type SupportedLanguage = 'pt' | 'en' | 'es';

// ─── Pattern Tables ─────────────────────────────────────────────

const PT_ORDINALS: Record<string, number> = {
  primeira: 1,
  primeiro: 1,
  '1a': 1,
  '1o': 1,
  '1ª': 1,
  '1º': 1,
  segunda: 2,
  segundo: 2,
  '2a': 2,
  '2o': 2,
  '2ª': 2,
  '2º': 2,
  terceira: 3,
  terceiro: 3,
  '3a': 3,
  '3o': 3,
  '3ª': 3,
  '3º': 3,
  quarta: 4,
  quarto: 4,
  '4a': 4,
  '4o': 4,
  '4ª': 4,
  '4º': 4,
};

const PT_SUPERLATIVES: Record<string, 'cheapest' | 'most_expensive'> = {
  'mais barata': 'cheapest',
  'mais barato': 'cheapest',
  'mais em conta': 'cheapest',
  'mais cara': 'most_expensive',
  'mais caro': 'most_expensive',
  'mais exclusiva': 'most_expensive',
  'mais exclusivo': 'most_expensive',
};

const EN_ORDINALS: Record<string, number> = {
  first: 1,
  '1st': 1,
  second: 2,
  '2nd': 2,
  third: 3,
  '3rd': 3,
  fourth: 4,
  '4th': 4,
};

const EN_SUPERLATIVES: Record<string, 'cheapest' | 'most_expensive'> = {
  cheapest: 'cheapest',
  'least expensive': 'cheapest',
  'most expensive': 'most_expensive',
  priciest: 'most_expensive',
};

const ES_ORDINALS: Record<string, number> = {
  primera: 1,
  primero: 1,
  '1a': 1,
  '1o': 1,
  '1ª': 1,
  '1º': 1,
  segunda: 2,
  segundo: 2,
  '2a': 2,
  '2o': 2,
  '2ª': 2,
  '2º': 2,
  tercera: 3,
  tercero: 3,
  '3a': 3,
  '3o': 3,
  '3ª': 3,
  '3º': 3,
  cuarta: 4,
  cuarto: 4,
  '4a': 4,
  '4o': 4,
  '4ª': 4,
  '4º': 4,
};

const ES_SUPERLATIVES: Record<string, 'cheapest' | 'most_expensive'> = {
  'mas barata': 'cheapest',
  'mas barato': 'cheapest',
  'mas economica': 'cheapest',
  'mas economico': 'cheapest',
  'mas cara': 'most_expensive',
  'mas caro': 'most_expensive',
};

const RELATIVE_PATTERNS: Record<string, 'middle'> = {
  'do meio': 'middle',
  'the middle': 'middle',
  'middle one': 'middle',
  'del medio': 'middle',
  'la del medio': 'middle',
  'el del medio': 'middle',
};

interface LanguagePack {
  ordinals: Record<string, number>;
  superlatives: Record<string, 'cheapest' | 'most_expensive'>;
}

const LANGUAGE_PACKS: Record<SupportedLanguage, LanguagePack> = {
  pt: { ordinals: PT_ORDINALS, superlatives: PT_SUPERLATIVES },
  en: { ordinals: EN_ORDINALS, superlatives: EN_SUPERLATIVES },
  es: { ordinals: ES_ORDINALS, superlatives: ES_SUPERLATIVES },
};

// ─── Normalization ──────────────────────────────────────────────

/**
 * Normalize text for matching: lowercase, trim, strip accents.
 *
 * Uses NFD decomposition followed by removal of combining marks so that
 * "primeira" ≡ "Primeira", and PT "mais" shares no ambiguity with ES "mas".
 * We do NOT collapse "mais" → "mas"; instead, pattern tables keep both
 * spellings so language-scoped matching remains accurate.
 */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Check if the normalized input contains a key from the table as a whole
 * token (word-boundary aware). Returns the matched key with the longest
 * length (most specific) or undefined.
 */
function findLongestMatch<T>(
  normalizedInput: string,
  table: Record<string, T>,
): { key: string; value: T } | undefined {
  const paddedInput = ` ${normalizedInput} `;
  let bestKey: string | undefined;
  let bestLength = 0;

  for (const key of Object.keys(table)) {
    const normalizedKey = normalize(key);
    const paddedKey = ` ${normalizedKey} `;
    if (paddedInput.includes(paddedKey) && normalizedKey.length > bestLength) {
      bestKey = key;
      bestLength = normalizedKey.length;
    }
  }

  if (bestKey === undefined) {
    return undefined;
  }
  const value = table[bestKey];
  if (value === undefined) {
    return undefined;
  }
  return { key: bestKey, value };
}

// ─── Parser ─────────────────────────────────────────────────────

/**
 * Parse a guest utterance into an ordinal/superlative/relative selection.
 *
 * Matching strategy (per language, in order):
 *   1. Superlatives (longest specific phrases like "least expensive")
 *   2. Relative positions ("a do meio" / "the middle one")
 *   3. Ordinals ("primeira" / "1st" / "segunda")
 *
 * When `language` is omitted, all three languages are tried in sequence
 * (PT → EN → ES) and the FIRST conclusive match wins. Since max 4 positions
 * are supported and patterns do not collide meaningfully across languages,
 * ambiguity is not a concern in practice.
 */
export function parseOrdinal(
  text: string,
  language?: SupportedLanguage,
): OrdinalParseResult {
  if (typeof text !== 'string') {
    return { type: 'none' };
  }

  const normalized = normalize(text);
  if (normalized.length === 0) {
    return { type: 'none' };
  }

  const languagesToTry: SupportedLanguage[] =
    language !== undefined ? [language] : ['pt', 'en', 'es'];

  // Relative patterns are global (language-agnostic) — try them alongside each lang
  const relativeMatch = findLongestMatch(normalized, RELATIVE_PATTERNS);

  // Strategy: superlatives first (most specific), then relative, then ordinal.
  // But across languages, we must still prefer the LONGEST overall match to
  // avoid e.g. matching ES "segundo" when PT "mais barata" is present.
  type Candidate = {
    result: OrdinalParseResult;
    length: number;
    priority: number; // superlative=3, relative=2, position=1
  };

  const candidates: Candidate[] = [];

  for (const lang of languagesToTry) {
    const pack = LANGUAGE_PACKS[lang];

    const sup = findLongestMatch(normalized, pack.superlatives);
    if (sup !== undefined) {
      candidates.push({
        result: { type: 'superlative', criteria: sup.value },
        length: normalize(sup.key).length,
        priority: 3,
      });
    }

    const ord = findLongestMatch(normalized, pack.ordinals);
    if (ord !== undefined) {
      candidates.push({
        result: { type: 'position', position: ord.value },
        length: normalize(ord.key).length,
        priority: 1,
      });
    }
  }

  if (relativeMatch !== undefined) {
    candidates.push({
      result: { type: 'relative', criteria: relativeMatch.value },
      length: normalize(relativeMatch.key).length,
      priority: 2,
    });
  }

  if (candidates.length === 0) {
    return { type: 'none' };
  }

  // Pick the candidate with the highest priority; break ties by longest match.
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return b.length - a.length;
  });

  const winner = candidates[0];
  // Defensive fallback — candidates.length > 0 already checked, but TS needs this.
  if (winner === undefined) {
    return { type: 'none' };
  }
  return winner.result;
}
