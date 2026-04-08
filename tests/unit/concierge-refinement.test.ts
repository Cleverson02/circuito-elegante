/**
 * Concierge Refinement Tests — Story 1.9
 *
 * Validates prompt content, intent classification, source hierarchy,
 * anti-hallucination rules, WhatsApp formatting, and concierge techniques.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { IntentType, INTENT_ALIASES } from '../../backend/src/agents/types';

const ORCHESTRATOR_PROMPT = readFileSync(
  join(__dirname, '../../backend/src/prompts/orchestrator.md'),
  'utf-8',
);
const INTENT_PROMPT = readFileSync(
  join(__dirname, '../../backend/src/prompts/intent-agent.md'),
  'utf-8',
);
const PERSONA_PROMPT = readFileSync(
  join(__dirname, '../../backend/src/prompts/persona-system.md'),
  'utf-8',
);
const ORCHESTRATOR_SOURCE = readFileSync(
  join(__dirname, '../../backend/src/agents/orchestrator.ts'),
  'utf-8',
);

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC1-AC3: Hierarchy of Sources (Anti-Hallucination)
// ═══════════════════════════════════════════════════════════════

describe('Hierarchy of Sources — AC1, AC2, AC3', () => {
  it('orchestrator prompt defines source hierarchy with 5 levels', () => {
    expect(ORCHESTRATOR_PROMPT).toContain('Hierarchy of Sources');
    expect(ORCHESTRATOR_PROMPT).toContain('JSONB Structured Data');
    expect(ORCHESTRATOR_PROMPT).toContain('RAG Semantic Search');
    expect(ORCHESTRATOR_PROMPT).toContain('Generic Contextual Response');
    expect(ORCHESTRATOR_PROMPT).toContain('Elegant Admission');
    expect(ORCHESTRATOR_PROMPT).toContain('Handover');
  });

  it('orchestrator prompt prioritizes query_hotel_details as Priority 1', () => {
    expect(ORCHESTRATOR_PROMPT).toContain('Priority 1');
    expect(ORCHESTRATOR_PROMPT).toContain('query_hotel_details');
  });

  it('orchestrator prompt sets RAG as Priority 2 with similarity threshold', () => {
    expect(ORCHESTRATOR_PROMPT).toContain('Priority 2');
    expect(ORCHESTRATOR_PROMPT).toContain('0.78');
  });

  it('persona prompt instructs NEVER invent information', () => {
    expect(PERSONA_PROMPT).toMatch(/NEVER invent/i);
  });

  it('persona prompt handles low-confidence RAG results', () => {
    expect(PERSONA_PROMPT).toContain('0.78');
    expect(PERSONA_PROMPT).toMatch(/hedge|verificar/i);
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC4-AC6: Concierge Techniques
// ═══════════════════════════════════════════════════════════════

describe('Concierge Techniques — AC4, AC5, AC6', () => {
  it('persona prompt includes proactivity technique', () => {
    expect(PERSONA_PROMPT).toContain('Proatividade');
    expect(PERSONA_PROMPT).toMatch(/antecipar|anticipar/i);
  });

  it('persona prompt includes cross-selling technique', () => {
    expect(PERSONA_PROMPT).toContain('Cross-Selling');
  });

  it('persona prompt includes personalization by profile', () => {
    expect(PERSONA_PROMPT).toContain('Personalização por Perfil');
    expect(PERSONA_PROMPT).toContain('Casal romântico');
    expect(PERSONA_PROMPT).toContain('Família com crianças');
    expect(PERSONA_PROMPT).toContain('Corporativo');
    expect(PERSONA_PROMPT).toContain('Aventureiro');
  });

  it('persona prompt references sales_arguments_by_profile', () => {
    expect(PERSONA_PROMPT).toContain('sales_arguments_by_profile');
  });

  it('persona prompt references objections and attention_points', () => {
    expect(PERSONA_PROMPT).toMatch(/objections|objeções/i);
    expect(PERSONA_PROMPT).toMatch(/attention_points|caution/i);
  });

  it('persona prompt limits cross-sell to ONE per response', () => {
    expect(PERSONA_PROMPT).toMatch(/ONE cross-sell|maximum.*one/i);
  });

  it('persona prompt includes rapport technique', () => {
    expect(PERSONA_PROMPT).toContain('Rapport');
  });

  it('persona prompt includes elegant urgency', () => {
    expect(PERSONA_PROMPT).toContain('Urgência Elegante');
    expect(PERSONA_PROMPT).toMatch(/NEVER.*Está acabando|NEVER.*Últimas vagas/i);
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC7: Intent Agent — Granular Classification
// ═══════════════════════════════════════════════════════════════

describe('Intent Classification — AC7', () => {
  it('intent prompt includes DETAIL_QUERY intent', () => {
    expect(INTENT_PROMPT).toContain('DETAIL_QUERY');
  });

  it('intent prompt includes COMPARISON intent', () => {
    expect(INTENT_PROMPT).toContain('COMPARISON');
  });

  it('intent prompt maps DETAIL_QUERY to query_hotel_details', () => {
    expect(INTENT_PROMPT).toMatch(/DETAIL_QUERY.*hotel.*detail|DETAIL_QUERY.*specific/i);
  });

  it('DETAIL_QUERY and COMPARISON are valid IntentType values', () => {
    expect(() => IntentType.parse('DETAIL_QUERY')).not.toThrow();
    expect(() => IntentType.parse('COMPARISON')).not.toThrow();
  });

  it('intent aliases map correctly', () => {
    expect(INTENT_ALIASES['OPEN_QUESTION']).toBe('RAG');
    expect(INTENT_ALIASES['SEARCH']).toBe('API_SEARCH');
    expect(INTENT_ALIASES['BOOKING']).toBe('API_BOOKING');
  });

  it('intent prompt covers all 9 intent types', () => {
    const intents = ['DETAIL_QUERY', 'RAG', 'COMPARISON', 'API_SEARCH', 'API_BOOKING', 'CHAT', 'MULTIMODAL', 'HANDOVER', 'STATUS'];
    for (const intent of intents) {
      expect(INTENT_PROMPT).toContain(intent);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC8: Smart Tool Combinations
// ═══════════════════════════════════════════════════════════════

describe('Smart Tool Combinations — AC8', () => {
  it('orchestrator prompt describes tool combinations', () => {
    expect(ORCHESTRATOR_PROMPT).toContain('Smart Tool Combinations');
  });

  it('orchestrator maps DETAIL_QUERY to query_hotel_details', () => {
    expect(ORCHESTRATOR_PROMPT).toMatch(/DETAIL_QUERY.*query_hotel_details/);
  });

  it('orchestrator maps COMPARISON to multiple query_hotel_details calls', () => {
    expect(ORCHESTRATOR_PROMPT).toMatch(/COMPARISON.*query_hotel_details.*N/);
  });

  it('orchestrator describes combining structured + RAG for rich answers', () => {
    expect(ORCHESTRATOR_PROMPT).toMatch(/query_hotel_details.*query_knowledge_base|combine tools/i);
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC9: WhatsApp Formatting
// ═══════════════════════════════════════════════════════════════

describe('WhatsApp Formatting — AC9', () => {
  it('persona prompt sets 400 char limit per message chunk', () => {
    expect(PERSONA_PROMPT).toContain('400');
  });

  it('persona prompt restricts heavy markdown', () => {
    expect(PERSONA_PROMPT).toMatch(/No.*Markdown|No heavy Markdown|No headers/i);
  });

  it('persona prompt limits emoji usage', () => {
    expect(PERSONA_PROMPT).toMatch(/moderately|moderado|contextually/i);
  });

  it('persona prompt mandates short paragraphs', () => {
    expect(PERSONA_PROMPT).toMatch(/short paragraphs|2-3 sentences/i);
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC10: Source Attribution
// ═══════════════════════════════════════════════════════════════

describe('Source Attribution — AC10', () => {
  it('orchestrator source contains logSourceAttribution function', () => {
    expect(ORCHESTRATOR_SOURCE).toContain('logSourceAttribution');
  });

  it('orchestrator source logs source for query_knowledge_base results', () => {
    expect(ORCHESTRATOR_SOURCE).toMatch(/logSourceAttribution\('query_knowledge_base'/);
  });

  it('orchestrator source logs source for query_hotel_details results', () => {
    expect(ORCHESTRATOR_SOURCE).toMatch(/logSourceAttribution\('query_hotel_details'/);
  });

  it('orchestrator prompt describes source attribution tagging', () => {
    expect(ORCHESTRATOR_PROMPT).toContain('Source Attribution');
    expect(ORCHESTRATOR_PROMPT).toContain('[source:');
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC11: Fallback Chain
// ═══════════════════════════════════════════════════════════════

describe('Fallback Chain — AC11', () => {
  it('orchestrator prompt defines fallback chain', () => {
    expect(ORCHESTRATOR_PROMPT).toMatch(/fallback/i);
  });

  it('orchestrator prompt orders fallback: generic → admission → handover', () => {
    const genericIdx = ORCHESTRATOR_PROMPT.indexOf('Generic Contextual Response');
    const admissionIdx = ORCHESTRATOR_PROMPT.indexOf('Elegant Admission');
    const handoverIdx = ORCHESTRATOR_PROMPT.indexOf('Handover');
    expect(genericIdx).toBeLessThan(admissionIdx);
    expect(admissionIdx).toBeLessThan(handoverIdx);
  });

  it('pipeline resolves intent aliases correctly', () => {
    const pipelineSource = readFileSync(
      join(__dirname, '../../backend/src/agents/pipeline.ts'),
      'utf-8',
    );
    expect(pipelineSource).toContain('INTENT_ALIASES');
  });

  it('pipeline source partitions HANDOVER as sequential', () => {
    const pipelineSource = readFileSync(
      join(__dirname, '../../backend/src/agents/pipeline.ts'),
      'utf-8',
    );
    expect(pipelineSource).toContain("'HANDOVER'");
    expect(pipelineSource).toContain('SEQUENTIAL_INTENTS');
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 1.9 AC12: Regression Test Questions (Schema Validation)
// ═══════════════════════════════════════════════════════════════

describe('Regression Test Questions — AC12 (intent schema coverage)', () => {
  const regressionQuestions: { question: string; expectedIntent: string; category?: string }[] = [
    { question: 'O hotel aceita pets?', expectedIntent: 'RAG', category: 'policy' },
    { question: 'Qual horário do check-in?', expectedIntent: 'RAG', category: 'policy' },
    { question: 'Tem spa?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Como chego no hotel saindo do aeroporto?', expectedIntent: 'RAG', category: 'location' },
    { question: 'O que tem pra fazer na região?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Tem restaurante no hotel?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Aceita crianças?', expectedIntent: 'RAG', category: 'policy' },
    { question: 'Tem piscina aquecida?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Qual a política de cancelamento?', expectedIntent: 'RAG', category: 'policy' },
    { question: 'Me recomenda um hotel romântico no Nordeste', expectedIntent: 'API_SEARCH' },
    { question: 'Compara o Fasano SP com o Emiliano SP', expectedIntent: 'COMPARISON' },
    { question: 'O hotel tem Wi-Fi?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Tem estacionamento?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Quais prêmios o hotel tem?', expectedIntent: 'RAG', category: 'description' },
    { question: 'O hotel é sustentável?', expectedIntent: 'RAG', category: 'description' },
    { question: 'Tem room service?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Quero um hotel de serra com spa', expectedIntent: 'API_SEARCH' },
    { question: 'O que torna esse hotel especial?', expectedIntent: 'RAG', category: 'description' },
    { question: 'Tem acessibilidade PCD?', expectedIntent: 'RAG', category: 'experience' },
    { question: 'Posso fazer day use?', expectedIntent: 'RAG', category: 'experience' },
  ];

  it('all 20 regression questions have valid expected intents', () => {
    expect(regressionQuestions).toHaveLength(20);
    for (const q of regressionQuestions) {
      expect(() => IntentType.parse(q.expectedIntent)).not.toThrow();
    }
  });

  it('regression questions cover all required categories', () => {
    const categories = new Set(regressionQuestions.filter((q) => q.category).map((q) => q.category));
    expect(categories.has('policy')).toBe(true);
    expect(categories.has('experience')).toBe(true);
    expect(categories.has('location')).toBe(true);
    expect(categories.has('description')).toBe(true);
  });

  it('regression questions include COMPARISON and API_SEARCH intents', () => {
    const intents = new Set(regressionQuestions.map((q) => q.expectedIntent));
    expect(intents.has('COMPARISON')).toBe(true);
    expect(intents.has('API_SEARCH')).toBe(true);
    expect(intents.has('RAG')).toBe(true);
  });
});
