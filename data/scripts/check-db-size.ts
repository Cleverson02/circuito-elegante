import { sql } from 'drizzle-orm';
import { db } from '../backend/database/db.ts';

try {
  console.log('🔍 Conectando ao Supabase...\n');
  
  // Tamanho de cada tabela
  const tables = await db.execute(sql`
    SELECT 
      schemaname,
      tablename,
      ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  `);
  
  console.log('📊 TAMANHO DE CADA TABELA:\n');
  console.log('Tabela'.padEnd(40) + 'Tamanho'.padEnd(15) + 'Linhas');
  console.log('='.repeat(65));
  
  let totalSize = 0;
  for (const table of tables) {
    totalSize += table.size_mb;
    console.log(
      (table.tablename as string).padEnd(40) + 
      `${table.size_mb} MB`.padEnd(15) + 
      '?'
    );
  }
  
  console.log('='.repeat(65));
  console.log(`TOTAL BANCO DE DADOS: ${totalSize.toFixed(2)} MB\n`);
  
} catch (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}
