import postgres from 'postgres';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'migrations');

async function runMigrations(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files\n`);

  for (const file of files) {
    const filePath = join(MIGRATIONS_DIR, file);
    const content = readFileSync(filePath, 'utf-8');

    console.log(`Applying: ${file}...`);
    try {
      await sql.unsafe(content);
      console.log(`  ✅ ${file}`);
    } catch (error) {
      console.error(`  ❌ ${file}:`, error instanceof Error ? error.message : error);
      await sql.end();
      process.exit(1);
    }
  }

  console.log(`\n✅ All ${files.length} migrations applied successfully`);

  // Verify tables
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log(`\nTables created: ${tables.length}`);
  for (const t of tables) {
    console.log(`  - ${t['table_name']}`);
  }

  await sql.end();
}

runMigrations();
