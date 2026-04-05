import { z } from 'zod';
import { tool } from '@openai/agents';
import { eq, and, type SQL } from 'drizzle-orm';
import { getDatabase } from '../database/client.js';
import { hotels } from '../database/schema.js';

export const SearchHotelsParams = z.object({
  experience: z.string().nullable().describe('Hotel experience type (e.g., "Charme", "Resort", "Spa")'),
  region: z.string().nullable().describe('Geographic region (e.g., "Serra Gaúcha", "Litoral")'),
  destination: z.string().nullable().describe('Destination name (e.g., "Campos do Jordão")'),
  petFriendly: z.boolean().nullable().describe('Whether the hotel accepts pets'),
  poolHeated: z.boolean().nullable().describe('Whether the hotel has a heated pool'),
  bradescoCoupon: z.boolean().nullable().describe('Whether the hotel accepts Bradesco coupons'),
});

export type SearchHotelsParams = z.infer<typeof SearchHotelsParams>;

export interface HotelResult {
  id: string;
  name: string;
  slug: string;
  region: string;
  experience: string;
  destination: string;
  municipality: string;
  uf: string;
  petFriendly: boolean;
  poolHeated: boolean;
  bradescoCoupon: boolean;
}

export async function searchHotels(params: SearchHotelsParams): Promise<HotelResult[]> {
  const db = getDatabase();
  const conditions: SQL[] = [];

  if (params.experience) {
    conditions.push(eq(hotels.experience, params.experience));
  }
  if (params.region) {
    conditions.push(eq(hotels.region, params.region));
  }
  if (params.destination) {
    conditions.push(eq(hotels.destination, params.destination));
  }
  if (params.petFriendly != null) {
    conditions.push(eq(hotels.petFriendly, params.petFriendly));
  }
  if (params.poolHeated != null) {
    conditions.push(eq(hotels.poolHeated, params.poolHeated));
  }
  if (params.bradescoCoupon != null) {
    conditions.push(eq(hotels.bradescoCoupon, params.bradescoCoupon));
  }

  const query = db
    .select({
      id: hotels.id,
      name: hotels.name,
      slug: hotels.slug,
      region: hotels.region,
      experience: hotels.experience,
      destination: hotels.destination,
      municipality: hotels.municipality,
      uf: hotels.uf,
      petFriendly: hotels.petFriendly,
      poolHeated: hotels.poolHeated,
      bradescoCoupon: hotels.bradescoCoupon,
    })
    .from(hotels);

  const results = conditions.length > 0
    ? await query.where(and(...conditions)).limit(10)
    : await query.limit(10);

  return results;
}

export const searchHotelsTool = tool({
  name: 'search_hotels',
  description: 'Search hotels by criteria: experience, region, destination, petFriendly, poolHeated, bradescoCoupon. Returns up to 10 matching hotels.',
  parameters: SearchHotelsParams,
  execute: async (params) => {
    const results = await searchHotels(params);
    if (results.length === 0) {
      return { hotels: [], message: 'No hotels found matching the criteria.' };
    }
    return { hotels: results, count: results.length };
  },
});
