import { extractPetFriendly, extractPoolHeated } from '../../data/scripts/persist-enrichment';

describe('extractPetFriendly', () => {
  it('returns true for direct boolean pet_friendly=true', () => {
    expect(extractPetFriendly({ pet_friendly: true })).toBe(true);
  });

  it('returns false for direct boolean pet_friendly=false', () => {
    expect(extractPetFriendly({ pet_friendly: false })).toBe(false);
  });

  it('returns true for text "aceita pets"', () => {
    expect(extractPetFriendly({ pet_policy: 'O hotel aceita pets de pequeno porte' })).toBe(true);
  });

  it('returns true for text "pet-friendly"', () => {
    expect(extractPetFriendly({ pet_policy: 'Somos pet-friendly!' })).toBe(true);
  });

  it('returns true for text "animais são permitidos"', () => {
    expect(extractPetFriendly({ pet_policy: 'Animais de estimação são permitidos nas áreas comuns' })).toBe(true);
  });

  it('returns false for text "não aceita pets"', () => {
    expect(extractPetFriendly({ pet_policy: 'Não aceita pets' })).toBe(false);
  });

  it('returns false for text "proibido animais"', () => {
    expect(extractPetFriendly({ pet_policy: 'Proibido animais de estimação' })).toBe(false);
  });

  it('returns true for nested object allows_pets=true', () => {
    expect(extractPetFriendly({ pet_policy: { allows_pets: true, restrictions: 'small only' } })).toBe(true);
  });

  it('returns false for nested object allows_pets=false', () => {
    expect(extractPetFriendly({ pet_policy: { allows_pets: false } })).toBe(false);
  });

  it('returns null when no pet data available', () => {
    expect(extractPetFriendly({})).toBeNull();
  });

  it('returns null when pet_policy is null', () => {
    expect(extractPetFriendly({ pet_policy: null })).toBeNull();
  });

  it('returns null when pet_policy is empty string', () => {
    expect(extractPetFriendly({ pet_policy: '' })).toBeNull();
  });
});

describe('extractPoolHeated', () => {
  it('returns true for direct boolean pool_heated=true', () => {
    expect(extractPoolHeated({ pool_heated: true })).toBe(true);
  });

  it('returns false for direct boolean pool_heated=false', () => {
    expect(extractPoolHeated({ pool_heated: false })).toBe(false);
  });

  it('returns true when pool_description mentions "aquecida"', () => {
    expect(extractPoolHeated({ pool_description: 'Piscina semi-olímpica + piscinas aquecidas' })).toBe(true);
  });

  it('returns true for "Piscina Aquecida central"', () => {
    expect(extractPoolHeated({ pool_description: 'Piscina Aquecida central + piscinas privativas' })).toBe(true);
  });

  it('returns null when pool_description has no heat info', () => {
    expect(extractPoolHeated({ pool_description: 'Piscina ao ar livre, vista para o mar' })).toBeNull();
  });

  it('returns null when no pool data available', () => {
    expect(extractPoolHeated({})).toBeNull();
  });

  it('returns null when pool_description is null', () => {
    expect(extractPoolHeated({ pool_description: null })).toBeNull();
  });
});
