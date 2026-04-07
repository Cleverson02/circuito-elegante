#!/usr/bin/env node

/**
 * consolidate-phase3.js
 *
 * Consolida dados de Phase 3 (website scraping) nos JSONs de enriquecimento.
 *
 * Uso:
 *   node scripts/consolidate-phase3.js canto-do-irere-boutique-hotel
 *   node scripts/consolidate-phase3.js all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENRICHMENT_DIR = path.join(__dirname, '..', 'data', 'enrichment');
const WEBSCRAPE_DIR = path.join(__dirname, '..', 'data', 'enrichment');

/**
 * Calcula completeness (campos preenchidos / total)
 */
function calculateCompleteness(enrichment) {
  const TOTAL_FIELDS = 58;
  const filledFields = Object.values(enrichment).filter(v =>
    v !== null && v !== undefined && v !== '' && v !== 'null'
  ).length;
  return Math.round((filledFields / TOTAL_FIELDS) * 100) / 100;
}

/**
 * Consolida dados do website scraping no JSON de enriquecimento
 */
function consolidateHotel(slug, webscrapeData) {
  const jsonPath = path.join(ENRICHMENT_DIR, `${slug}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.error(`[ERRO] JSON não encontrado: ${jsonPath}`);
    return false;
  }

  // Ler JSON atual
  const hotel = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Mesclar dados do website
  const merged = {
    ...hotel.enrichment,
    ...(webscrapeData.fields || {})
  };

  // Atualizar enrichment
  hotel.enrichment = merged;
  hotel.status = 'P3_WITH_WEBSITE';
  hotel.enriched_at = new Date().toISOString();

  // Atualizar sources_consulted
  if (!hotel.sources_consulted) {
    hotel.sources_consulted = [];
  }
  if (!hotel.sources_consulted.includes('hotel_website')) {
    hotel.sources_consulted.push('hotel_website');
  }

  // Recalcular completeness
  const filledFields = Object.entries(merged)
    .filter(([k, v]) =>
      !k.startsWith('_') &&
      v !== null &&
      v !== undefined &&
      v !== '' &&
      v !== 'null' &&
      typeof v !== 'object'
    ).length;

  hotel.fields_filled = filledFields;
  hotel.fields_null = 58 - filledFields;
  hotel.completeness = calculateCompleteness(merged);
  hotel.quality_score = Math.min(hotel.completeness, 1.0);

  // Atualizar _meta
  if (!hotel.enrichment._meta) {
    hotel.enrichment._meta = {};
  }
  hotel.enrichment._meta.enriched_at = hotel.enriched_at;
  hotel.enrichment._meta.last_updated = hotel.enriched_at;
  hotel.enrichment._meta.status = 'P3_WITH_WEBSITE';

  if (!hotel.enrichment._meta.sources) {
    hotel.enrichment._meta.sources = {};
  }
  hotel.enrichment._meta.sources.hotel_website = {
    date: new Date().toISOString().split('T')[0],
    url: webscrapeData.website_url || null,
    fields_extracted: webscrapeData.fields_count || Object.keys(webscrapeData.fields || {}).length
  };

  // Salvar
  fs.writeFileSync(jsonPath, JSON.stringify(hotel, null, 2), 'utf-8');

  console.log(`[OK] ${slug}: ${hotel.fields_filled}/58 campos (${Math.round(hotel.completeness * 100)}%)`);
  return true;
}

/**
 * Main
 */
function main() {
  const arg = process.argv[2] || 'all';

  if (arg === 'all') {
    // Consolidar todos os arquivos -webscrape.json
    if (!fs.existsSync(WEBSCRAPE_DIR)) {
      console.error(`[ERRO] Diretório não encontrado: ${WEBSCRAPE_DIR}`);
      process.exit(1);
    }

    const files = fs.readdirSync(WEBSCRAPE_DIR)
      .filter(f => f.endsWith('-webscrape.json'))
      .sort();

    let success = 0;

    files.forEach(file => {
      const slug = file.replace('-webscrape.json', '');
      const webscrapeFile = path.join(WEBSCRAPE_DIR, file);
      const webscrapeData = JSON.parse(fs.readFileSync(webscrapeFile, 'utf-8'));

      if (consolidateHotel(slug, webscrapeData)) {
        success++;
      }
    });

    console.log(`\n[RESUMO] ${success}/${files.length} hotéis consolidados`);
  } else {
    // Consolidar um hotel específico
    const webscrapeFile = path.join(WEBSCRAPE_DIR, `${arg}-webscrape.json`);

    if (!fs.existsSync(webscrapeFile)) {
      console.error(`[ERRO] Arquivo não encontrado: ${webscrapeFile}`);
      process.exit(1);
    }

    const webscrapeData = JSON.parse(fs.readFileSync(webscrapeFile, 'utf-8'));
    consolidateHotel(arg, webscrapeData);
  }
}

main();
