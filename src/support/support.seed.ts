import { PrismaClient } from '@prisma/client';

type IssueSeed = {
  title: string;
  slug: string;
  description?: string;
  keywords?: string[];
  solution?: string;
  actionType?: string;
  actionUrl?: string;
  requiresAdmin?: boolean;
  priority?: string;
  caseType?: string;
};

type SubcategorySeed = {
  name: string;
  slug: string;
  issues: IssueSeed[];
};

type CategorySeed = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: SubcategorySeed[];
};

const BRAND_TREE: CategorySeed[] = [
  {
    name: 'My Account',
    slug: 'my-account',
    icon: 'User',
    description: 'Profile, login, verification, and account settings',
    subcategories: [
      {
        name: 'Profile & Business Information',
        slug: 'profile',
        issues: [
          { title: 'Edit Business Information', slug: 'edit-business-info', solution: 'Go to Settings → Profile to update your business details.', actionType: 'link', actionUrl: '/brand-settings/profile' },
          { title: 'Verification Pending', slug: 'verification-pending', solution: 'Your KYC is under review. You will be notified once approved.', keywords: ['kyc', 'verify'], requiresAdmin: true, caseType: 'KYC' },
          { title: 'Forgot Password', slug: 'forgot-password', solution: 'Use the Forgot Password link on the login page to reset your password.', actionType: 'link', actionUrl: '/sign-up-login-screen' },
          { title: 'Other Account Issue', slug: 'other-account', requiresAdmin: true, caseType: 'ACCOUNT' },
        ],
      },
    ],
  },
  {
    name: 'Campaigns',
    slug: 'campaigns',
    icon: 'Briefcase',
    description: 'Create, edit, and manage your campaigns',
    subcategories: [
      {
        name: 'Campaign Management',
        slug: 'campaign-management',
        issues: [
          { title: 'Create a Campaign', slug: 'create-campaign', solution: 'Go to Create Campaign to launch a new campaign.', actionType: 'link', actionUrl: '/brand-campaign-management/create' },
          { title: 'Campaign Not Showing', slug: 'campaign-not-showing', solution: 'Check your campaign status in My Campaigns. Draft campaigns are not visible to creators.', actionType: 'link', actionUrl: '/brand-my-campaigns', requiresAdmin: true, caseType: 'CAMPAIGN' },
          { title: 'Campaign Status Issue', slug: 'campaign-status', keywords: ['stuck', 'active', 'paused'], requiresAdmin: true, caseType: 'CAMPAIGN', priority: 'HIGH' },
          { title: 'Other Campaign Issue', slug: 'other-campaign', requiresAdmin: true, caseType: 'CAMPAIGN' },
        ],
      },
    ],
  },
  {
    name: 'Applications',
    slug: 'applications',
    icon: 'Users',
    description: 'Review and manage creator applications',
    subcategories: [
      {
        name: 'Application Status',
        slug: 'application-status',
        issues: [
          { title: 'Application Not Showing', slug: 'application-not-showing', solution: 'Applications appear once creators apply. Check that your campaign is active.', actionType: 'link', actionUrl: '/brand-applicant', requiresAdmin: true, caseType: 'CAMPAIGN' },
          { title: 'Approve or Decline Application', slug: 'approve-decline', solution: 'Review applicants from the Applicants page.', actionType: 'link', actionUrl: '/brand-applicant' },
          { title: 'Other Application Issue', slug: 'other-application', requiresAdmin: true, caseType: 'CAMPAIGN' },
        ],
      },
    ],
  },
  {
    name: 'Content & Deliverables',
    slug: 'content-deliverables',
    icon: 'Upload',
    description: 'Review and approve creator content',
    subcategories: [
      {
        name: 'Content Review',
        slug: 'content-review',
        issues: [
          { title: 'Content Missing or Won\'t Load', slug: 'content-missing', solution: 'Check Review Deliverables for submitted content.', actionType: 'link', actionUrl: '/brand-deliverables', requiresAdmin: true, caseType: 'CONTENT' },
          { title: 'Request Revision', slug: 'request-revision', solution: 'Use Review Deliverables to request changes from the creator.', actionType: 'link', actionUrl: '/brand-deliverables' },
          { title: 'Other Content Issue', slug: 'other-content', requiresAdmin: true, caseType: 'CONTENT' },
        ],
      },
    ],
  },
  {
    name: 'Payments & Billing',
    slug: 'payments-billing',
    icon: 'CreditCard',
    description: 'Payments, escrow, refunds, and billing',
    subcategories: [
      {
        name: 'Payment Status',
        slug: 'payment-status',
        issues: [
          { title: 'Payment Status Inquiry', slug: 'payment-status', keywords: ['payment', 'escrow', 'billing'], requiresAdmin: true, caseType: 'PAYMENT', priority: 'HIGH' },
          { title: 'Payment Dispute', slug: 'payment-dispute', keywords: ['dispute', 'refund'], requiresAdmin: true, caseType: 'PAYMENT_DISPUTE', priority: 'URGENT' },
          { title: 'Other Payment Issue', slug: 'other-payment', requiresAdmin: true, caseType: 'PAYMENT' },
        ],
      },
    ],
  },
  {
    name: 'Messaging',
    slug: 'messaging',
    icon: 'MessageSquare',
    description: 'Chat and communication with creators',
    subcategories: [
      {
        name: 'Messaging Issues',
        slug: 'messaging-issues',
        issues: [
          { title: 'Can\'t Send Message', slug: 'cant-send-message', solution: 'Ensure you have an active conversation. Try refreshing the page.', actionType: 'link', actionUrl: '/brand-messages', requiresAdmin: true, caseType: 'GENERAL_SUPPORT' },
          { title: 'Report a Message', slug: 'report-message', requiresAdmin: true, caseType: 'MODERATION', priority: 'HIGH' },
          { title: 'Other Messaging Issue', slug: 'other-messaging', requiresAdmin: true, caseType: 'GENERAL_SUPPORT' },
        ],
      },
    ],
  },
  {
    name: 'Technical Issues',
    slug: 'technical',
    icon: 'Settings',
    description: 'Bugs, errors, and platform problems',
    subcategories: [
      {
        name: 'Technical Support',
        slug: 'technical-support',
        issues: [
          { title: 'Page Not Loading', slug: 'page-not-loading', requiresAdmin: true, caseType: 'TECHNICAL', priority: 'HIGH' },
          { title: 'Upload Failed', slug: 'upload-failed', keywords: ['upload', 'error'], requiresAdmin: true, caseType: 'TECHNICAL' },
          { title: 'Other Technical Issue', slug: 'other-technical', requiresAdmin: true, caseType: 'TECHNICAL' },
        ],
      },
    ],
  },
  {
    name: 'Report a Problem',
    slug: 'report-problem',
    icon: 'Flag',
    description: 'Report creators, fraud, or policy violations',
    subcategories: [
      {
        name: 'Reports',
        slug: 'reports',
        issues: [
          { title: 'Report a Creator', slug: 'report-creator', requiresAdmin: true, caseType: 'MODERATION', priority: 'HIGH' },
          { title: 'Fraud or Scam', slug: 'fraud-scam', requiresAdmin: true, caseType: 'FRAUD', priority: 'URGENT' },
          { title: 'Other Report', slug: 'other-report', requiresAdmin: true, caseType: 'MODERATION' },
        ],
      },
    ],
  },
  {
    name: 'Something Else',
    slug: 'something-else',
    icon: 'HelpCircle',
    description: 'Can\'t find what you need? Chat with our team',
    subcategories: [
      {
        name: 'General Help',
        slug: 'general-help',
        issues: [
          { title: 'Chat with Admin', slug: 'chat-with-admin', description: 'Tell us what you need help with and our team will assist you.', requiresAdmin: true, caseType: 'GENERAL_SUPPORT' },
        ],
      },
    ],
  },
];

const CREATOR_TREE: CategorySeed[] = [
  {
    name: 'My Profile',
    slug: 'my-profile',
    icon: 'User',
    description: 'Profile, social accounts, and verification',
    subcategories: [
      {
        name: 'Profile Settings',
        slug: 'profile-settings',
        issues: [
          { title: 'Edit Profile', slug: 'edit-profile', solution: 'Update your profile from My Profile settings.', actionType: 'link', actionUrl: '/creator-profile' },
          { title: 'Connect Social Account', slug: 'connect-social', solution: 'Link your social accounts in Profile settings.', actionType: 'link', actionUrl: '/creator-settings/profile' },
          { title: 'Verification Issue', slug: 'verification-issue', requiresAdmin: true, caseType: 'KYC' },
          { title: 'Other Profile Issue', slug: 'other-profile', requiresAdmin: true, caseType: 'ACCOUNT' },
        ],
      },
    ],
  },
  {
    name: 'Find Campaigns',
    slug: 'find-campaigns',
    icon: 'Search',
    description: 'Discover and apply to campaigns',
    subcategories: [
      {
        name: 'Campaign Discovery',
        slug: 'campaign-discovery',
        issues: [
          { title: 'Campaign Doesn\'t Appear', slug: 'campaign-not-appearing', solution: 'Try adjusting filters on Discover Campaigns.', actionType: 'link', actionUrl: '/campaign-discovery' },
          { title: 'Campaign Eligibility', slug: 'campaign-eligibility', keywords: ['eligible', 'followers', 'requirements'], requiresAdmin: true, caseType: 'CAMPAIGN' },
          { title: 'Other Discovery Issue', slug: 'other-discovery', requiresAdmin: true, caseType: 'CAMPAIGN' },
        ],
      },
    ],
  },
  {
    name: 'Campaign Applications',
    slug: 'campaign-applications',
    icon: 'FileText',
    description: 'Apply, track, and manage applications',
    subcategories: [
      {
        name: 'Application Status',
        slug: 'application-status',
        issues: [
          { title: 'Application Status', slug: 'application-status', solution: 'Check My Campaigns for application status (Pending, Approved, Declined).', actionType: 'link', actionUrl: '/my-applications', keywords: ['pending', 'approved', 'declined'] },
          { title: 'Application Not Showing', slug: 'application-not-showing', requiresAdmin: true, caseType: 'CAMPAIGN' },
          { title: 'Can\'t Apply to Campaign', slug: 'cant-apply', requiresAdmin: true, caseType: 'CAMPAIGN' },
          { title: 'Other Application Issue', slug: 'other-application', requiresAdmin: true, caseType: 'CAMPAIGN' },
        ],
      },
    ],
  },
  {
    name: 'My Campaigns',
    slug: 'my-campaigns',
    icon: 'Briefcase',
    description: 'Active campaigns and deliverables',
    subcategories: [
      {
        name: 'Active Campaigns',
        slug: 'active-campaigns',
        issues: [
          { title: 'Campaign Details', slug: 'campaign-details', solution: 'View campaign details in My Campaigns.', actionType: 'link', actionUrl: '/my-applications' },
          { title: 'Brand Isn\'t Responding', slug: 'brand-not-responding', requiresAdmin: true, caseType: 'CAMPAIGN', priority: 'HIGH' },
          { title: 'Other Campaign Issue', slug: 'other-campaign', requiresAdmin: true, caseType: 'CAMPAIGN' },
        ],
      },
    ],
  },
  {
    name: 'Content & Deliverables',
    slug: 'content-deliverables',
    icon: 'Upload',
    description: 'Submit and track your content',
    subcategories: [
      {
        name: 'Content Submission',
        slug: 'content-submission',
        issues: [
          { title: 'Submit Content', slug: 'submit-content', solution: 'Upload deliverables from My Deliverables.', actionType: 'link', actionUrl: '/creator-deliverables' },
          { title: 'Upload Problem', slug: 'upload-problem', keywords: ['upload', 'failed'], requiresAdmin: true, caseType: 'CONTENT' },
          { title: 'Content Was Rejected', slug: 'content-rejected', requiresAdmin: true, caseType: 'CONTENT' },
          { title: 'Other Content Issue', slug: 'other-content', requiresAdmin: true, caseType: 'CONTENT' },
        ],
      },
    ],
  },
  {
    name: 'Payments & Earnings',
    slug: 'payments-earnings',
    icon: 'Wallet',
    description: 'Earnings, withdrawals, and payment status',
    subcategories: [
      {
        name: 'Payment & Withdrawals',
        slug: 'payment-withdrawals',
        issues: [
          { title: 'Payment Not Received', slug: 'payment-not-received', keywords: ['payment', 'withdrawal', 'earnings'], requiresAdmin: true, caseType: 'PAYMENT', priority: 'HIGH' },
          { title: 'Withdrawal Issue', slug: 'withdrawal-issue', keywords: ['withdraw', 'wallet'], requiresAdmin: true, caseType: 'WITHDRAWAL', priority: 'HIGH' },
          { title: 'Payment Dispute', slug: 'payment-dispute', requiresAdmin: true, caseType: 'PAYMENT_DISPUTE', priority: 'URGENT' },
          { title: 'Other Payment Issue', slug: 'other-payment', requiresAdmin: true, caseType: 'PAYMENT' },
        ],
      },
    ],
  },
  {
    name: 'Messaging',
    slug: 'messaging',
    icon: 'MessageSquare',
    description: 'Chat with brands',
    subcategories: [
      {
        name: 'Messaging Issues',
        slug: 'messaging-issues',
        issues: [
          { title: 'Can\'t Send Message', slug: 'cant-send-message', actionType: 'link', actionUrl: '/messaging-inbox', requiresAdmin: true, caseType: 'GENERAL_SUPPORT' },
          { title: 'Report a Message', slug: 'report-message', requiresAdmin: true, caseType: 'MODERATION', priority: 'HIGH' },
          { title: 'Other Messaging Issue', slug: 'other-messaging', requiresAdmin: true, caseType: 'GENERAL_SUPPORT' },
        ],
      },
    ],
  },
  {
    name: 'Technical Issues',
    slug: 'technical',
    icon: 'Settings',
    description: 'Bugs and platform errors',
    subcategories: [
      {
        name: 'Technical Support',
        slug: 'technical-support',
        issues: [
          { title: 'Page Not Loading', slug: 'page-not-loading', requiresAdmin: true, caseType: 'TECHNICAL', priority: 'HIGH' },
          { title: 'Upload Failed', slug: 'upload-failed', requiresAdmin: true, caseType: 'TECHNICAL' },
          { title: 'Other Technical Issue', slug: 'other-technical', requiresAdmin: true, caseType: 'TECHNICAL' },
        ],
      },
    ],
  },
  {
    name: 'Report a Problem',
    slug: 'report-problem',
    icon: 'Flag',
    description: 'Report brands or policy violations',
    subcategories: [
      {
        name: 'Reports',
        slug: 'reports',
        issues: [
          { title: 'Report a Brand', slug: 'report-brand', requiresAdmin: true, caseType: 'MODERATION', priority: 'HIGH' },
          { title: 'Payment Manipulation', slug: 'payment-manipulation', requiresAdmin: true, caseType: 'FRAUD', priority: 'URGENT' },
          { title: 'Other Report', slug: 'other-report', requiresAdmin: true, caseType: 'MODERATION' },
        ],
      },
    ],
  },
  {
    name: 'Something Else',
    slug: 'something-else',
    icon: 'HelpCircle',
    description: 'General questions and admin chat',
    subcategories: [
      {
        name: 'General Help',
        slug: 'general-help',
        issues: [
          { title: 'Chat with Admin', slug: 'chat-with-admin', description: 'Describe your issue and our support team will help.', requiresAdmin: true, caseType: 'GENERAL_SUPPORT' },
        ],
      },
    ],
  },
];

export async function seedSupportData(prisma: PrismaClient) {
  const existing = await prisma.supportCategory.count();
  if (existing > 0) return;

  async function seedRole(role: 'BRAND' | 'CREATOR', tree: CategorySeed[]) {
    for (let ci = 0; ci < tree.length; ci++) {
      const cat = tree[ci];
      const category = await prisma.supportCategory.create({
        data: {
          role,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          sort_order: ci,
        },
      });

      for (let si = 0; si < cat.subcategories.length; si++) {
        const sub = cat.subcategories[si];
        const subcategory = await prisma.supportSubcategory.create({
          data: {
            category_id: category.id,
            name: sub.name,
            slug: sub.slug,
            sort_order: si,
          },
        });

        for (const issue of sub.issues) {
          await prisma.supportIssue.create({
            data: {
              subcategory_id: subcategory.id,
              title: issue.title,
              slug: issue.slug,
              description: issue.description,
              keywords: issue.keywords ?? [],
              solution: issue.solution,
              action_type: issue.actionType,
              action_url: issue.actionUrl,
              requires_admin: issue.requiresAdmin ?? false,
              priority: issue.priority ?? 'MEDIUM',
              case_type: issue.caseType ?? 'GENERAL_SUPPORT',
            },
          });
        }
      }
    }
  }

  await seedRole('BRAND', BRAND_TREE);
  await seedRole('CREATOR', CREATOR_TREE);
}
