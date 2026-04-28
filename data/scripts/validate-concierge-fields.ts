import * as fs from "fs";
import * as path from "path";

// Campos CRÍTICOS que concierge precisa saber
const CONCIERGE_CRITICAL_FIELDS = [
  "1.1", // Nome
  "2.1", // Site
  "2.3", // Endereço
  "2.4", // Telefone
  "3.1", // Descrição
  "4.2", // Tipos de quarto
  "6.1", // Restaurantes
  "7.1", // Lazer/Atividades
  "8.1", // Check-in/out
  "9.3", // FAQs
];

async function main() {
  console.log("🏨 VALIDAÇÃO: Campos Críticos para Concierge\n");

  const mergedDir = path.join(process.cwd(), "data/enrichment/merged-v2");
  const files = fs.readdirSync(mergedDir).filter(f => f.endsWith("-merged-v2.json"));

  let totalHotels = 0;
  let hotelsWithAllCritical = 0;
  let hotelsWithGaps: Array<{name: string; missing: string[]; coverage: number}> = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(mergedDir, file), "utf-8"));
    totalHotels++;

    const missing: string[] = [];
    for (const field of CONCIERGE_CRITICAL_FIELDS) {
      if (!data.fields[field]?.value) {
        missing.push(field);
      }
    }

    const coverage = ((CONCIERGE_CRITICAL_FIELDS.length - missing.length) / CONCIERGE_CRITICAL_FIELDS.length) * 100;

    if (missing.length === 0) {
      hotelsWithAllCritical++;
    } else {
      hotelsWithGaps.push({
        name: data.name,
        missing,
        coverage,
      });
    }
  }

  console.log(`📊 RESULTADO:\n`);
  console.log(`Total de hotéis: ${totalHotels}`);
  console.log(`✅ Com todos campos críticos: ${hotelsWithAllCritical} (${((hotelsWithAllCritical/totalHotels)*100).toFixed(1)}%)`);
  console.log(`⚠️  Com campos faltando: ${hotelsWithGaps.length}\n`);

  if (hotelsWithGaps.length > 0) {
    console.log(`🔴 HOTÉIS COM GAPS CRÍTICOS:\n`);
    hotelsWithGaps.sort((a, b) => a.coverage - b.coverage);

    hotelsWithGaps.forEach((h, i) => {
      if (i < 20) { // Mostrar top 20
        console.log(`${(i+1).toString().padStart(2)}. ${h.name.padEnd(50)} | ${h.coverage.toFixed(1).padStart(5)}% | Faltam: ${h.missing.join(', ')}`);
      }
    });

    if (hotelsWithGaps.length > 20) {
      console.log(`... e mais ${hotelsWithGaps.length - 20} hotéis\n`);
    }
  }

  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    total_hotels: totalHotels,
    with_all_critical_fields: hotelsWithAllCritical,
    with_gaps: hotelsWithGaps.length,
    gaps_list: hotelsWithGaps,
  };

  fs.writeFileSync(
    path.join(mergedDir, "CONCIERGE-VALIDATION-REPORT.json"),
    JSON.stringify(report, null, 2)
  );

  console.log(`📄 Relatório salvo: data/enrichment/merged-v2/CONCIERGE-VALIDATION-REPORT.json`);
}

main().catch(console.error);
