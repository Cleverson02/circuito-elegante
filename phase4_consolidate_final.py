#!/usr/bin/env python3
"""
Fase 4: Consolidar dados finais (XLSX + MD) e preparar para JSONB
"""

import json
from datetime import datetime

with open('batch_enrich_checkpoint.json', 'r', encoding='utf-8') as f:
    checkpoint = json.load(f)

hotels = checkpoint['hotels']

print("[Fase 4] Consolidando dados finais...")

# ============ ANÁLISE DE COBERTURA ============
total_hotels = len(hotels)
with_xlsx = sum(1 for h in hotels.values() if h['enrichment_status']['phase_xlsx'])
with_md = sum(1 for h in hotels.values() if h['enrichment_status']['phase_md'])
coverage_by_hotel = {}

for slug, hotel_data in hotels.items():
    sources_count = len(hotel_data['sources'])
    fields_filled = 0
    
    # Contar campos preenchidos
    if hotel_data.get('qa_data'):
        fields_filled += len(hotel_data['qa_data'])
    
    # XLSX fields (básicos)
    raw_fields = hotel_data['raw_xlsx']
    if raw_fields.get('ESTABELECIMENTOS'):
        fields_filled += 1
    
    coverage_by_hotel[slug] = {
        'sources': sources_count,
        'fields': fields_filled,
        'completion': f"{min(100, fields_filled * 3)}%"  # Rough estimate
    }

# ============ ESTATÍSTICAS ============
stats = {
    'timestamp': datetime.now().isoformat(),
    'total_hotels': total_hotels,
    'with_xlsx': with_xlsx,
    'with_md': with_md,
    'with_both': sum(1 for h in hotels.values() if h['enrichment_status']['phase_xlsx'] and h['enrichment_status']['phase_md']),
    'avg_sources_per_hotel': round(sum(len(h['sources']) for h in hotels.values()) / total_hotels, 1),
    'avg_fields_per_hotel': round(sum(c['fields'] for c in coverage_by_hotel.values()) / total_hotels, 1),
    'sources_distribution': {
        'xlsx': with_xlsx,
        'md': with_md
    }
}

print(f"\nEstatísticas Consolidadas:")
print(f"  Total hotéis: {stats['total_hotels']}")
print(f"  Com XLSX: {stats['with_xlsx']} ({round(stats['with_xlsx']/stats['total_hotels']*100)}%)")
print(f"  Com MD: {stats['with_md']} ({round(stats['with_md']/stats['total_hotels']*100)}%)")
print(f"  Com AMBAS: {stats['with_both']}")
print(f"  Avg campos por hotel: {stats['avg_fields_per_hotel']}")

# ============ SALVAR CONSOLIDADO ============
with open('phase4_consolidation_report.json', 'w', encoding='utf-8') as f:
    json.dump({
        'stats': stats,
        'coverage_by_hotel': coverage_by_hotel
    }, f, indent=2, ensure_ascii=False)

print(f"\n[Fase 4] Consolidação completada")
print(f"Relatório salvo em phase4_consolidation_report.json")

