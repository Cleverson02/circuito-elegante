import * as fs from "fs";
import * as path from "path";

interface HotelData {
  name: string;
  slug: string;
  template_coverage: number;
  gap_fields: string[];
  fields: Record<string, any>;
}

const CONCIERGE_CRITICAL = ["1.1", "2.1", "2.3", "2.4", "3.1", "4.2", "6.1", "7.1", "8.1", "9.3"];

function classifyByCoat(coverage: number): { tier: string; emoji: string } {
  if (coverage >= 0.9) return { tier: "GOLD", emoji: "🥇" };
  if (coverage >= 0.8) return { tier: "GOOD", emoji: "🥈" };
  if (coverage >= 0.5) return { tier: "FAIR", emoji: "🥉" };
  return { tier: "POOR", emoji: "❌" };
}

async function main() {
  console.log("🏨 CLASSIFICAÇÃO DE HOTÉIS POR PRIORIDADE DE ENRIQUECIMENTO\n");

  const mergedDir = path.join(process.cwd(), "data/enrichment/merged-v2");
  const files = fs.readdirSync(mergedDir).filter(f => f.endsWith("-merged-v2.json"));

  // Ler FAQ hotéis
  const faqReportPath = path.join(mergedDir, "FAQ-VALIDATION-REPORT.json");
  const faqReport = JSON.parse(fs.readFileSync(faqReportPath, "utf-8"));
  const faqSlugs = new Set(faqReport.details.map((h: any) => h.slug));

  const hotels: Array<HotelData & { faqRespondent: boolean; coverage_tier: string; emoji: string; critical_fields_count: number }> = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(mergedDir, file), "utf-8")) as HotelData;
    
    // Count critical fields
    let criticalCount = 0;
    for (const field of CONCIERGE_CRITICAL) {
      if (data.fields[field]?.value) criticalCount++;
    }

    const isFaqRespondent = faqSlugs.has(data.slug);
    const { tier, emoji } = classifyByCoat(data.template_coverage);

    hotels.push({
      ...data,
      faqRespondent: isFaqRespondent,
      coverage_tier: tier,
      emoji,
      critical_fields_count: criticalCount,
    });
  }

  // Categorize
  const gold = hotels.filter(h => h.template_coverage >= 0.9);
  const good = hotels.filter(h => h.template_coverage >= 0.8 && h.template_coverage < 0.9);
  const fair = hotels.filter(h => h.template_coverage >= 0.5 && h.template_coverage < 0.8);
  const poor = hotels.filter(h => h.template_coverage < 0.5);

  console.log(`📊 RESUMO (Total: ${hotels.length} hotéis)\n`);
  console.log(`🥇 GOLD   (≥90%): ${gold.length} hotéis — NÃO NECESSITAM ENRIQUECIMENTO`);
  console.log(`🥈 GOOD   (80-89%): ${good.length} hotéis — MANUTENÇÃO/COMPLEMENTAÇÃO`);
  console.log(`🥉 FAIR   (50-79%): ${fair.length} hotéis — ENRIQUECIMENTO PRIORITÁRIO`);
  console.log(`❌ POOR   (<50%): ${poor.length} hotéis — ENRIQUECIMENTO CRÍTICO\n`);

  console.log(`📋 HOTÉIS RESPONDENTES FAQ: ${faqSlugs.size}/92\n`);

  // Details por tier
  console.log("═══════════════════════════════════════════════════════════════════\n");
  
  console.log(`🥇 GOLD (${gold.length}) - COMPLETOS, NÃO ENRIQUECER:\n`);
  gold.forEach((h, i) => {
    const faqMark = h.faqRespondent ? " [FAQ]" : "";
    console.log(`${(i+1).toString().padStart(2)}. ${h.name.padEnd(45)} | ${(h.template_coverage * 100).toFixed(1)}% | ${h.critical_fields_count}/10 críticos${faqMark}`);
  });

  console.log(`\n🥈 GOOD (${good.length}) - ACIMA DO MÍNIMO, MANUTENÇÃO:\n`);
  good.forEach((h, i) => {
    const faqMark = h.faqRespondent ? " [FAQ]" : "";
    console.log(`${(i+1).toString().padStart(2)}. ${h.name.padEnd(45)} | ${(h.template_coverage * 100).toFixed(1)}% | ${h.critical_fields_count}/10 críticos${faqMark}`);
  });

  console.log(`\n🥉 FAIR (${fair.length}) - ENRIQUECIMENTO PRIORITÁRIO:\n`);
  fair.sort((a, b) => b.template_coverage - a.template_coverage);
  fair.forEach((h, i) => {
    const faqMark = h.faqRespondent ? " [FAQ]" : "";
    console.log(`${(i+1).toString().padStart(2)}. ${h.name.padEnd(45)} | ${(h.template_coverage * 100).toFixed(1)}% | ${h.critical_fields_count}/10 críticos | Faltam: ${h.gap_fields.length}${faqMark}`);
  });

  console.log(`\n❌ POOR (${poor.length}) - ENRIQUECIMENTO CRÍTICO:\n`);
  poor.sort((a, b) => b.template_coverage - a.template_coverage);
  poor.forEach((h, i) => {
    const faqMark = h.faqRespondent ? " [FAQ]" : "";
    console.log(`${(i+1).toString().padStart(2)}. ${h.name.padEnd(45)} | ${(h.template_coverage * 100).toFixed(1)}% | ${h.critical_fields_count}/10 críticos | Faltam: ${h.gap_fields.length}${faqMark}`);
  });

  // Save priority list
  const priorityList = {
    timestamp: new Date().toISOString(),
    total_hotels: hotels.length,
    classification: {
      gold: { count: gold.length, hotels: gold.map(h => ({ name: h.name, slug: h.slug, coverage: h.template_coverage, critical: h.critical_fields_count })) },
      good: { count: good.length, hotels: good.map(h => ({ name: h.name, slug: h.slug, coverage: h.template_coverage, critical: h.critical_fields_count })) },
      fair: { count: fair.length, hotels: fair.map(h => ({ name: h.name, slug: h.slug, coverage: h.template_coverage, critical: h.critical_fields_count, missing_fields: h.gap_fields.length })) },
      poor: { count: poor.length, hotels: poor.map(h => ({ name: h.name, slug: h.slug, coverage: h.template_coverage, critical: h.critical_fields_count, missing_fields: h.gap_fields.length })) },
    },
    enrichment_queue: [
      ...poor.sort((a, b) => b.template_coverage - a.template_coverage),
      ...fair.sort((a, b) => b.template_coverage - a.template_coverage),
    ].map(h => ({ name: h.name, slug: h.slug, coverage: (h.template_coverage * 100).toFixed(1), gaps: h.gap_fields.length })),
  };

  fs.writeFileSync(
    path.join(mergedDir, "HOTEL-ENRICHMENT-PRIORITY.json"),
    JSON.stringify(priorityList, null, 2)
  );

  console.log(`\n✅ Priorização salva: data/enrichment/merged-v2/HOTEL-ENRICHMENT-PRIORITY.json`);
  console.log(`\n🎯 PRÓXIMA RODADA DE ENRIQUECIMENTO: Começar pelos ${fair.length + poor.length} hotéis FAIR+POOR`);
}

main().catch(console.error);
