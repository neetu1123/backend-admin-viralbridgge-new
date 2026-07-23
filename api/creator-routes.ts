import { Router } from 'express';
import { requireCreator, type AuthedRequest } from './lib/auth-middleware';
import { fail, ok, paramId, run, runWithAudit } from './lib/http';
import { getPrisma } from './lib/prisma';
import { parseListQuery } from './lib/query';
import { getCreatorService } from './lib/services';

const router = Router();
const creator = () => getCreatorService();
const prisma = () => getPrisma();

router.use(requireCreator);

router.get('/profile', (req: AuthedRequest, res) => run(req, res, (id) => creator().getProfile(id)));
router.put('/profile', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().updateProfile(id, req.body), {
    action: 'UPDATE_CREATOR_PROFILE',
    entity: 'Creator',
    entityId: (r) => String((r as { id?: string })?.id ?? req.user!.id),
    metadata: () => ({ fields: Object.keys(req.body ?? {}) }),
  }),
);

router.post('/upload-photo', (req: AuthedRequest, res) => {
  const { profileUploadMiddleware, toProfileUploadPayload } = require('./lib/multer-profile') as typeof import('./lib/multer-profile');
  profileUploadMiddleware(req, res, async (err: unknown) => {
    if (err) return fail(res, err instanceof Error ? err.message : 'Upload failed', 400);
    try {
      const file = req.file;
      if (file) {
        const result = await creator().uploadPhotoFile(req.user!.id, toProfileUploadPayload(file));
        return ok(res, result);
      }
      if (req.body?.url) {
        const result = await creator().uploadPhoto(req.user!.id, req.body);
        return ok(res, result);
      }
      return fail(res, 'image file or url is required', 400);
    } catch (error) {
      return fail(res, error instanceof Error ? error.message : 'Upload failed', 500);
    }
  });
});
router.post('/upload-media-kit', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().uploadMediaKit(id, req.body), {
    action: 'CREATOR_UPLOAD_MEDIA_KIT',
    entity: 'Creator',
    entityId: (r) => String((r as { id?: string })?.id ?? req.user!.id),
  }),
);

router.get('/campaigns', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getCampaigns(id, parseListQuery(req.query as Record<string, unknown>) as never)),
);
router.get('/campaigns/:id', (req: AuthedRequest, res) => run(req, res, () => creator().getCampaign(paramId(req))));

router.post('/apply/:campaignId', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().apply(id, paramId(req, 'campaignId'), req.body), {
    action: 'APPLY_CAMPAIGN',
    entity: 'Application',
    entityId: (r) => String((r as { id?: string })?.id ?? ''),
    metadata: (r) => ({
      campaignId: paramId(req, 'campaignId'),
      campaignTitle: (r as { campaign?: { title?: string } })?.campaign?.title,
    }),
  }),
);

router.get('/applications', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getApplications(id, parseListQuery(req.query as Record<string, unknown>) as never)),
);
router.get('/applications/:id', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getApplication(id, paramId(req))),
);
router.delete('/applications/:id', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().withdrawApplication(id, paramId(req)), {
    action: 'WITHDRAW_APPLICATION',
    entity: 'Application',
    entityId: () => paramId(req),
  }),
);

router.get('/dashboard', (req: AuthedRequest, res) => run(req, res, (id) => creator().getDashboard(id)));
router.get('/deliverables', (req: AuthedRequest, res) => run(req, res, (id) => creator().getDeliverables(id)));

router.post('/deliverables/upload', (req: AuthedRequest, res) => {
  const { deliverableUploadMiddleware, toUploadPayload } = require('./lib/multer-deliverable') as typeof import('./lib/multer-deliverable');
  deliverableUploadMiddleware(req, res, async (err: unknown) => {
    if (err) return fail(res, err instanceof Error ? err.message : 'Upload failed', 400);
    try {
      const files = req.files as { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };
      const file = files?.file?.[0];
      if (!file) return fail(res, 'file is required', 400);
      const result = await creator().uploadDeliverableMedia(req.user!.id, toUploadPayload(file), {
        campaignId: req.body?.campaign_id,
        thumbnail: files?.thumbnail?.[0] ? toUploadPayload(files.thumbnail[0]) : undefined,
      });
      return ok(res, result, 201);
    } catch (error) {
      return fail(res, error instanceof Error ? error.message : 'Upload failed', 500);
    }
  });
});

router.post('/deliverables/:id/submit-file', (req: AuthedRequest, res) => {
  const { deliverableUploadMiddleware, toUploadPayload } = require('./lib/multer-deliverable') as typeof import('./lib/multer-deliverable');
  deliverableUploadMiddleware(req, res, async (err: unknown) => {
    if (err) return fail(res, err instanceof Error ? err.message : 'Upload failed', 400);
    try {
      const files = req.files as { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };
      const file = files?.file?.[0];
      if (!file) return fail(res, 'file is required', 400);
      const result = await creator().submitDeliverableWithFile(
        req.user!.id,
        paramId(req),
        toUploadPayload(file),
        req.body?.notes,
        files?.thumbnail?.[0] ? toUploadPayload(files.thumbnail[0]) : undefined,
      );
      return ok(res, result);
    } catch (error) {
      return fail(res, error instanceof Error ? error.message : 'Submit failed', 500);
    }
  });
});

router.post('/deliverables/:id/submit', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().submitDeliverable(id, paramId(req), req.body), {
    action: 'SUBMIT_DELIVERABLE',
    entity: 'Deliverable',
    entityId: (r) => String((r as { id?: string })?.id ?? paramId(req)),
  }),
);

router.get('/wallet/transactions', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getWalletTransactions(id, parseListQuery(req.query as Record<string, unknown>) as never)),
);
router.post('/wallet/withdraw', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().withdraw(id, req.body), {
    action: 'CREATOR_WITHDRAW',
    entity: 'Wallet',
    entityId: (r) => String((r as { wallet?: { id?: string } })?.wallet?.id ?? req.user!.id),
    metadata: () => ({ amount: req.body?.amount }),
  }),
);
router.get('/wallet', (req: AuthedRequest, res) => run(req, res, (id) => creator().getWallet(id)));

router.get('/escrows', async (req: AuthedRequest, res) => {
  try {
    const { listUserEscrows } = require('./lib/disputes') as typeof import('./lib/disputes');
    return ok(res, await listUserEscrows(prisma(), req.user!.id, 'creator'));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load escrows', 500);
  }
});

router.get('/disputes', async (req: AuthedRequest, res) => {
  try {
    const { listUserDisputes } = require('./lib/disputes') as typeof import('./lib/disputes');
    return ok(res, await listUserDisputes(prisma(), req.user!.id, 'creator'));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load disputes', 500);
  }
});

router.post('/disputes', async (req: AuthedRequest, res) => {
  try {
    const { openCreatorDispute } = require('./lib/disputes') as typeof import('./lib/disputes');
    const result = await openCreatorDispute(prisma(), req.user!.id, req.body ?? {});
    return ok(res, result, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to open dispute', 500);
  }
});

router.get('/conversations', (req: AuthedRequest, res) => run(req, res, (id) => creator().getConversations(id)));
router.get('/messages/:conversationId', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getMessages(id, paramId(req, 'conversationId'))),
);
router.post('/messages/send', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().sendMessage(id, req.body), {
    action: 'CREATOR_SEND_MESSAGE',
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

router.get('/settings', (req: AuthedRequest, res) => run(req, res, (id) => creator().getSettings(id)));
router.put('/settings', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().updateSettings(id, req.body), {
    action: 'UPDATE_CREATOR_SETTINGS',
    entity: 'Creator',
    entityId: () => req.user!.id,
  }),
);

export const creatorRouter = router;
