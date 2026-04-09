/**
 * Unit tests — WhatsApp Template Messages
 *
 * Story 4.9 — WhatsApp Template Messages (FR37)
 * Tests: renderTemplate, validation, sendTemplate fallback, orchestration
 */

// ─── Logger Mock ────────────────────────────────────────────────

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

import { logger as mockLogger } from '../../backend/src/middleware/logging';

// ─── Imports ────────────────────────────────────────────────────

import {
  renderTemplate,
  sendTemplateMessage,
  TemplateNotFoundError,
  MissingTemplateVariableError,
} from '../../backend/src/integrations/whatsapp-templates';

import { templateRegistry } from '../../backend/src/integrations/templates/index';

// ─── Mock EvolutionClient ───────────────────────────────────────

const mockSendTemplate = jest.fn();
const mockEvolutionClient = {
  sendTemplate: mockSendTemplate,
} as any;

// ─── Tests ──────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Template Registry', () => {
  it('contains all 4 required templates', () => {
    expect(templateRegistry.has('follow_up_quote_expiring')).toBe(true);
    expect(templateRegistry.has('reservation_confirmed')).toBe(true);
    expect(templateRegistry.has('out_of_hours_followup')).toBe(true);
    expect(templateRegistry.has('reengagement')).toBe(true);
    expect(templateRegistry.size).toBe(4);
  });

  it('all templates have pt_BR language', () => {
    for (const [, def] of templateRegistry) {
      expect(def.language).toBe('pt_BR');
    }
  });
});

describe('renderTemplate', () => {
  it('renders template with correct variable substitution (AC2)', () => {
    const result = renderTemplate('follow_up_quote_expiring', {
      guest_name: 'Maria',
      hotel_name: 'Hotel Fasano',
      expiry_time: '18:00 de hoje',
    });

    expect(result.name).toBe('follow_up_quote_expiring');
    expect(result.language).toBe('pt_BR');
    expect(result.body).toContain('Maria');
    expect(result.body).toContain('Hotel Fasano');
    expect(result.body).toContain('18:00 de hoje');
    expect(result.body).not.toContain('{{');
  });

  it('returns positional parameters in variable definition order', () => {
    const result = renderTemplate('follow_up_quote_expiring', {
      guest_name: 'Ana',
      hotel_name: 'Copacabana Palace',
      expiry_time: 'amanha',
    });

    expect(result.parameters).toHaveLength(3);
    expect(result.parameters[0]).toEqual({ type: 'text', text: 'Ana' });
    expect(result.parameters[1]).toEqual({ type: 'text', text: 'Copacabana Palace' });
    expect(result.parameters[2]).toEqual({ type: 'text', text: 'amanha' });
  });

  it('renders out_of_hours_followup with single variable', () => {
    const result = renderTemplate('out_of_hours_followup', {
      guest_name: 'Joao',
    });

    expect(result.body).toContain('Joao');
    expect(result.parameters).toHaveLength(1);
  });

  it('throws TemplateNotFoundError for unknown template (AC2)', () => {
    expect(() => renderTemplate('nonexistent_template', {}))
      .toThrow(TemplateNotFoundError);

    try {
      renderTemplate('nonexistent_template', {});
    } catch (err) {
      expect((err as TemplateNotFoundError).templateName).toBe('nonexistent_template');
    }
  });

  it('throws MissingTemplateVariableError when required variables missing (AC3)', () => {
    expect(() => renderTemplate('follow_up_quote_expiring', {
      guest_name: 'Maria',
      // missing hotel_name and expiry_time
    })).toThrow(MissingTemplateVariableError);

    try {
      renderTemplate('follow_up_quote_expiring', { guest_name: 'Maria' });
    } catch (err) {
      const e = err as MissingTemplateVariableError;
      expect(e.templateName).toBe('follow_up_quote_expiring');
      expect(e.missingVariables).toContain('hotel_name');
      expect(e.missingVariables).toContain('expiry_time');
      expect(e.missingVariables).not.toContain('guest_name');
    }
  });

  it('ignores extra variables without error (AC3)', () => {
    expect(() => renderTemplate('out_of_hours_followup', {
      guest_name: 'Maria',
      extra_var: 'should be ignored',
      another_extra: 'also ignored',
    })).not.toThrow();

    const result = renderTemplate('out_of_hours_followup', {
      guest_name: 'Maria',
      extra_var: 'ignored',
    });
    expect(result.body).toContain('Maria');
    expect(result.body).not.toContain('ignored');
  });
});

describe('sendTemplateMessage', () => {
  it('sends template successfully and returns sent:true (AC6)', async () => {
    const mockResponse = { status: 'SENT', key: { id: 'MSG-TPL-001' } };
    mockSendTemplate.mockResolvedValueOnce(mockResponse);

    const result = await sendTemplateMessage(
      mockEvolutionClient,
      '+5521999',
      'out_of_hours_followup',
      { guest_name: 'Maria' },
    );

    expect(result.sent).toBe(true);
    if (result.sent) {
      expect(result.response).toBe(mockResponse);
    }
    expect(mockSendTemplate).toHaveBeenCalledWith(
      '+5521999',
      'out_of_hours_followup',
      'pt_BR',
      [{ type: 'text', text: 'Maria' }],
    );
  });

  it('logs template_sent on success (AC8)', async () => {
    mockSendTemplate.mockResolvedValueOnce({ status: 'SENT' });

    await sendTemplateMessage(mockEvolutionClient, '+5521999', 'out_of_hours_followup', { guest_name: 'Ana' });

    expect(mockLogger.info).toHaveBeenCalledWith('template_sent', expect.objectContaining({
      event: 'template_sent',
      templateName: 'out_of_hours_followup',
      phone: '+5521999',
      variableCount: 1,
    }));
  });

  it('returns sent:false on Evolution API error (AC5/AC6)', async () => {
    mockSendTemplate.mockRejectedValueOnce(new Error('Evolution API returned 470'));

    const result = await sendTemplateMessage(
      mockEvolutionClient,
      '+5521999',
      'out_of_hours_followup',
      { guest_name: 'Maria' },
    );

    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.reason).toContain('470');
    }
  });

  it('logs template_skipped on failure (AC8)', async () => {
    mockSendTemplate.mockRejectedValueOnce(new Error('timeout'));

    await sendTemplateMessage(mockEvolutionClient, '+5521999', 'out_of_hours_followup', { guest_name: 'Ana' });

    expect(mockLogger.warn).toHaveBeenCalledWith('template_skipped', expect.objectContaining({
      event: 'template_skipped',
      templateName: 'out_of_hours_followup',
    }));
  });

  it('returns sent:false for unknown template', async () => {
    const result = await sendTemplateMessage(
      mockEvolutionClient,
      '+5521999',
      'nonexistent',
      {},
    );

    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.reason).toContain('not found');
    }
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it('returns sent:false for missing variables', async () => {
    const result = await sendTemplateMessage(
      mockEvolutionClient,
      '+5521999',
      'follow_up_quote_expiring',
      { guest_name: 'Maria' }, // missing hotel_name, expiry_time
    );

    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.reason).toContain('missing variables');
    }
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });
});
