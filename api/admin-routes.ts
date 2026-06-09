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

router.get('/campaigns', async (_req, res) =>
  ok(
    res,
    await prisma().campaign.findMany({
      include: {
        brand: { include: { user: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
  ),
);

router.get('/campaigns/flagged', async (_req, res) =>
  ok(res, await prisma().campaign.findMany({ where: { status: 'FLAGGED' }, include: { brand: true } })),
);

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

router.get('/transactions', async (_req, res) =>
  ok(res, await prisma().transaction.findMany({ include: { wallet: { include: { user: true } } } })),
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

export const adminRouter = router;
