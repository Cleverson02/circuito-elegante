#!/usr/bin/env node

/**
 * monitor-phase3.js
 *
 * Dashboard de monitoramento Phase 3 em tempo real
 * Rastreia progresso de consolidação de 5 lotes paralelos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENRICHMENT_DIR = path.join(__dirname, '..', 'data', 'enrichment');

function getMetrics() {
  // Contar webscrape files por lote
  const files = fs.readdirSync(ENRICHMENT_DIR);
  const webscrapeFiles = files.filter(f => f.endsWith('-webscrape.json'));

  // Analisar hotéis consolidados
  const hoteis = [];
  for (const f of files) {
    if (f.endsWith('.json') && !f.endsWith('-webscrape.json')) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(ENRICHMENT_DIR, f), 'utf-8'));
        hoteis.push({
          slug: data.hotel_slug || f.replace('.json', ''),
          status: data.status || 'UNKNOWN',
          completeness: data.completeness || 0,
          fields: data.fields_filled || 0,
          sources: (data.sources_consulted || []).length
        });
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  // Agrupar por completeness
  const byCompleteness = {
    low: hoteis.filter(h => h.completeness < 0.25).length,
    mid: hoteis.filter(h => h.completeness >= 0.25 && h.completeness < 0.5).length,
    good: hoteis.filter(h => h.completeness >= 0.5 && h.completeness < 0.7).length,
    great: hoteis.filter(h => h.completeness >= 0.7).length
  };

  // Agrupar por status
  const byStatus = {};
  for (const h of hoteis) {
    if (!byStatus[h.status]) byStatus[h.status] = 0;
    byStatus[h.status]++;
  }

  return {
    timestamp: new Date().toISOString(),
    webscrapeReady: webscrapeFiles.length,
    hotelsAnalyzed: hoteis.length,
    avgCompleteness: hoteis.length > 0 ? (hoteis.reduce((sum, h) => sum + h.completeness, 0) / hoteis.length) : 0,
    byCompleteness,
    byStatus,
    hotelsSummary: hoteis
  };
}

function printReport(metrics) {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    PHASE 3 — ENRICHMENT PROGRESS MONITOR                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Timestamp: ${metrics.timestamp}`);
  console.log();
  console.log(`WEBSCRAPE FILES:`);
  console.log(`  Ready to consolidate: ${metrics.webscrapeReady}/57 lotes`);
  console.log();
  console.log(`HOTELS ANALYZED: ${metrics.hotelsAnalyzed}/92`);
  console.log(`  Avg Completeness: ${(metrics.avgCompleteness * 100).toFixed(1)}%`);
  console.log();
  console.log(`COMPLETENESS DISTRIBUTION:`);
  console.log(`  < 25%:    ${metrics.byCompleteness.low.toString().padStart(3)} hotels`);
  console.log(`  25-50%:   ${metrics.byCompleteness.mid.toString().padStart(3)} hotels`);
  console.log(`  50-70%:   ${metrics.byCompleteness.good.toString().padStart(3)} hotels`);
  console.log(`  >= 70%:   ${metrics.byCompleteness.great.toString().padStart(3)} hotels (GOAL: 85+)`);
  console.log();
  console.log(`BY STATUS:`);
  for (const [status, count] of Object.entries(metrics.byStatus).sort()) {
    console.log(`  ${status.padEnd(15)} ${count.toString().padStart(3)} hotels`);
  }
  console.log();
  console.log(`NEXT STEPS:`);
  if (metrics.webscrapeReady < 57) {
    console.log(`  [ ] Waiting for ${57 - metrics.webscrapeReady} more webscrape files...`);
  } else {
    console.log(`  [x] All webscrape files ready`);
  }
  if (metrics.byCompleteness.great < 85) {
    const gap = 85 - metrics.byCompleteness.great;
    console.log(`  [ ] ${gap} more hotels needed to reach goal of 85 @ >= 70%`);
    console.log(`      Consider Phase 4 (chatbot) for gaps`);
  } else {
    console.log(`  [x] GOAL REACHED: ${metrics.byCompleteness.great}/92 >= 70%`);
  }
  console.log();
  console.log('Press Ctrl+C to exit');
}

// Main
const metrics = getMetrics();
printReport(metrics);

// Auto-refresh every 10 seconds
setInterval(() => {
  const updated = getMetrics();
  printReport(updated);
}, 10000);
