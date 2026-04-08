/**
 * Unit tests — Business Hours Guard & Lead Registration
 *
 * Story 4.7 — Fallback de Fora de Expediente
 * Tests: isWithinBusinessHours boundaries, lead registration, fail-open
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

// ─── FS Mock ────────────────────────────────────────────────────

const mockWriteFile = jest.fn().mockResolvedValue(undefined);
const mockReadFile = jest.fn().mockRejectedValue(new Error('ENOENT'));
const mockMkdir = jest.fn().mockResolvedValue(undefined);

jest.mock('fs/promises', () => ({
  writeFile: (...args: any[]) => mockWriteFile(...args),
  readFile: (...args: any[]) => mockReadFile(...args),
  mkdir: (...args: any[]) => mockMkdir(...args),
}));

// ─── Imports ────────────────────────────────────────────────────

import {
  isWithinBusinessHours,
  registerOutOfHoursLead,
  calculateNextFollowUp,
  BUSINESS_HOURS_START,
  BUSINESS_HOURS_END,
  BUSINESS_TIMEZONE,
  OUT_OF_HOURS_MESSAGE_WHATSAPP,
  OUT_OF_HOURS_MESSAGE_WEBSITE,
} from '../../backend/src/services/business-hours';

import { logger as mockLogger } from '../../backend/src/middleware/logging';

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Mock Intl.DateTimeFormat to return a specific hour for BRT timezone.
 */
function mockBRTHour(hour: number): jest.SpyInstance {
  return jest.spyOn(Intl, 'DateTimeFormat').mockImplementation((_locale?: any, options?: any) => {
    return {
      format: () => String(hour),
      resolvedOptions: () => ({ timeZone: options?.timeZone ?? 'America/Sao_Paulo' }),
    } as any;
  });
}

// ─── Tests ──────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('isWithinBusinessHours', () => {
  it('returns true at 10:00 BRT (within hours)', () => {
    const spy = mockBRTHour(10);
    expect(isWithinBusinessHours()).toBe(true);
    spy.mockRestore();
  });

  it('returns true at 08:00 BRT (boundary — start)', () => {
    const spy = mockBRTHour(8);
    expect(isWithinBusinessHours()).toBe(true);
    spy.mockRestore();
  });

  it('returns true at 21:00 BRT (21:xx is within, < 22)', () => {
    const spy = mockBRTHour(21);
    expect(isWithinBusinessHours()).toBe(true);
    spy.mockRestore();
  });

  it('returns false at 22:00 BRT (boundary — end)', () => {
    const spy = mockBRTHour(22);
    expect(isWithinBusinessHours()).toBe(false);
    spy.mockRestore();
  });

  it('returns false at 23:00 BRT (after hours)', () => {
    const spy = mockBRTHour(23);
    expect(isWithinBusinessHours()).toBe(false);
    spy.mockRestore();
  });

  it('returns false at 07:00 BRT (before hours)', () => {
    const spy = mockBRTHour(7);
    expect(isWithinBusinessHours()).toBe(false);
    spy.mockRestore();
  });

  it('returns false at 00:00 BRT (midnight)', () => {
    const spy = mockBRTHour(0);
    expect(isWithinBusinessHours()).toBe(false);
    spy.mockRestore();
  });

  it('returns true at 12:00 BRT (noon)', () => {
    const spy = mockBRTHour(12);
    expect(isWithinBusinessHours()).toBe(true);
    spy.mockRestore();
  });

  // AC9: Fail-open
  it('returns true (fail-open) when timezone is invalid (AC9)', () => {
    // Force Intl.DateTimeFormat to throw
    const spy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
      throw new RangeError('Invalid time zone');
    });

    expect(isWithinBusinessHours('Invalid/Timezone')).toBe(true);
    expect(mockLogger.error).toHaveBeenCalledWith('business_hours_check_failed', expect.objectContaining({
      event: 'business_hours_check_failed',
    }));

    spy.mockRestore();
  });
});

describe('Configuration constants', () => {
  it('has correct defaults', () => {
    expect(BUSINESS_HOURS_START).toBe(8);
    expect(BUSINESS_HOURS_END).toBe(22);
    expect(BUSINESS_TIMEZONE).toBe('America/Sao_Paulo');
  });

  it('WhatsApp message is luxury tone with emoji', () => {
    expect(OUT_OF_HOURS_MESSAGE_WHATSAPP).toContain('Circuito Elegante');
    expect(OUT_OF_HOURS_MESSAGE_WHATSAPP).toContain('8h');
    expect(OUT_OF_HOURS_MESSAGE_WHATSAPP).toContain('22h');
    expect(OUT_OF_HOURS_MESSAGE_WHATSAPP).toContain('✨');
  });

  it('Website message has no WhatsApp emojis', () => {
    expect(OUT_OF_HOURS_MESSAGE_WEBSITE).toContain('Circuito Elegante');
    expect(OUT_OF_HOURS_MESSAGE_WEBSITE).not.toContain('✨');
  });
});

describe('calculateNextFollowUp', () => {
  it('returns a valid ISO string with -03:00 offset', () => {
    const result = calculateNextFollowUp();
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}T08:00:00-03:00/);
  });

  it('returns 08:00 time', () => {
    const result = calculateNextFollowUp();
    expect(result).toContain('T08:00:00');
  });
});

describe('registerOutOfHoursLead', () => {
  it('writes lead with correct fields (AC7)', async () => {
    await registerOutOfHoursLead('+5521999', 'Quero reservar um hotel', 'whatsapp', 'session-1');

    expect(mockMkdir).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledTimes(1);

    const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(1);

    const lead = writtenData[0];
    expect(lead.phone).toBe('+5521999');
    expect(lead.message).toBe('Quero reservar um hotel');
    expect(lead.channel).toBe('whatsapp');
    expect(lead.sessionId).toBe('session-1');
    expect(lead.status).toBe('pending');
    expect(lead.leadId).toBeDefined();
    expect(lead.receivedAt).toBeDefined();
    expect(lead.scheduledFollowUp).toContain('T08:00:00-03:00');
  });

  it('appends to existing leads file', async () => {
    const existingLeads = [{ leadId: 'existing-1', phone: '+55111', status: 'pending' }];
    mockReadFile.mockResolvedValueOnce(JSON.stringify(existingLeads));

    await registerOutOfHoursLead('+5521999', 'Nova mensagem', 'website', 'session-2');

    const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(2);
    expect(writtenData[0].leadId).toBe('existing-1');
    expect(writtenData[1].phone).toBe('+5521999');
  });

  it('logs out_of_hours_lead_registered on success (AC8)', async () => {
    await registerOutOfHoursLead('+5521999', 'Test', 'whatsapp', 's1');

    expect(mockLogger.info).toHaveBeenCalledWith('out_of_hours_lead_registered', expect.objectContaining({
      event: 'out_of_hours_lead_registered',
      phone: '+5521999',
    }));
  });

  it('logs error but does not throw on write failure', async () => {
    mockWriteFile.mockRejectedValueOnce(new Error('Disk full'));

    await expect(
      registerOutOfHoursLead('+5521999', 'Test', 'whatsapp', 's1')
    ).resolves.not.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith('out_of_hours_lead_registration_failed', expect.objectContaining({
      event: 'out_of_hours_lead_registration_failed',
    }));
  });
});
