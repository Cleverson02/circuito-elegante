import postgres from 'postgres';
import * as XLSX from 'xlsx';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// --- Types ---

interface RawRow {
  name: string;
  municipality: string;
  uf: string;
  hasApi: boolean;
  bradescoCoupon: boolean;
  elevareHotelId: string | null;
  region: string;
  experience: string;
  destination: string;
}

interface HotelRecord {
  name: string;
  slug: string;
  region: string;
  experience: string;
  destination: string;
  municipality: string;
  uf: string;
  has_api: boolean;
  elevare_hotel_id: string | null;
  bradesco_coupon: boolean;
  pet_friendly: boolean;
  pool_heated: boolean;
  data: Record<string, string>;
}

// --- Helpers ---

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function yesNo(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return value.trim().toUpperCase() === 'SIM';
}

function normalizeRegion(value: string): string {
  const normalized = value.trim().toLowerCase();
  const valid = ['nordeste', 'sudeste', 'sul', 'centro-oeste', 'norte'];
  const match = valid.find((v) => v === normalized);
  if (match) return match;
  // Handle "Centro-oeste" case-insensitive
  if (normalized.replace(/[\s-]/g, '') === 'centrooeste') return 'centro-oeste';
  return normalized;
}

function normalizeExperience(value: string): string {
  const normalized = value.trim().toLowerCase();
  const valid = ['praia', 'campo', 'serra', 'cidade'];
  const match = valid.find((v) => v === normalized);
  if (match) return match;
  return normalized;
}

// --- Parsing ---

export function parseXlsx(filePath: string): RawRow[] {
  const workbook = XLSX.read(readFileSync(filePath));
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('XLSX has no sheets');
  const sheet = workbook.Sheets[sheetName]!;
  const allRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });

  const rows: RawRow[] = [];

  // XLSX has two sections:
  //   Section 1 (has_api=true):  ESTABELECIMENTOS, MUNICÍPIO, UF, API?, BRADESCO, hotel_ID, Região, Experiência, Destino
  //   Section 2 (has_api=false): ESTABELECIMENTOS, MUNICÍPIO, UF, API?, BRADESCO, CONCIERGE, Região, Experiência, Destino
  // Separated by empty rows, each with its own header row

  let inSection = false;
  let sectionHasHotelId = false;

  for (const row of allRows) {
    const firstCell = String(row[0] ?? '').trim();

    // Skip empty rows
    if (!firstCell) {
      inSection = false;
      continue;
    }

    // Detect header rows
    if (firstCell.toUpperCase() === 'ESTABELECIMENTOS') {
      inSection = true;
      // Section 1 has "hotel_ID" in column 5, Section 2 has "ENVIAR PARA CONCIERGE"
      const col5 = String(row[5] ?? '').trim().toLowerCase();
      sectionHasHotelId = col5 === 'hotel_id';
      continue;
    }

    if (!inSection) continue;

    const name = String(row[0] ?? '').trim();
    const municipality = String(row[1] ?? '').trim();
    const uf = String(row[2] ?? '').trim();
    const apiFlag = String(row[3] ?? '').trim();
    const bradescoFlag = String(row[4] ?? '').trim();
    const hotelIdOrConcierge = String(row[5] ?? '').trim();
    const region = String(row[6] ?? '').trim();
    const experience = String(row[7] ?? '').trim();
    const destination = String(row[8] ?? '').trim();

    if (!name) continue;

    rows.push({
      name,
      municipality,
      uf,
      hasApi: yesNo(apiFlag),
      bradescoCoupon: yesNo(bradescoFlag),
      elevareHotelId: sectionHasHotelId && hotelIdOrConcierge ? hotelIdOrConcierge : null,
      region,
      experience,
      destination,
    });
  }

  return rows;
}

// --- Validation ---

const REQUIRED_FIELDS: (keyof RawRow)[] = ['name', 'municipality', 'uf', 'region', 'experience', 'destination'];

export interface ValidationResult {
  valid: HotelRecord[];
  rejected: { row: RawRow; reasons: string[] }[];
}

export function validateAndMap(rows: RawRow[]): ValidationResult {
  const valid: HotelRecord[] = [];
  const rejected: { row: RawRow; reasons: string[] }[] = [];

  for (const row of rows) {
    const reasons: string[] = [];

    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || String(row[field]).trim() === '') {
        reasons.push(`Missing required field: ${field}`);
      }
    }

    if (reasons.length > 0) {
      rejected.push({ row, reasons });
      continue;
    }

    valid.push({
      name: row.name,
      slug: slugify(row.name),
      region: normalizeRegion(row.region),
      experience: normalizeExperience(row.experience),
      destination: row.destination,
      municipality: row.municipality,
      uf: row.uf.toUpperCase(),
      has_api: row.hasApi,
      elevare_hotel_id: row.elevareHotelId,
      bradesco_coupon: row.bradescoCoupon,
      pet_friendly: false,
      pool_heated: false,
      data: {
        source: 'xlsx-ingest',
        ingestedAt: new Date().toISOString(),
      } as Record<string, string>,
    });
  }

  return { valid, rejected };
}

// --- Upsert ---

async function upsertHotels(
  sql: postgres.Sql,
  hotels: HotelRecord[],
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const hotel of hotels) {
    const result = await sql<{ is_insert: boolean }[]>`
      INSERT INTO hotels (
        name, slug, region, experience, destination,
        municipality, uf, has_api, elevare_hotel_id,
        bradesco_coupon, pet_friendly, pool_heated, data
      ) VALUES (
        ${hotel.name}, ${hotel.slug}, ${hotel.region}, ${hotel.experience}, ${hotel.destination},
        ${hotel.municipality}, ${hotel.uf}, ${hotel.has_api}, ${hotel.elevare_hotel_id},
        ${hotel.bradesco_coupon}, ${hotel.pet_friendly}, ${hotel.pool_heated}, ${sql.json(hotel.data)}
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        region = EXCLUDED.region,
        experience = EXCLUDED.experience,
        destination = EXCLUDED.destination,
        municipality = EXCLUDED.municipality,
        uf = EXCLUDED.uf,
        has_api = EXCLUDED.has_api,
        elevare_hotel_id = EXCLUDED.elevare_hotel_id,
        bradesco_coupon = EXCLUDED.bradesco_coupon,
        data = EXCLUDED.data,
        updated_at = now()
      RETURNING (xmax = 0) AS is_insert
    `;

    if (result[0]?.is_insert) {
      inserted++;
    } else {
      updated++;
    }
  }

  return { inserted, updated };
}

// --- Main ---

async function main(): Promise<void> {
  // Script e invocado via `npm run ingest:hotels` (cwd = raiz do projeto).
  // Usar process.cwd() evita import.meta (ESM-only, quebra ts-jest CJS) e
  // __dirname (CJS-only, ausente em ESM). Funciona em ambos os runtimes.
  const XLSX_PATH = join(process.cwd(), 'data', 'lista-hoteis-circuito-elegante.xlsx');

  console.log('🏨 Ingestão de Hotéis — Circuito Elegante');
  console.log('=========================================\n');

  // 1. Parse XLSX
  console.log(`📄 Lendo: ${XLSX_PATH}`);
  const rawRows = parseXlsx(XLSX_PATH);
  console.log(`   Linhas encontradas: ${rawRows.length}`);

  // 2. Validate & Map
  const { valid, rejected } = validateAndMap(rawRows);
  console.log(`   Válidos: ${valid.length}`);
  console.log(`   Rejeitados: ${rejected.length}`);

  if (rejected.length > 0) {
    console.log('\n⚠️  Linhas rejeitadas:');
    for (const { row, reasons } of rejected) {
      console.log(`   - "${row.name}": ${reasons.join(', ')}`);
    }
  }

  // 3. Connect & Upsert
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.error('\n❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('\n📥 Inserindo no PostgreSQL...');
    const { inserted, updated } = await upsertHotels(sql, valid);

    // 4. Verification
    const countAll = await sql<{ total: number }[]>`SELECT COUNT(*)::int AS total FROM hotels`;
    const countApi = await sql<{ total: number }[]>`SELECT COUNT(*)::int AS total FROM hotels WHERE has_api = true`;

    console.log('\n✅ Resultado:');
    console.log(`   Inseridos: ${inserted}`);
    console.log(`   Atualizados: ${updated}`);
    console.log(`   Rejeitados: ${rejected.length}`);
    console.log(`   Total no banco: ${countAll[0]?.total ?? 0}`);
    console.log(`   Com API (has_api=true): ${countApi[0]?.total ?? 0}`);
  } finally {
    await sql.end();
  }
}

// Only run when executed directly (not when imported by tests)
const isDirectExecution = process.argv[1]?.endsWith('ingest-hotels.ts') || process.argv[1]?.endsWith('ingest-hotels');
if (isDirectExecution) {
  main().catch((err) => {
    console.error('❌ Erro na ingestão:', err);
    process.exit(1);
  });
}
