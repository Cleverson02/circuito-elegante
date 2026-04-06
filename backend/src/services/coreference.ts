/**
 * Coreference Resolver — hidden-state mapping between guest utterances and
 * technical offer identifiers.
 *
 * Story 3.5 — Mapeamento de Estado Oculto.
 *
 * The resolver implements the "implicit coreference" paradigm: guests refer
 * to room options by ordinal ("a segunda"), superlative ("a mais barata"),
 * relative position ("a do meio"), or by WhatsApp Reply to a specific image.
 * In all cases, technical IDs (offerId, roomId, ratePlanId, requestId) are
 * NEVER exposed to the guest — they exist only in internal Redis state.
 *
 * The OfferMap is stored in Redis under `offers:{sessionId}` with TTL
 * aligned to the session lifetime (24h).
 */

import { getRedisClient } from '../state/redis-client.js';
import { REDIS_KEYS, REDIS_TTL } from '../state/keys.js';
import { logger } from '../middleware/logging.js';
import { parseOrdinal, type SupportedLanguage, type OrdinalParseResult } from './ordinal-parser.js';

// ─── Types ──────────────────────────────────────────────────────

export interface OfferOption {
  /** 1-indexed position as presented to the guest (1, 2, 3, 4). */
  position: number;
  /** Technical Elevare offer identifier. NEVER exposed to guest. */
  offerId: string;
  /** Technical Elevare request identifier. NEVER exposed to guest. */
  requestId: string;
  /** Technical room identifier. NEVER exposed to guest. */
  roomId: string;
  /** Technical rate-plan identifier. NEVER exposed to guest. */
  ratePlanId: string;
  /** Display name of the hotel (safe to show). */
  hotelName: string;
  /** Display name of the room type (safe to show). */
  roomType: string;
  /** Total price for the stay. */
  totalPrice: number;
  /** ISO currency code (e.g. "BRL"). */
  currency: string;
  /** Optional photo URL. */
  photoUrl?: string;
  /** Optional WhatsApp message ID (populated post-render by Story 4.4). */
  whatsappMessageId?: string;
}

export interface OfferMap {
  sessionId: string;
  requestId: string;
  options: OfferOption[];
  createdAt: string;
  expiresAt: string;
}

export interface CoreferenceInput {
  text?: string;
  whatsappMessageId?: string;
  language?: SupportedLanguage;
}

export type CoreferenceResult =
  | { resolved: true; option: OfferOption }
  | {
      resolved: false;
      clarificationNeeded?: true;
      mapExpired?: true;
      message: string;
    };

// ─── Error Classes ──────────────────────────────────────────────

export class PositionOutOfRangeError extends Error {
  public readonly position: number;
  public readonly maxPosition: number;

  constructor(position: number, maxPosition: number) {
    super(
      `Position ${position} is out of range (valid: 1..${maxPosition})`,
    );
    this.name = 'PositionOutOfRangeError';
    this.position = position;
    this.maxPosition = maxPosition;
  }
}

export class MessageIdNotFoundError extends Error {
  public readonly whatsappMessageId: string;

  constructor(whatsappMessageId: string) {
    super('WhatsApp message id not found in offer map');
    this.name = 'MessageIdNotFoundError';
    this.whatsappMessageId = whatsappMessageId;
  }
}

export class OfferMapExpiredError extends Error {
  public readonly sessionId: string;

  constructor(sessionId: string) {
    super('Offer map has expired or was never created');
    this.name = 'OfferMapExpiredError';
    this.sessionId = sessionId;
  }
}

// ─── Clarification Messages (guest-facing, NO technical IDs) ────

const CLARIFICATION_MESSAGES: Record<SupportedLanguage, string> = {
  pt: 'Qual das opcoes apresentadas voce gostaria?',
  en: 'Which of the presented options would you like?',
  es: '¿Cual de las opciones presentadas le gustaria?',
};

const MAP_EXPIRED_MESSAGES: Record<SupportedLanguage, string> = {
  pt: 'As opcoes apresentadas anteriormente nao estao mais disponiveis. Gostaria que eu faca uma nova busca?',
  en: 'The previously presented options are no longer available. Would you like me to search again?',
  es: 'Las opciones presentadas anteriormente ya no estan disponibles. ¿Le gustaria que busque de nuevo?',
};

const POSITION_WORDS: Record<SupportedLanguage, string[]> = {
  pt: ['primeira', 'segunda', 'terceira', 'quarta'],
  en: ['first', 'second', 'third', 'fourth'],
  es: ['primera', 'segunda', 'tercera', 'cuarta'],
};

const CONJUNCTIONS: Record<SupportedLanguage, string> = {
  pt: ' ou ',
  en: ' or ',
  es: ' o ',
};

/**
 * Build a clarification message that lists positional options dynamically
 * based on how many are actually in the map. Never includes technical IDs.
 */
function buildClarificationMessage(
  language: SupportedLanguage,
  optionCount: number,
): string {
  const base = CLARIFICATION_MESSAGES[language];
  const words = POSITION_WORDS[language];
  const conjunction = CONJUNCTIONS[language];

  const effectiveCount = Math.max(0, Math.min(optionCount, words.length));
  if (effectiveCount === 0) {
    return base;
  }

  const takeWords = words.slice(0, effectiveCount);
  let positional: string;
  if (takeWords.length === 1) {
    positional = takeWords[0] ?? '';
  } else {
    const head = takeWords.slice(0, -1).join(', ');
    const tail = takeWords[takeWords.length - 1] ?? '';
    positional = `${head}${conjunction}${tail}`;
  }

  const article = language === 'en' ? 'The ' : 'A ';
  return `${base} ${article}${positional}?`;
}

// ─── Internal Resolvers ─────────────────────────────────────────

export function resolveByPosition(
  offerMap: OfferMap,
  position: number,
): OfferOption {
  if (
    !Number.isInteger(position) ||
    position < 1 ||
    position > offerMap.options.length
  ) {
    throw new PositionOutOfRangeError(position, offerMap.options.length);
  }
  const option = offerMap.options[position - 1];
  if (option === undefined) {
    throw new PositionOutOfRangeError(position, offerMap.options.length);
  }
  return option;
}

export function resolveByMessageId(
  offerMap: OfferMap,
  whatsappMessageId: string,
): OfferOption {
  const option = offerMap.options.find(
    (o) => o.whatsappMessageId === whatsappMessageId,
  );
  if (option === undefined) {
    throw new MessageIdNotFoundError(whatsappMessageId);
  }
  return option;
}

export function resolveBySuperlative(
  offerMap: OfferMap,
  criteria: 'cheapest' | 'most_expensive',
): OfferOption {
  if (offerMap.options.length === 0) {
    throw new PositionOutOfRangeError(1, 0);
  }
  // Stable sort — preserves original position order on price ties so that
  // "a mais barata" with two equal-lowest prices returns the earliest option.
  const indexed = offerMap.options.map((opt, idx) => ({ opt, idx }));
  indexed.sort((a, b) => {
    const priceDiff = a.opt.totalPrice - b.opt.totalPrice;
    if (priceDiff !== 0) return priceDiff;
    return a.idx - b.idx;
  });
  const winner =
    criteria === 'cheapest'
      ? indexed[0]
      : indexed[indexed.length - 1];
  if (winner === undefined) {
    throw new PositionOutOfRangeError(1, 0);
  }
  return winner.opt;
}

export function resolveByRelativePosition(
  offerMap: OfferMap,
  criteria: 'middle',
): OfferOption {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = criteria; // only 'middle' supported today; reserved for future.
  if (offerMap.options.length === 0) {
    throw new PositionOutOfRangeError(1, 0);
  }
  const mid = Math.ceil(offerMap.options.length / 2);
  return resolveByPosition(offerMap, mid);
}

// ─── OfferMap CRUD ──────────────────────────────────────────────

/**
 * Input shape accepted by `createOfferMap` — the subset of fields that come
 * from the curation pipeline (Story 3.4). `position` is assigned here.
 */
export type CuratedOption = Omit<OfferOption, 'position' | 'whatsappMessageId'> & {
  whatsappMessageId?: string;
};

/**
 * Persist a new OfferMap in Redis. Overwrites any existing map for the same
 * sessionId (invalidation semantics per AC10).
 */
export async function createOfferMap(
  sessionId: string,
  requestId: string,
  curatedOptions: CuratedOption[],
): Promise<OfferMap> {
  const redis = getRedisClient();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REDIS_TTL.session * 1000);

  const options: OfferOption[] = curatedOptions.map((opt, idx) => ({
    ...opt,
    position: idx + 1,
  }));

  const offerMap: OfferMap = {
    sessionId,
    requestId,
    options,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await redis.set(
    REDIS_KEYS.offers(sessionId),
    JSON.stringify(offerMap),
    'EX',
    REDIS_TTL.session,
  );

  logger.info('offer_map created', {
    sessionId,
    optionCount: options.length,
    ttlSeconds: REDIS_TTL.session,
  });

  return offerMap;
}

/**
 * Retrieve the OfferMap for a session, or null if not present/expired.
 */
export async function getOfferMap(sessionId: string): Promise<OfferMap | null> {
  const redis = getRedisClient();
  const data = await redis.get(REDIS_KEYS.offers(sessionId));
  if (!data) return null;
  try {
    return JSON.parse(data) as OfferMap;
  } catch (err) {
    logger.error('offer_map parse failed', {
      sessionId,
      error: err instanceof Error ? err.message : 'unknown',
    });
    return null;
  }
}

/**
 * Update the whatsappMessageId of specific options by position. Used by the
 * premium render pipeline (Story 4.4) after dispatching images through the
 * Evolution API and obtaining message IDs from the callback.
 */
export async function updateOfferMapMessageIds(
  sessionId: string,
  messageIdMap: Record<number, string>,
): Promise<OfferMap | null> {
  const offerMap = await getOfferMap(sessionId);
  if (!offerMap) {
    logger.warn('offer_map update failed — not found', { sessionId });
    return null;
  }

  const updatedOptions = offerMap.options.map((opt) => {
    const newId = messageIdMap[opt.position];
    if (newId !== undefined) {
      return { ...opt, whatsappMessageId: newId };
    }
    return opt;
  });

  const updated: OfferMap = { ...offerMap, options: updatedOptions };

  const redis = getRedisClient();
  await redis.set(
    REDIS_KEYS.offers(sessionId),
    JSON.stringify(updated),
    'EX',
    REDIS_TTL.session,
  );

  logger.info('offer_map message_ids updated', {
    sessionId,
    updatedPositions: Object.keys(messageIdMap).length,
  });

  return updated;
}

/**
 * Delete the OfferMap for a session (explicit cleanup).
 */
export async function deleteOfferMap(sessionId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(REDIS_KEYS.offers(sessionId));
  logger.info('offer_map deleted', { sessionId });
}

/**
 * Alias for deleteOfferMap — conceptually "invalidate" the current map so a
 * new search/curation can install a fresh one. Equivalent to deletion since
 * createOfferMap overwrites by key.
 */
export async function invalidateOfferMap(sessionId: string): Promise<void> {
  await deleteOfferMap(sessionId);
}

// ─── Main Entry Point ───────────────────────────────────────────

/**
 * Unified entry point for coreference resolution.
 *
 * Resolution order:
 *   1. If `whatsappMessageId` is present, attempt message-id resolution.
 *   2. If `text` is present, parse as ordinal/superlative/relative.
 *   3. If map has exactly 1 option and nothing else matched, auto-resolve.
 *   4. Otherwise, return clarificationNeeded with a language-appropriate
 *      message that lists positional labels only (never technical IDs).
 *
 * NEVER exposes offerId, roomId, ratePlanId, or requestId in returned
 * messages or logs (at info level).
 */
export async function resolveCoreference(
  sessionId: string,
  input: CoreferenceInput,
): Promise<CoreferenceResult> {
  const language: SupportedLanguage = input.language ?? 'pt';

  const offerMap = await getOfferMap(sessionId);
  if (!offerMap) {
    logger.info('coreference map_expired', { sessionId });
    return {
      resolved: false,
      mapExpired: true,
      message: MAP_EXPIRED_MESSAGES[language],
    };
  }

  // 1. WhatsApp Reply resolution
  if (input.whatsappMessageId !== undefined && input.whatsappMessageId.length > 0) {
    try {
      const option = resolveByMessageId(offerMap, input.whatsappMessageId);
      logger.info('coreference resolved', {
        sessionId,
        method: 'messageId',
        position: option.position,
      });
      return { resolved: true, option };
    } catch (err) {
      if (err instanceof MessageIdNotFoundError) {
        logger.debug('coreference messageId not found', {
          sessionId,
          whatsappMessageId: input.whatsappMessageId,
        });
        // Fall through to text-based resolution if text is also provided.
        if (input.text === undefined || input.text.trim().length === 0) {
          return {
            resolved: false,
            clarificationNeeded: true,
            message: buildClarificationMessage(
              language,
              offerMap.options.length,
            ),
          };
        }
      } else {
        throw err;
      }
    }
  }

  // 2. Text-based (ordinal / superlative / relative) resolution
  if (input.text !== undefined && input.text.trim().length > 0) {
    const parsed: OrdinalParseResult = parseOrdinal(input.text, input.language);

    if (parsed.type === 'position') {
      if (parsed.position > offerMap.options.length) {
        logger.info('coreference position out of range', {
          sessionId,
          position: parsed.position,
          maxPosition: offerMap.options.length,
        });
        throw new PositionOutOfRangeError(
          parsed.position,
          offerMap.options.length,
        );
      }
      const option = resolveByPosition(offerMap, parsed.position);
      logger.info('coreference resolved', {
        sessionId,
        method: 'position',
        position: option.position,
      });
      return { resolved: true, option };
    }

    if (parsed.type === 'superlative') {
      const option = resolveBySuperlative(offerMap, parsed.criteria);
      logger.info('coreference resolved', {
        sessionId,
        method: 'superlative',
        criteria: parsed.criteria,
        position: option.position,
      });
      return { resolved: true, option };
    }

    if (parsed.type === 'relative') {
      const option = resolveByRelativePosition(offerMap, parsed.criteria);
      logger.info('coreference resolved', {
        sessionId,
        method: 'relative',
        criteria: parsed.criteria,
        position: option.position,
      });
      return { resolved: true, option };
    }

    // parsed.type === 'none'
    if (offerMap.options.length === 1) {
      const only = offerMap.options[0];
      if (only !== undefined) {
        logger.info('coreference resolved', {
          sessionId,
          method: 'single-option',
          position: only.position,
        });
        return { resolved: true, option: only };
      }
    }

    logger.info('coreference clarification_needed', {
      sessionId,
      reason: 'text unparsed',
    });
    return {
      resolved: false,
      clarificationNeeded: true,
      message: buildClarificationMessage(language, offerMap.options.length),
    };
  }

  // 3. Neither text nor messageId provided — single-option auto-resolve
  if (offerMap.options.length === 1) {
    const only = offerMap.options[0];
    if (only !== undefined) {
      logger.info('coreference resolved', {
        sessionId,
        method: 'single-option',
        position: only.position,
      });
      return { resolved: true, option: only };
    }
  }

  logger.info('coreference clarification_needed', {
    sessionId,
    reason: 'no input',
  });
  return {
    resolved: false,
    clarificationNeeded: true,
    message: buildClarificationMessage(language, offerMap.options.length),
  };
}
