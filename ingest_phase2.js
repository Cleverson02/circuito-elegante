import postgres from 'postgres';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)="?(.+?)"?$/);
  if (match) envVars[match[1]] = match[2].replace(/"/g, '');
});

const checkpoint = JSON.parse(fs.readFileSync('batch_enrich_checkpoint.json', 'utf-8'));
const hotels = checkpoint.hotels;

const sql = postgres(envVars.DATABASE_URL);

async function ingestPhase2() {
  try {
    console.log(`[Fase 2 Ingest] Salvando dados MD em PostgreSQL...\n`);
    
    let updated = 0;
    
    for (const [slug, hotelData] of Object.entries(hotels)) {
      if (!hotelData.enrichment_status.phase_md) continue;
      
      try {
        const jsonbData = {
          enrichment_status: hotelData.enrichment_status,
          sources: hotelData.sources,
          qa_data: hotelData.qa_data || {},
          xlsx_fields: hotelData.raw_xlsx
        };
        
        await sql`
          UPDATE hotels
          SET data = ${JSON.stringify(jsonbData)}, updated_at = NOW()
          WHERE slug = ${slug}
        `;
        
        updated++;
        if (updated % 5 === 0) console.log(`  ✓ ${updated} updated`);
      } catch (err) {
        console.error(`  ✗ ${slug}: ${err.message.split('\n')[0]}`);
      }
    }
    
    console.log(`\n[Fase 2] ${updated} hotéis salvos com dados MD`);
  } finally {
    await sql.end();
  }
}

ingestPhase2().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
