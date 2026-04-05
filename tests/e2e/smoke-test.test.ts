/**
 * Smoke Test Suite — EPIC-1 Foundation Validation
 *
 * These tests validate that all foundation components are
 * working together end-to-end. They require:
 * - PostgreSQL with hotels data and pgvector extension
 * - Redis running
 * - Server running on PORT (default 3000)
 *
 * Run: DATABASE_URL=... REDIS_URL=... pnpm test:e2e
 */

const BASE_URL = process.env['SMOKE_TEST_URL'] ?? 'http://localhost:3000';

async function fetchJSON(path: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${BASE_URL}${path}`);
  const body = (await res.json()) as Record<string, unknown>;
  return { status: res.status, body };
}

describe('Smoke Tests — EPIC-1 Foundation', () => {
  describe('Health Endpoint', () => {
    it('GET /health returns 200 with consolidated status', async () => {
      const { status, body } = await fetchJSON('/health');
      expect(status).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('checks');

      const checks = body['checks'] as Record<string, unknown>;
      expect(checks).toHaveProperty('database');
      expect(checks).toHaveProperty('redis');
      expect(checks).toHaveProperty('vectordb');
      expect(checks).toHaveProperty('hotels_count');
    });

    it('GET /health status is ok when all deps healthy', async () => {
      const { body } = await fetchJSON('/health');
      expect(body['status']).toBe('ok');
    });

    it('GET /health/ready returns 200 when healthy', async () => {
      const { status, body } = await fetchJSON('/health/ready');
      expect(status).toBe(200);
      expect(body['status']).toBe('ok');
    });

    it('GET /health/live always returns 200', async () => {
      const { status, body } = await fetchJSON('/health/live');
      expect(status).toBe(200);
      expect(body['status']).toBe('alive');
    });
  });

  describe('Hotels Data', () => {
    it('hotels_count reports hotels in database', async () => {
      const { body } = await fetchJSON('/health');
      const checks = body['checks'] as Record<string, Record<string, unknown>>;
      const hotelsCheck = checks['hotels_count'];
      expect(hotelsCheck).toBeDefined();
      expect(hotelsCheck!['status']).toBe('connected');
      const details = hotelsCheck!['details'] as Record<string, unknown>;
      expect(details['hotels_count']).toBeGreaterThan(0);
    });
  });

  describe('Embeddings (pgvector)', () => {
    it('vectordb reports embeddings loaded', async () => {
      const { body } = await fetchJSON('/health');
      const checks = body['checks'] as Record<string, Record<string, unknown>>;
      const vectorCheck = checks['vectordb'];
      expect(vectorCheck).toBeDefined();
      expect(vectorCheck!['status']).toBe('connected');
      const details = vectorCheck!['details'] as Record<string, unknown>;
      expect(details['embeddings_loaded']).toBeGreaterThan(0);
    });
  });

  describe('Redis', () => {
    it('redis reports connected', async () => {
      const { body } = await fetchJSON('/health');
      const checks = body['checks'] as Record<string, Record<string, unknown>>;
      const redisCheck = checks['redis'];
      expect(redisCheck).toBeDefined();
      expect(redisCheck!['status']).toBe('connected');
    });
  });
});
