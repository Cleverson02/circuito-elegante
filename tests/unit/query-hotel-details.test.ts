import { queryHotelDetails } from '../../backend/src/tools/query-hotel-details';

// Mock the database
jest.mock('../../backend/src/database/client', () => {
  const mockHotelData = {
    identity: {
      description: 'Hotel de luxo em Ipanema',
      lodging_type: 'Hotel de luxo 5 estrelas',
      website: 'https://www.fasano.com.br',
    },
    accommodations: {
      room_types: [{ name: 'Suite', max_guests: 2 }],
      total_rooms: 89,
    },
    infrastructure: {
      pool_description: 'Piscina de borda infinita no rooftop',
      gym: 'Academia completa',
    },
    gastronomy: {
      restaurants: [{ name: 'Gero Rio', cuisine: 'Italiana' }],
      meals_included: 'Café da manhã',
    },
    policies: {
      check_in_time: '15:00',
      check_out_time: '12:00',
      pet_policy: 'Não aceita pets',
    },
    transport: {
      airport_distance: 'SDU ~15 min',
    },
    experiences: {
      activities_tours: ['Surf', 'Yoga'],
    },
    reputation: {
      differentials: ['Projeto de Philippe Starck', 'Piscina rooftop icônica'],
      star_rating: 5,
      awards: ['Condé Nast Traveler'],
    },
    integration: {
      ce_page_url: 'https://www.circuitoelegante.com.br/hotel/fasano-rj/',
    },
    _enrichment_version: '2.0',
    _enriched_at: '2026-04-08T01:00:00Z',
  };

  const mockHotels = [
    {
      id: '123',
      name: 'Fasano - RJ',
      slug: 'fasano-rj',
      pet_friendly: false,
      petFriendly: false,
      pool_heated: false,
      poolHeated: false,
      bradesco_coupon: false,
      bradescoCoupon: false,
      data: mockHotelData,
    },
  ];

  return {
    getDatabase: () => ({
      select: () => ({
        from: () => ({
          where: (condition: unknown) => ({
            limit: () => {
              // Check if the condition matches our mock
              return Promise.resolve(mockHotels.filter((h) => {
                // Simple simulation: return if any match
                return true;
              }).slice(0, 1));
            },
          }),
        }),
      }),
      execute: () => Promise.resolve([]),
    }),
  };
});

describe('query_hotel_details — Category Extraction', () => {
  it('should return summary when no category specified', async () => {
    const result = await queryHotelDetails({ hotelSlug: 'fasano-rj', category: null });

    expect(result.found).toBe(true);
    expect(result.hotelName).toBe('Fasano - RJ');
    expect(result.hotelSlug).toBe('fasano-rj');
    expect(result.details).toBeDefined();
    // Summary should contain key fields from multiple categories
    expect(result.schemaFields).toEqual({
      petFriendly: false,
      poolHeated: false,
      bradescoCoupon: false,
    });
  });

  it('should return specific category data', async () => {
    const result = await queryHotelDetails({ hotelSlug: 'fasano-rj', category: 'gastronomy' });

    expect(result.found).toBe(true);
    expect(result.category).toBe('gastronomy');
    expect(result.details).toBeDefined();
    const details = result.details!;
    expect(details['restaurants']).toBeDefined();
    expect(details['meals_included']).toBe('Café da manhã');
  });

  it('should return infrastructure category', async () => {
    const result = await queryHotelDetails({ hotelSlug: 'fasano-rj', category: 'infrastructure' });

    expect(result.found).toBe(true);
    expect(result.category).toBe('infrastructure');
    expect(result.details!['pool_description']).toBe('Piscina de borda infinita no rooftop');
    expect(result.details!['gym']).toBe('Academia completa');
  });

  it('should return reputation category', async () => {
    const result = await queryHotelDetails({ hotelSlug: 'fasano-rj', category: 'reputation' });

    expect(result.found).toBe(true);
    expect(result.details!['star_rating']).toBe(5);
    expect(result.details!['differentials']).toEqual(['Projeto de Philippe Starck', 'Piscina rooftop icônica']);
  });

  it('should return not found for unknown hotel', async () => {
    // Override mock to return empty for this test
    jest.spyOn(
      require('../../backend/src/database/client'),
      'getDatabase',
    ).mockReturnValueOnce({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }),
      execute: () => Promise.resolve([]),
    });

    const result = await queryHotelDetails({ hotelSlug: 'hotel-inexistente', category: null });

    expect(result.found).toBe(false);
    expect(result.suggestion).toBe('query_knowledge_base');
  });

  it('should return empty details for empty category', async () => {
    const result = await queryHotelDetails({ hotelSlug: 'fasano-rj', category: 'concierge' });

    expect(result.found).toBe(true);
    expect(result.details).toEqual({});
  });
});
