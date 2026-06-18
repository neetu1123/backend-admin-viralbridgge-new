"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAMPAIGN_STATUSES = exports.PLATFORMS = void 0;
exports.listAdminBrands = listAdminBrands;
exports.getAdminBrandDetail = getAdminBrandDetail;
exports.createCampaignForBrand = createCampaignForBrand;
exports.createBrandAccount = createBrandAccount;
exports.createCampaignWithBrand = createCampaignWithBrand;
const bcrypt = __importStar(require("bcrypt"));
const notifications_1 = require("./notifications");
const PLATFORMS = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK', 'LINKEDIN'];
exports.PLATFORMS = PLATFORMS;
const CAMPAIGN_STATUSES = ['DRAFT', 'ACTIVE', 'PENDING_APPROVAL'];
exports.CAMPAIGN_STATUSES = CAMPAIGN_STATUSES;
function normalizePlatform(platform) {
    const p = String(platform ?? 'INSTAGRAM').toUpperCase();
    if (!PLATFORMS.includes(p)) {
        throw new Error(`Invalid platform. Allowed: ${PLATFORMS.join(', ')}`);
    }
    return p;
}
function normalizeStatus(status) {
    const s = String(status ?? 'DRAFT').toUpperCase();
    if (!CAMPAIGN_STATUSES.includes(s)) {
        throw new Error(`Invalid status. Allowed: ${CAMPAIGN_STATUSES.join(', ')}`);
    }
    return s;
}
function parseDeadline(body) {
    const raw = body.applicationDeadline ?? body.application_deadline ?? body.endDate ?? body.end_date ?? body.startDate ?? body.start_date;
    if (!raw)
        throw new Error('applicationDeadline or endDate is required');
    const date = new Date(String(raw));
    if (Number.isNaN(date.getTime()))
        throw new Error('Invalid deadline date');
    return date;
}
function parseLocality(body) {
    const loc = body.locality;
    if (Array.isArray(loc))
        return loc.map(String).join(', ');
    if (typeof loc === 'string')
        return loc;
    return undefined;
}
function buildDeliverables(body) {
    const items = [];
    const posts = Number(body.numberOfPosts ?? body.number_of_posts) || 0;
    const reels = Number(body.numberOfReels ?? body.number_of_reels) || 0;
    const stories = Number(body.numberOfStories ?? body.number_of_stories) || 0;
    const videos = Number(body.numberOfVideos ?? body.number_of_videos) || 0;
    if (posts > 0)
        items.push(`${posts} Post${posts > 1 ? 's' : ''}`);
    if (reels > 0)
        items.push(`${reels} Reel${reels > 1 ? 's' : ''}`);
    if (stories > 0)
        items.push(`${stories} Stor${stories > 1 ? 'ies' : 'y'}`);
    if (videos > 0)
        items.push(`${videos} Video${videos > 1 ? 's' : ''}`);
    const custom = body.customDeliverables ?? body.custom_deliverables;
    if (Array.isArray(custom)) {
        custom.forEach((d) => {
            const s = String(d).trim();
            if (s)
                items.push(s);
        });
    }
    if (Array.isArray(body.deliverables)) {
        body.deliverables.forEach((d) => {
            const s = String(d).trim();
            if (s)
                items.push(s);
        });
    }
    return items.length > 0 ? items : ['Campaign content'];
}
function buildMetadata(body, adminId) {
    return {
        totalBudget: Number(body.totalBudget ?? body.total_budget ?? body.budget) || 0,
        creatorBudget: Number(body.creatorBudget ?? body.creator_budget) || 0,
        platformFee: Number(body.platformFee ?? body.platform_fee) || 0,
        minimumFollowers: Number(body.minimumFollowers ?? body.minimum_followers) || 0,
        maximumFollowers: Number(body.maximumFollowers ?? body.maximum_followers) || 0,
        minimumEngagementRate: Number(body.minimumEngagementRate ?? body.minimum_engagement_rate) || 0,
        numberOfPosts: Number(body.numberOfPosts ?? body.number_of_posts) || 0,
        numberOfReels: Number(body.numberOfReels ?? body.number_of_reels) || 0,
        numberOfStories: Number(body.numberOfStories ?? body.number_of_stories) || 0,
        numberOfVideos: Number(body.numberOfVideos ?? body.number_of_videos) || 0,
        customDeliverables: body.customDeliverables ?? body.custom_deliverables ?? [],
        startDate: body.startDate ?? body.start_date ?? null,
        endDate: body.endDate ?? body.end_date ?? null,
        applicationDeadline: body.applicationDeadline ?? body.application_deadline ?? null,
        campaignBrief: body.campaignBrief ?? body.campaign_brief ?? null,
        referenceFiles: body.referenceFiles ?? body.reference_files ?? [],
        brandAssets: body.brandAssets ?? body.brand_assets ?? [],
        createdByAdminId: adminId,
        enterpriseManaged: true,
    };
}
function resolveBudget(body) {
    const total = Number(body.totalBudget ?? body.total_budget ?? body.budget);
    if (!total || total <= 0)
        throw new Error('totalBudget must be greater than 0');
    return total;
}
async function getBrandRoleId(prisma) {
    const role = await prisma.role.findUnique({ where: { name: 'BRAND' } });
    if (!role)
        throw new Error('BRAND role not found. Run database seed.');
    return role.id;
}
async function ensureBrandWallet(prisma, userId) {
    return prisma.wallet.upsert({
        where: { user_id: userId },
        update: {},
        create: { user_id: userId },
    });
}
async function listAdminBrands(prisma, query = {}) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const skip = (page - 1) * limit;
    const userWhere = { role: { name: 'BRAND' }, is_deleted: false };
    if (query.status)
        userWhere.status = query.status.toUpperCase();
    if (query.verified === 'true')
        userWhere.is_verified = true;
    if (query.verified === 'false')
        userWhere.is_verified = false;
    const where = { user: userWhere };
    if (query.industry)
        where.industry = { contains: query.industry, mode: 'insensitive' };
    if (query.search) {
        where.OR = [
            { company_name: { contains: query.search, mode: 'insensitive' } },
            { contact_email: { contains: query.search, mode: 'insensitive' } },
            { user: { name: { contains: query.search, mode: 'insensitive' } } },
            { user: { email: { contains: query.search, mode: 'insensitive' } } },
        ];
    }
    const [rows, total] = await Promise.all([
        prisma.brandProfile.findMany({
            where,
            skip,
            take: limit,
            orderBy: { company_name: 'asc' },
            include: {
                user: { select: { id: true, name: true, email: true, status: true, is_verified: true } },
                _count: { select: { campaigns: true } },
            },
        }),
        prisma.brandProfile.count({ where }),
    ]);
    return {
        data: rows.map((b) => ({
            id: b.id,
            userId: b.user_id,
            companyName: b.company_name,
            contactPerson: b.user.name,
            email: b.contact_email ?? b.user.email,
            phone: b.phone,
            website: b.website,
            industry: b.industry,
            status: b.user.status,
            verified: b.user.is_verified,
            campaignCount: b._count.campaigns,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
async function getAdminBrandDetail(prisma, brandId) {
    const brand = await prisma.brandProfile.findUnique({
        where: { id: brandId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                    is_verified: true,
                    created_at: true,
                },
            },
            campaigns: {
                orderBy: { created_at: 'desc' },
                include: { _count: { select: { applications: true } } },
            },
        },
    });
    if (!brand)
        return null;
    const wallet = await prisma.wallet.findUnique({ where: { user_id: brand.user_id } });
    const brandKyc = await prisma.brandKyc.findUnique({ where: { user_id: brand.user_id } });
    const latestKyc = await prisma.kycRequest.findFirst({
        where: { user_id: brand.user_id },
        orderBy: { submitted_at: 'desc' },
    });
    const activeCampaigns = brand.campaigns.filter((c) => ['ACTIVE', 'PENDING_APPROVAL'].includes(c.status));
    const completedCampaigns = brand.campaigns.filter((c) => c.status === 'COMPLETED');
    return {
        profile: {
            id: brand.id,
            userId: brand.user_id,
            companyName: brand.company_name,
            contactPerson: brand.user.name,
            email: brand.contact_email ?? brand.user.email,
            phone: brand.phone,
            website: brand.website,
            industry: brand.industry,
            description: brand.description,
            location: brand.location,
            status: brand.user.status,
            verified: brand.user.is_verified,
            memberSince: brand.user.created_at,
        },
        wallet: wallet
            ? {
                availableBalance: wallet.available_balance,
                pendingBalance: wallet.pending_balance,
            }
            : { availableBalance: 0, pendingBalance: 0 },
        kycStatus: latestKyc?.status ?? brandKyc?.verification_status ?? 'UNVERIFIED',
        activeCampaigns: activeCampaigns.map(formatCampaignSummary),
        completedCampaigns: completedCampaigns.map(formatCampaignSummary),
        totalCampaigns: brand.campaigns.length,
    };
}
function formatCampaignSummary(c) {
    return {
        id: c.id,
        title: c.title,
        platform: c.platform,
        budget: c.budget,
        status: c.status,
        deadline: c.deadline,
        applicants: c._count?.applications ?? 0,
        createdAt: c.created_at,
    };
}
async function createCampaignRecord(prisma, brandProfileId, adminId, body) {
    const budget = resolveBudget(body);
    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim();
    if (!title)
        throw new Error('title is required');
    if (!description)
        throw new Error('description is required');
    const languages = Array.isArray(body.languages)
        ? body.languages.map(String)
        : typeof body.languages === 'string'
            ? [body.languages]
            : ['English'];
    return prisma.campaign.create({
        data: {
            brand_id: brandProfileId,
            title,
            description,
            platform: normalizePlatform(body.platform),
            budget,
            remaining_budget: budget,
            deadline: parseDeadline(body),
            deliverables: buildDeliverables(body),
            locality: parseLocality(body),
            languages,
            status: normalizeStatus(body.status),
            created_by_admin_id: adminId,
            metadata: buildMetadata(body, adminId),
        },
        include: {
            brand: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
    });
}
async function postCampaignCreated(prisma, adminId, campaign, brandUserId, auditFn, options) {
    await auditFn({
        adminId,
        brandId: campaign.brand.user_id,
        campaignId: campaign.id,
        metadata: { action: 'CREATE_CAMPAIGN_FOR_BRAND', ...options },
    });
    await (0, notifications_1.createNotification)(prisma, {
        userId: brandUserId,
        title: 'Campaign Created on Your Behalf',
        message: `Campaign "${campaign.title}" has been created by the ViralBridge Admin Team on your behalf.`,
        type: 'CAMPAIGN',
        entityType: 'Campaign',
        entityId: campaign.id,
    });
    await (0, notifications_1.createNotification)(prisma, {
        userId: adminId,
        title: 'Campaign Assigned to Brand',
        message: `Campaign "${campaign.title}" was successfully assigned to ${campaign.brand.company_name}.`,
        type: 'CAMPAIGN',
        entityType: 'Campaign',
        entityId: campaign.id,
    });
}
async function createCampaignForBrand(prisma, adminId, body, auditFn) {
    const brandId = String(body.brandId ?? body.brand_id ?? '').trim();
    if (!brandId)
        throw new Error('brandId is required');
    const brand = await prisma.brandProfile.findUnique({
        where: { id: brandId },
        include: { user: true },
    });
    if (!brand)
        throw new Error('Brand not found');
    const campaign = await createCampaignRecord(prisma, brand.id, adminId, body);
    await postCampaignCreated(prisma, adminId, campaign, brand.user_id, auditFn);
    return {
        campaign,
        brand: { id: brand.id, companyName: brand.company_name, userId: brand.user_id },
    };
}
async function createBrandAccount(prisma, body) {
    const companyName = String(body.companyName ?? body.company_name ?? '').trim();
    const contactPerson = String(body.contactPerson ?? body.contact_person ?? companyName).trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const phone = body.phone ? String(body.phone) : undefined;
    const website = body.website ? String(body.website) : undefined;
    const industry = body.industry ? String(body.industry) : undefined;
    if (!companyName)
        throw new Error('companyName is required');
    if (!email)
        throw new Error('email is required');
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
        throw new Error('A user with this email already exists');
    const roleId = await getBrandRoleId(prisma);
    const tempPassword = String(body.password ?? `Vb@${Math.random().toString(36).slice(2, 10)}A1`);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const user = await prisma.user.create({
        data: {
            name: contactPerson,
            email,
            password: hashedPassword,
            role_id: roleId,
            status: 'ACTIVE',
            is_verified: true,
        },
    });
    const brandProfile = await prisma.brandProfile.create({
        data: {
            user_id: user.id,
            company_name: companyName,
            industry,
            website,
            contact_email: email,
            phone,
        },
    });
    await ensureBrandWallet(prisma, user.id);
    return {
        user,
        brandProfile,
        tempPassword,
        invitationNote: `Brand account created. Temporary password: ${tempPassword} (share securely; email integration pending).`,
    };
}
async function createCampaignWithBrand(prisma, adminId, body, auditFn) {
    const { user, brandProfile, tempPassword, invitationNote } = await createBrandAccount(prisma, body);
    const campaign = await createCampaignRecord(prisma, brandProfile.id, adminId, body);
    await postCampaignCreated(prisma, adminId, campaign, user.id, auditFn, {
        invitationSent: true,
        newBrand: true,
    });
    return {
        campaign,
        brand: {
            id: brandProfile.id,
            userId: user.id,
            companyName: brandProfile.company_name,
            email: user.email,
            tempPassword,
        },
        invitationNote,
    };
}
//# sourceMappingURL=admin-campaigns.js.map