import * as fs from "fs";
import * as path from "path";
import XLSX from "xlsx";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🏨 VALIDAÇÃO E LIMPEZA FINAL: 93 hotéis do XLSX\n");

  // 1. Ler XLSX
  const excelPath = path.join(process.cwd(), "data/lista-hoteis-circuito-elegante.xlsx");
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const xlsxHotels = new Map<string, string>();
  for (const row of rows) {
    const hotelName = (row["ESTABELECIMENTOS"] || "").toString().trim();
    if (hotelName && hotelName !== "ESTABELECIMENTOS") {
      const slug = slugify(hotelName);
      xlsxHotels.set(slug, hotelName);
    }
  }
  console.log(`✅ XLSX: ${xlsxHotels.size} hotéis\n`);

  // 2. Ler merged-v2
  const mergedDir = path.join(process.cwd(), "data/enrichment/merged-v2");
  const files = fs.readdirSync(mergedDir).filter(f => f.endsWith("-merged-v2.json"));

  const mergedHotels = new Map<string, string>();
  for (const file of files) {
    const slug = file.replace("-merged-v2.json", "");
    mergedHotels.set(slug, file);
  }
  console.log(`merged-v2: ${mergedHotels.size} arquivos\n`);

  // 3. Identificar para MANTER vs REMOVER
  const toKeep: string[] = [];
  const toRemove: string[] = [];

  for (const [slug, file] of mergedHotels.entries()) {
    if (xlsxHotels.has(slug)) {
      toKeep.push(slug);
    } else {
      toRemove.push(slug);
    }
  }

  console.log(`📊 ANÁLISE:`);
  console.log(`   Manter: ${toKeep.length} hotéis (estão no XLSX)`);
  console.log(`   Remover: ${toRemove.length} hotéis (NÃO estão no XLSX)\n`);

  if (toRemove.length > 0) {
    console.log(`🔴 Arquivos a REMOVER:\n`);
    toRemove.forEach(slug => {
      console.log(`   rm data/enrichment/merged-v2/${slug}-merged-v2.json`);
    });
  }

  // 4. Executar remoção
  console.log(`\n⚙️  Removendo ${toRemove.length} hotéis...\n`);
  for (const slug of toRemove) {
    const filePath = path.join(mergedDir, `${slug}-merged-v2.json`);
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Deletado: ${slug}`);
    } catch (e) {
      console.log(`   ❌ Erro ao deletar ${slug}: ${(e as Error).message}`);
    }
  }

  // 5. Verificar resultado final
  const finalFiles = fs.readdirSync(mergedDir).filter(f => f.endsWith("-merged-v2.json"));
  console.log(`\n✅ RESULTADO FINAL:`);
  console.log(`   Hotéis em merged-v2 agora: ${finalFiles.length}`);
  if (finalFiles.length === xlsxHotels.size) {
    console.log(`   ✅ PERFEITO! Alinhado com XLSX (${xlsxHotels.size})`);
  } else {
    console.log(`   ⚠️  Esperado ${xlsxHotels.size}, encontrado ${finalFiles.length}`);
  }
}

main().catch(console.error);
