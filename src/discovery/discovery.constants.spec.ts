import { parseLocationFromQuery, slugify } from './discovery.constants';

describe('discovery.constants', () => {
  it('slugifies names for public URLs', () => {
    expect(slugify('E-Gym The Family Club')).toBe('e-gym-the-family-club');
  });

  it('parses city from keyword queries', () => {
    expect(parseLocationFromQuery('gym Mumbai')).toEqual({ keyword: 'gym', city: 'Mumbai' });
    expect(parseLocationFromQuery('photographer in Delhi')).toEqual({ keyword: 'photographer', city: 'Delhi' });
    expect(parseLocationFromQuery('bridal makeup')).toEqual({ keyword: 'bridal makeup' });
  });
});
