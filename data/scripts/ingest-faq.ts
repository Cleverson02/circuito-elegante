import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';
import { chunkByHeadings } from '../../backend/src/vectordb/chunker.js';
import { generateEmbeddings, EMBEDDING_MODEL } from '../../backend/src/vectordb/embedding.js';

// --- Config ---

const FAQ_PATH = join(__dirname, '..', 'faqs', 'Questionário de Informações - Hotéis Circuito Elegante.md');
const SOURCE = 'local-file';
const FAQ_FILENAME = 'Questionário de Informações - Hotéis Circuito Elegante.md';

// --- Types ---

interface HotelRow {
  id: string;
  name: string;
  slug: string;
}

// --- Helpers ---

function parseHotelSections(content: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = content.split('\n');
  let currentHotel = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    // Top-level heading = hotel name (# Hotel Name)
    const h1Match = line.match(/^#\s+([^#].+)/);
    if (h1Match) {
      if (currentHotel && currentLines.length > 0) {
        sections.set(currentHotel, currentLines.join('\n'));
      }
      currentHotel = h1Match[1]!.replace(/\\\./g, '.').replace(/\*\*/g, '').trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentHotel && currentLines.length > 0) {
    sections.set(currentHotel, currentLines.join('\n'));
  }

  return sections;
}

function normalizeHotelName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

async function findHotelByName(sql: ReturnType<typeof postgres>, hotelName: string): Promise<HotelRow | null> {
  // Try exact match first
  const exact = await sql<HotelRow[]>`SELECT id, name, slug FROM hotels WHERE LOWER(name) = ${hotelName.toLowerCase()} LIMIT 1`;
  if (exact.length > 0) return exact[0]!;

  // Try fuzzy match with ILIKE
  const normalized = normalizeHotelName(hotelName);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return null;

  // Match on first significant word
  const firstWord = words[0]!;
  const fuzzy = await sql<HotelRow[]>`SELECT id, name, slug FROM hotels WHERE LOWER(name) ILIKE ${'%' + firstWord + '%'} LIMIT 1`;
  return fuzzy.length > 0 ? fuzzy[0]! : null;
}

// --- Main ---

async function main(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  if (!process.env['OPENAI_API_KEY']) {
    console.error('OPENAI_API_KEY is required');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 5 });

  try {
    // Ensure pgvector extension
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;

    // Read FAQ file
    console.log(`Reading FAQ file: ${FAQ_PATH}`);
    const content = readFileSync(FAQ_PATH, 'utf-8');
    const hotelSections = parseHotelSections(content);
    console.log(`Found ${hotelSections.size} hotel sections`);

    let totalChunks = 0;
    let totalEmbeddings = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let skippedHotels = 0;

    for (const [hotelName, sectionContent] of hotelSections) {
      // Skip generic sections
      if (hotelName === 'FORMULÁRIO' || hotelName.length > 200) {
        console.log(`  Skipping non-hotel section: ${hotelName.substring(0, 50)}...`);
        skippedHotels++;
        continue;
      }

      const hotel = await findHotelByName(sql, hotelName);
      if (!hotel) {
        console.warn(`  Hotel not found in DB: "${hotelName}" — skipping`);
        skippedHotels++;
        continue;
      }

      // Chunk
      const chunks = chunkByHeadings(sectionContent, hotelName);
      if (chunks.length === 0) continue;

      totalChunks += chunks.length;
      console.log(`  ${hotel.name}: ${chunks.length} chunks`);

      // Generate embeddings for all chunks
      const texts = chunks.map((c) => `${c.sectionTitle}\n${c.content}`);
      const embeddings = await generateEmbeddings(texts);
      totalEmbeddings += embeddings.length;

      // Upsert to database
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]!;
        const embedding = embeddings[i]!;
        const embeddingStr = `[${embedding.join(',')}]`;

        const existing = await sql`
          SELECT id FROM faq_embeddings
          WHERE hotel_id = ${hotel.id} AND content_hash = ${chunk.contentHash}
          LIMIT 1
        `;

        if (existing.length > 0) {
          const existingId = existing[0]!['id'];
          await sql`
            UPDATE faq_embeddings SET
              section_title = ${chunk.sectionTitle},
              content = ${chunk.content},
              embedding = ${embeddingStr}::vector,
              embedding_version = ${EMBEDDING_MODEL},
              source = ${SOURCE},
              file_name = ${FAQ_FILENAME},
              last_synced_at = NOW(),
              updated_at = NOW()
            WHERE id = ${existingId}
          `;
          totalUpdated++;
        } else {
          await sql`
            INSERT INTO faq_embeddings (hotel_id, section_title, content, content_hash, embedding, embedding_version, source, file_name)
            VALUES (${hotel.id}, ${chunk.sectionTitle}, ${chunk.content}, ${chunk.contentHash}, ${embeddingStr}::vector, ${EMBEDDING_MODEL}, ${SOURCE}, ${FAQ_FILENAME})
          `;
          totalInserted++;
        }
      }
    }

    // Summary
    console.log('\n--- Ingestion Summary ---');
    console.log(`Hotels processed: ${hotelSections.size - skippedHotels}`);
    console.log(`Hotels skipped:   ${skippedHotels}`);
    console.log(`Chunks generated: ${totalChunks}`);
    console.log(`Embeddings created: ${totalEmbeddings}`);
    console.log(`Records inserted: ${totalInserted}`);
    console.log(`Records updated:  ${totalUpdated}`);

    // Verify
    const countResult = await sql`SELECT COUNT(*)::int as count FROM faq_embeddings`;
    console.log(`Total embeddings in DB: ${countResult[0]!['count']}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
