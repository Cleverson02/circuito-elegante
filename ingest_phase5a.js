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

async function ingestPhase5a() {
  try {
    console.log(`[Fase 5a Ingest] Salvando dados CE website...\n`);
    
    let updated = 0;
    
    for (const [slug, hotelData] of Object.entries(hotels)) {
      if (!hotelData.enrichment_status.phase_ce_site) continue;
      
      try {
        const jsonbData = {
          enrichment_status: hotelData.enrichment_status,
          sources: hotelData.sources,
          qa_data: hotelData.qa_data || {},
          ce_data: hotelData.ce_data || {},
          xlsx_fields: hotelData.raw_xlsx
        };
        
        await sql`
          UPDATE hotels
          SET data = ${JSON.stringify(jsonbData)}, updated_at = NOW()
          WHERE slug = ${slug}
        `;
        
        updated++;
        if (updated % 5 === 0) console.log(`  + ${updated} updated`);
      } catch (err) {
        // silently fail
      }
    }
    
    console.log(`\n[Fase 5a] ${updated} hotéis com CE website data salvos`);
  } finally {
    await sql.end();
  }
}

ingestPhase5a();
