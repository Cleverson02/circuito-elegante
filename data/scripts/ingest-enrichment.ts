import postgres from 'postgres';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Paths resolved relative to project root (works in both ESM and CJS)
const PROJECT_ROOT = resolve(process.cwd());
const ENRICHMENT_DIR = join(PROJECT_ROOT, 'data', 'enrichment');
const REPORT_PATH = join(PROJECT_ROOT, 'data', 'reports', 'enrichment-coverage.md');

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

interface IngestResult {
  slug: string;
  updated: boolean;
  petFriendly: boolean;
  poolHeated: boolean;
  bradescoCoupon: boolean;
  categoriesPopulated: string[];
  fieldsCount: number;
  error?: string;
}

// --- Field Mapping: enrichment flat keys → taxonomy categories ---
// Reference: docs/architecture/HOTEL-DATA-TAXONOMY.md (10 categories, 58 fields)

const FIELD_MAP: Record<string, string> = {
  // 1. IDENTIDADE & LOCALIZAÇÃO
  'website_url':           'identity.website',
  'google_maps_url':       'identity.google_maps',
  'description':           'identity.description',
  'lodging_type':          'identity.lodging_type',
  'address_street':        'identity.address_street',
  'address_number':        'identity.address_number',
  'address_neighborhood':  'identity.address_neighborhood',
  'address_zip_code':      'identity.address_zip_code',
  'latitude':              'identity.latitude',
  'longitude':             'identity.longitude',
  'contact_phone':         'identity.contact_phone',
  'contact_email':         'identity.contact_email',
  'contact_whatsapp':      'identity.contact_whatsapp',

  // 2. ACOMODAÇÕES
  'room_types':            'accommodations.room_types',
  'total_rooms':           'accommodations.total_rooms',
  'room_amenities':        'accommodations.room_amenities',
  'max_capacity':          'accommodations.max_capacity',

  // 3. INFRAESTRUTURA & LAZER
  'parking':               'infrastructure.parking',
  'pool_description':      'infrastructure.pool_description',
  'pool_heated':           'infrastructure.pool_heated',
  'leisure_items':         'infrastructure.leisure_items',
  'wellness':              'infrastructure.wellness',
  'event_space':           'infrastructure.event_space',
  'wifi':                  'infrastructure.wifi',
  'accessibility':         'infrastructure.accessibility',
  'gym':                   'infrastructure.gym',

  // 4. GASTRONOMIA
  'restaurants':           'gastronomy.restaurants',
  'meals_included':        'gastronomy.meals_included',
  'special_dining':        'gastronomy.special_dining',
  'room_service':          'gastronomy.room_service',
  'dietary_options':       'gastronomy.dietary_options',

  // 5. POLÍTICAS & REGRAS
  'check_in_time':         'policies.check_in_time',
  'check_out_time':        'policies.check_out_time',
  'check_in_out':          'policies.check_in_out',
  'early_late_checkout':   'policies.early_late_checkout',
  'cancellation_policy':   'policies.cancellation_policy',
  'children_policy':       'policies.children_policy',
  'pet_policy':            'policies.pet_policy',
  'smoking_policy':        'policies.smoking_policy',
  'minimum_age':           'policies.minimum_age',
  'min_age_solo':          'policies.minimum_age',            // alias

  // 6. ACESSO & TRANSPORTE
  'airport_distance':           'transport.airport_distance',
  'transfer':                   'transport.transfer',
  'nearby_attractions':         'transport.nearby_attractions',
  'access_instructions':        'transport.access_instructions',
  'how_to_get_there':           'transport.access_instructions',    // alias

  // 7. EXPERIÊNCIAS & PROGRAMAÇÃO
  'special_programming':        'experiences.special_programming',
  'concierge_service':          'experiences.concierge_service',
  'hotel_concierge_services':   'experiences.concierge_service',    // alias
  'activities_tours':      'experiences.activities_tours',
  'day_use':               'experiences.day_use',
  'special_packages':      'experiences.special_packages',

  // 8. DIFERENCIAIS & REPUTAÇÃO
  'differentials':         'reputation.differentials',
  'highlights':            'reputation.differentials',   // alias
  'awards_seals':          'reputation.awards',
  'awards_certifications': 'reputation.awards',          // alias
  'sustainability':        'reputation.sustainability',
  'star_rating':           'reputation.star_rating',
  'price_range':           'reputation.price_range',
  'price_tier':            'reputation.price_range',     // alias

  // 9. CONHECIMENTO DO CONCIERGE
  'faq':                          'concierge.faq',
  'guest_faqs':                   'concierge.faq',                  // alias
  'objections':                   'concierge.objections',
  'common_objections':            'concierge.objections',           // alias
  'caution_points':               'concierge.caution_points',
  'attention_points':             'concierge.caution_points',       // alias
  'sales_arguments':              'concierge.sales_arguments',
  'sales_arguments_by_profile':   'concierge.sales_arguments',      // alias

  // 10. INTEGRAÇÃO CE
  'ce_page_url':                  'integration.ce_page_url',
  'photos':                       'integration.photos',
  'photo_urls':                   'integration.photos',             // alias
};

// Keys to skip during mapping (not part of taxonomy)
const SKIP_KEYS = new Set([
  'hotel_name', 'municipality', 'state_code', 'region', '_meta',
]);

// Valid taxonomy categories
const TAXONOMY_CATEGORIES = [
  'identity', 'accommodations', 'infrastructure', 'gastronomy',
  'policies', 'transport', 'experiences', 'reputation',
  'concierge', 'integration',
] as const;

// --- Boolean Extraction ---

const PET_POSITIVE_PATTERNS = [
  /aceita\s*pets?/i,
  /pet[\s-]*friendly/i,
  /permite\s*(animais|pets?)/i,
  /animais\s*(de\s*estimação\s*)?(são\s*)?(permitidos|aceitos|bem[\s-]?vindos)/i,
  /hospedagem\s*(com|para)\s*(pets?|animais)/i,
  /accepts?\s*pets?/i,
];

const PET_NEGATIVE_PATTERNS = [
  /n[ãa]o\s*(aceita|permite|recebe)\s*(animais|pets?)/i,
  /proibido\s*(animais|pets?)/i,
  /sem\s*(pets?|animais)/i,
  /does\s*not\s*accept\s*pets?/i,
];

export function extractPetFriendly(enrichment: Record<string, unknown>): boolean | null {
  if (typeof enrichment['pet_friendly'] === 'boolean') return enrichment['pet_friendly'];

  const petPolicy = enrichment['pet_policy'];

  // Object with explicit flag
  if (petPolicy && typeof petPolicy === 'object' && !Array.isArray(petPolicy)) {
    const obj = petPolicy as Record<string, unknown>;
    if (typeof obj['allows_pets'] === 'boolean') return obj['allows_pets'];
    if (typeof obj['accepts_pets'] === 'boolean') return obj['accepts_pets'];
    if (typeof obj['pet_friendly'] === 'boolean') return obj['pet_friendly'];
    // Check details text
    const details = obj['details'];
    if (typeof details === 'string' && details.trim()) {
      for (const pattern of PET_NEGATIVE_PATTERNS) {
        if (pattern.test(details)) return false;
      }
      for (const pattern of PET_POSITIVE_PATTERNS) {
        if (pattern.test(details)) return true;
      }
    }
  }

  // String
  if (typeof petPolicy === 'string' && petPolicy.trim()) {
    for (const pattern of PET_NEGATIVE_PATTERNS) {
      if (pattern.test(petPolicy)) return false;
    }
    for (const pattern of PET_POSITIVE_PATTERNS) {
      if (pattern.test(petPolicy)) return true;
    }
  }

  return null;
}

export function extractPoolHeated(enrichment: Record<string, unknown>): boolean | null {
  if (typeof enrichment['pool_heated'] === 'boolean') return enrichment['pool_heated'];

  const poolDesc = enrichment['pool_description'];
  if (typeof poolDesc === 'string') {
    if (/n[ãa]o.*aquecida/i.test(poolDesc)) return false;
    if (/aquecida/i.test(poolDesc)) return true;
  }

  return null;
}

export function extractBradescoCoupon(enrichment: Record<string, unknown>, meta: Record<string, unknown> | undefined): boolean | null {
  if (typeof enrichment['bradesco_coupon'] === 'boolean') return enrichment['bradesco_coupon'];
  if (meta && typeof meta['bradesco_coupon'] === 'boolean') return meta['bradesco_coupon'];
  return null;
}

// --- Taxonomy Mapping ---

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  const lastKey = parts.pop()!;
  let current = obj;

  for (const part of parts) {
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

export function mapToTaxonomy(enrichment: Record<string, unknown>): Record<string, unknown> {
  const structured: Record<string, unknown> = {};
  const unmapped: string[] = [];

  for (const [key, value] of Object.entries(enrichment)) {
    if (SKIP_KEYS.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;

    const taxonomyPath = FIELD_MAP[key];
    if (taxonomyPath) {
      setNestedValue(structured, taxonomyPath, value);
    } else {
      unmapped.push(key);
    }
  }

  if (unmapped.length > 0) {
    console.warn(`  ⚠️  Unmapped fields: ${unmapped.join(', ')}`);
  }

  return structured;
}

// --- Validation ---

function validateType(key: string, value: unknown): { valid: boolean; warning?: string } {
  // Boolean fields that should be boolean
  const booleanFields = ['pool_heated', 'accessibility', 'gym', 'day_use'];
  if (booleanFields.includes(key)) {
    if (typeof value !== 'boolean' && typeof value !== 'string' && typeof value !== 'object') {
      return { valid: true, warning: `${key}: expected boolean/string/object, got ${typeof value}` };
    }
  }

  // Array fields
  const arrayFields = ['room_types', 'leisure_items', 'restaurants', 'activities_tours', 'awards_seals', 'awards_certifications', 'special_packages', 'room_amenities'];
  if (arrayFields.includes(key)) {
    if (!Array.isArray(value) && typeof value !== 'string') {
      return { valid: true, warning: `${key}: expected array, got ${typeof value}` };
    }
  }

  // Numeric fields
  const numericFields = ['total_rooms', 'star_rating', 'minimum_age', 'latitude', 'longitude'];
  if (numericFields.includes(key)) {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return { valid: true, warning: `${key}: expected number, got ${typeof value}` };
    }
  }

  return { valid: true };
}

// --- Enrichment Metadata ---

function buildEnrichmentMeta(data: EnrichmentJson): Record<string, unknown> {
  return {
    _enrichment_version: data.enrichment_version ?? '2.0',
    _enriched_at: data.enriched_at ?? new Date().toISOString(),
    _sources: data.sources_consulted ?? [],
    _quality_score: data.quality_score ?? null,
    _completeness: data.completeness ?? null,
    _ingested_at: new Date().toISOString(),
  };
}

// --- Ingest Logic ---

async function ingestHotel(
  sql: postgres.Sql,
  data: EnrichmentJson,
): Promise<IngestResult> {
  const slug = data.hotel_slug;
  if (!slug) {
    return { slug: '(unknown)', updated: false, petFriendly: false, poolHeated: false, bradescoCoupon: false, categoriesPopulated: [], fieldsCount: 0, error: 'Missing hotel_slug' };
  }

  // Check hotel exists
  const existing = await sql<{ id: string; pet_friendly: boolean; pool_heated: boolean; bradesco_coupon: boolean }[]>`
    SELECT id, pet_friendly, pool_heated, bradesco_coupon FROM hotels WHERE slug = ${slug} LIMIT 1
  `;

  if (existing.length === 0) {
    return { slug, updated: false, petFriendly: false, poolHeated: false, bradescoCoupon: false, categoriesPopulated: [], fieldsCount: 0, error: 'Hotel not found in database' };
  }

  const hotel = existing[0]!;
  const enrichment = data.enrichment ?? {};
  const meta = enrichment['_meta'] as Record<string, unknown> | undefined;

  // Validate fields
  const warnings: string[] = [];
  for (const [key, value] of Object.entries(enrichment)) {
    if (SKIP_KEYS.has(key)) continue;
    const { warning } = validateType(key, value);
    if (warning) warnings.push(warning);
  }
  if (warnings.length > 0) {
    console.warn(`  ⚠️  ${slug}: ${warnings.join('; ')}`);
  }

  // Map to taxonomy structure
  const structured = mapToTaxonomy(enrichment);

  // Add enrichment metadata
  const enrichmentMeta = buildEnrichmentMeta(data);

  // Add chatbot_info if present
  if (data.chatbot_info && Object.keys(data.chatbot_info).length > 0) {
    structured['concierge'] = {
      ...(structured['concierge'] as Record<string, unknown> ?? {}),
      chatbot_info: data.chatbot_info,
    };
  }

  // Build merge payload: structured categories + metadata
  const mergePayload: Record<string, unknown> = {
    ...structured,
    ...enrichmentMeta,
  };

  // Count populated categories
  const categoriesPopulated = TAXONOMY_CATEGORIES.filter(
    (cat) => structured[cat] && typeof structured[cat] === 'object' && Object.keys(structured[cat] as Record<string, unknown>).length > 0,
  );

  const fieldsCount = Object.keys(enrichment).filter(
    (k) => !SKIP_KEYS.has(k) && enrichment[k] !== null && enrichment[k] !== undefined,
  ).length;

  // Extract booleans
  const petFromEnrichment = extractPetFriendly(enrichment);
  const poolFromEnrichment = extractPoolHeated(enrichment);
  const bradescoFromEnrichment = extractBradescoCoupon(enrichment, meta);

  const newPetFriendly = petFromEnrichment === true || hotel.pet_friendly;
  const newPoolHeated = poolFromEnrichment === true || hotel.pool_heated;
  const newBradescoCoupon = bradescoFromEnrichment ?? hotel.bradesco_coupon;

  // JSONB merge: existing data preserved, structured enrichment overlays
  // Uses || operator for shallow top-level merge — category keys are replaced wholesale
  // Safe for idempotent re-runs since same JSON produces same categories each time
  await sql`
    UPDATE hotels SET
      data = data || ${sql.json(mergePayload as never)}::jsonb,
      pet_friendly = ${newPetFriendly},
      pool_heated = ${newPoolHeated},
      bradesco_coupon = ${newBradescoCoupon},
      updated_at = now()
    WHERE slug = ${slug}
  `;

  return {
    slug,
    updated: true,
    petFriendly: newPetFriendly,
    poolHeated: newPoolHeated,
    bradescoCoupon: newBradescoCoupon,
    categoriesPopulated,
    fieldsCount,
  };
}

// --- Coverage Report ---

function generateCoverageReport(results: IngestResult[]): string {
  const updated = results.filter((r) => r.updated);
  const failed = results.filter((r) => !r.updated);

  // Category coverage
  const categoryCounts: Record<string, number> = {};
  for (const cat of TAXONOMY_CATEGORIES) {
    categoryCounts[cat] = updated.filter((r) => r.categoriesPopulated.includes(cat)).length;
  }

  // Boolean counts
  const withPet = updated.filter((r) => r.petFriendly).length;
  const withPool = updated.filter((r) => r.poolHeated).length;
  const withBradesco = updated.filter((r) => r.bradescoCoupon).length;

  const totalHotels = updated.length;

  const lines: string[] = [
    '# Enrichment Coverage Report',
    '',
    `> Generated: ${new Date().toISOString()}`,
    `> Story: 1.7 — Ingestão de Dados Enriquecidos v2`,
    '',
    '## Summary',
    '',
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total JSON files | ${results.length} |`,
    `| Hotels updated | ${updated.length} |`,
    `| Hotels failed | ${failed.length} |`,
    `| pet_friendly=true | ${withPet} |`,
    `| pool_heated=true | ${withPool} |`,
    `| bradesco_coupon=true | ${withBradesco} |`,
    '',
    '## Category Coverage',
    '',
    `| Category | Hotels | Coverage |`,
    `|----------|--------|----------|`,
  ];

  for (const cat of TAXONOMY_CATEGORIES) {
    const count = categoryCounts[cat]!;
    const pct = totalHotels > 0 ? Math.round((count / totalHotels) * 100) : 0;
    const flag = pct < 50 ? ' ⚠️' : '';
    lines.push(`| ${cat} | ${count}/${totalHotels} | ${pct}%${flag} |`);
  }

  lines.push('', '## Low Coverage Categories (< 50%)', '');
  const lowCoverage = TAXONOMY_CATEGORIES.filter(
    (cat) => totalHotels > 0 && (categoryCounts[cat]! / totalHotels) < 0.5,
  );
  if (lowCoverage.length === 0) {
    lines.push('All categories have >= 50% coverage.');
  } else {
    for (const cat of lowCoverage) {
      lines.push(`- **${cat}**: ${categoryCounts[cat]}/${totalHotels} hotels`);
    }
  }

  if (failed.length > 0) {
    lines.push('', '## Failed Hotels', '');
    for (const r of failed) {
      lines.push(`- **${r.slug}**: ${r.error}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

// --- Main ---

async function main(): Promise<void> {
  console.log('📦 Ingest Enrichment v2 — JSON → Structured JSONB');
  console.log('===================================================\n');

  // 1. Read JSON files
  let files: string[];
  try {
    files = readdirSync(ENRICHMENT_DIR)
      .filter((f) => f.endsWith('.json') && !f.includes('webscrape'));
  } catch {
    console.error(`❌ Directory not found: ${ENRICHMENT_DIR}`);
    process.exit(1);
  }

  console.log(`📁 Found: ${files.length} enrichment JSON files\n`);

  if (files.length === 0) {
    console.log('⚠️  No files to process.');
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
    const results: IngestResult[] = [];

    for (const file of files) {
      const filePath = join(ENRICHMENT_DIR, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const data: EnrichmentJson = JSON.parse(content);
        const result = await ingestHotel(sql, data);
        results.push(result);

        const icon = result.updated ? '✅' : '⚠️';
        const cats = result.categoriesPopulated.length > 0
          ? ` [${result.categoriesPopulated.join(',')}]`
          : '';
        const bools: string[] = [];
        if (result.petFriendly) bools.push('pet');
        if (result.poolHeated) bools.push('pool');
        if (result.bradescoCoupon) bools.push('bradesco');
        const boolStr = bools.length > 0 ? ` {${bools.join(',')}}` : '';

        console.log(`  ${icon} ${result.slug}: ${result.fieldsCount} fields${cats}${boolStr}${result.error ? ` — ${result.error}` : ''}`);
      } catch (err) {
        const slug = file.replace('.json', '');
        results.push({ slug, updated: false, petFriendly: false, poolHeated: false, bradescoCoupon: false, categoriesPopulated: [], fieldsCount: 0, error: String(err) });
        console.log(`  ❌ ${slug}: ${err}`);
      }
    }

    // 3. Summary
    const updated = results.filter((r) => r.updated).length;
    const failed = results.filter((r) => !r.updated).length;

    console.log('\n--- Summary ---');
    console.log(`  Processed: ${results.length}`);
    console.log(`  Updated:   ${updated}`);
    console.log(`  Failed:    ${failed}`);

    // 4. Verification
    const countEnriched = await sql<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM hotels
      WHERE data->>'_enrichment_version' IS NOT NULL
    `;
    const countWithDesc = await sql<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM hotels
      WHERE data #>> '{identity,description}' IS NOT NULL
         OR data->>'description' IS NOT NULL
    `;

    console.log(`\n  Hotels with enrichment: ${countEnriched[0]?.total ?? 0}`);
    console.log(`  Hotels with description: ${countWithDesc[0]?.total ?? 0}`);

    // 5. Generate coverage report
    const report = generateCoverageReport(results);
    try {
      writeFileSync(REPORT_PATH, report, 'utf-8');
      console.log(`\n📊 Coverage report: ${REPORT_PATH}`);
    } catch {
      console.log('\n📊 Coverage report (inline):\n');
      console.log(report);
    }
  } finally {
    await sql.end();
  }
}

// Only run when executed directly (ESM)
const isDirectExecution = process.argv[1]?.endsWith('ingest-enrichment.ts') || process.argv[1]?.endsWith('ingest-enrichment');
if (isDirectExecution) {
  main().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}
