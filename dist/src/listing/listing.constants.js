"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORT_REASONS = exports.FREE_LISTING_LIMITS = exports.LISTING_STATUSES = void 0;
exports.listingPermissions = listingPermissions;
exports.isSafeHttpUrl = isSafeHttpUrl;
exports.LISTING_STATUSES = [
    'DRAFT',
    'PENDING_REVIEW',
    'PUBLISHED',
    'REJECTED',
    'SUSPENDED',
    'ARCHIVED',
];
exports.FREE_LISTING_LIMITS = {
    gallery: 5,
    services: 5,
    languages: 8,
    name: 120,
    shortDescription: 200,
    description: 4000,
    logo: 1,
    cover: 1,
};
exports.REPORT_REASONS = [
    'spam',
    'fake_listing',
    'incorrect_information',
    'inappropriate_content',
    'impersonation',
    'other',
];
function listingPermissions(account) {
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
function isSafeHttpUrl(value) {
    if (!value)
        return true;
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=listing.constants.js.map