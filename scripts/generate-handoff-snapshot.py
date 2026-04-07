#!/usr/bin/env python3
"""Generate complete hotel status snapshot for handoff."""
import json, os

d = 'data/enrichment/'
results = []
for f in sorted(os.listdir(d)):
    if f.endswith('.json') and not f.endswith('-webscrape.json'):
        try:
            h = json.load(open(os.path.join(d, f), encoding='utf-8'))
            results.append({
                's': h.get('hotel_slug', f.replace('.json','')),
                'c': h.get('completeness', 0),
                'f': h.get('fields_filled', 0),
                'st': h.get('status', '?'),
                'w': (h.get('enrichment',{}).get('website_url','') or '')
            })
        except:
            pass

g70 = [r for r in results if r['c'] >= 0.7]
g50 = [r for r in results if 0.5 <= r['c'] < 0.7]
g25 = [r for r in results if 0.25 <= r['c'] < 0.5]
glow = [r for r in results if r['c'] < 0.25]

lines = []
lines.append(f'TOTAL: {len(results)} hoteis')
lines.append(f'>= 70%: {len(g70)}')
lines.append(f'50-69%: {len(g50)}')
lines.append(f'25-49%: {len(g25)}')
lines.append(f'< 25%:  {len(glow)}')
lines.append('')

lines.append('=== >= 70% (NAO TOCAR) ===')
for r in sorted(g70, key=lambda x: -x['c']):
    lines.append(f"  {r['s']:<50} {r['c']:.0%} ({r['f']}/58) {r['st']}")

lines.append('')
lines.append('=== 50-69% (QUASE LA - PRIORIDADE ALTA) ===')
for r in sorted(g50, key=lambda x: -x['c']):
    w = r['w'][:60] if r['w'] else 'SEM WEBSITE'
    lines.append(f"  {r['s']:<50} {r['c']:.0%} ({r['f']}/58) {w}")

lines.append('')
lines.append('=== 25-49% (MEDIO - DEEP SCRAPE + CHATBOT) ===')
for r in sorted(g25, key=lambda x: -x['c']):
    w = r['w'][:60] if r['w'] else 'SEM WEBSITE'
    lines.append(f"  {r['s']:<50} {r['c']:.0%} ({r['f']}/58) {w}")

lines.append('')
lines.append('=== < 25% (BAIXO - PRECISA TUDO) ===')
for r in sorted(glow, key=lambda x: -x['c']):
    w = r['w'][:60] if r['w'] else 'SEM WEBSITE'
    lines.append(f"  {r['s']:<50} {r['c']:.0%} ({r['f']}/58) {w}")

# Gerar lista de slugs por grupo
lines.append('')
lines.append('=== SLUGS POR GRUPO (para scripts) ===')
lines.append(f'DONE ({len(g70)}): ' + ','.join(r['s'] for r in g70))
lines.append(f'NEAR ({len(g50)}): ' + ','.join(r['s'] for r in g50))
lines.append(f'MID  ({len(g25)}): ' + ','.join(r['s'] for r in g25))
lines.append(f'LOW  ({len(glow)}): ' + ','.join(r['s'] for r in glow))

output = '\n'.join(lines)

with open('.aiox/HOTEL-STATUS-SNAPSHOT.txt', 'w', encoding='utf-8') as f:
    f.write(output)

print(output)
