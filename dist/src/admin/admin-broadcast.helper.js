"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminBroadcast = sendAdminBroadcast;
function normalizeAudience(audience) {
    if (!audience || audience === 'all')
        return 'everyone';
    return audience;
}
function roleNamesForAudience(audience) {
    const map = {
        everyone: ['CREATOR', 'BRAND', 'ADMIN', 'SUPER_ADMIN'],
        all: ['CREATOR', 'BRAND', 'ADMIN', 'SUPER_ADMIN'],
        creators: ['CREATOR'],
        brands: ['BRAND'],
        admins: ['ADMIN', 'SUPER_ADMIN'],
    };
    return map[audience] ?? map.everyone;
}
function hasCreatorFilters(filters) {
    if (!filters)
        return false;
    return Boolean(filters.state?.trim()
        || filters.city?.trim()
        || filters.language?.trim()
        || filters.followersMin != null
        || filters.followersMax != null
        || filters.brandId?.trim());
}
function hasLocationFilters(filters) {
    return Boolean(filters?.state?.trim() || filters?.city?.trim());
}
function locationMatches(value, state, city) {
    const hay = (value ?? '').toLowerCase();
    if (city?.trim() && !hay.includes(city.trim().toLowerCase()))
        return false;
    if (state?.trim() && !hay.includes(state.trim().toLowerCase()))
        return false;
    return true;
}
async function creatorMatchesFilters(prisma, userId, filters) {
    if (!filters || !hasCreatorFilters(filters))
        return true;
    const profile = await prisma.creatorProfile.findUnique({
        where: { user_id: userId },
        select: {
            locality: true,
            languages: true,
            followers: true,
        },
    });
    if (!profile)
        return false;
    if (filters.language?.trim() && !profile.languages.includes(filters.language.trim()))
        return false;
    if (filters.followersMin != null && profile.followers < filters.followersMin)
        return false;
    if (filters.followersMax != null && profile.followers > filters.followersMax)
        return false;
    if (!locationMatches(profile.locality, filters.state, filters.city))
        return false;
    if (filters.brandId?.trim()) {
        const linked = await prisma.application.findFirst({
            where: {
                creator: { user_id: userId },
                status: { in: ['ACCEPTED', 'COMPLETED', 'PENDING'] },
                campaign: { brand_id: filters.brandId.trim() },
            },
            select: { id: true },
        });
        if (!linked)
            return false;
    }
    return true;
}
async function brandMatchesFilters(prisma, userId, filters) {
    if (!filters)
        return true;
    const profile = await prisma.brandProfile.findUnique({
        where: { user_id: userId },
        select: { id: true, location: true },
    });
    if (!profile)
        return false;
    if (filters.brandId?.trim() && profile.id !== filters.brandId.trim())
        return false;
    if (hasLocationFilters(filters) && !locationMatches(profile.location, filters.state, filters.city)) {
        return false;
    }
    return true;
}
async function resolveRecipients(prisma, audienceInput, filters) {
    const audience = normalizeAudience(audienceInput);
    const roles = roleNamesForAudience(audience);
    const creatorFiltersActive = hasCreatorFilters(filters);
    const users = await prisma.user.findMany({
        where: {
            is_deleted: false,
            is_banned: false,
            role: { name: { in: roles } },
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: { select: { name: true } },
        },
    });
    const matched = [];
    for (const user of users) {
        const roleName = user.role?.name;
        if (!roleName)
            continue;
        if (roleName === 'CREATOR') {
            if (await creatorMatchesFilters(prisma, user.id, filters)) {
                matched.push({ id: user.id, email: user.email, name: user.name });
            }
            continue;
        }
        if (roleName === 'BRAND') {
            if (await brandMatchesFilters(prisma, user.id, filters)) {
                matched.push({ id: user.id, email: user.email, name: user.name });
            }
            continue;
        }
        if (creatorFiltersActive)
            continue;
        matched.push({ id: user.id, email: user.email, name: user.name });
    }
    return matched;
}
async function sendAdminBroadcast(prisma, email, notifications, body, adminId) {
    if (!email.isConfigured()) {
        throw new Error('Email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to your backend environment (Vercel → Project → Settings → Environment Variables), then redeploy.');
    }
    if (!body.subject?.trim() || !body.title?.trim() || !body.message?.trim()) {
        throw new Error('Subject, title, and message are required');
    }
    const audience = normalizeAudience(body.audience);
    const recipients = await resolveRecipients(prisma, audience, body.filters);
    if (!recipients.length) {
        return { sent: 0, failed: 0, inApp: 0, total: 0, audience, errors: [] };
    }
    let sent = 0;
    let failed = 0;
    let inApp = 0;
    const errors = [];
    for (const user of recipients) {
        if (body.sendInApp !== false) {
            try {
                await notifications.create({
                    userId: user.id,
                    title: body.title,
                    message: body.message,
                    type: 'BROADCAST',
                    metadata: { audience, adminId, filters: body.filters ?? null },
                });
                inApp += 1;
            }
            catch (err) {
                errors.push(`In-app ${user.email}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        try {
            await email.sendBroadcastEmail({
                to: user.email,
                subject: body.subject.trim(),
                title: body.title.trim(),
                message: body.message.trim(),
                ctaLabel: body.ctaLabel,
                ctaUrl: body.ctaUrl,
            });
            sent += 1;
        }
        catch (err) {
            failed += 1;
            errors.push(`${user.email}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    if (adminId) {
        try {
            await prisma.auditLog.create({
                data: {
                    admin_id: adminId,
                    action: 'SEND_BROADCAST',
                    entity: 'Broadcast',
                    entity_id: audience,
                    metadata: {
                        subject: body.subject,
                        sent,
                        failed,
                        inApp,
                        total: recipients.length,
                        filters: (body.filters ?? null),
                    },
                },
            });
        }
        catch {
        }
    }
    return {
        sent,
        failed,
        inApp,
        total: recipients.length,
        audience,
        errors: errors.slice(0, 5),
    };
}
//# sourceMappingURL=admin-broadcast.helper.js.map