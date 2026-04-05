#!/usr/bin/env python3
"""
Fase 2 V2: Parse MD com novo padrão
"""

import json
import re

with open('batch_enrich_checkpoint.json', 'r', encoding='utf-8') as f:
    checkpoint = json.load(f)
hotels = checkpoint['hotels']

print("[Fase 2] Parsing MD (v2)...")

md_path = r"C:\Dev\Projects\CE\data\faqs\Questionário de Informações - Hotéis Circuito Elegante.md"
with open(md_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Split por hotéis (# Titulo\n\n**Questionário...)
hotel_blocks = re.split(r'^# ([^\n]+)\n+\*\*Questionário', content, flags=re.MULTILINE)

md_data = {}
merged = 0

# Processar blocos (index 1,3,5... são nomes; 2,4,6... são conteúdos)
for i in range(1, len(hotel_blocks), 2):
    if i + 1 >= len(hotel_blocks):
        break
    
    hotel_name = hotel_blocks[i].strip()
    hotel_content = '**Questionário' + hotel_blocks[i + 1]
    
    # Extrair Q&A
    qa_dict = {}
    
    # Pattern: "N\. Pergunta: \n\n" seguido de conteúdo até próxima pergunta
    q_pattern = r'^(\d+)\\.\s+([^:\n]+):\s*\n+(.+?)(?=^\d+\\.|\Z)'
    matches = re.finditer(q_pattern, hotel_content, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        q_num = match.group(1)
        q_text = match.group(2).strip()
        answer_raw = match.group(3).strip()
        
        # Limpar resposta: remover ** e pegar primeiro parágrafo
        answer = re.sub(r'\*\*', '', answer_raw)
        answer = answer.split('\n\n')[0]  # Primeiro parágrafo
        answer = answer.replace('\n', ' ').strip()
        
        if answer and len(answer) > 5:
            qa_dict[q_num] = {'q': q_text, 'a': answer}
    
    if qa_dict:
        md_data[hotel_name] = qa_dict
        print(f"  {hotel_name[:45]:45s} → {len(qa_dict)} Q&A")
        
        # Tentar mergear com checkpoint
        for slug, hotel_data in hotels.items():
            hotel_name_lower = hotel_data['name'].lower()
            md_name_lower = hotel_name.lower()
            
            # Matching: procura por similaridade
            if hotel_name_lower in md_name_lower or md_name_lower in hotel_name_lower or \
               slug.replace('-', ' ') in md_name_lower:
                if 'qa_data' not in hotel_data:
                    hotel_data['qa_data'] = {}
                hotel_data['qa_data'].update(qa_dict)
                hotel_data['enrichment_status']['phase_md'] = True
                if 'md' not in hotel_data['sources']:
                    hotel_data['sources'].append('md')
                merged += 1
                break

print(f"\nTotal: {len(md_data)} hotéis com MD")
print(f"Merged: {merged} hotéis com checkpoint\n")

# Salvar
checkpoint['hotels'] = hotels
with open('batch_enrich_checkpoint.json', 'w', encoding='utf-8') as f:
    json.dump(checkpoint, f, indent=2, ensure_ascii=False)

print(f"[Fase 2] ✓ Checkpoint atualizado")
print(f"Hotéis com MD: {sum(1 for h in hotels.values() if h['enrichment_status']['phase_md'])}")

