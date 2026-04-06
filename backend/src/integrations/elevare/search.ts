import type { Redis } from 'ioredis';
import type {
  ElevareSearchParams,
  ElevareMultiSearchParams,
  ElevareSearchResponse,
  ElevareMultiSearchResponse,
  StoredSearchResult,
  StoredMultiSearchResult,
} from './types.js';
import { ELEVARE_REDIS_KEYS, ELEVARE_REDIS_TTL } from './types.js';
import type { ElevareClient } from './client.js';

/**
 * Search via Elevare and store the full result (including photos) in Redis.
 *
 * The requestId is stored with a 30-minute TTL, separate from the default
 * session TTL (5 min). This longer TTL accommodates the full booking flow:
 * search → customer → quotation.
 */
export async function searchAndStore(
  client: ElevareClient,
  redis: Redis,
  params: ElevareSearchParams,
): Promise<ElevareSearchResponse> {
  const response = await client.search(params);

  const stored: StoredSearchResult = {
    requestId: response.requestId,
    results: response.results,
    storedAt: new Date().toISOString(),
  };

  await redis.set(
    ELEVARE_REDIS_KEYS.searchResult(response.requestId),
    JSON.stringify(stored),
    'EX',
    ELEVARE_REDIS_TTL.searchResult,
  );

  return response;
}

/**
 * Multi-search via Elevare and store grouped results in Redis.
 */
export async function multiSearchAndStore(
  client: ElevareClient,
  redis: Redis,
  params: ElevareMultiSearchParams,
): Promise<ElevareMultiSearchResponse> {
  const response = await client.multiSearch(params);

  const stored: StoredMultiSearchResult = {
    requestId: response.requestId,
    hotels: response.hotels,
    storedAt: new Date().toISOString(),
  };

  await redis.set(
    ELEVARE_REDIS_KEYS.searchResult(response.requestId),
    JSON.stringify(stored),
    'EX',
    ELEVARE_REDIS_TTL.searchResult,
  );

  return response;
}

/**
 * Retrieve a previously stored search result from Redis.
 * Returns null if the requestId has expired or was never stored.
 */
export async function getStoredSearchResult(
  redis: Redis,
  requestId: string,
): Promise<StoredSearchResult | StoredMultiSearchResult | null> {
  const data = await redis.get(ELEVARE_REDIS_KEYS.searchResult(requestId));
  if (!data) return null;
  return JSON.parse(data) as StoredSearchResult | StoredMultiSearchResult;
}
