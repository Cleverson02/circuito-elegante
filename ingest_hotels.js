#!/usr/bin/env node
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

async function ingestHotels() {
  try {
    console.log(`[Ingestao] Iniciando... ${Object.keys(hotels).length} hoteis\n`);
    
    let processed = 0;
    let failed = 0;
    
    for (const [slug, hotelData] of Object.entries(hotels)) {
      try {
        const jsonbData = {
          enrichment_status: hotelData.enrichment_status,
          sources: hotelData.sources,
          created_at: hotelData.created_at,
          xlsx_fields: hotelData.raw_xlsx
        };
        
        await sql`
          INSERT INTO hotels (slug, name, municipality, uf, region, experience, destination, data)
          VALUES (
            ${slug},
            ${hotelData.name},
            ${hotelData.municipality},
            ${hotelData.state},
            ${hotelData.region || 'Circuito Elegante'},
            ${hotelData.experience || 'Luxo'},
            ${hotelData.destination || 'Brasil'},
            ${JSON.stringify(jsonbData)}
          )
          ON CONFLICT (slug) DO UPDATE
          SET data = EXCLUDED.data, region = EXCLUDED.region, experience = EXCLUDED.experience, destination = EXCLUDED.destination, updated_at = NOW()
        `;
        
        processed++;
        if (processed % 10 === 0) console.log(`  ✓ ${processed}/${Object.keys(hotels).length}`);
      } catch (err) {
        failed++;
        if (failed === 1) console.error(`  ✗ Erro: ${err.message.split('\n')[0]}`);
      }
    }
    
    console.log(`\n[Concluido] ${processed} hoteis salvos em PostgreSQL!`);
    if (failed > 0) console.log(`[Atencao] ${failed} hoteis com erro`);
  } finally {
    await sql.end();
  }
}

ingestHotels().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
