import * as fs from "fs";
import * as path from "path";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🏨 VALIDAÇÃO FAQ: Hotéis que responderam questionnaire\n");

  // 1. Extrair hotéis que responderam FAQ (do arquivo markdown)
  const faqPath = path.join(process.cwd(), "data/faqs/Questionário de Informações - Hotéis Circuito Elegante.md");
  const faqContent = fs.readFileSync(faqPath, "utf-8");

  // Buscar padrão "# Nome Hotel" (seções principais)
  const faqSections = faqContent.match(/^# [A-Za-z].+$/gm) || [];
  const faqHotels: {name: string; slug: string}[] = [];

  for (const section of faqSections) {
    const name = section.replace(/^# /, "").trim();
    // Skip cabeçalho e seções de amenities
    if (name !== "FORMULÁRIO" && !name.includes("Amenities") && !name.includes("higiene")) {
      const slug = slugify(name);
      faqHotels.push({name, slug});
    }
  }

  console.log(`📋 Hotéis que RESPONDERAM FAQ: ${faqHotels.length}\n`);
  console.log("Nomes encontrados:");
  faqHotels.forEach((h, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${h.name.padEnd(50)} | slug: ${h.slug}`);
  });

  // 2. Verificar se estão em merged-v2
  console.log(`\n📊 VALIDAÇÃO: Presença em merged-v2\n`);

  const mergedDir = path.join(process.cwd(), "data/enrichment/merged-v2");
  const files = fs.readdirSync(mergedDir).filter(f => f.endsWith("-merged-v2.json"));
  const mergedSlugs = new Set(files.map(f => f.replace("-merged-v2.json", "")));

  const faqInMerged: {name: string; slug: string; found: boolean}[] = [];
  const faqNotInMerged: string[] = [];

  for (const hotel of faqHotels) {
    if (mergedSlugs.has(hotel.slug)) {
      faqInMerged.push({...hotel, found: true});
    } else {
      faqNotInMerged.push(hotel.slug);
    }
  }

  console.log(`✅ Encontrados em merged-v2: ${faqInMerged.length}/${faqHotels.length}`);
  console.log(`❌ NÃO encontrados: ${faqNotInMerged.length}\n`);

  if (faqNotInMerged.length > 0) {
    console.log(`⚠️  Hotéis FAQ que faltam em merged-v2:`);
    faqNotInMerged.forEach(s => console.log(`   - ${s}`));
    console.log();
  }

  // 3. Verificar campos críticos nos hotéis FAQ
  console.log(`📋 VALIDAÇÃO: Campos críticos nos hotéis FAQ\n`);

  const CRITICAL_FIELDS = ["1.1", "2.1", "2.3", "2.4", "3.1", "4.2", "6.1", "7.1", "8.1", "9.3"];

  const report: Array<{
    name: string;
    slug: string;
    fields_total: number;
    critical_fields: number;
    missing_critical: string[];
    coverage: number;
  }> = [];

  for (const hotel of faqInMerged) {
    const filePath = path.join(mergedDir, `${hotel.slug}-merged-v2.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const missingCritical = CRITICAL_FIELDS.filter(f => !data.fields[f]?.value);
    const criticalCount = CRITICAL_FIELDS.length - missingCritical.length;
    const coverage = (criticalCount / CRITICAL_FIELDS.length) * 100;

    report.push({
      name: hotel.name,
      slug: hotel.slug,
      fields_total: Object.keys(data.fields || {}).length,
      critical_fields: criticalCount,
      missing_critical: missingCritical,
      coverage,
    });
  }

  // Ordenar por cobertura
  report.sort((a, b) => b.coverage - a.coverage);

  console.log(`HOTÉIS FAQ - STATUS DE CAMPOS CRÍTICOS:\n`);
  report.slice(0, 15).forEach((h, i) => {
    const status = h.missing_critical.length === 0 ? "✅" : "⚠️ ";
    console.log(`${status} ${(i+1).toString().padStart(2)}. ${h.name.padEnd(40)} | ${h.critical_fields}/${CRITICAL_FIELDS.length} campos críticos | Faltam: ${h.missing_critical.join(", ") || "nenhum"}`);
  });

  // 4. Estabelecer padrão mínimo
  console.log(`\n🎯 PADRÃO MÍNIMO PARA STELLA:\n`);

  const perfeitosCount = report.filter(h => h.missing_critical.length === 0).length;
  const mediaCobertura = (report.reduce((sum, h) => sum + h.coverage, 0) / report.length).toFixed(1);

  console.log(`Hotéis FAQ com TODOS campos críticos: ${perfeitosCount}/${faqInMerged.length}`);
  console.log(`Cobertura média dos hotéis FAQ: ${mediaCobertura}%`);
  console.log(`\n📌 PADRÃO MÍNIMO RECOMENDADO:`);
  console.log(`   - Nome (1.1), Site (2.1), Endereço (2.3), Telefone (2.4) - OBRIGATÓRIO`);
  console.log(`   - Descrição (3.1), Tipos quarto (4.2) - OBRIGATÓRIO`);
  console.log(`   - Restaurantes (6.1), Lazer (7.1), Check-in (8.1), FAQs (9.3) - RECOMENDADO`);
  console.log(`   - TODOS os 92 hotéis devem ter NO MÍNIMO dados do XLSX + FAQ (se responderam)`);

  // 5. Salvar relatório
  fs.writeFileSync(
    path.join(mergedDir, "FAQ-VALIDATION-REPORT.json"),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      total_faq_hotels: faqHotels.length,
      faq_hotels_in_merged: faqInMerged.length,
      faq_hotels_not_found: faqNotInMerged,
      details: report,
      standard: {
        must_have: ["1.1", "2.1", "2.3", "2.4", "3.1", "4.2"],
        should_have: ["6.1", "7.1", "8.1", "9.3"],
        all_critical: CRITICAL_FIELDS,
      }
    }, null, 2)
  );

  console.log(`\n✅ Relatório salvo: FAQ-VALIDATION-REPORT.json`);
}

main().catch(console.error);
