import { isSafeHttpUrl, listingPermissions } from './listing.constants';

describe('listing.constants', () => {
  it('locks campaign and payment features for free listings', () => {
    const free = listingPermissions('FREE_LISTING');
    expect(free.publicDiscoverProfile).toBe(true);
    expect(free.basicEnquiries).toBe(true);
    expect(free.createCampaign).toBe(false);
    expect(free.applyCampaign).toBe(false);
    expect(free.payments).toBe(false);
    expect(free.teamManagement).toBe(false);
  });

  it('unlocks brand campaign tools only for Brand accounts', () => {
    const brand = listingPermissions('BRAND');
    expect(brand.createCampaign).toBe(true);
    expect(brand.discoverCreators).toBe(true);
    expect(brand.applyCampaign).toBe(false);
  });

  it('keeps Brand and Creator campaign tools locked until full access', () => {
    const brand = listingPermissions('BRAND', 'LIMITED');
    const creator = listingPermissions('CREATOR', 'LIMITED');
    expect(brand.createCampaign).toBe(false);
    expect(brand.payments).toBe(false);
    expect(creator.applyCampaign).toBe(false);
    expect(creator.campaignManagement).toBe(false);
  });

  it('rejects unsafe listing URLs', () => {
    expect(isSafeHttpUrl('https://viralbridge.com')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('')).toBe(true);
  });
});
