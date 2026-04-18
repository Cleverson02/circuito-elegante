import {
  TransferParams,
  HandoverReason,
  buildHandoverSummary,
} from '../../backend/src/tools/transfer-to-human';

const NULL_DEFAULTS = {
  guestName: null,
  guestPhone: null,
  hotelFocus: null,
  lastIntent: null,
  preferences: null,
};

describe('transfer_to_human Tool', () => {
  describe('HandoverReason enum', () => {
    it('should accept all 5 valid reasons', () => {
      const reasons = ['hotel_manual', 'guest_requested', 'low_confidence', 'api_failure', 'sensitive_topic'];
      for (const reason of reasons) {
        expect(() => HandoverReason.parse(reason)).not.toThrow();
      }
    });

    it('should reject invalid reasons', () => {
      expect(() => HandoverReason.parse('unknown')).toThrow();
    });
  });

  describe('TransferParams schema', () => {
    it('should require reason and conversationSummary', () => {
      expect(() => TransferParams.parse({})).toThrow();
    });

    it('should accept minimal params with nulls', () => {
      const parsed = TransferParams.parse({
        ...NULL_DEFAULTS,
        reason: 'guest_requested',
        conversationSummary: 'Guest wants to speak with a human',
      });
      expect(parsed.reason).toBe('guest_requested');
      expect(parsed.guestName).toBeNull();
    });

    it('should accept full params', () => {
      const parsed = TransferParams.parse({
        reason: 'hotel_manual',
        guestName: 'João Silva',
        guestPhone: '+5511999999999',
        hotelFocus: 'Le Canton',
        conversationSummary: 'Guest asking about availability',
        lastIntent: 'API_BOOKING',
        preferences: JSON.stringify({ region: 'Serra Gaúcha', petFriendly: true }),
      });
      expect(parsed.guestName).toBe('João Silva');
      expect(parsed.preferences).toContain('region');
    });
  });

  describe('buildHandoverSummary', () => {
    it('should build complete summary for guest_requested', () => {
      const summary = buildHandoverSummary({
        ...NULL_DEFAULTS,
        reason: 'guest_requested',
        guestName: 'Maria',
        guestPhone: '+5511888888888',
        hotelFocus: 'Nomaa Hotel',
        conversationSummary: 'Guest wants human help for special request',
        lastIntent: 'HANDOVER',
        preferences: JSON.stringify({ language: 'pt' }),
      });

      expect(summary.guest.name).toBe('Maria');
      expect(summary.guest.phone).toBe('+5511888888888');
      expect(summary.reason).toBe('guest_requested');
      expect(summary.hotelFocus).toBe('Nomaa Hotel');
      expect(summary.handover).toBe(true);
      expect(summary.chatwootReady).toBe(true);
      expect(summary.timestamp).toBeDefined();
    });

    it('should handle hotel_manual reason', () => {
      const summary = buildHandoverSummary({
        ...NULL_DEFAULTS,
        reason: 'hotel_manual',
        conversationSummary: 'Hotel has no API integration',
      });
      expect(summary.reason).toBe('hotel_manual');
      expect(summary.guest.name).toBeNull();
    });

    it('should handle low_confidence reason', () => {
      const summary = buildHandoverSummary({
        ...NULL_DEFAULTS,
        reason: 'low_confidence',
        conversationSummary: 'Intent classification confidence below threshold',
        lastIntent: 'RAG',
      });
      expect(summary.reason).toBe('low_confidence');
      expect(summary.conversation.lastIntent).toBe('RAG');
    });

    it('should handle api_failure reason', () => {
      const summary = buildHandoverSummary({
        ...NULL_DEFAULTS,
        reason: 'api_failure',
        conversationSummary: 'Elevare API timeout',
        hotelFocus: 'Casa Turquesa',
      });
      expect(summary.reason).toBe('api_failure');
      expect(summary.hotelFocus).toBe('Casa Turquesa');
    });

    it('should handle sensitive_topic reason', () => {
      const summary = buildHandoverSummary({
        ...NULL_DEFAULTS,
        reason: 'sensitive_topic',
        conversationSummary: 'Guest has complaint about previous stay',
      });
      expect(summary.reason).toBe('sensitive_topic');
      expect(summary.preferences).toEqual({});
    });

    it('should include ISO timestamp', () => {
      const summary = buildHandoverSummary({
        ...NULL_DEFAULTS,
        reason: 'guest_requested',
        conversationSummary: 'test',
      });
      expect(summary.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should always set handover and chatwootReady to true', () => {
      const summary = buildHandoverSummary({
        ...NULL_DEFAULTS,
        reason: 'hotel_manual',
        conversationSummary: 'test',
      });
      expect(summary.handover).toBe(true);
      expect(summary.chatwootReady).toBe(true);
    });
  });
});
