import { IntentOutput, IntentType, Language, GuardrailOutput, MODELS } from '../../backend/src/agents/types';

describe('Intent Agent Types & Schemas', () => {
  describe('IntentType enum', () => {
    it('should accept all 7 valid intent types', () => {
      const validIntents = ['RAG', 'API_SEARCH', 'API_BOOKING', 'CHAT', 'MULTIMODAL', 'HANDOVER', 'STATUS'];
      for (const intent of validIntents) {
        expect(() => IntentType.parse(intent)).not.toThrow();
      }
    });

    it('should reject invalid intent types', () => {
      expect(() => IntentType.parse('INVALID')).toThrow();
      expect(() => IntentType.parse('')).toThrow();
    });
  });

  describe('Language enum', () => {
    it('should accept pt, en, es', () => {
      expect(() => Language.parse('pt')).not.toThrow();
      expect(() => Language.parse('en')).not.toThrow();
      expect(() => Language.parse('es')).not.toThrow();
    });

    it('should reject unsupported languages', () => {
      expect(() => Language.parse('fr')).toThrow();
      expect(() => Language.parse('de')).toThrow();
    });
  });

  describe('IntentOutput schema', () => {
    it('should validate a complete intent output', () => {
      const output = {
        intent: 'RAG',
        confidence: 0.95,
        subIntents: [],
        language: 'pt',
        reasoning: 'User asking about hotel amenities',
      };
      const parsed = IntentOutput.parse(output);
      expect(parsed.intent).toBe('RAG');
      expect(parsed.confidence).toBe(0.95);
      expect(parsed.language).toBe('pt');
    });

    it('should validate multi-intent output', () => {
      const output = {
        intent: 'API_SEARCH',
        confidence: 0.88,
        subIntents: ['API_SEARCH', 'RAG'],
        language: 'pt',
        reasoning: 'User searching hotels and asking about amenities',
      };
      const parsed = IntentOutput.parse(output);
      expect(parsed.subIntents).toHaveLength(2);
      expect(parsed.subIntents).toContain('RAG');
    });

    it('should default subIntents to empty array', () => {
      const output = {
        intent: 'CHAT',
        confidence: 0.99,
        language: 'pt',
        reasoning: 'Simple greeting',
      };
      const parsed = IntentOutput.parse(output);
      expect(parsed.subIntents).toEqual([]);
    });

    it('should reject confidence outside 0-1 range', () => {
      const output = {
        intent: 'CHAT',
        confidence: 1.5,
        subIntents: [],
        language: 'pt',
        reasoning: 'test',
      };
      expect(() => IntentOutput.parse(output)).toThrow();
    });

    it('should reject missing required fields', () => {
      expect(() => IntentOutput.parse({ intent: 'RAG' })).toThrow();
      expect(() => IntentOutput.parse({})).toThrow();
    });
  });

  describe('GuardrailOutput schema', () => {
    it('should validate a clean pass', () => {
      const output = { isViolation: false };
      const parsed = GuardrailOutput.parse(output);
      expect(parsed.isViolation).toBe(false);
    });

    it('should validate a violation with details', () => {
      const output = {
        isViolation: true,
        category: 'jailbreak',
        explanation: 'Prompt injection detected',
      };
      const parsed = GuardrailOutput.parse(output);
      expect(parsed.isViolation).toBe(true);
      expect(parsed.category).toBe('jailbreak');
    });

    it('should allow optional fields to be omitted', () => {
      const output = { isViolation: false };
      const parsed = GuardrailOutput.parse(output);
      expect(parsed.category).toBeUndefined();
      expect(parsed.explanation).toBeUndefined();
    });
  });

  describe('Model Configuration', () => {
    it('should have nano, turbo, and pro tiers', () => {
      expect(MODELS.nano).toBeDefined();
      expect(MODELS.turbo).toBeDefined();
      expect(MODELS.pro).toBeDefined();
    });

    it('should use lightweight model for nano tier', () => {
      expect(MODELS.nano).toBe('gpt-4o-mini');
    });

    it('should map all tiers to valid model strings', () => {
      for (const model of Object.values(MODELS)) {
        expect(typeof model).toBe('string');
        expect(model.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Intent Classification Scenarios (Schema Validation)', () => {
  it('should validate RAG intent for amenity question', () => {
    const output = IntentOutput.parse({
      intent: 'RAG',
      confidence: 0.92,
      subIntents: [],
      language: 'pt',
      reasoning: 'User asking about pool in specific hotel',
    });
    expect(output.intent).toBe('RAG');
  });

  it('should validate API_SEARCH for hotel search', () => {
    const output = IntentOutput.parse({
      intent: 'API_SEARCH',
      confidence: 0.89,
      subIntents: [],
      language: 'pt',
      reasoning: 'User searching for hotels in a specific region',
    });
    expect(output.intent).toBe('API_SEARCH');
  });

  it('should validate CHAT for greeting', () => {
    const output = IntentOutput.parse({
      intent: 'CHAT',
      confidence: 0.98,
      subIntents: [],
      language: 'pt',
      reasoning: 'Simple greeting message',
    });
    expect(output.intent).toBe('CHAT');
  });

  it('should validate HANDOVER for human request', () => {
    const output = IntentOutput.parse({
      intent: 'HANDOVER',
      confidence: 0.95,
      subIntents: [],
      language: 'pt',
      reasoning: 'User explicitly requesting human assistance',
    });
    expect(output.intent).toBe('HANDOVER');
  });

  it('should validate multi-intent: search + RAG', () => {
    const output = IntentOutput.parse({
      intent: 'API_SEARCH',
      confidence: 0.85,
      subIntents: ['API_SEARCH', 'RAG'],
      language: 'pt',
      reasoning: 'User wants hotel search AND amenity info',
    });
    expect(output.subIntents).toContain('API_SEARCH');
    expect(output.subIntents).toContain('RAG');
  });

  it('should validate English language detection', () => {
    const output = IntentOutput.parse({
      intent: 'CHAT',
      confidence: 0.97,
      subIntents: [],
      language: 'en',
      reasoning: 'English greeting detected',
    });
    expect(output.language).toBe('en');
  });

  it('should validate Spanish language detection', () => {
    const output = IntentOutput.parse({
      intent: 'API_SEARCH',
      confidence: 0.90,
      subIntents: [],
      language: 'es',
      reasoning: 'Spanish hotel search query',
    });
    expect(output.language).toBe('es');
  });
});
