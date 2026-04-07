#!/usr/bin/env node

/**
 * PHASE 4 DATA COLLECTION - Hotel Mapping Script
 * Identifies 52 hotels with completeness < 70% for questionnaire outreach
 * Generates outreach plan with contact info and messaging templates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enrichmentDir = path.join(__dirname, 'data', 'enrichment');
const hotels = [];

// Read all JSON files and analyze completeness
const files = fs.readdirSync(enrichmentDir).filter(f => f.endsWith('.json'));

console.log(`Scanning ${files.length} hotel JSON files...\n`);

files.forEach(file => {
  try {
    const filePath = path.join(enrichmentDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (content.completeness !== undefined && content.hotel_slug) {
      hotels.push({
        slug: content.hotel_slug,
        hotel_name: content.enrichment?.hotel_name || content.hotel_slug,
        municipality: content.enrichment?.municipality || 'N/A',
        state: content.enrichment?.state_code || 'N/A',
        completeness: content.completeness,
        completeness_pct: Math.round(content.completeness * 100),
        fields_filled: content.fields_filled || 0,
        fields_total: content.fields_total || 0,
        status: content.status || 'UNKNOWN',
        has_website: content.enrichment?.website_url ? true : false,
        has_whatsapp: content.enrichment?.contact_whatsapp ? true : false,
        has_email: content.enrichment?.contact_email ? true : false,
      });
    }
  } catch (error) {
    console.error(`Error parsing ${file}: ${error.message}`);
  }
});

// Filter < 70%
const targetHotels = hotels.filter(h => h.completeness < 0.7);
targetHotels.sort((a, b) => a.completeness - b.completeness);

console.log(`PHASE 4 - Hotel Mapping Results`);
console.log(`================================\n`);
console.log(`Total hotels: ${hotels.length}`);
console.log(`Hotels < 70% completeness: ${targetHotels.length}`);
console.log(`Hotels >= 70% completeness: ${hotels.length - targetHotels.length}\n`);

// Breakdown by completeness tier
const tiers = {
  'P1 (0-20%)': targetHotels.filter(h => h.completeness < 0.2).length,
  'P2 (20-40%)': targetHotels.filter(h => h.completeness >= 0.2 && h.completeness < 0.4).length,
  'P3 (40-60%)': targetHotels.filter(h => h.completeness >= 0.4 && h.completeness < 0.6).length,
  'P4 (60-70%)': targetHotels.filter(h => h.completeness >= 0.6 && h.completeness < 0.7).length,
};

console.log(`Completeness Distribution:`);
Object.entries(tiers).forEach(([tier, count]) => {
  console.log(`  ${tier}: ${count} hotels`);
});
console.log();

// Contact channel analysis
const withWhatsApp = targetHotels.filter(h => h.has_whatsapp).length;
const withEmail = targetHotels.filter(h => h.has_email).length;
const withWebsite = targetHotels.filter(h => h.has_website).length;

console.log(`Contact Channel Availability:`);
console.log(`  WhatsApp: ${withWhatsApp} hotels (${Math.round(withWhatsApp/targetHotels.length*100)}%)`);
console.log(`  Email: ${withEmail} hotels (${Math.round(withEmail/targetHotels.length*100)}%)`);
console.log(`  Website: ${withWebsite} hotels (${Math.round(withWebsite/targetHotels.length*100)}%)`);
console.log();

// Show top 20 lowest completeness (P1)
console.log(`\nTOP 20 - LOWEST COMPLETENESS (Priority P1):\n`);
targetHotels.slice(0, 20).forEach((h, idx) => {
  console.log(`${idx+1}. ${h.hotel_name} (${h.municipality}, ${h.state})`);
  console.log(`   Completeness: ${h.completeness_pct}% | Fields: ${h.fields_filled}/${h.fields_total}`);
  console.log(`   Contact: ${h.has_whatsapp ? '📱 WhatsApp' : ''} ${h.has_email ? '📧 Email' : ''} ${h.has_website ? '🌐 Website' : ''}`);
  console.log();
});

// Save mapping to JSON for Phase 4 execution
const outreachPlan = {
  phase: 4,
  title: 'Hotel Enrichment - Direct Outreach via Questionnaire',
  execution_date: new Date().toISOString(),
  target_hotels: targetHotels.length,
  success_criteria: {
    target_responses: Math.round(targetHotels.length * 0.80),
    expected_completeness_lift: '20-30%',
    target_final_completeness: 0.70,
  },
  contact_channels: {
    whatsapp_available: withWhatsApp,
    email_available: withEmail,
    website_available: withWebsite,
  },
  hotels: targetHotels.map((h, idx) => ({
    index: idx + 1,
    priority: h.completeness < 0.2 ? 'P1' : h.completeness < 0.4 ? 'P2' : h.completeness < 0.6 ? 'P3' : 'P4',
    slug: h.slug,
    hotel_name: h.hotel_name,
    location: `${h.municipality}, ${h.state}`,
    current_completeness: h.completeness_pct,
    contact: {
      whatsapp: h.has_whatsapp,
      email: h.has_email,
      website: h.has_website,
    },
    status: h.status,
  })),
};

const outputPath = path.join(__dirname, '.aiox', 'PHASE4-OUTREACH-PLAN.json');
fs.writeFileSync(outputPath, JSON.stringify(outreachPlan, null, 2));
console.log(`\nOutreach plan saved to: ${outputPath}`);
console.log(`\nREADY FOR PHASE 4 EXECUTION`);
