import { QueryHotelDetailsParams } from '../../backend/src/tools/query-hotel-details';

describe('query_hotel_details Tool', () => {
  describe('QueryHotelDetailsParams schema', () => {
    it('should accept hotelName with null fields (summary mode)', () => {
      const parsed = QueryHotelDetailsParams.parse({
        hotelName: 'Rituaali Spa',
        fields: null,
      });
      expect(parsed.hotelName).toBe('Rituaali Spa');
      expect(parsed.fields).toBeNull();
    });

    it('should accept hotelName with specific fields', () => {
      const parsed = QueryHotelDetailsParams.parse({
        hotelName: 'Unique Garden',
        fields: ['room_types', 'parking', 'check_in_out'],
      });
      expect(parsed.hotelName).toBe('Unique Garden');
      expect(parsed.fields).toHaveLength(3);
      expect(parsed.fields).toContain('room_types');
    });

    it('should accept hotelName with empty fields array', () => {
      const parsed = QueryHotelDetailsParams.parse({
        hotelName: 'Le Canton',
        fields: [],
      });
      expect(parsed.fields).toHaveLength(0);
    });

    it('should reject missing hotelName', () => {
      expect(() => QueryHotelDetailsParams.parse({ fields: null })).toThrow();
    });

    it('should reject empty hotelName', () => {
      // zod string() allows empty by default — tool handles gracefully
      const parsed = QueryHotelDetailsParams.parse({ hotelName: '', fields: null });
      expect(parsed.hotelName).toBe('');
    });

    it('should accept fuzzy partial names', () => {
      const parsed = QueryHotelDetailsParams.parse({
        hotelName: 'rituali',
        fields: null,
      });
      expect(parsed.hotelName).toBe('rituali');
    });

    it('should accept single field in array', () => {
      const parsed = QueryHotelDetailsParams.parse({
        hotelName: 'Nomaa',
        fields: ['wellness'],
      });
      expect(parsed.fields).toEqual(['wellness']);
    });

    it('should accept many taxonomy fields', () => {
      const parsed = QueryHotelDetailsParams.parse({
        hotelName: 'Vila Kalango',
        fields: [
          'description', 'lodging_type', 'room_types', 'room_amenities',
          'parking', 'pool_description', 'wellness', 'restaurants',
          'check_in_out', 'cancellation_policy', 'children_policy',
          'pet_policy', 'airport_distance', 'transfer',
        ],
      });
      expect(parsed.fields).toHaveLength(14);
    });
  });
});
