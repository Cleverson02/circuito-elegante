import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { registerHealthChecker } from '../api/health.js';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sql: ReturnType<typeof postgres> | null = null;

export function getDatabase() {
  if (db) return db;

  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  sql = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  db = drizzle(sql, { schema });

  // Register health checkers
  registerHealthChecker('database', async () => {
    try {
      const client = getPostgresClient();
      await client`SELECT 1`;
      return { status: 'connected' };
    } catch (error) {
      return {
        status: 'error',
        details: { message: error instanceof Error ? error.message : 'Connection failed' },
      };
    }
  });

  registerHealthChecker('hotels_count', async () => {
    try {
      const client = getPostgresClient();
      const result = await client`SELECT COUNT(*)::int as count FROM hotels`;
      const count = (result[0]?.['count'] as number) ?? 0;
      return {
        status: 'connected',
        details: { hotels_count: count },
      };
    } catch (error) {
      return {
        status: 'error',
        details: { message: error instanceof Error ? error.message : 'Query failed' },
      };
    }
  });

  return db;
}

export function getPostgresClient() {
  if (sql) return sql;

  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  sql = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return sql;
}

export async function closeDatabase(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
    db = null;
  }
}

export { schema };
