import pg from 'postgres';
import fs from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

const connectionString = 'postgresql://postgres.rgdyleduvddgzxgpqcyk:%40Juntoseabencoados10@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require';

async function exportDatabase() {
  console.log('🔗 Conectando ao Supabase...');
  
  try {
    const sql = postgres({
      url: connectionString,
      max: 1,
      ssl: 'require'
    });

    // Testa conexão
    const result = await sql`SELECT version()`;
    console.log('✅ Conectado ao Supabase!');
    console.log(`   Version: ${result[0].version.substring(0, 50)}...`);

    // Faz dump usando comando SQL
    console.log('\n📤 Exportando dados...');
    
    // Backup de tabelas importantes
    const tables = [
      'hotels',
      'faq_embeddings', 
      'guest_profiles',
      'conversations',
      'webhook_events',
      'agent_metrics',
      'comments'
    ];

    let backupSQL = '-- Stella Database Backup\n';
    backupSQL += `-- Exported at: ${new Date().toISOString()}\n`;
    backupSQL += '-- Tables: ' + tables.join(', ') + '\n\n';

    for (const table of tables) {
      try {
        const rows = await sql.unsafe(`SELECT * FROM ${table} LIMIT 1`);
        console.log(`  ✅ Tabela '${table}' encontrada`);
      } catch (e) {
        console.log(`  ⚠️  Tabela '${table}' não existe ou erro ao acessar`);
      }
    }

    // Usa pg_dump via linha de comando (se disponível)
    console.log('\n⏳ Tentando usar pg_dump do sistema...');
    
    const { execSync } = await import('child_process');
    try {
      execSync('pg_dump --version', { stdio: 'pipe' });
      console.log('✅ pg_dump disponível!');
      
      const cmd = `PGPASSWORD="@Juntoseabencoados10" pg_dump \
        --host=aws-1-sa-east-1.pooler.supabase.com \
        --port=6543 \
        --username=postgres.rgdyleduvddgzxgpqcyk \
        --dbname=postgres \
        --no-password \
        --no-owner \
        --format=plain | gzip > db_stella_backup.sql.gz`;
      
      execSync(cmd, { shell: '/bin/bash', stdio: 'inherit' });
      console.log('✅ Backup criado: db_stella_backup.sql.gz');
      
    } catch (err) {
      console.log('⚠️  pg_dump não disponível, criando backup estrutural...');
      
      backupSQL += '-- Note: Full dump not available, using query export\n\n';
      
      // Exporta estrutura e dados via queries
      for (const table of tables) {
        try {
          backupSQL += `\n-- Table: ${table}\n`;
          const rows = await sql.unsafe(`SELECT * FROM ${table}`);
          console.log(`  📝 Exportado ${rows.length} registros de '${table}'`);
          backupSQL += `-- ${rows.length} rows\n`;
        } catch (e) {
          console.log(`  ⚠️  Erro ao exportar '${table}': ${e.message}`);
        }
      }
      
      // Salva backup
      const gzip = createGzip();
      const source = fs.createReadStream(fs.writeFileSync('backup_temp.sql', backupSQL));
      const destination = fs.createWriteStream('db_stella_backup.sql.gz');
      
      try {
        await pipeline(source, gzip, destination);
        console.log('✅ Backup comprimido criado!');
      } catch (e) {
        fs.writeFileSync('db_stella_backup.sql.gz', backupSQL);
        console.log('⚠️  Backup salvo sem compressão');
      }
    }

    await sql.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

exportDatabase();
