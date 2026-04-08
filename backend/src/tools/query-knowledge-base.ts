import { z } from 'zod';
import { tool } from '@openai/agents';
import { getPostgresClient } from '../database/client.js';
import { generateEmbedding } from '../vectordb/embedding.js';
import { searchSimilar } from '../vectordb/faq-store.js';
import { getRedisClient } from '../state/redis-client.js';
import { hashContent } from '../vectordb/chunker.js';

export const EMBEDDING_CATEGORIES = ['faq', 'description', 'experience', 'policy', 'location'] as const;
export type EmbeddingCategory = (typeof EMBEDDING_CATEGORIES)[number];

export const QueryKBParams = z.object({
  question: z.string().describe('The question to search in the knowledge base'),
  hotelName: z.string().nullable().describe('Hotel name to filter results (supports fuzzy matching)'),
  categories: z.array(z.enum(EMBEDDING_CATEGORIES)).optional().describe(
    'Pre-filter by embedding categories: faq, description, experience, policy, location. Reduces search space for better precision.',
  ),
});

export type QueryKBParams = z.infer<typeof QueryKBParams>;

const SIMILARITY_THRESHOLD = 0.78;
const CACHE_TTL = 3600; // 1 hour
const TOP_K = 3;

function normalizeForMatch(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

async function fuzzyFindHotelId(hotelName: string): Promise<string | null> {
  const client = getPostgresClient();
  const normalized = normalizeForMatch(hotelName);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return null;

  // Try exact match first
  const exact = await client`SELECT id FROM hotels WHERE LOWER(name) = ${hotelName.toLowerCase()} LIMIT 1`;
  if (exact.length > 0) return exact[0]!['id'] as string;

  // Fuzzy match on significant words
  for (const word of words) {
    const fuzzy = await client`SELECT id FROM hotels WHERE LOWER(name) ILIKE ${'%' + word + '%'} LIMIT 1`;
    if (fuzzy.length > 0) return fuzzy[0]!['id'] as string;
  }

  return null;
}

async function getCachedEmbedding(question: string): Promise<number[] | null> {
  try {
    const redis = getRedisClient();
    const cacheKey = `emb:${hashContent(question)}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as number[];
  } catch {
    // Cache miss or Redis unavailable — proceed without cache
  }
  return null;
}

async function cacheEmbedding(question: string, embedding: number[]): Promise<void> {
  try {
    const redis = getRedisClient();
    const cacheKey = `emb:${hashContent(question)}`;
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(embedding));
  } catch {
    // Cache write failure is non-critical
  }
}

export async function queryKnowledgeBase(params: QueryKBParams): Promise<{
  results: { sectionTitle: string; content: string; similarity: number }[];
  suggestion?: string;
}> {
  // Resolve hotel ID if name provided
  let hotelId: string | null = null;
  if (params.hotelName) {
    hotelId = await fuzzyFindHotelId(params.hotelName);
    if (!hotelId) {
      return { results: [], suggestion: 'transfer_to_human' };
    }
  }

  // Generate or retrieve cached embedding
  let embedding = await getCachedEmbedding(params.question);
  if (!embedding) {
    embedding = await generateEmbedding(params.question);
    await cacheEmbedding(params.question, embedding);
  }

  // Search pgvector with pre-filtering
  const allResults = await searchSimilar(embedding, TOP_K * 2, {
    hotelId: hotelId ?? undefined,
    categories: params.categories,
  });

  // Filter by threshold
  const filtered = allResults
    .filter((r) => r.similarity >= SIMILARITY_THRESHOLD)
    .slice(0, TOP_K);

  if (filtered.length === 0) {
    return { results: [], suggestion: 'transfer_to_human' };
  }

  return {
    results: filtered.map((r) => ({
      sectionTitle: r.sectionTitle,
      content: r.content,
      similarity: r.similarity,
      category: r.category,
    })),
  };
}

export const queryKnowledgeBaseTool = tool({
  name: 'query_knowledge_base',
  description: 'Search the hotel knowledge base using semantic search. Optionally filter by hotel name and/or categories (faq, description, experience, policy, location) for precise pre-filtering. Returns top 3 most relevant chunks.',
  parameters: QueryKBParams,
  execute: async (params) => {
    const result = await queryKnowledgeBase(params);
    if (result.results.length === 0) {
      return {
        found: false,
        suggestion: result.suggestion ?? 'transfer_to_human',
        message: 'No relevant information found in knowledge base.',
      };
    }
    return {
      found: true,
      results: result.results,
      count: result.results.length,
    };
  },
});
