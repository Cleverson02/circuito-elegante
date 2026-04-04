#!/usr/bin/env python3
"""
Fase 2: Parse Questionário MD e merge com dados XLSX
"""

import json
import re
from pathlib import Path

# ============ CARREGAR CHECKPOINT ============
with open('batch_enrich_checkpoint.json', 'r', encoding='utf-8') as f:
    checkpoint = json.load(f)

hotels = checkpoint['hotels']

# ============ PARSE MD ============
print("[Fase 2] Parsing Questionário de Informações...")

md_path = r"C:\Dev\Projects\CE\data\faqs\Questionário de Informações - Hotéis Circuito Elegante.md"
with open(md_path, 'r', encoding='utf-8') as f:
    md_content = f.read()

# Dividir por hotéis (# Titulo)
lines = md_content.split('\n')

md_hotels = {}
current_hotel = None
current_section = []

for i, line in enumerate(lines):
    # Detectar hotel (# Titulo, não Q-words)
    if line.startswith('# ') and not any(x in line for x in ['FORMULÁRIO', 'Questionário', 'currentDate']):
        # Salvar hotel anterior
        if current_hotel and current_section:
            md_hotels[current_hotel] = '\n'.join(current_section)
        
        current_hotel = line.replace('# ', '').strip()
        current_section = []
    elif current_hotel:
        current_section.append(line)

# Salvar último
if current_hotel and current_section:
    md_hotels[current_hotel] = '\n'.join(current_section)

print(f"  Encontrados {len(md_hotels)} hotéis no MD")

# ============ EXTRAIR Q&A ============
def extract_qa(text):
    """Extrair perguntas e respostas do texto"""
    qa_dict = {}
    
    # Pattern: "N. Pergunta:\n\n**Resposta**"
    # Mais flexível: procura por linha começando com número
    lines = text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Detectar pergunta (número. Texto:)
        match = re.match(r'^(\d+)\.\s+(.+?):\s*$', line)
        if match:
            q_num = match.group(1)
            q_text = match.group(2).strip()
            
            # Buscar resposta (próximas linhas não vazias)
            answer_lines = []
            i += 1
            while i < len(lines):
                resp_line = lines[i].strip()
                
                # Parar se próxima pergunta
                if re.match(r'^\d+\.', resp_line):
                    break
                
                # Parar em seção de outro hotel
                if resp_line.startswith('**Questionário'):
                    break
                
                # Adicionar resposta (remover ** e limpeza)
                if resp_line and not resp_line.startswith('#'):
                    answer_lines.append(resp_line.replace('**', ''))
                
                i += 1
            
            answer = ' '.join(answer_lines).strip()
            if answer:
                qa_dict[q_num] = {'q': q_text, 'a': answer}
            continue
        
        i += 1
    
    return qa_dict

# Parse todos os hotéis
md_data = {}
for hotel_name, text in md_hotels.items():
    qa = extract_qa(text)
    if qa:
        md_data[hotel_name] = qa
        print(f"  {hotel_name[:45]:45s} → {len(qa)} Q&A")

print(f"\nTotal: {len(md_data)} hotéis com dados do MD\n")

# ============ MERGE COM CHECKPOINT ============
print("[Fase 2] Merging MD + XLSX...")

# Mapear nomes MD para slugs
merged_count = 0
for md_hotel_name, qa_data in md_data.items():
    # Tentar encontrar hotel no checkpoint por nome similar
    found = False
    
    # Busca exata no nome
    for slug, hotel_data in hotels.items():
        hotel_name = hotel_data['name'].lower()
        md_name_lower = md_hotel_name.lower()
        
        # Matching: buscar por similaridade
        if hotel_name in md_name_lower or md_name_lower in hotel_name:
            # Merge Q&A
            if 'qa_data' not in hotel_data:
                hotel_data['qa_data'] = {}
            
            hotel_data['qa_data'].update(qa_data)
            hotel_data['enrichment_status']['phase_md'] = True
            hotel_data['sources'].append('md')
            merged_count += 1
            found = True
            break
    
    if not found:
        print(f"  [!] Não encontrado: {md_hotel_name}")

print(f"  Merged: {merged_count}/{len(md_data)} hotéis")

# ============ SALVAR CHECKPOINT ============
checkpoint['hotels'] = hotels
with open('batch_enrich_checkpoint.json', 'w', encoding='utf-8') as f:
    json.dump(checkpoint, f, indent=2, ensure_ascii=False)

print(f"\n[Fase 2] Checkpoint atualizado com dados MD")
print(f"Status: {sum(1 for h in hotels.values() if h['enrichment_status']['phase_md'])} hotéis com MD")

