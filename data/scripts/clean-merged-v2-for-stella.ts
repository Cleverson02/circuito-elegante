import * as fs from "fs";
import * as path from "path";
import XLSX from "xlsx";

interface MergedHotel {
  slug: string;
  name: string;
  template_coverage: number;
  template_fields: Record<string, boolean>;
  gap_fields: string[];
  fields: Record<string, any>;
  excel_data?: Record<string, any>;
  sources?: string[];
  source_priority?: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🏨 LIMPEZA MERGED-V2: Manter 93 (XLSX) + Fazer Merge Duplicatas");
  console.log("═══════════════════════════════════════════════════════════\n");

  // 1. Ler XLSX para obter lista oficial
  console.log("1️⃣  Lendo XLSX (lista oficial)...");
  const excelPath = path.join(process.cwd(), "data/lista-hoteis-circuito-elegante.xlsx");
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const xlsxHotels = new Set<string>();
  for (const row of rows) {
    const hotelName = (row["ESTABELECIMENTOS"] || "").toString().trim();
    if (hotelName && hotelName !== "ESTABELECIMENTOS") {
      const slug = slugify(hotelName);
      xlsxHotels.add(slug);
    }
  }
  console.log(`✅ ${xlsxHotels.size} hotéis no XLSX\n`);

  // 2. Ler merged-v2 JSON files
  console.log("2️⃣  Lendo merged-v2 JSON files...");
  const mergedDir = path.join(process.cwd(), "data/enrichment/merged-v2");
  const files = fs.readdirSync(mergedDir).filter(f => f.endsWith("-merged-v2.json"));

  const mergedHotels = new Map<string, MergedHotel>();
  for (const file of files) {
    const slug = file.replace("-merged-v2.json", "");
    const data = JSON.parse(fs.readFileSync(path.join(mergedDir, file), "utf-8"));
    mergedHotels.set(slug, data);
  }
  console.log(`✅ ${mergedHotels.size} hotéis em merged-v2\n`);

  // 3. Identificar hotéis para remover (não estão no XLSX)
  console.log("3️⃣  Identificando hotéis fora do XLSX...");
  const toRemove: string[] = [];
  const foundInXlsx: string[] = [];

  for (const slug of mergedHotels.keys()) {
    if (!xlsxHotels.has(slug)) {
      toRemove.push(slug);
    } else {
      foundInXlsx.push(slug);
    }
  }

  console.log(`⚠️  ${toRemove.length} hotéis em merged-v2 mas NÃO no XLSX:`);
  toRemove.forEach(s => console.log(`   - ${s}`));
  console.log(`✅ ${foundInXlsx.length} hotéis encontrados em ambos\n`);

  // 4. Identificar e mergear duplicatas
  console.log("4️⃣  Identificando duplicatas (mesmo nome, slugs diferentes)...\n");

  // Duplicatas conhecidas
  const duplicatePairs = [
    { a: "parador-lumiar-hotel-spa", b: "parador-lumiar", name: "PARADOR LUMIAR" },
    { a: "tiradentes-boutique-hotel", b: "tiradentes-boutique", name: "TIRADENTES BOUTIQUE" },
    { a: "valle-dincanto-hotel", b: "valle-d-incanto-hotel", name: "VALLE D'INCANTO" },
  ];

  for (const pair of duplicatePairs) {
    const hotelA = mergedHotels.get(pair.a);
    const hotelB = mergedHotels.get(pair.b);

    if (!hotelA || !hotelB) {
      console.log(`⚠️  ${pair.name}: Não encontrado (${pair.a} ou ${pair.b})`);
      continue;
    }

    console.log(`🔗 ${pair.name}:`);
    console.log(`   A: ${pair.a} (coverage: ${(hotelA.template_coverage * 100).toFixed(1)}%)`);
    console.log(`   B: ${pair.b} (coverage: ${(hotelB.template_coverage * 100).toFixed(1)}%)`);

    // Merger: pegar campos de ambos, preferindo o que tem mais dados
    const merged: MergedHotel = {
      slug: pair.b, // Usar slug mais curto/padrão
      name: hotelA.name || hotelB.name,
      template_coverage: Math.max(hotelA.template_coverage, hotelB.template_coverage),
      template_fields: hotelA.template_fields,
      gap_fields: [],
      fields: {},
      sources: [],
      source_priority: [],
    };

    // Merge de fields: para cada campo, pegar o que tem mais dados
    const allFields = new Set([
      ...Object.keys(hotelA.fields || {}),
      ...Object.keys(hotelB.fields || {}),
    ]);

    for (const fieldKey of allFields) {
      const fieldA = hotelA.fields?.[fieldKey];
      const fieldB = hotelB.fields?.[fieldKey];

      // Lógica: usar o que tem valor válido
      if (fieldA?.value && !fieldB?.value) {
        merged.fields[fieldKey] = fieldA;
      } else if (fieldB?.value && !fieldA?.value) {
        merged.fields[fieldKey] = fieldB;
      } else if (fieldA?.value && fieldB?.value) {
        // Ambos têm valor: usar o que tem source_type mais confiável (FAQ > outros)
        const sourceA = fieldA.source_type || "unknown";
        const sourceB = fieldB.source_type || "unknown";

        if (sourceA === "questionnaire" || sourceA === "faq") {
          merged.fields[fieldKey] = fieldA;
        } else if (sourceB === "questionnaire" || sourceB === "faq") {
          merged.fields[fieldKey] = fieldB;
        } else {
          // Se ambos têm valor e não são FAQ, usar o primeiro
          merged.fields[fieldKey] = fieldA;
        }
      } else if (!fieldA?.value && !fieldB?.value) {
        // Ambos vazios, pular
        continue;
      }
    }

    // Recalcular template_coverage e gap_fields
    const TEMPLATE_FIELDS = [
      "1.1", "1.2", "1.3", "1.4", "1.5",
      "2.1", "2.2", "2.3", "2.4",
      "3.1", "3.2",
      "4.1", "4.2", "4.3",
      "5.1", "5.2", "5.3",
      "6.1", "6.2", "6.3", "6.4",
      "7.1", "7.2", "7.3",
      "8.1", "8.2", "8.3", "8.4",
      "9.1", "9.2", "9.3",
      "10.1", "10.2",
    ];

    let filledCount = 0;
    for (const field of TEMPLATE_FIELDS) {
      if (merged.fields[field]?.value) {
        filledCount++;
      } else {
        merged.gap_fields.push(field);
      }
    }
    merged.template_coverage = filledCount / TEMPLATE_FIELDS.length;

    // Salvar merged
    const mergedPath = path.join(mergedDir, `${pair.b}-merged-v2.json`);
    fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2));

    console.log(`   ✅ MERGED → ${pair.b}`);
    console.log(`      Cobertura final: ${(merged.template_coverage * 100).toFixed(1)}%`);
    console.log(`      Campos preenchidos: ${filledCount}/${TEMPLATE_FIELDS.length}`);
    console.log(`      → Deletar: ${pair.a}\n`);
  }

  // 5. Resumo
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📊 RESUMO");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log(`XLSX: 93 hotéis oficiais`);
  console.log(`merged-v2: ${mergedHotels.size} hotéis`);
  console.log(`\nPara REMOVER (não estão no XLSX): ${toRemove.length} hotéis`);
  console.log(`Para MANTER (estão no XLSX): ${foundInXlsx.length} hotéis`);
  console.log(`Duplicatas a MERGEAR: 3 pares`);
  console.log(`\nResultado final esperado: 93 hotéis (sem duplicatas, merge completo)`);

  console.log("\n🎯 PRÓXIMOS PASSOS MANUAIS:");
  console.log(`1. Remover arquivos fora do XLSX:`);
  toRemove.forEach(s => {
    console.log(`   rm data/enrichment/merged-v2/${s}-merged-v2.json`);
  });
  console.log(`\n2. Remover arquivos duplicados (após merge):`);
  console.log(`   rm data/enrichment/merged-v2/parador-lumiar-hotel-spa-merged-v2.json`);
  console.log(`   rm data/enrichment/merged-v2/tiradentes-boutique-hotel-merged-v2.json`);
  console.log(`   rm data/enrichment/merged-v2/valle-dincanto-hotel-merged-v2.json`);

  console.log(`\n3. Verificar resultado:`);
  console.log(`   ls data/enrichment/merged-v2/*-merged-v2.json | wc -l`);
  console.log(`   (deve ser 93)`);
}

main().catch(console.error);
