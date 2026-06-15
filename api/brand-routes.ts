import { Router } from 'express';
import { requireBrand, type AuthedRequest } from './lib/auth-middleware';
import { fail, ok, paramId, run, runWithAudit } from './lib/http';
import { getPrisma } from './lib/prisma';
import { parseListQuery } from './lib/query';
import { getBrandService } from './lib/services';

const router = Router();
const brand = () => getBrandService();
const prisma = () => getPrisma();

const campaignId = (r: unknown) => String((r as { id?: string })?.id ?? '');

router.use(requireBrand);

router.get('/profile', (req: AuthedRequest, res) => run(req, res, (id) => brand().getProfile(id)));
router.put('/profile', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().updateProfile(id, req.body), {
    action: 'UPDATE_BRAND_PROFILE',
    entity: 'Brand',
    entityId: (r) => String((r as { id?: string })?.id ?? req.user!.id),
    metadata: () => ({ fields: Object.keys(req.body ?? {}) }),
  }),
);

router.post('/campaigns', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().createCampaign(id, req.body), {
    action: 'CREATE_CAMPAIGN',
    entity: 'Campaign',
    entityId: campaignId,
    metadata: (r) => ({ title: (r as { title?: string })?.title, status: (r as { status?: string })?.status }),
  }),
);
router.get('/campaigns', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getCampaigns(id, parseListQuery(req.query as Record<string, unknown>) as never)),
);

router.get('/campaigns/:id/detail', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getCampaignDetail(id, paramId(req))),
);
router.get('/campaigns/:id/applicants', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getApplicants(id, paramId(req))),
);
router.get('/campaigns/:id/recommendations', async (req: AuthedRequest, res) => {
  try {
    const { getOrCreatePlatformSettings } = require('./lib/platform-settings') as typeof import('./lib/platform-settings');
    const settings = await getOrCreatePlatformSettings(prisma());
    if (!settings.ai_matching_enabled) {
      return ok(res, { enabled: false, recommendations: [] });
    }
    return run(req, res, (id) => brand().getCampaignRecommendations(id, paramId(req)));
  } catch (error) {
    console.error('GET /brand/campaigns/:id/recommendations failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to load recommendations';
    return fail(res, message, 500);
  }
});
router.get('/campaigns/:id/deliverables', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getCampaignDeliverables(id, paramId(req))),
);
router.post('/campaigns/:id/invite/:creatorId', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().inviteCreator(id, paramId(req), paramId(req, 'creatorId')), {
    action: 'INVITE_CREATOR',
    entity: 'Campaign',
    entityId: () => paramId(req),
    metadata: () => ({ creatorId: paramId(req, 'creatorId') }),
  }),
);
router.get('/campaigns/:id', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getCampaign(id, paramId(req))),
);
router.put('/campaigns/:id', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().updateCampaign(id, paramId(req), req.body), {
    action: 'UPDATE_CAMPAIGN',
    entity: 'Campaign',
    entityId: campaignId,
    metadata: (r) => ({ title: (r as { title?: string })?.title }),
  }),
);
router.delete('/campaigns/:id', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().deleteCampaign(id, paramId(req)), {
    action: 'DELETE_CAMPAIGN',
    entity: 'Campaign',
    entityId: () => paramId(req),
  }),
);

router.post('/applications/:id/approve', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().updateApplication(id, paramId(req), 'ACCEPTED'), {
    action: 'APPROVE_APPLICATION',
    entity: 'Application',
    entityId: (r) => String((r as { id?: string })?.id ?? paramId(req)),
    metadata: () => ({ status: 'ACCEPTED' }),
  }),
);
router.post('/applications/:id/reject', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().updateApplication(id, paramId(req), 'REJECTED'), {
    action: 'REJECT_APPLICATION',
    entity: 'Application',
    entityId: (r) => String((r as { id?: string })?.id ?? paramId(req)),
    metadata: () => ({ status: 'REJECTED' }),
  }),
);
router.post('/applications/:id/shortlist', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().updateApplication(id, paramId(req), 'SHORTLISTED'), {
    action: 'SHORTLIST_APPLICATION',
    entity: 'Application',
    entityId: (r) => String((r as { id?: string })?.id ?? paramId(req)),
    metadata: () => ({ status: 'SHORTLISTED' }),
  }),
);

router.get('/creators', (req: AuthedRequest, res) =>
  run(req, res, () => brand().getCreators(parseListQuery(req.query as Record<string, unknown>) as never)),
);
router.get('/my-creators', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getMyCreators(id, parseListQuery(req.query as Record<string, unknown>) as never)),
);

router.post('/deliverables/:id/approve', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().reviewDeliverable(id, paramId(req), 'APPROVED'), {
    action: 'APPROVE_DELIVERABLE',
    entity: 'Deliverable',
    entityId: () => paramId(req),
  }),
);
router.post('/deliverables/:id/revise', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().reviewDeliverable(id, paramId(req), 'REVISION_REQUESTED', req.body?.notes), {
    action: 'REQUEST_DELIVERABLE_REVISION',
    entity: 'Deliverable',
    entityId: () => paramId(req),
    metadata: () => ({ notes: req.body?.notes }),
  }),
);

router.post('/escrows/:id/release', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().releaseEscrow(id, paramId(req)), {
    action: 'RELEASE_ESCROW',
    entity: 'Escrow',
    entityId: () => paramId(req),
  }),
);

router.get('/escrows', async (req: AuthedRequest, res) => {
  try {
    const { listUserEscrows } = require('./lib/disputes') as typeof import('./lib/disputes');
    return ok(res, await listUserEscrows(prisma(), req.user!.id, 'brand'));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load escrows', 500);
  }
});

router.get('/disputes', async (req: AuthedRequest, res) => {
  try {
    const { listUserDisputes } = require('./lib/disputes') as typeof import('./lib/disputes');
    return ok(res, await listUserDisputes(prisma(), req.user!.id, 'brand'));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load disputes', 500);
  }
});

router.post('/disputes', async (req: AuthedRequest, res) => {
  try {
    const { openBrandDispute } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await openBrandDispute(prisma(), req.user!.id, req.body ?? {});
    return ok(res, result, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to open dispute', 500);
  }
});

router.get('/dashboard', (req: AuthedRequest, res) => run(req, res, (id) => brand().getDashboard(id)));

router.get('/wallet/transactions', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getWalletTransactions(id, parseListQuery(req.query as Record<string, unknown>) as never)),
);
router.post('/wallet/add-funds', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().addFunds(id, req.body), {
    action: 'BRAND_ADD_FUNDS',
    entity: 'Wallet',
    entityId: (r) => String((r as { wallet?: { id?: string } })?.wallet?.id ?? req.user!.id),
    metadata: () => ({ amount: req.body?.amount }),
  }),
);
router.get('/wallet', (req: AuthedRequest, res) => run(req, res, (id) => brand().getWallet(id)));

router.get('/analytics/roi', (req: AuthedRequest, res) => run(req, res, (id) => brand().getRoi(id)));
router.get('/analytics/top-creators', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getTopCreators(id)),
);
router.get('/analytics', (req: AuthedRequest, res) => run(req, res, (id) => brand().getAnalytics(id)));

router.get('/conversations', (req: AuthedRequest, res) => run(req, res, (id) => brand().getConversations(id)));
router.get('/messages/:conversationId', (req: AuthedRequest, res) =>
  run(req, res, (id) => brand().getMessages(id, paramId(req, 'conversationId'))),
);
router.post('/messages/send', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().sendMessage(id, req.body), {
    action: 'BRAND_SEND_MESSAGE',
    entity: 'Message',
    entityId: (r) => String((r as { id?: string })?.id ?? req.body?.conversationId ?? 'message'),
  }),
);

router.get('/notifications/unread-count', async (req: AuthedRequest, res) => {
  const { getUnreadCount } = require('./lib/notifications') as typeof import('./lib/notifications');
  return ok(res, await getUnreadCount(prisma(), req.user!.id));
});

router.patch('/notifications/read-all', async (req: AuthedRequest, res) => {
  const { markAllNotificationsRead } = require('./lib/notifications') as typeof import('./lib/notifications');
  return ok(res, await markAllNotificationsRead(prisma(), req.user!.id));
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

router.patch('/notifications/:id/read', async (req: AuthedRequest, res) => {
  const { markNotificationRead } = require('./lib/notifications') as typeof import('./lib/notifications');
  const result = await markNotificationRead(prisma(), req.user!.id, paramId(req));
  if (!result) return fail(res, 'Notification not found', 404);
  return ok(res, result);
});

router.get('/settings', (req: AuthedRequest, res) => run(req, res, (id) => brand().getSettings(id)));
router.put('/settings', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => brand().updateSettings(id, req.body), {
    action: 'UPDATE_BRAND_SETTINGS',
    entity: 'Brand',
    entityId: () => req.user!.id,
  }),
);

export const brandRouter = router;
