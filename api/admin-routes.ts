import { Router, type Request } from 'express';
import * as bcrypt from 'bcrypt';
import { getAdminMatchesResponse, updateMatchStatus } from './lib/ai-matching-express';
import { requireAdmin, type AuthedRequest } from './lib/auth-middleware';
import { getPrisma } from './lib/prisma';
import { getSettingsResponse, updateSettingsResponse } from './lib/platform-settings';

const router = Router();
const prisma = () => getPrisma();

function paramId(req: Request, key = 'id'): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}

function ok(res: any, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res: any, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

async function audit(
  adminId: string | undefined,
  action: string,
  entity: string,
  entityId: string,
  metadata?: unknown,
  actorRole?: string,
) {
  if (!adminId) return;
  try {
    await prisma().auditLog.create({
      data: {
        admin_id: adminId,
        action,
        entity,
        entity_id: entityId,
        metadata: { ...((metadata as object) ?? {}), ...(actorRole ? { actorRole } : {}) },
      },
    });
  } catch (error) {
    console.error('AuditLog write failed:', error);
  }
}

router.use(requireAdmin);

router.get('/dashboard/stats', async (_req, res) => {
  const [users, campaigns, escrows, auditLogs] = await Promise.all([
    prisma().user.count(),
    prisma().campaign.count(),
    prisma().escrow.aggregate({ _sum: { amount: true } }),
    prisma().auditLog.count(),
  ]);
  return ok(res, {
    totalUsers: users,
    totalCampaigns: campaigns,
    gmv: escrows._sum.amount || 0,
    totalAuditLogs: auditLogs,
  });
});

router.get('/users', async (_req, res) => ok(res, await prisma().user.findMany({ include: { role: true } })));

router.get('/users/:id', async (req, res) => {
  const user = await prisma().user.findUnique({
    where: { id: paramId(req) },
    include: { role: true, creator_profile: true, brand_profile: true },
  });
  if (!user) return fail(res, 'User not found', 404);
  return ok(res, user);
});

router.patch('/users/:id/role', async (req: AuthedRequest, res) => {
  const result = await prisma().user.update({
    where: { id: paramId(req) },
    data: { role_id: req.body?.role_id },
  });
  await audit(req.user?.id, 'UPDATE_USER_ROLE', 'User', paramId(req), { role_id: req.body?.role_id });
  return ok(res, result);
});

router.patch('/users/:id/ban', async (req: AuthedRequest, res) => {
  const result = await prisma().user.update({ where: { id: paramId(req) }, data: { is_banned: true } });
  await audit(req.user?.id, 'BAN_USER', 'User', paramId(req), { banned: true });
  return ok(res, result);
});

router.patch('/users/:id/unban', async (req: AuthedRequest, res) => {
  const result = await prisma().user.update({ where: { id: paramId(req) }, data: { is_banned: false } });
  await audit(req.user?.id, 'UNBAN_USER', 'User', paramId(req), { banned: false });
  return ok(res, result);
});

router.get('/campaigns', async (_req, res) => {
  try {
    const campaigns = await prisma().campaign.findMany({
      include: {
        brand: { include: { user: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return ok(res, campaigns);
  } catch (error) {
    console.error('GET /admin/campaigns failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to load campaigns';
    return fail(res, message, 500);
  }
});

router.get('/campaigns/flagged', async (_req, res) => {
  try {
    const campaigns = await prisma().campaign.findMany({
      where: { status: 'FLAGGED' },
      include: { brand: true },
    });
    return ok(res, campaigns);
  } catch (error) {
    console.error('GET /admin/campaigns/flagged failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to load flagged campaigns';
    return fail(res, message, 500);
  }
});

router.post('/campaigns/:id/approve', async (req: AuthedRequest, res) => {
  const result = await prisma().campaign.update({ where: { id: paramId(req) }, data: { status: 'ACTIVE' } });
  await audit(req.user?.id, 'APPROVE_CAMPAIGN', 'Campaign', paramId(req), { status: 'ACTIVE' });
  try {
    const { getMatchingService } = require('./lib/services') as typeof import('./lib/services');
    await getMatchingService().runMatchingForCampaign(paramId(req));
  } catch (error) {
    console.error('AI matching after approve failed:', error);
  }
  return ok(res, result);
});

router.post('/campaigns/:id/reject', async (req: AuthedRequest, res) => {
  const result = await prisma().campaign.update({ where: { id: paramId(req) }, data: { status: 'REJECTED' } });
  await audit(req.user?.id, 'REJECT_CAMPAIGN', 'Campaign', paramId(req), { status: 'REJECTED' });
  return ok(res, result);
});

router.post('/campaigns/:id/flag', async (req: AuthedRequest, res) => {
  const reason = req.body?.reason ?? '';
  const result = await prisma().campaign.update({ where: { id: paramId(req) }, data: { status: 'FLAGGED' } });
  await audit(req.user?.id, 'FLAG_CAMPAIGN', 'Campaign', paramId(req), { status: 'FLAGGED', reason });
  return ok(res, result);
});

async function auditCampaignForBrand(data: {
  adminId: string;
  brandId: string;
  campaignId: string;
  metadata?: unknown;
}) {
  await audit(data.adminId, 'CREATE_CAMPAIGN_FOR_BRAND', 'Campaign', data.campaignId, {
    brand_id: data.brandId,
    ...(data.metadata as object),
  });
}

router.get('/brands', async (req, res) => {
  try {
    const { listAdminBrands } = require('./lib/admin-campaigns') as typeof import('./lib/admin-campaigns');
    const result = await listAdminBrands(prisma(), {
      search: req.query.search ? String(req.query.search) : undefined,
      industry: req.query.industry ? String(req.query.industry) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
      verified: req.query.verified ? String(req.query.verified) : undefined,
      page: parseInt(String(req.query.page ?? '1'), 10) || 1,
      limit: parseInt(String(req.query.limit ?? '20'), 10) || 20,
    });
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load brands', 500);
  }
});

router.get('/brands/:id', async (req, res) => {
  try {
    const { getAdminBrandDetail } = require('./lib/admin-campaigns') as typeof import('./lib/admin-campaigns');
    const result = await getAdminBrandDetail(prisma(), paramId(req));
    if (!result) return fail(res, 'Brand not found', 404);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load brand', 500);
  }
});

router.post('/campaigns/create-for-brand', async (req: AuthedRequest, res) => {
  try {
    const { createCampaignForBrand } = require('./lib/admin-campaigns') as typeof import('./lib/admin-campaigns');
    const result = await createCampaignForBrand(prisma(), req.user!.id, req.body ?? {}, auditCampaignForBrand);
    return ok(res, result, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to create campaign', 500);
  }
});

router.post('/campaigns/create-with-brand', async (req: AuthedRequest, res) => {
  try {
    const { createCampaignWithBrand } = require('./lib/admin-campaigns') as typeof import('./lib/admin-campaigns');
    const result = await createCampaignWithBrand(prisma(), req.user!.id, req.body ?? {}, auditCampaignForBrand);
    return ok(res, result, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to create brand and campaign', 500);
  }
});

router.get('/transactions', async (_req, res) =>
  ok(res, await prisma().walletTransaction.findMany({ include: { wallet: { include: { user: true } } } })),
);

router.get('/roles', async (_req, res) =>
  ok(res, await prisma().role.findMany({ include: { _count: { select: { users: true } } } })),
);

router.post('/roles', async (req: AuthedRequest, res) => {
  const role = await prisma().role.create({
    data: { name: req.body?.name, description: req.body?.description },
  });
  await audit(req.user?.id, 'CREATE_ROLE', 'Role', role.id, { name: role.name });
  return ok(res, role, 201);
});

router.put('/roles/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma().role.findUnique({ where: { id: paramId(req) } });
  if (!existing) return fail(res, 'Role not found', 404);
  if (['SUPER_ADMIN', 'ADMIN'].includes(existing.name) && existing.name !== req.body?.name) {
    return fail(res, 'System critical roles (SUPER_ADMIN, ADMIN) cannot be renamed.', 400);
  }
  const role = await prisma().role.update({
    where: { id: paramId(req) },
    data: { name: req.body?.name, description: req.body?.description },
  });
  await audit(req.user?.id, 'UPDATE_ROLE', 'Role', paramId(req), { name: role.name });
  return ok(res, role);
});

router.delete('/roles/:id', async (req: AuthedRequest, res) => {
  const role = await prisma().role.findUnique({ where: { id: paramId(req) } });
  if (!role) return fail(res, 'Role not found', 404);
  if (['SUPER_ADMIN', 'ADMIN'].includes(role.name)) {
    return fail(res, 'System critical roles (SUPER_ADMIN, ADMIN) cannot be deleted.', 400);
  }
  await prisma().user.updateMany({ where: { role_id: paramId(req) }, data: { role_id: null } });
  await prisma().role.delete({ where: { id: paramId(req) } });
  await audit(req.user?.id, 'DELETE_ROLE', 'Role', paramId(req), { name: role.name });
  return ok(res, role);
});

router.get('/admins', async (_req, res) =>
  ok(res, await prisma().user.findMany({ where: { role_id: { not: null } }, include: { role: true } })),
);

router.post('/admins/assign', async (req: AuthedRequest, res) => {
  const { email, role_id, password, name } = req.body ?? {};
  if (!email || !role_id) return fail(res, 'email and role_id are required');

  let user = await prisma().user.findUnique({ where: { email } });
  if (!user) {
    if (!password) return fail(res, 'User not found. Provide a password to create a new account.');
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma().user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role_id,
        is_verified: true,
        status: 'ACTIVE',
      },
    });
    await audit(req.user?.id, 'CREATE_ADMIN_USER', 'User', user.id, { email, role_id });
  } else {
    user = await prisma().user.update({ where: { id: user.id }, data: { role_id } });
    await audit(req.user?.id, 'ASSIGN_ADMIN_ROLE', 'User', user.id, { email, role_id });
  }
  return ok(res, user);
});

router.get('/audit-logs/stats', async (_req, res) => {
  const total = await prisma().auditLog.count();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await prisma().auditLog.count({ where: { created_at: { gte: today } } });
  const byEntity = await prisma().auditLog.groupBy({
    by: ['entity'],
    _count: { entity: true },
    orderBy: { _count: { entity: 'desc' } },
  });
  return ok(res, { total, today: todayCount, byEntity });
});

router.get('/audit-logs', async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, parseInt(String(req.query.limit ?? '50'), 10) || 50);
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (req.query.entity) where.entity = String(req.query.entity);
  if (req.query.admin_id) where.admin_id = String(req.query.admin_id);
  if (req.query.action) where.action = { contains: String(req.query.action), mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    prisma().auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { admin: { select: { id: true, name: true, email: true } } },
    }),
    prisma().auditLog.count({ where }),
  ]);

  return ok(res, { data: logs, total, page, limit, totalPages: Math.ceil(total / limit) });
});

router.post('/audit-logs', async (req: AuthedRequest, res) => {
  const log = await prisma().auditLog.create({
    data: {
      admin_id: req.user!.id,
      action: req.body?.action,
      entity: req.body?.entity,
      entity_id: req.body?.entity_id,
      metadata: req.body?.metadata ?? {},
    },
  });
  return ok(res, log, 201);
});

router.get('/settings', async (_req, res) => {
  try {
    return ok(res, await getSettingsResponse(prisma()));
  } catch (error) {
    console.error('GET /admin/settings failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to load settings';
    return fail(res, message, 500);
  }
});

router.patch('/settings', async (req: AuthedRequest, res) => {
  try {
    const result = await updateSettingsResponse(prisma(), req.body ?? {}, req.user?.id);
    await audit(req.user?.id, 'UPDATE_PLATFORM_SETTINGS', 'platform_settings', 'default', {
      aiMatchingEnabled: result.aiMatchingEnabled,
    });
    return ok(res, result);
  } catch (error) {
    console.error('PATCH /admin/settings failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return fail(res, message, 500);
  }
});

router.get('/matching', async (_req, res) => {
  try {
    return ok(res, await getAdminMatchesResponse(prisma()));
  } catch (error) {
    console.error('GET /admin/matching failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to load matches';
    return fail(res, message, 500);
  }
});

router.patch('/matching/:id', async (req: AuthedRequest, res) => {
  try {
    const status = req.body?.status as 'active' | 'removed' | 'forced';
    if (!status) return fail(res, 'status is required');
    const result = await updateMatchStatus(prisma(), paramId(req), status);
    await audit(req.user?.id, status === 'forced' ? 'FORCE_MATCH' : status === 'removed' ? 'REMOVE_MATCH' : 'RESTORE_MATCH', 'AiMatch', paramId(req), { status });
    return ok(res, result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update match';
    const statusCode = message.includes('disabled') ? 403 : message.includes('not found') ? 404 : 500;
    console.error('PATCH /admin/matching failed:', error);
    return fail(res, message, statusCode);
  }
});

router.post('/matching/run', async (req: AuthedRequest, res) => {
  try {
    const { getMatchingService } = require('./lib/services') as typeof import('./lib/services');
    const result = await getMatchingService().runMatchingForAllActiveCampaigns();
    await audit(req.user?.id, 'RUN_AI_MATCHING', 'platform_settings', 'default', result);
    return ok(res, result);
  } catch (error) {
    console.error('POST /admin/matching/run failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to run matching';
    return fail(res, message.includes('Cannot find module') ? 'Backend rebuild required. Redeploy backend after npm run build.' : message, 500);
  }
});

router.get('/disputes/stats', async (_req, res) => {
  try {
    const { getAdminDisputeStats } = require('./lib/disputes') as typeof import('./lib/disputes');
    return ok(res, await getAdminDisputeStats(prisma()));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load dispute stats', 500);
  }
});

router.get('/disputes', async (req, res) => {
  try {
    const { listAdminDisputes } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await listAdminDisputes(prisma(), {
      status: req.query.status ? String(req.query.status) : undefined,
      priority: req.query.priority ? String(req.query.priority) : undefined,
      raised_by: req.query.raised_by ? String(req.query.raised_by) : undefined,
      page: parseInt(String(req.query.page ?? '1'), 10) || 1,
      limit: parseInt(String(req.query.limit ?? '50'), 10) || 50,
    });
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load disputes', 500);
  }
});

router.get('/disputes/:id', async (req, res) => {
  try {
    const { getAdminDispute } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await getAdminDispute(prisma(), paramId(req));
    if (!result) return fail(res, 'Dispute not found', 404);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load dispute', 500);
  }
});

router.patch('/disputes/:id/escalate', async (req: AuthedRequest, res) => {
  try {
    const { updateAdminDispute } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await updateAdminDispute(prisma(), paramId(req), 'escalate', req.body);
    await audit(req.user?.id, 'ESCALATE_DISPUTE', 'Dispute', paramId(req), req.body);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to escalate dispute', 500);
  }
});

router.patch('/disputes/:id/resolve', async (req: AuthedRequest, res) => {
  try {
    const { updateAdminDispute } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await updateAdminDispute(prisma(), paramId(req), 'resolve', req.body);
    await audit(req.user?.id, 'RESOLVE_DISPUTE', 'Dispute', paramId(req), req.body);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to resolve dispute', 500);
  }
});

router.patch('/disputes/:id/refund', async (req: AuthedRequest, res) => {
  try {
    const { updateAdminDispute } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await updateAdminDispute(prisma(), paramId(req), 'refund', req.body);
    await audit(req.user?.id, 'REFUND_DISPUTE', 'Dispute', paramId(req), req.body);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to refund dispute', 500);
  }
});

router.patch('/disputes/:id/partial-payout', async (req: AuthedRequest, res) => {
  try {
    const { updateAdminDispute } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await updateAdminDispute(prisma(), paramId(req), 'partial', req.body);
    await audit(req.user?.id, 'PARTIAL_PAYOUT_DISPUTE', 'Dispute', paramId(req), req.body);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to process partial payout', 500);
  }
});

router.get('/kyc', async (req, res) => {
  try {
    const { listAdminKyc } = require('./lib/kyc') as typeof import('./lib/kyc');
    const result = await listAdminKyc(prisma(), {
      status: req.query.status ? String(req.query.status) : undefined,
      user_type: req.query.user_type ? String(req.query.user_type) : undefined,
      page: parseInt(String(req.query.page ?? '1'), 10) || 1,
      limit: parseInt(String(req.query.limit ?? '20'), 10) || 20,
    });
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load KYC requests', 500);
  }
});

router.post('/kyc/:id/approve', async (req: AuthedRequest, res) => {
  try {
    const { approveKyc } = require('./lib/kyc') as typeof import('./lib/kyc');
    const result = await approveKyc(prisma(), paramId(req), req.user!.id, req.body?.remarks);
    await audit(req.user?.id, 'APPROVE_KYC', 'KycRequest', paramId(req), { remarks: req.body?.remarks });
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to approve KYC', 500);
  }
});

router.post('/kyc/:id/reject', async (req: AuthedRequest, res) => {
  try {
    const { rejectKyc } = require('./lib/kyc') as typeof import('./lib/kyc');
    const result = await rejectKyc(prisma(), paramId(req), req.user!.id, req.body?.remarks);
    await audit(req.user?.id, 'REJECT_KYC', 'KycRequest', paramId(req), { remarks: req.body?.remarks });
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to reject KYC', 500);
  }
});

router.get('/notifications/unread-count', async (req: AuthedRequest, res) => {
  const { getUnreadCount } = require('./lib/notifications') as typeof import('./lib/notifications');
  return ok(res, await getUnreadCount(prisma(), req.user!.id));
});

router.get('/notifications', async (req: AuthedRequest, res) => {
  const { listNotifications } = require('./lib/notifications') as typeof import('./lib/notifications');
  const result = await listNotifications(prisma(), req.user!.id, {
    page: parseInt(String(req.query.page ?? '1'), 10) || 1,
    limit: parseInt(String(req.query.limit ?? '20'), 10) || 20,
    type: req.query.type ? String(req.query.type) : undefined,
    unread: req.query.unread === 'true',
  });
  return ok(res, result);
});

router.patch('/notifications/read-all', async (req: AuthedRequest, res) => {
  const { markAllNotificationsRead } = require('./lib/notifications') as typeof import('./lib/notifications');
  return ok(res, await markAllNotificationsRead(prisma(), req.user!.id));
});

router.patch('/notifications/:id/read', async (req: AuthedRequest, res) => {
  const { markNotificationRead } = require('./lib/notifications') as typeof import('./lib/notifications');
  const result = await markNotificationRead(prisma(), req.user!.id, paramId(req));
  if (!result) return fail(res, 'Notification not found', 404);
  return ok(res, result);
});

router.get('/email/status', async (_req, res) => {
  try {
    const { getEmailStatus } = require('./lib/admin-broadcast') as typeof import('./lib/admin-broadcast');
    const { getEmailService } = require('./lib/services') as typeof import('./lib/services');
    return ok(res, getEmailStatus(getEmailService()));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load email status', 500);
  }
});

router.post('/email/test', async (req: AuthedRequest, res) => {
  try {
    const { sendTestEmail } = require('./lib/admin-broadcast') as typeof import('./lib/admin-broadcast');
    const { getEmailService } = require('./lib/services') as typeof import('./lib/services');
    const to = String(req.body?.to ?? '').trim();
    if (!to) return fail(res, 'Recipient email (to) is required', 400);
    const result = await sendTestEmail(getEmailService(), to);
    await audit(req.user?.id, 'SEND_TEST_EMAIL', 'Email', to, {});
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Test email failed', 400);
  }
});

router.post('/broadcast', async (req: AuthedRequest, res) => {
  try {
    const { sendAdminBroadcast } = require('./lib/admin-broadcast') as typeof import('./lib/admin-broadcast');
    const { getEmailService, getNotificationsService } = require('./lib/services') as typeof import('./lib/services');
    const result = await sendAdminBroadcast(
      prisma(),
      getEmailService(),
      getNotificationsService(),
      req.body ?? {},
      req.user?.id,
    );
    await audit(req.user?.id, 'SEND_BROADCAST', 'Broadcast', String(req.body?.audience ?? 'all'), result);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Broadcast failed', 400);
  }
});

router.get('/withdrawals', async (req, res) => {
  const status = String(req.query.status ?? 'PENDING').toUpperCase();
  const statuses =
    status === 'APPROVED' ? ['APPROVED', 'COMPLETED'] : [status];
  const rows = await prisma().walletTransaction.findMany({
    where: {
      type: 'WITHDRAWAL',
      status: statuses.length === 1 ? statuses[0] : { in: statuses },
    },
    include: { wallet: { include: { user: true } } },
    orderBy: { created_at: 'desc' },
  });
  return ok(res, rows);
});

router.patch('/withdrawals/:id/approve', async (req: AuthedRequest, res) => {
  const txn = await prisma().walletTransaction.update({
    where: { id: paramId(req) },
    data: { status: 'APPROVED' },
    include: { wallet: { include: { user: true } } },
  });
  if (txn.wallet?.user_id) {
    const { createNotification } = require('./lib/notifications') as typeof import('./lib/notifications');
    await createNotification(prisma(), {
      userId: txn.wallet.user_id,
      title: 'Withdrawal Approved',
      message: `Your withdrawal of $${txn.amount} has been approved.`,
      type: 'WITHDRAWAL',
      entityType: 'Transaction',
      entityId: txn.id,
    });
  }
  await audit(req.user?.id, 'APPROVE_WITHDRAWAL', 'Transaction', paramId(req), { amount: txn.amount });
  return ok(res, txn);
});

router.patch('/withdrawals/:id/reject', async (req: AuthedRequest, res) => {
  const txn = await prisma().walletTransaction.findUnique({
    where: { id: paramId(req) },
    include: { wallet: true },
  });
  if (!txn) return fail(res, 'Withdrawal not found', 404);
  const updated = await prisma().$transaction(async (tx) => {
    const result = await tx.walletTransaction.update({
      where: { id: txn.id },
      data: { status: 'REJECTED' },
      include: { wallet: { include: { user: true } } },
    });
    if (txn.wallet) {
      await tx.wallet.update({
        where: { id: txn.wallet.id },
        data: { available_balance: { increment: txn.amount } },
      });
    }
    return result;
  });
  if (updated.wallet?.user_id) {
    const { createNotification } = require('./lib/notifications') as typeof import('./lib/notifications');
    await createNotification(prisma(), {
      userId: updated.wallet.user_id,
      title: 'Withdrawal Rejected',
      message: req.body?.reason ?? `Your withdrawal of $${updated.amount} was rejected and funds returned to your wallet.`,
      type: 'WITHDRAWAL',
      entityType: 'Transaction',
      entityId: updated.id,
    });
  }
  await audit(req.user?.id, 'REJECT_WITHDRAWAL', 'Transaction', paramId(req), { amount: updated.amount });
  return ok(res, updated);
});

router.post('/invite-admin', async (req: AuthedRequest, res) => {
  const { email, role_id, password, name } = req.body ?? {};
  if (!email || !role_id) return fail(res, 'email and role_id are required');
  let user = await prisma().user.findUnique({ where: { email } });
  if (!user) {
    if (!password) return fail(res, 'User not found. Provide a password to create a new account.');
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma().user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role_id,
        is_verified: true,
        status: 'ACTIVE',
      },
    });
    await audit(req.user?.id, 'INVITE_ADMIN', 'User', user.id, { email, role_id });
  } else {
    user = await prisma().user.update({ where: { id: user.id }, data: { role_id } });
    await audit(req.user?.id, 'INVITE_ADMIN', 'User', user.id, { email, role_id });
  }
  return ok(res, user, 201);
});

export const adminRouter = router;
