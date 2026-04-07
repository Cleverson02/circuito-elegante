import postgres from 'postgres';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ENRICHMENT_DIR = join(__dirname, '..', 'enrichment');

// --- Types ---

interface EnrichmentJson {
  hotel_slug: string;
  enrichment_version?: string;
  enriched_at?: string;
  sources_consulted?: string[];
  quality_score?: number;
  completeness?: number;
  fields_filled?: number;
  fields_total?: number;
  chatbot_info?: Record<string, unknown>;
  enrichment?: Record<string, unknown>;
}

interface PersistResult {
  slug: string;
  updated: boolean;
  petFriendly: boolean;
  poolHeated: boolean;
  fieldsCount: number;
  error?: string;
}

// --- Boolean Extraction ---

const PET_POSITIVE_PATTERNS = [
  /aceita\s*pets?/i,
  /pet[\s-]*friendly/i,
  /permite\s*(animais|pets?)/i,
  /animais\s*(de\s*estimação\s*)?(são\s*)?(permitidos|aceitos|bem[\s-]?vindos)/i,
  /hospedagem\s*(com|para)\s*(pets?|animais)/i,
];

const PET_NEGATIVE_PATTERNS = [
  /n[ãa]o\s*(aceita|permite|recebe)\s*(animais|pets?)/i,
  /proibido\s*(animais|pets?)/i,
  /sem\s*(pets?|animais)/i,
];

export function extractPetFriendly(enrichment: Record<string, unknown>): boolean | null {
  // Direct boolean field
  if (typeof enrichment['pet_friendly'] === 'boolean') return enrichment['pet_friendly'];

  // Check pet_policy text
  const petPolicy = enrichment['pet_policy'];
  if (typeof petPolicy === 'string' && petPolicy.trim()) {
    for (const pattern of PET_NEGATIVE_PATTERNS) {
      if (pattern.test(petPolicy)) return false;
    }
    for (const pattern of PET_POSITIVE_PATTERNS) {
      if (pattern.test(petPolicy)) return true;
    }
  }

  // Check nested object
  if (petPolicy && typeof petPolicy === 'object') {
    const obj = petPolicy as Record<string, unknown>;
    if (typeof obj['allows_pets'] === 'boolean') return obj['allows_pets'];
    if (typeof obj['pet_friendly'] === 'boolean') return obj['pet_friendly'];
  }

  return null; // Unknown — don't change existing value
}

export function extractPoolHeated(enrichment: Record<string, unknown>): boolean | null {
  // Direct boolean field
  if (typeof enrichment['pool_heated'] === 'boolean') return enrichment['pool_heated'];

  // Check pool_description text
  const poolDesc = enrichment['pool_description'];
  if (typeof poolDesc === 'string') {
    if (/aquecida/i.test(poolDesc)) return true;
    if (/n[ãa]o.*aquecida/i.test(poolDesc)) return false;
  }

  return null;
}

// --- Persist Logic ---

async function persistHotel(
  sql: postgres.Sql,
  data: EnrichmentJson,
): Promise<PersistResult> {
  const slug = data.hotel_slug;
  if (!slug) {
    return { slug: '(unknown)', updated: false, petFriendly: false, poolHeated: false, fieldsCount: 0, error: 'Missing hotel_slug' };
  }

  // Check hotel exists
  const existing = await sql<{ id: string; pet_friendly: boolean; pool_heated: boolean }[]>`
    SELECT id, pet_friendly, pool_heated FROM hotels WHERE slug = ${slug} LIMIT 1
  `;

  if (existing.length === 0) {
    return { slug, updated: false, petFriendly: false, poolHeated: false, fieldsCount: 0, error: 'Hotel not found in database' };
  }

  const hotel = existing[0]!;
  const enrichment = data.enrichment ?? {};

  // Build JSONB merge payload
  const mergeData: Record<string, unknown> = {
    enrichment_version: data.enrichment_version,
    enriched_at: data.enriched_at,
    sources_consulted: data.sources_consulted,
    quality_score: data.quality_score,
    completeness: data.completeness,
    fields_filled: data.fields_filled,
    fields_total: data.fields_total,
    persisted_at: new Date().toISOString(),
    ...enrichment,
  };
  if (data.chatbot_info) {
    mergeData['chatbot_info'] = data.chatbot_info;
  }

  const fieldsCount = Object.keys(mergeData).filter(
    (k) => mergeData[k] !== null && mergeData[k] !== undefined,
  ).length;

  // Extract booleans (only override if enrichment has definitive answer)
  const petFromEnrichment = extractPetFriendly(enrichment);
  const poolFromEnrichment = extractPoolHeated(enrichment);

  const newPetFriendly = petFromEnrichment === true || hotel.pet_friendly;
  const newPoolHeated = poolFromEnrichment === true || hotel.pool_heated;

  // JSONB merge: existing data preserved, enrichment overlays
  await sql`
    UPDATE hotels SET
      data = data || ${sql.json(mergeData as never)}::jsonb,
      pet_friendly = ${newPetFriendly},
      pool_heated = ${newPoolHeated},
      updated_at = now()
    WHERE slug = ${slug}
  `;

  return {
    slug,
    updated: true,
    petFriendly: newPetFriendly,
    poolHeated: newPoolHeated,
    fieldsCount,
  };
}

// --- Main ---

async function main(): Promise<void> {
  console.log('📦 Persist Enrichment — JSON → PostgreSQL');
  console.log('==========================================\n');

  // 1. Read JSON files
  let files: string[];
  try {
    files = readdirSync(ENRICHMENT_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    console.error(`❌ Diretório não encontrado: ${ENRICHMENT_DIR}`);
    process.exit(1);
  }

  console.log(`📁 Encontrados: ${files.length} arquivos JSON em data/enrichment/`);

  if (files.length === 0) {
    console.log('⚠️  Nenhum arquivo para processar. Execute o squad enrichment primeiro.');
    process.exit(0);
  }

  // 2. Connect
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 5 });

  try {
    const results: PersistResult[] = [];

    for (const file of files) {
      const filePath = join(ENRICHMENT_DIR, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const data: EnrichmentJson = JSON.parse(content);
        const result = await persistHotel(sql, data);
        results.push(result);

        const icon = result.updated ? '✅' : '⚠️';
        const booleans = [];
        if (result.petFriendly) booleans.push('pet');
        if (result.poolHeated) booleans.push('pool');
        const boolStr = booleans.length > 0 ? ` [${booleans.join(',')}]` : '';

        console.log(`  ${icon} ${result.slug}: ${result.fieldsCount} campos${boolStr}${result.error ? ` — ${result.error}` : ''}`);
      } catch (err) {
        const slug = file.replace('.json', '');
        results.push({ slug, updated: false, petFriendly: false, poolHeated: false, fieldsCount: 0, error: String(err) });
        console.log(`  ❌ ${slug}: ${err}`);
      }
    }

    // 3. Summary
    const updated = results.filter((r) => r.updated).length;
    const failed = results.filter((r) => !r.updated).length;
    const withPet = results.filter((r) => r.petFriendly).length;
    const withPool = results.filter((r) => r.poolHeated).length;

    console.log('\n--- Resultado ---');
    console.log(`  Processados: ${results.length}`);
    console.log(`  Atualizados: ${updated}`);
    console.log(`  Falhas:      ${failed}`);
    console.log(`  pet_friendly=true: ${withPet}`);
    console.log(`  pool_heated=true:  ${withPool}`);

    // 4. Verification
    const countAll = await sql<{ total: number }[]>`SELECT COUNT(*)::int AS total FROM hotels`;
    const countEnriched = await sql<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM hotels
      WHERE data ? 'enrichment_version'
    `;

    console.log(`\n  Total no banco: ${countAll[0]?.total ?? 0}`);
    console.log(`  Com enrichment: ${countEnriched[0]?.total ?? 0}`);
  } finally {
    await sql.end();
  }
}

// Only run when executed directly
const isDirectExecution = require.main === module || process.argv[1]?.endsWith('persist-enrichment');
if (isDirectExecution) {
  main().catch((err) => {
    console.error('❌ Erro na persistência:', err);
    process.exit(1);
  });
}
