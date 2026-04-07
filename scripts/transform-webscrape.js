#!/usr/bin/env node

/**
 * transform-webscrape.js
 *
 * Transforma o formato de webscrape do web-scraper para o formato esperado.
 * Extrai dados de property_details, amenities, etc e os coloca em formato flat.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENRICHMENT_DIR = path.join(__dirname, '..', 'data', 'enrichment');

function transformWebscrapeFormat(data) {
  const fields = {};

  // Extrair dados do formato do web-scraper
  if (data.source?.official_website) {
    fields.website_url = data.source.official_website;
  }

  if (data.property_details) {
    const pd = data.property_details;

    // Location
    if (pd.location) {
      fields.municipality = pd.location.split(',')[0]?.trim();
      fields.nearby_attractions = pd.location;
    }

    // Accommodations
    if (pd.accommodations?.type) {
      fields.lodging_type = pd.accommodations.type;
    }

    // Amenities
    if (pd.amenities) {
      const amens = [];
      if (pd.amenities.outdoor?.length > 0) amens.push(...pd.amenities.outdoor);
      if (pd.amenities.wellness?.length > 0) amens.push(...pd.amenities.wellness);
      if (pd.amenities.dining?.length > 0) amens.push(...pd.amenities.dining);
      if (pd.amenities.entertainment?.length > 0) amens.push(...pd.amenities.entertainment);
      if (pd.amenities.business?.length > 0) amens.push(...pd.amenities.business);

      if (amens.length > 0) {
        fields.leisure_items = amens;
      }
    }

    // Description
    if (pd.classification) {
      fields.highlights = pd.classification;
    }
  }

  if (data.description) {
    fields.description = data.description;
  }

  // Contar campos não-null
  const fieldsCount = Object.values(fields).filter(v =>
    v !== null && v !== undefined && v !== '' && v !== 'null'
  ).length;

  return {
    website_url: fields.website_url,
    fields,
    fields_count: fieldsCount
  };
}

function main() {
  const files = fs.readdirSync(ENRICHMENT_DIR)
    .filter(f => f.endsWith('-webscrape.json'))
    .sort();

  console.log(`Transformando ${files.length} arquivos...`);

  files.forEach(file => {
    const filePath = path.join(ENRICHMENT_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const transformed = transformWebscrapeFormat(data);

    // Sobrescrever com formato transformado
    fs.writeFileSync(filePath, JSON.stringify(transformed, null, 2), 'utf-8');

    console.log(`[OK] ${file} -> ${transformed.fields_count} campos`);
  });

  console.log(`\n[PRONTO] ${files.length} arquivos transformados`);
}

main();
