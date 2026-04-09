/**
 * E2E Tests — WhatsApp Template Messages
 *
 * Story 4.8 — E2E Tests Multi-Canal (AC8)
 * Tests: render + send, fallback 470, template not found.
 */

// ─── Mocks ──────────────────────────────────────────────────────

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), child: jest.fn().mockReturnThis() },
}));

// ─── Imports ────────────────────────────────────────────────────

import {
  renderTemplate,
  sendTemplateMessage,
  TemplateNotFoundError,
} from '../../backend/src/integrations/whatsapp-templates';

// ─── Tests ──────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Template Messages E2E (AC8)', () => {
  it('renders and sends follow_up_quote_expiring with correct payload', async () => {
    const mockSendTemplate = jest.fn().mockResolvedValue({
      status: 'SENT',
      key: { id: 'TPL-001' },
    });
    const mockClient = { sendTemplate: mockSendTemplate } as any;

    const result = await sendTemplateMessage(mockClient, '+5521999', 'follow_up_quote_expiring', {
      guest_name: 'Maria Silva',
      hotel_name: 'Hotel Fasano Rio',
      expiry_time: '18:00 de hoje',
    });

    expect(result.sent).toBe(true);
    expect(mockSendTemplate).toHaveBeenCalledWith(
      '+5521999',
      'follow_up_quote_expiring',
      'pt_BR',
      [
        { type: 'text', text: 'Maria Silva' },
        { type: 'text', text: 'Hotel Fasano Rio' },
        { type: 'text', text: '18:00 de hoje' },
      ],
    );
  });

  it('handles Evolution API error 470 (template not approved) gracefully', async () => {
    const mockSendTemplate = jest.fn().mockRejectedValue(
      new Error('Evolution API returned 470 for POST /message/sendTemplate/stella'),
    );
    const mockClient = { sendTemplate: mockSendTemplate } as any;

    const result = await sendTemplateMessage(mockClient, '+5521999', 'out_of_hours_followup', {
      guest_name: 'Joao',
    });

    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.reason).toContain('470');
    }
  });

  it('handles template not found gracefully', async () => {
    const mockClient = { sendTemplate: jest.fn() } as any;

    const result = await sendTemplateMessage(mockClient, '+5521999', 'nonexistent_template', {});

    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.reason).toContain('not found');
    }
    expect(mockClient.sendTemplate).not.toHaveBeenCalled();
  });

  it('renders all 4 templates without errors', () => {
    const templates: Array<{ name: string; vars: Record<string, string> }> = [
      { name: 'follow_up_quote_expiring', vars: { guest_name: 'A', hotel_name: 'B', expiry_time: 'C' } },
      { name: 'reservation_confirmed', vars: { guest_name: 'A', hotel_name: 'B', check_in_date: 'C', check_out_date: 'D' } },
      { name: 'out_of_hours_followup', vars: { guest_name: 'A' } },
      { name: 'reengagement', vars: { guest_name: 'A', hotel_name: 'B' } },
    ];

    for (const t of templates) {
      expect(() => renderTemplate(t.name, t.vars)).not.toThrow();
      const rendered = renderTemplate(t.name, t.vars);
      expect(rendered.body).not.toContain('{{');
      expect(rendered.language).toBe('pt_BR');
    }
  });
});
