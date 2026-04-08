import { z } from 'zod';
import { tool } from '@openai/agents';
import { eq, ilike, sql as sqlOp } from 'drizzle-orm';
import { getDatabase } from '../database/client.js';
import { hotels } from '../database/schema.js';

// --- Taxonomy categories (matching HOTEL-DATA-TAXONOMY.md) ---

const TAXONOMY_CATEGORIES = [
  'identity',
  'accommodations',
  'infrastructure',
  'gastronomy',
  'policies',
  'transport',
  'experiences',
  'reputation',
  'concierge',
  'integration',
] as const;

type TaxonomyCategory = typeof TAXONOMY_CATEGORIES[number];

// --- Parameters (AC7) ---

export const QueryHotelDetailsParams = z.object({
  hotelSlug: z.string().describe(
    'Hotel slug identifier (e.g., "fasano-rj", "botanique-hotel-experience"). Also accepts hotel name for fuzzy matching.',
  ),
  category: z.enum(TAXONOMY_CATEGORIES).nullable().describe(
    'Optional taxonomy category to filter results. If provided, returns only data from that category. ' +
    'If omitted, returns a summary of key fields from each category. ' +
    'Valid: identity, accommodations, infrastructure, gastronomy, policies, transport, experiences, reputation, concierge, integration',
  ),
});

export type QueryHotelDetailsParams = z.infer<typeof QueryHotelDetailsParams>;

export interface HotelDetailsResult {
  found: boolean;
  hotelName?: string;
  hotelSlug?: string;
  category?: string;
  details?: Record<string, unknown>;
  schemaFields?: Record<string, unknown>;
  suggestion?: string;
}

// --- Summary fields per category (when no category specified) ---

const CATEGORY_SUMMARY_KEYS: Record<TaxonomyCategory, string[]> = {
  identity:        ['description', 'lodging_type', 'website'],
  accommodations:  ['room_types', 'total_rooms'],
  infrastructure:  ['pool_description', 'wellness', 'gym', 'parking'],
  gastronomy:      ['restaurants', 'meals_included'],
  policies:        ['check_in_time', 'check_out_time', 'check_in_out', 'pet_policy', 'children_policy'],
  transport:       ['airport_distance', 'transfer'],
  experiences:     ['activities_tours', 'special_packages', 'concierge_service'],
  reputation:      ['differentials', 'star_rating', 'awards', 'price_range'],
  concierge:       ['faq', 'caution_points'],
  integration:     ['ce_page_url'],
};

// --- Hotel lookup (slug-first, then fuzzy by name) ---

function normalizeForMatch(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

interface HotelRow {
  id: string;
  name: string;
  slug: string;
  petFriendly: boolean;
  poolHeated: boolean;
  bradescoCoupon: boolean;
  data: Record<string, unknown>;
}

async function findHotel(hotelSlug: string): Promise<HotelRow | null> {
  const db = getDatabase();

  // 1. Exact slug match
  const bySlug = await db
    .select({
      id: hotels.id, name: hotels.name, slug: hotels.slug,
      petFriendly: hotels.petFriendly, poolHeated: hotels.poolHeated,
      bradescoCoupon: hotels.bradescoCoupon, data: hotels.data,
    })
    .from(hotels)
    .where(eq(hotels.slug, hotelSlug.toLowerCase()))
    .limit(1);

  if (bySlug.length > 0) return bySlug[0] as HotelRow;

  // 2. Fuzzy match by name (hotelSlug might be a name)
  const byName = await db
    .select({
      id: hotels.id, name: hotels.name, slug: hotels.slug,
      petFriendly: hotels.petFriendly, poolHeated: hotels.poolHeated,
      bradescoCoupon: hotels.bradescoCoupon, data: hotels.data,
    })
    .from(hotels)
    .where(ilike(hotels.name, `%${hotelSlug}%`))
    .limit(1);

  if (byName.length > 0) return byName[0] as HotelRow;

  // 3. Significant word match
  const normalized = normalizeForMatch(hotelSlug);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);

  for (const word of words) {
    const fuzzy = await db
      .select({
        id: hotels.id, name: hotels.name, slug: hotels.slug,
        petFriendly: hotels.petFriendly, poolHeated: hotels.poolHeated,
        bradescoCoupon: hotels.bradescoCoupon, data: hotels.data,
      })
      .from(hotels)
      .where(ilike(hotels.name, `%${word}%`))
      .limit(1);

    if (fuzzy.length > 0) return fuzzy[0] as HotelRow;
  }

  // 4. Trigram similarity fallback
  try {
    const trigramResult = await db.execute(
      sqlOp`SELECT id, name, slug, pet_friendly, pool_heated, bradesco_coupon, data,
                   similarity(name, ${hotelSlug}) AS sim
            FROM hotels
            WHERE similarity(name, ${hotelSlug}) > 0.15
            ORDER BY sim DESC
            LIMIT 1`,
    );

    if (trigramResult.length > 0) {
      const row = trigramResult[0] as Record<string, unknown>;
      return {
        id: row['id'] as string,
        name: row['name'] as string,
        slug: row['slug'] as string,
        petFriendly: row['pet_friendly'] as boolean,
        poolHeated: row['pool_heated'] as boolean,
        bradescoCoupon: row['bradesco_coupon'] as boolean,
        data: (row['data'] as Record<string, unknown>) ?? {},
      };
    }
  } catch {
    // pg_trgm not available
  }

  return null;
}

// --- Extract category data from JSONB ---

function extractCategory(
  data: Record<string, unknown>,
  category: TaxonomyCategory,
): Record<string, unknown> {
  // Structured taxonomy data (nested under category key)
  const categoryData = data[category];
  if (categoryData && typeof categoryData === 'object' && !Array.isArray(categoryData)) {
    return categoryData as Record<string, unknown>;
  }

  // Fallback: extract flat keys that belong to this category
  // (for data ingested before taxonomy restructuring)
  return {};
}

function extractSummary(data: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};

  for (const category of TAXONOMY_CATEGORIES) {
    const categoryData = extractCategory(data, category);
    if (Object.keys(categoryData).length === 0) continue;

    const summaryKeys = CATEGORY_SUMMARY_KEYS[category];
    const catSummary: Record<string, unknown> = {};

    for (const key of summaryKeys) {
      const value = categoryData[key];
      if (value !== null && value !== undefined) {
        catSummary[key] = value;
      }
    }

    if (Object.keys(catSummary).length > 0) {
      summary[category] = catSummary;
    }
  }

  // Include top-level flat fields as fallback (for non-restructured data)
  if (Object.keys(summary).length === 0) {
    const fallbackKeys = [
      'description', 'lodging_type', 'restaurants', 'check_in_time', 'check_out_time',
      'pet_policy', 'pool_description', 'airport_distance', 'differentials', 'star_rating',
    ];
    for (const key of fallbackKeys) {
      const value = data[key];
      if (value !== null && value !== undefined) {
        summary[key] = value;
      }
    }
  }

  return summary;
}

// --- Public API ---

export async function queryHotelDetails(
  params: QueryHotelDetailsParams,
): Promise<HotelDetailsResult> {
  const hotel = await findHotel(params.hotelSlug);

  if (!hotel) {
    return {
      found: false,
      suggestion: 'query_knowledge_base',
    };
  }

  const data = (hotel.data ?? {}) as Record<string, unknown>;

  const schemaFields = {
    petFriendly: hotel.petFriendly,
    poolHeated: hotel.poolHeated,
    bradescoCoupon: hotel.bradescoCoupon,
  };

  if (params.category) {
    const categoryData = extractCategory(data, params.category);
    return {
      found: true,
      hotelName: hotel.name,
      hotelSlug: hotel.slug,
      category: params.category,
      details: categoryData,
      schemaFields,
    };
  }

  const summary = extractSummary(data);
  return {
    found: true,
    hotelName: hotel.name,
    hotelSlug: hotel.slug,
    details: summary,
    schemaFields,
  };
}

// --- Tool Definition ---

export const queryHotelDetailsTool = tool({
  name: 'query_hotel_details',
  description:
    'Get detailed hotel information from enriched structured data. Data is organized into taxonomy categories: ' +
    'identity, accommodations, infrastructure, gastronomy, policies, transport, experiences, reputation, concierge, integration. ' +
    'Use hotelSlug for exact match or hotel name for fuzzy matching. ' +
    'Specify a category to get detailed data for that area, or omit for a general summary.',
  parameters: QueryHotelDetailsParams,
  execute: async (params) => {
    const result = await queryHotelDetails(params);
    if (!result.found) {
      return {
        found: false,
        suggestion: result.suggestion,
        message: `Hotel "${params.hotelSlug}" não encontrado. Tente query_knowledge_base para busca semântica.`,
      };
    }
    return {
      found: true,
      hotelName: result.hotelName,
      hotelSlug: result.hotelSlug,
      category: result.category ?? 'summary',
      details: result.details,
      schemaFields: result.schemaFields,
    };
  },
});
