#!/usr/bin/env python3
"""
Hotel Enrichment Pipeline — YOLO Mode
93 hotéis, salvando incrementalmente por hotel
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime

# ============ CONFIGURAÇÃO ============
TAXONOMIA = {
    "1.1": {"cat": "Identidade", "field": "name", "source": "schema", "type": "string"},
    "1.2": {"cat": "Identidade", "field": "municipality", "source": "schema", "type": "string"},
    "1.3": {"cat": "Identidade", "field": "uf", "source": "schema", "type": "string"},
    "1.7": {"cat": "Identidade", "field": "website", "source": "form_q4", "type": "url"},
    "1.8": {"cat": "Identidade", "field": "google_maps_url", "source": "form_q5", "type": "url"},
    "1.9": {"cat": "Identidade", "field": "description", "source": "form_q6", "type": "text"},
    "1.10": {"cat": "Identidade", "field": "accommodation_type", "source": "form_q7", "type": "string"},
    
    "2.1": {"cat": "Acomodacoes", "field": "room_types", "source": "form_q8", "type": "array"},
    "2.3": {"cat": "Acomodacoes", "field": "room_amenities", "source": "form_q9", "type": "text"},
    
    "3.1": {"cat": "Infraestrutura", "field": "parking", "source": "form_q10", "type": "object"},
    "3.2": {"cat": "Infraestrutura", "field": "pool", "source": "form_q11", "type": "text"},
    "3.4": {"cat": "Infraestrutura", "field": "leisure_items", "source": "form_q16", "type": "array"},
    "3.5": {"cat": "Infraestrutura", "field": "wellness", "source": "form_q17", "type": "text"},
    "3.6": {"cat": "Infraestrutura", "field": "event_space", "source": "form_q20", "type": "object"},
    "3.7": {"cat": "Infraestrutura", "field": "wifi", "source": "form_q29", "type": "object"},
    
    "4.1": {"cat": "Gastronomia", "field": "restaurants", "source": "form_q13", "type": "array"},
    "4.2": {"cat": "Gastronomia", "field": "meals_included", "source": "form_q14", "type": "string"},
    "4.3": {"cat": "Gastronomia", "field": "special_dining", "source": "form_q15", "type": "text"},
    
    "5.1": {"cat": "Politicas", "field": "checkin_checkout", "source": "form_q21", "type": "object"},
    "5.2": {"cat": "Politicas", "field": "early_late", "source": "form_q22", "type": "text"},
    "5.3": {"cat": "Politicas", "field": "cancellation_policy", "source": "form_q26", "type": "text"},
    "5.4": {"cat": "Politicas", "field": "children_rules", "source": "form_q27", "type": "text"},
    
    "6.1": {"cat": "Acesso", "field": "airport_distance", "source": "form_q23", "type": "text"},
    "6.2": {"cat": "Acesso", "field": "transfer", "source": "form_q24", "type": "object"},
    
    "7.1": {"cat": "Experiencias", "field": "programming", "source": "form_q18", "type": "text"},
    "7.2": {"cat": "Experiencias", "field": "concierge_services", "source": "form_q19", "type": "text"},
    
    "8.1": {"cat": "Diferenciais", "field": "sales_arguments", "source": "form_q30", "type": "text"},
    "8.2": {"cat": "Diferenciais", "field": "awards", "source": "taxonomy", "type": "array"},
    "8.4": {"cat": "Diferenciais", "field": "star_rating", "source": "taxonomy", "type": "number"},
    
    "9.1": {"cat": "Conhecimento", "field": "guest_faqs", "source": "form_q25", "type": "array"},
    
    "10.4": {"cat": "Integracao", "field": "ce_page_url", "source": "taxonomy", "type": "url"},
}

# ============ CARREGA DADOS ============
print("[1/5] Carregando dados...")

with open('hoteis_index.json', 'r', encoding='utf-8') as f:
    hotel_index = json.load(f)

print(f"    Carregados {len(hotel_index)} hotéis do XLSX")

# ============ MAPEIA PARA TAXONOMIA ============
print("[2/5] Mapeando dados para taxonomia...")

enriched_hotels = {}
gap_analysis = {}

for slug, hotel_data in hotel_index.items():
    name = hotel_data['name']
    
    # Consolidar dados
    consolidated = {
        "_id": slug,
        "_name": name,
        "_city": hotel_data.get('city'),
        "_state": hotel_data.get('state'),
        "_source": "xlsx",  # Indicar que vem do XLSX
        "_created_at": datetime.now().isoformat(),
        "_gaps": []  # Campos que faltam para completar
    }
    
    # Iterar por taxonomia e popular
    filled = 0
    gaps = 0
    
    for tax_id, tax_def in TAXONOMIA.items():
        field_name = tax_def['field']
        
        # Tentar encontrar valor no raw_xlsx
        raw_value = hotel_data['raw_xlsx'].get(field_name) or \
                   hotel_data['raw_xlsx'].get(field_name.upper()) or None
        
        if raw_value:
            consolidated[field_name] = raw_value
            filled += 1
        else:
            consolidated['_gaps'].append(field_name)
            gaps += 1
    
    enriched_hotels[slug] = consolidated
    gap_analysis[slug] = {"filled": filled, "gaps": gaps, "coverage": f"{filled}/{len(TAXONOMIA)}"}

# ============ ESTATÍSTICAS ============
print("[3/5] Análise de gaps...")

total_filled = sum(g['filled'] for g in gap_analysis.values())
total_gaps = sum(g['gaps'] for g in gap_analysis.values())
avg_coverage = total_filled / (total_filled + total_gaps) * 100 if (total_filled + total_gaps) > 0 else 0

print(f"    Preenchidos: {total_filled}/{total_filled + total_gaps} campos")
print(f"    Cobertura média: {avg_coverage:.1f}%")
print(f"    Hotéis com dados completos: {sum(1 for g in gap_analysis.values() if g['gaps'] == 0)}/{len(hotel_index)}")

# ============ SALVA DADOS ============
print("[4/5] Salvando dados enriquecidos...")

output_file = 'hoteis_enriched.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(enriched_hotels, f, ensure_ascii=False, indent=2)

print(f"    Salvos em {output_file}")

# ============ GERA RELATÓRIO ============
print("[5/5] Gerando relatório...")

report = {
    "timestamp": datetime.now().isoformat(),
    "total_hotels": len(enriched_hotels),
    "fields_taxonomy": len(TAXONOMIA),
    "total_filled": total_filled,
    "total_gaps": total_gaps,
    "avg_coverage": f"{avg_coverage:.1f}%",
    "hotels_complete": sum(1 for g in gap_analysis.values() if g['gaps'] == 0),
    "top_gaps": sorted(
        [(field, sum(1 for h in enriched_hotels.values() if field in h['_gaps'])) 
         for field in TAXONOMIA.values()],
        key=lambda x: x[1],
        reverse=True
    )[:10]
}

print("\n" + "="*60)
print("RELATORIO DE ENRIQUECIMENTO — FASE 1 (XLSX)")
print("="*60)
print(f"Hotéis: {report['total_hotels']}")
print(f"Campos taxonomia: {report['fields_taxonomy']}")
print(f"Total preenchido: {report['total_filled']}/{report['total_filled'] + report['total_gaps']}")
print(f"Cobertura: {report['avg_coverage']}")
print(f"Hotéis 100% completos: {report['hotels_complete']}")
print(f"\nTop 10 campos faltando:")
for field, count in report['top_gaps']:
    print(f"  {field}: {count} hotéis")

# Salvar relatório
with open('enrichment_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)

print(f"\nRelatório salvo em enrichment_report.json")
print("\nProxima fase: Chatbot interview (HE_007) para preencher gaps...")

