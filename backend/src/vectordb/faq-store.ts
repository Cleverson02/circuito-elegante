import { sql } from 'drizzle-orm';
import { getDatabase, getPostgresClient } from '../database/client.js';
import { faqEmbeddings } from '../database/schema.js';
import { registerHealthChecker } from '../api/health.js';
import { logger } from '../middleware/logging.js';

export interface FaqRecord {
  hotelId: string;
  sectionTitle: string;
  content: string;
  contentHash: string;
  embedding: number[];
  source: string;
  fileName: string | null;
}

export async function upsertFaqEmbeddings(records: FaqRecord[]): Promise<{ inserted: number; updated: number }> {
  const db = getDatabase();
  let inserted = 0;
  let updated = 0;

  for (const record of records) {
    const existing = await db
      .select({ id: faqEmbeddings.id })
      .from(faqEmbeddings)
      .where(
        sql`${faqEmbeddings.hotelId} = ${record.hotelId} AND ${faqEmbeddings.contentHash} = ${record.contentHash}`,
      )
      .limit(1);

    const first = existing[0];
    if (first) {
      await db
        .update(faqEmbeddings)
        .set({
          sectionTitle: record.sectionTitle,
          content: record.content,
          embedding: record.embedding,
          source: record.source,
          fileName: record.fileName,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(sql`${faqEmbeddings.id} = ${first.id}`);
      updated++;
    } else {
      await db.insert(faqEmbeddings).values({
        hotelId: record.hotelId,
        sectionTitle: record.sectionTitle,
        content: record.content,
        contentHash: record.contentHash,
        embedding: record.embedding,
        source: record.source,
        fileName: record.fileName,
      });
      inserted++;
    }
  }

  return { inserted, updated };
}

export async function getEmbeddingCount(): Promise<number> {
  const client = getPostgresClient();
  const result = await client`SELECT COUNT(*)::int as count FROM faq_embeddings`;
  return (result[0]?.['count'] as number) ?? 0;
}

export async function searchSimilar(
  queryEmbedding: number[],
  limit = 5,
): Promise<{ id: string; sectionTitle: string; content: string; similarity: number }[]> {
  const client = getPostgresClient();
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  const results = await client`
    SELECT id, section_title, content,
           1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM faq_embeddings
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    id: r['id'] as string,
    sectionTitle: r['section_title'] as string,
    content: r['content'] as string,
    similarity: r['similarity'] as number,
  }));
}

export function registerVectordbHealthChecker(): void {
  registerHealthChecker('vectordb', async () => {
    try {
      const count = await getEmbeddingCount();
      return {
        status: 'connected',
        details: { embeddings_loaded: count },
      };
    } catch (error) {
      return {
        status: 'error',
        details: { message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  });
  logger.info('Vectordb health checker registered');
}
