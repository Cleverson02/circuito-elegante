#!/usr/bin/env python3
"""
Iniciar enriquecimento em batch — 93 hotéis YOLO
Salvando incrementalmente. Delegando gaps ao web-scraper.
"""

import json
from datetime import datetime
from pathlib import Path

# Carregar dados
with open('hoteis_index.json', 'r') as f:
    hotels = json.load(f)

print(f"{'='*70}")
print(f"PIPELINE DE ENRIQUECIMENTO — 93 HOTÉIS — YOLO MODE")
print(f"{'='*70}\n")

print(f"FASE 1: DADOS DO XLSX (VALIDADOS)")
print(f"{'─'*70}")

# Consolidar dados XLSX em formato de ingestion
batch_data = {}
for slug, hotel_info in list(hotels.items())[:93]:
    name = hotel_info['name']
    
    # Estrutura incrementales
    batch_data[slug] = {
        "id": slug,
        "name": name,
        "municipality": hotel_info.get('city', ''),
        "state": hotel_info.get('state', ''),
        "raw_xlsx": hotel_info['raw_xlsx'],
        "enrichment_status": {
            "phase_xlsx": True,
            "phase_md": False,
            "phase_chatbot": False,
            "phase_ce_site": False,
            "phase_hotel_site": False
        },
        "created_at": datetime.now().isoformat(),
        "sources": ["xlsx"]
    }

print(f"✓ Consolidados {len(batch_data)} hotéis do XLSX")
print(f"✓ Status: Pronto para Phase 2 (MD + Chatbot + Scraping)")

# Salvar checkpoint
checkpoint_file = 'batch_enrich_checkpoint.json'
with open(checkpoint_file, 'w', encoding='utf-8') as f:
    json.dump({
        "timestamp": datetime.now().isoformat(),
        "total_hotels": len(batch_data),
        "processed": 0,
        "hotels": batch_data
    }, f, indent=2, ensure_ascii=False)

print(f"\nCheckpoint salvo em: {checkpoint_file}")

# Relatório de progresso
print(f"\n{'='*70}")
print(f"STATUS DO BATCH")
print(f"{'='*70}")
print(f"Total de hotéis: {len(batch_data)}")
print(f"Fases concluídas: 1/5 (XLSX)")
print(f"Próximas fases: MD → Chatbot → CE Site → Hotel Sites")
print(f"\nPrimeiros 5 hotéis:")
for i, (slug, data) in enumerate(list(batch_data.items())[:5], 1):
    print(f"{i}. {data['name']:40s} ({data['municipality']})")

