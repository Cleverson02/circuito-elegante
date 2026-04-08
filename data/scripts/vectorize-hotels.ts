/**
 * Vectorize Hotels — Story 1.8
 *
 * Reads enriched JSONB data from hotels table, converts to categorized
 * Markdown, chunks by logical unit, generates embeddings, and upserts
 * to faq_embeddings with category + metadata.
 *
 * Usage: npm run ingest:vectorize
 */

import postgres from 'postgres';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { jsonToMarkdown, extractFaqChunks } from '../../backend/src/vectordb/json-to-markdown.js';
import { chunkByHeadings, hashContent } from '../../backend/src/vectordb/chunker.js';
import { generateEmbeddings } from '../../backend/src/vectordb/embedding.js';
import type { EmbeddingCategory } from '../../backend/src/vectordb/json-to-markdown.js';

const PROJECT_ROOT = resolve(process.cwd());
const REPORT_PATH = join(PROJECT_ROOT, 'data', 'reports', 'vectorization-report.md');

interface ChunkRecord {
  hotelId: string;
  hotelName: string;
  hotelSlug: string;
  sectionTitle: string;
  content: string;
  contentHash: string;
  category: EmbeddingCategory;
  fieldName: string;
}

interface HotelStats {
  slug: string;
  name: string;
  chunksByCategory: Record<string, number>;
  totalChunks: number;
  error?: string;
}

async function main(): Promise<void> {
  console.log('🔮 Vectorize Hotels — Full-Content Embedding Pipeline');
  console.log('=====================================================\n');

  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 5 });

  try {
    // 1. Fetch all hotels with enriched JSONB data
    const hotels = await sql<{ id: string; name: string; slug: string; data: Record<string, unknown> }[]>`
      SELECT id, name, slug, data
      FROM hotels
      WHERE data->>'_enrichment_version' IS NOT NULL
      ORDER BY name
    `;

    console.log(`📋 Found ${hotels.length} enriched hotels\n`);

    if (hotels.length === 0) {
      console.log('⚠️  No enriched hotels found. Run ingest:enrichment first.');
      process.exit(0);
    }

    const allChunks: ChunkRecord[] = [];
    const hotelStats: HotelStats[] = [];

    // 2. Process each hotel
    for (const hotel of hotels) {
      try {
        const chunks = processHotel(hotel);
        allChunks.push(...chunks);

        const categoryCount: Record<string, number> = {};
        for (const chunk of chunks) {
          categoryCount[chunk.category] = (categoryCount[chunk.category] ?? 0) + 1;
        }

        hotelStats.push({
          slug: hotel.slug,
          name: hotel.name,
          chunksByCategory: categoryCount,
          totalChunks: chunks.length,
        });

        const catStr = Object.entries(categoryCount)
          .map(([k, v]) => `${k}:${v}`)
          .join(', ');
        console.log(`  ✅ ${hotel.slug}: ${chunks.length} chunks [${catStr}]`);
      } catch (err) {
        hotelStats.push({
          slug: hotel.slug,
          name: hotel.name,
          chunksByCategory: {},
          totalChunks: 0,
          error: String(err),
        });
        console.log(`  ❌ ${hotel.slug}: ${err}`);
      }
    }

    console.log(`\n📦 Total chunks to embed: ${allChunks.length}`);

    // 3. Generate embeddings in batches
    console.log('\n🧠 Generating embeddings...');
    const texts = allChunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);
    console.log(`  ✅ Generated ${embeddings.length} embeddings`);

    // 4. Upsert to faq_embeddings
    console.log('\n💾 Upserting to database...');
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i]!;
      const embedding = embeddings[i]!;
      const embeddingStr = `[${embedding.join(',')}]`;

      const existing = await sql`
        SELECT id FROM faq_embeddings
        WHERE hotel_id = ${chunk.hotelId}::uuid
          AND content_hash = ${chunk.contentHash}
        LIMIT 1
      `;

      const metadata = {
        hotel_slug: chunk.hotelSlug,
        hotel_name: chunk.hotelName,
        field_name: chunk.fieldName,
        source: 'enrichment-vectorize',
      };

      if (existing.length > 0) {
        await sql`
          UPDATE faq_embeddings SET
            section_title = ${chunk.sectionTitle},
            content = ${chunk.content},
            embedding = ${embeddingStr}::vector,
            source = 'enrichment-vectorize',
            category = ${chunk.category},
            metadata = ${sql.json(metadata)}::jsonb,
            last_synced_at = now(),
            updated_at = now()
          WHERE id = ${existing[0]!['id']}
        `;
        updated++;
      } else {
        await sql`
          INSERT INTO faq_embeddings (hotel_id, section_title, content, content_hash, embedding, source, category, metadata)
          VALUES (
            ${chunk.hotelId}::uuid,
            ${chunk.sectionTitle},
            ${chunk.content},
            ${chunk.contentHash},
            ${embeddingStr}::vector,
            'enrichment-vectorize',
            ${chunk.category},
            ${sql.json(metadata)}::jsonb
          )
        `;
        inserted++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`  Progress: ${i + 1}/${allChunks.length}`);
      }
    }

    // 5. Summary
    console.log('\n--- Summary ---');
    console.log(`  Hotels processed: ${hotelStats.length}`);
    console.log(`  Total chunks:     ${allChunks.length}`);
    console.log(`  Inserted:         ${inserted}`);
    console.log(`  Updated:          ${updated}`);

    // 6. Verification
    const countResult = await sql<{ total: number }[]>`SELECT COUNT(*)::int AS total FROM faq_embeddings`;
    console.log(`  Total embeddings: ${countResult[0]?.total ?? 0}`);

    // 7. Generate report
    const report = generateReport(hotelStats, allChunks.length, inserted, updated);
    try {
      writeFileSync(REPORT_PATH, report, 'utf-8');
      console.log(`\n📊 Report: ${REPORT_PATH}`);
    } catch {
      console.log('\n📊 Report (inline):\n');
      console.log(report);
    }
  } finally {
    await sql.end();
  }
}

function processHotel(hotel: { id: string; name: string; slug: string; data: Record<string, unknown> }): ChunkRecord[] {
  const chunks: ChunkRecord[] = [];

  // 1. Convert structured data to categorized Markdown documents
  const documents = jsonToMarkdown(hotel.name, hotel.data);

  for (const doc of documents) {
    // Chunk each document by logical units (headings/paragraphs)
    const docChunks = chunkByHeadings(doc.markdown, hotel.name);
    for (const chunk of docChunks) {
      chunks.push({
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelSlug: hotel.slug,
        sectionTitle: chunk.sectionTitle,
        content: chunk.content,
        contentHash: chunk.contentHash,
        category: doc.category,
        fieldName: doc.taxonomyCategory,
      });
    }
  }

  // 2. Extract FAQ entries as individual chunks
  const faqChunks = extractFaqChunks(hotel.name, hotel.data);
  for (const faq of faqChunks) {
    chunks.push({
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelSlug: hotel.slug,
      sectionTitle: `FAQ — ${hotel.name}`,
      content: faq.content,
      contentHash: hashContent(faq.content),
      category: 'faq',
      fieldName: faq.fieldName,
    });
  }

  return chunks;
}

function generateReport(stats: HotelStats[], totalChunks: number, inserted: number, updated: number): string {
  const successful = stats.filter((s) => !s.error);
  const failed = stats.filter((s) => s.error);

  const categoryTotals: Record<string, number> = {};
  for (const s of successful) {
    for (const [cat, count] of Object.entries(s.chunksByCategory)) {
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + count;
    }
  }

  const lines: string[] = [
    '# Vectorization Report',
    '',
    `> Generated: ${new Date().toISOString()}`,
    '> Story: 1.8 — Vetorização Full-Content para RAG',
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '|--------|-------|',
    `| Hotels processed | ${stats.length} |`,
    `| Hotels vectorized | ${successful.length} |`,
    `| Hotels failed | ${failed.length} |`,
    `| Total chunks | ${totalChunks} |`,
    `| Embeddings inserted | ${inserted} |`,
    `| Embeddings updated | ${updated} |`,
    '',
    '## Chunks by Category',
    '',
    '| Category | Chunks | % |',
    '|----------|--------|---|',
  ];

  for (const [cat, count] of Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])) {
    const pct = totalChunks > 0 ? Math.round((count / totalChunks) * 100) : 0;
    lines.push(`| ${cat} | ${count} | ${pct}% |`);
  }

  lines.push('', '## Hotels Detail', '', '| Hotel | Total | faq | description | experience | policy | location |', '|-------|-------|-----|-------------|------------|--------|----------|');

  for (const s of successful.sort((a, b) => b.totalChunks - a.totalChunks)) {
    const c = s.chunksByCategory;
    lines.push(`| ${s.slug} | ${s.totalChunks} | ${c['faq'] ?? 0} | ${c['description'] ?? 0} | ${c['experience'] ?? 0} | ${c['policy'] ?? 0} | ${c['location'] ?? 0} |`);
  }

  if (failed.length > 0) {
    lines.push('', '## Failed Hotels', '');
    for (const s of failed) {
      lines.push(`- **${s.slug}**: ${s.error}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

// Only run when executed directly
const isDirectExecution = process.argv[1]?.endsWith('vectorize-hotels.ts') || process.argv[1]?.endsWith('vectorize-hotels');
if (isDirectExecution) {
  main().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

export { processHotel, generateReport };
