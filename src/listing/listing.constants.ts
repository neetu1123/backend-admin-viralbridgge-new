export const LISTING_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'SUSPENDED',
  'ARCHIVED',
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];
export type ListingType = 'BUSINESS' | 'CREATOR';
export type AccountKind = 'FREE_LISTING' | 'BRAND' | 'CREATOR';
export type FeatureAccess = 'LIMITED' | 'FULL';

export const FREE_LISTING_LIMITS = {
  gallery: 5,
  services: 5,
  languages: 8,
  name: 120,
  shortDescription: 200,
  description: 4000,
  logo: 1,
  cover: 1,
};

export const REPORT_REASONS = [
  'spam',
  'fake_listing',
  'incorrect_information',
  'inappropriate_content',
  'impersonation',
  'other',
] as const;

export function listingPermissions(account: AccountKind, featureAccess: FeatureAccess = 'FULL') {
  const unlocked = featureAccess === 'FULL' && (account === 'BRAND' || account === 'CREATOR');
  return {
    publicDiscoverProfile: true,
    searchVisibility: true,
    basicProfile: true,
    basicGallery: true,
    basicEnquiries: true,
    basicProfileViews: true,
    createCampaign: unlocked && account === 'BRAND',
    discoverCreators: unlocked && account === 'BRAND',
    applyCampaign: unlocked && account === 'CREATOR',
    campaignManagement: unlocked,
    advancedAnalytics: unlocked,
    teamManagement: unlocked,
    advancedMessaging: unlocked,
    payments: unlocked,
    advancedLeads: unlocked,
    featuredListing: unlocked,
    priorityPlacement: unlocked,
  };
}

export function isSafeHttpUrl(value?: string | null): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
