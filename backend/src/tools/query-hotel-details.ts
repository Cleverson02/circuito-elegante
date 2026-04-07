import { z } from 'zod';
import { tool } from '@openai/agents';
import { ilike, sql as sqlOp } from 'drizzle-orm';
import { getDatabase } from '../database/client.js';
import { hotels } from '../database/schema.js';

export const QueryHotelDetailsParams = z.object({
  hotelName: z.string().describe('Hotel name (supports fuzzy matching: "rituali" finds "Rituaali Spa")'),
  fields: z.array(z.string()).nullable().describe('Specific fields from hotel data to return (e.g., ["room_types", "parking", "check_in_out"]). If null, returns a summary of the most relevant fields.'),
});

export type QueryHotelDetailsParams = z.infer<typeof QueryHotelDetailsParams>;

export interface HotelDetailsResult {
  found: boolean;
  hotelName?: string;
  hotelSlug?: string;
  details?: Record<string, unknown>;
  suggestion?: string;
}

const SUMMARY_FIELDS = [
  'description',
  'lodging_type',
  'website_url',
  'room_types',
  'total_rooms',
  'parking',
  'pool_description',
  'wellness',
  'restaurants',
  'check_in_out',
  'cancellation_policy',
  'pet_policy',
  'children_policy',
  'airport_distance',
];

function normalizeForMatch(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

async function fuzzyFindHotel(
  hotelName: string,
): Promise<{ id: string; name: string; slug: string; data: Record<string, unknown> } | null> {
  const db = getDatabase();

  // 1. Exact match
  const exact = await db
    .select({ id: hotels.id, name: hotels.name, slug: hotels.slug, data: hotels.data })
    .from(hotels)
    .where(ilike(hotels.name, hotelName))
    .limit(1);

  if (exact.length > 0) return exact[0] as { id: string; name: string; slug: string; data: Record<string, unknown> };

  // 2. ILIKE with significant words
  const normalized = normalizeForMatch(hotelName);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);

  for (const word of words) {
    const fuzzy = await db
      .select({ id: hotels.id, name: hotels.name, slug: hotels.slug, data: hotels.data })
      .from(hotels)
      .where(ilike(hotels.name, `%${word}%`))
      .limit(1);

    if (fuzzy.length > 0) return fuzzy[0] as { id: string; name: string; slug: string; data: Record<string, unknown> };
  }

  // 3. Trigram similarity (pg_trgm) as last resort
  try {
    const trigramResult = await db.execute(
      sqlOp`SELECT id, name, slug, data, similarity(name, ${hotelName}) AS sim
            FROM hotels
            WHERE similarity(name, ${hotelName}) > 0.15
            ORDER BY sim DESC
            LIMIT 1`,
    );

    if (trigramResult.length > 0) {
      const row = trigramResult[0] as Record<string, unknown>;
      return {
        id: row['id'] as string,
        name: row['name'] as string,
        slug: row['slug'] as string,
        data: (row['data'] as Record<string, unknown>) ?? {},
      };
    }
  } catch {
    // pg_trgm not available — skip
  }

  return null;
}

function extractFields(
  data: Record<string, unknown>,
  fields: string[] | null,
): Record<string, unknown> {
  const targetFields = fields ?? SUMMARY_FIELDS;
  const result: Record<string, unknown> = {};

  for (const field of targetFields) {
    result[field] = data[field] ?? null;
  }

  return result;
}

export async function queryHotelDetails(
  params: QueryHotelDetailsParams,
): Promise<HotelDetailsResult> {
  const hotel = await fuzzyFindHotel(params.hotelName);

  if (!hotel) {
    return {
      found: false,
      suggestion: 'query_knowledge_base',
    };
  }

  const data = (hotel.data ?? {}) as Record<string, unknown>;
  const details = extractFields(data, params.fields);

  return {
    found: true,
    hotelName: hotel.name,
    hotelSlug: hotel.slug,
    details,
  };
}

export const queryHotelDetailsTool = tool({
  name: 'query_hotel_details',
  description:
    'Get detailed hotel information from enriched data: room types, amenities, policies, restaurants, wellness, parking, etc. Use when the guest asks about a SPECIFIC hotel\'s features. Supports fuzzy name matching.',
  parameters: QueryHotelDetailsParams,
  execute: async (params) => {
    const result = await queryHotelDetails(params);
    if (!result.found) {
      return {
        found: false,
        suggestion: result.suggestion,
        message: `Hotel "${params.hotelName}" não encontrado. Tente query_knowledge_base para busca semântica.`,
      };
    }
    return {
      found: true,
      hotelName: result.hotelName,
      hotelSlug: result.hotelSlug,
      details: result.details,
    };
  },
});
