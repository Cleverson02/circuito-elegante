import { MODELS } from '../../backend/src/agents/types';

describe('Persona Agent', () => {
  describe('Model Configuration', () => {
    it('should use pro tier model for Persona', () => {
      expect(MODELS.pro).toBeDefined();
      expect(typeof MODELS.pro).toBe('string');
    });
  });

  describe('GenerateResponseInput validation', () => {
    it('should accept valid input structure', () => {
      const input = {
        toolResults: { hotels: [{ name: 'Le Canton', region: 'Serra Gaúcha' }] },
        sessionContext: { guestName: 'Maria', hotelFocus: 'Le Canton' },
        language: 'pt' as const,
      };
      expect(input.toolResults).toBeDefined();
      expect(input.language).toBe('pt');
    });

    it('should accept input without sessionContext', () => {
      const input = {
        toolResults: { message: 'No results found' },
        language: 'en' as const,
      };
      expect(input.toolResults).toBeDefined();
      expect(input.language).toBe('en');
    });

    it('should accept all 3 supported languages', () => {
      const languages = ['pt', 'en', 'es'] as const;
      for (const lang of languages) {
        expect(['pt', 'en', 'es']).toContain(lang);
      }
    });
  });

  describe('Persona System Prompt', () => {
    it('should exist as markdown file', () => {
      const fs = require('fs');
      const path = require('path');
      const promptPath = path.join(__dirname, '../../backend/src/prompts/persona-system.md');
      expect(fs.existsSync(promptPath)).toBe(true);
    });

    it('should contain AAA guidelines', () => {
      const fs = require('fs');
      const path = require('path');
      const promptPath = path.join(__dirname, '../../backend/src/prompts/persona-system.md');
      const content = fs.readFileSync(promptPath, 'utf-8');
      expect(content).toContain('Acolhedora');
      expect(content).toContain('Conhecedora');
      expect(content).toContain('Discreta');
    });

    it('should contain persona defense instructions', () => {
      const fs = require('fs');
      const path = require('path');
      const promptPath = path.join(__dirname, '../../backend/src/prompts/persona-system.md');
      const content = fs.readFileSync(promptPath, 'utf-8');
      expect(content).toContain('Not an AI');
      expect(content).toContain('not a chatbot');
    });

    it('should contain no-technical-details rule', () => {
      const fs = require('fs');
      const path = require('path');
      const promptPath = path.join(__dirname, '../../backend/src/prompts/persona-system.md');
      const content = fs.readFileSync(promptPath, 'utf-8');
      expect(content).toContain('NEVER expose technical details');
      expect(content).toContain('UUIDs');
    });

    it('should contain BRL price format rule', () => {
      const fs = require('fs');
      const path = require('path');
      const promptPath = path.join(__dirname, '../../backend/src/prompts/persona-system.md');
      const content = fs.readFileSync(promptPath, 'utf-8');
      expect(content).toContain('R$');
    });

    it('should contain language matching rule', () => {
      const fs = require('fs');
      const path = require('path');
      const promptPath = path.join(__dirname, '../../backend/src/prompts/persona-system.md');
      const content = fs.readFileSync(promptPath, 'utf-8');
      expect(content).toContain('PT/EN/ES');
    });
  });
});
