/**
 * E2E Tests — Out-of-Hours Fallback
 *
 * Story 4.8 — E2E Tests Multi-Canal (AC7)
 * Tests: business hours guard, fallback message, lead registration.
 */

// ─── Mocks ──────────────────────────────────────────────────────

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), child: jest.fn().mockReturnThis() },
}));

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
  OUT_OF_HOURS_MESSAGE_WHATSAPP,
  OUT_OF_HOURS_MESSAGE_WEBSITE,
} from '../../backend/src/services/business-hours';

// ─── Helpers ────────────────────────────────────────────────────

function mockBRTHour(hour: number): jest.SpyInstance {
  return jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    format: () => String(hour),
    resolvedOptions: () => ({ timeZone: 'America/Sao_Paulo' }),
  } as any));
}

// ─── Tests ──────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('Out-of-Hours E2E (AC7)', () => {
  it('full flow: 23h BRT → guard intercepts → fallback message → lead registered', async () => {
    // Step 1: Mock 23:00 BRT
    const spy = mockBRTHour(23);
    expect(isWithinBusinessHours()).toBe(false);

    // Step 2: Verify fallback message is appropriate
    expect(OUT_OF_HOURS_MESSAGE_WHATSAPP).toContain('Circuito Elegante');
    expect(OUT_OF_HOURS_MESSAGE_WHATSAPP).toContain('8h');
    expect(OUT_OF_HOURS_MESSAGE_WHATSAPP).toContain('22h');

    // Step 3: Register lead
    await registerOutOfHoursLead('+5521999', 'Quero um hotel', 'whatsapp', 'session-ooh');

    // Verify lead was written
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(1);
    expect(writtenData[0].phone).toBe('+5521999');
    expect(writtenData[0].channel).toBe('whatsapp');
    expect(writtenData[0].status).toBe('pending');
    expect(writtenData[0].scheduledFollowUp).toContain('T08:00:00-03:00');

    spy.mockRestore();
  });

  it('within business hours → guard allows → no lead registered', () => {
    const spy = mockBRTHour(14);
    expect(isWithinBusinessHours()).toBe(true);
    spy.mockRestore();
  });

  it('website fallback message has no WhatsApp emojis', () => {
    expect(OUT_OF_HOURS_MESSAGE_WEBSITE).not.toContain('✨');
    expect(OUT_OF_HOURS_MESSAGE_WEBSITE).toContain('Circuito Elegante');
  });
});
