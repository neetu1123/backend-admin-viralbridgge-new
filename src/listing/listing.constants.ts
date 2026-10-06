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

export function listingPermissions(account: AccountKind) {
  const paid = account === 'BRAND' || account === 'CREATOR';
  return {
    publicDiscoverProfile: true,
    searchVisibility: true,
    basicProfile: true,
    basicGallery: true,
    basicEnquiries: true,
    basicProfileViews: true,
    createCampaign: account === 'BRAND',
    discoverCreators: account === 'BRAND',
    applyCampaign: account === 'CREATOR',
    campaignManagement: paid,
    advancedAnalytics: paid,
    teamManagement: paid,
    advancedMessaging: paid,
    payments: paid,
    advancedLeads: paid,
    featuredListing: paid,
    priorityPlacement: paid,
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
