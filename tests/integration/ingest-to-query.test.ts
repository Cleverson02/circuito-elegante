/**
 * Integration Test: Enrichment Ingest → Query Hotel Details
 *
 * Tests the full pipeline: reading enrichment JSON, mapping to taxonomy,
 * persisting to PostgreSQL JSONB, and querying via the tool.
 *
 * Requires: DATABASE_URL environment variable pointing to a test database.
 * Run: DATABASE_URL=... npx jest tests/integration/ingest-to-query.test.ts
 */

import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  mapToTaxonomy,
  extractPetFriendly,
  extractPoolHeated,
  extractBradescoCoupon,
} from '../../data/scripts/ingest-enrichment';

const DATABASE_URL = process.env['DATABASE_URL'];
const ENRICHMENT_DIR = join(__dirname, '..', '..', 'data', 'enrichment');

// Skip if no database
const describeIfDb = DATABASE_URL ? describe : describe.skip;

describeIfDb('Integration: Enrichment Ingest → Query', () => {
  let sql: postgres.Sql;

  beforeAll(() => {
    sql = postgres(DATABASE_URL!, { max: 2 });
  });

  afterAll(async () => {
    await sql.end();
  });

  it('should have hotels in the database', async () => {
    const result = await sql<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM hotels`;
    expect(result[0]!.count).toBeGreaterThan(0);
  });

  it('should read and map fasano-rj enrichment JSON', () => {
    const content = readFileSync(join(ENRICHMENT_DIR, 'fasano-rj.json'), 'utf-8');
    const data = JSON.parse(content);
    const enrichment = data.enrichment ?? {};

    const structured = mapToTaxonomy(enrichment);

    // Should have identity category
    expect(structured['identity']).toBeDefined();
    const identity = structured['identity'] as Record<string, unknown>;
    expect(identity['description']).toContain('luxo');

    // Should have gastronomy
    expect(structured['gastronomy']).toBeDefined();
    const gastronomy = structured['gastronomy'] as Record<string, unknown>;
    expect(gastronomy['restaurants']).toBeDefined();

    // Should have policies
    expect(structured['policies']).toBeDefined();
  });

  it('should extract booleans from fasano-rj', () => {
    const content = readFileSync(join(ENRICHMENT_DIR, 'fasano-rj.json'), 'utf-8');
    const data = JSON.parse(content);
    const enrichment = data.enrichment ?? {};
    const meta = enrichment['_meta'] as Record<string, unknown> | undefined;

    const pet = extractPetFriendly(enrichment);
    const pool = extractPoolHeated(enrichment);
    const bradesco = extractBradescoCoupon(enrichment, meta);

    // Fasano RJ: "Nao aceita pets"
    expect(pet).toBe(false);
    // Fasano RJ: pool description doesn't mention heating
    expect(pool).toBeNull();
    // Fasano RJ: bradesco_coupon in _meta is false
    expect(bradesco).toBe(false);
  });

  it('should persist enrichment data and verify JSONB merge', async () => {
    const content = readFileSync(join(ENRICHMENT_DIR, 'fasano-rj.json'), 'utf-8');
    const data = JSON.parse(content);
    const enrichment = data.enrichment ?? {};
    const structured = mapToTaxonomy(enrichment);

    const mergePayload = {
      ...structured,
      _enrichment_version: '2.0-test',
      _enriched_at: new Date().toISOString(),
      _ingested_at: new Date().toISOString(),
    };

    // Persist
    await sql`
      UPDATE hotels SET
        data = data || ${sql.json(mergePayload as never)}::jsonb,
        updated_at = now()
      WHERE slug = 'fasano-rj'
    `;

    // Verify
    const result = await sql<{ data: Record<string, unknown> }[]>`
      SELECT data FROM hotels WHERE slug = 'fasano-rj' LIMIT 1
    `;

    expect(result.length).toBe(1);
    const hotelData = result[0]!.data;

    // Check structured taxonomy exists
    expect(hotelData['identity']).toBeDefined();
    expect(hotelData['gastronomy']).toBeDefined();
    expect(hotelData['_enrichment_version']).toBe('2.0-test');
  });

  it('should query hotel details by category after ingest', async () => {
    // Verify data exists
    const result = await sql<{ data: Record<string, unknown> }[]>`
      SELECT data FROM hotels WHERE slug = 'fasano-rj' LIMIT 1
    `;

    const data = result[0]!.data;

    // Extract identity category
    const identity = data['identity'] as Record<string, unknown> | undefined;
    if (identity) {
      expect(identity['description']).toBeDefined();
    }

    // Extract gastronomy category
    const gastronomy = data['gastronomy'] as Record<string, unknown> | undefined;
    if (gastronomy) {
      expect(gastronomy['restaurants']).toBeDefined();
    }
  });

  it('should be idempotent (re-ingest produces same result)', async () => {
    const content = readFileSync(join(ENRICHMENT_DIR, 'fasano-rj.json'), 'utf-8');
    const data = JSON.parse(content);
    const enrichment = data.enrichment ?? {};
    const structured = mapToTaxonomy(enrichment);

    const mergePayload = {
      ...structured,
      _enrichment_version: '2.0-test',
      _enriched_at: new Date().toISOString(),
      _ingested_at: new Date().toISOString(),
    };

    // First ingest
    await sql`
      UPDATE hotels SET
        data = data || ${sql.json(mergePayload as never)}::jsonb,
        updated_at = now()
      WHERE slug = 'fasano-rj'
    `;

    const first = await sql<{ data: Record<string, unknown> }[]>`
      SELECT data FROM hotels WHERE slug = 'fasano-rj' LIMIT 1
    `;

    // Second ingest (should not duplicate or lose data)
    await sql`
      UPDATE hotels SET
        data = data || ${sql.json(mergePayload as never)}::jsonb,
        updated_at = now()
      WHERE slug = 'fasano-rj'
    `;

    const second = await sql<{ data: Record<string, unknown> }[]>`
      SELECT data FROM hotels WHERE slug = 'fasano-rj' LIMIT 1
    `;

    // Identity category should be identical
    expect(second[0]!.data['identity']).toEqual(first[0]!.data['identity']);
    expect(second[0]!.data['gastronomy']).toEqual(first[0]!.data['gastronomy']);
  });

  it('should verify enrichment count query (AC11)', async () => {
    const result = await sql<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM hotels
      WHERE data->>'_enrichment_version' IS NOT NULL
         OR data #>> '{identity,description}' IS NOT NULL
    `;

    // At least fasano-rj should have been enriched
    expect(result[0]!.total).toBeGreaterThan(0);
  });
});
