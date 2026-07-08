"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminBroadcast = sendAdminBroadcast;
async function resolveRecipients(prisma, audience) {
    const roleMap = {
        all: ['CREATOR', 'BRAND'],
        creators: ['CREATOR'],
        brands: ['BRAND'],
        admins: ['ADMIN', 'SUPER_ADMIN'],
    };
    return prisma.user.findMany({
        where: {
            is_deleted: false,
            is_banned: false,
            role: { name: { in: roleMap[audience] } },
        },
        select: { id: true, email: true, name: true },
    });
}
async function sendAdminBroadcast(prisma, email, notifications, body, adminId) {
    if (!email.isConfigured()) {
        throw new Error('Email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to your backend environment (Vercel → Project → Settings → Environment Variables), then redeploy.');
    }
    if (!body.subject?.trim() || !body.title?.trim() || !body.message?.trim()) {
        throw new Error('Subject, title, and message are required');
    }
    const audience = body.audience ?? 'all';
    const recipients = await resolveRecipients(prisma, audience);
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
                    metadata: { audience, adminId },
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
                    metadata: { subject: body.subject, sent, failed, inApp, total: recipients.length },
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