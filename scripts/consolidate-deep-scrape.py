#!/usr/bin/env python3
"""
Consolidate deep scrape data into hotel enrichment JSONs
Uses WebSearch triangulation data
"""

import json
import os
from datetime import datetime

enrichment_dir = 'data/enrichment/'

# Dados consolidados via WebSearch + Triangulação
deep_scrape_data = {
    'kurotel-spa': {
        'website_url': 'https://www.kurotel.com.br',
        'fields': {
            'lodging_type': 'Spa Resort - Medical Wellness Center',
            'municipality': 'Gramado',
            'state_code': 'RS',
            'address_street': 'R. Nacoes Unidas, 533',
            'address_neighborhood': 'Bavaria',
            'total_rooms': 20,
            'meals_included': 'Breakfast + 5 meals per day',
            'check_in_out': {'check_in': '14:00', 'check_out': '12:00'},
            'accessibility': True,
            'wifi': {'included': True},
            'price_tier': '$$$$',
            'star_rating': 5,
            'description': 'Medical wellness spa center with longevity programs',
            'wellness': 'Spa, sauna, medical wellness center',
            'leisure_items': ['Pool', 'Spa', 'Sauna', 'Daily activities', 'Longevity center'],
            'activities_tours': ['Water aerobics', 'Dance classes', 'Tai chi', 'Yoga meditation', 'Health programs']
        }
    },
    'madeiro-beach-hotel': {
        'website_url': 'https://www.madeirobeachhotel.com/en',
        'fields': {
            'lodging_type': 'Luxury Beach Resort',
            'municipality': 'Tibau do Sul',
            'state_code': 'RN',
            'total_rooms': 16,
            'meals_included': 'Breakfast included',
            'restaurants': [
                {'name': 'Main Restaurant', 'hours': '14:00-22:00', 'cuisine': 'International seafood'},
                {'name': 'Beach Bar', 'hours': '10:00-17:00'}
            ],
            'leisure_items': ['Pool', 'Spa', 'Yoga', 'Beach access'],
            'wellness': 'Spa with deep-tissue massages',
            'activities_tours': ['Yoga classes', 'Spa treatments', 'Beach activities'],
            'parking': {'has_parking': True, 'is_free': True},
            'wifi': {'included': True},
            'accessibility': True,
            'price_tier': '$$$$',
            'star_rating': 4,
            'description': 'Luxury eco-friendly beach resort with ocean-view lodges',
            'sustainability': 'Eco-friendly design'
        }
    },
    'pousada-cantelli': {
        'website_url': 'https://www.pousadacantelli.com.br/',
        'fields': {
            'lodging_type': 'Boutique Pousada - Wine Country',
            'municipality': 'Bento Goncalves',
            'state_code': 'RS',
            'total_rooms': 8,
            'meals_included': 'Breakfast (highly praised)',
            'amenities': 'WiFi, minibar, TV, AC, fireplace, hydromassage bath, bicycles',
            'leisure_items': ['Bicycles', 'Garden', 'Fireplace', 'Wine region access'],
            'activities_tours': ['Vineyard tours', 'Wine tasting', 'Caminhos de Pedra', 'Winery visits'],
            'pet_policy': {'accepts_pets': True},
            'parking': {'has_parking': True, 'is_free': True},
            'wifi': {'included': True},
            'accessibility': True,
            'price_tier': '$$$',
            'star_rating': 4,
            'description': 'Boutique pousada in historic 1878 house, wine region Serra Gauca',
            'awards_certifications': ['Top 20 Best Inns in Brazil (TripAdvisor)'],
            'nearby_attractions': 'Wineries, Aurora Winery, Caminhos de Pedra'
        }
    }
}

# Consolidar nos JSONs
success = 0
for slug, data in deep_scrape_data.items():
    json_path = os.path.join(enrichment_dir, f'{slug}.json')
    if os.path.exists(json_path):
        try:
            hotel = json.load(open(json_path, encoding='utf-8'))

            # Mesclar dados
            hotel['enrichment'].update(data.get('fields', {}))
            hotel['status'] = 'P3_WITH_DEEP_SCRAPE'
            hotel['enriched_at'] = datetime.now().isoformat()

            # Atualizar sources
            if 'hotel_website' not in hotel.get('sources_consulted', []):
                hotel['sources_consulted'].append('hotel_website')

            # Recalcular completeness
            filled = len([v for k, v in hotel['enrichment'].items()
                         if v and not k.startswith('_') and v != 'null' and str(v).strip()])
            hotel['fields_filled'] = filled
            hotel['fields_null'] = 58 - filled
            hotel['completeness'] = min(filled / 58, 1.0)
            hotel['quality_score'] = min(hotel['completeness'], 1.0)

            json.dump(hotel, open(json_path, 'w', encoding='utf-8'), indent=2)
            print(f"OK {slug}: {filled}/58 ({hotel['completeness']:.0%})")
            success += 1
        except Exception as e:
            print(f"ERROR {slug}: {e}")

print(f"\nConsolidated {success}/3 hotels from deep scrape")
