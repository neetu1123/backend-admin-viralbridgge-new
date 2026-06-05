import { Router } from 'express';
import { requireCreator, type AuthedRequest } from './lib/auth-middleware';
import { paramId, run, runWithAudit } from './lib/http';
import { parseListQuery } from './lib/query';
import { getCreatorService } from './lib/services';

const router = Router();
const creator = () => getCreatorService();

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

router.post('/upload-photo', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().uploadPhoto(id, req.body), {
    action: 'CREATOR_UPLOAD_PHOTO',
    entity: 'Creator',
    entityId: (r) => String((r as { id?: string })?.id ?? req.user!.id),
  }),
);
router.post('/upload-media-kit', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().uploadMediaKit(id, req.body), {
    action: 'CREATOR_UPLOAD_MEDIA_KIT',
    entity: 'Creator',
    entityId: (r) => String((r as { id?: string })?.id ?? req.user!.id),
  }),
);

router.get('/campaigns', (req: AuthedRequest, res) =>
  run(req, res, () => creator().getCampaigns(parseListQuery(req.query as Record<string, unknown>) as never)),
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

router.get('/dashboard', (req: AuthedRequest, res) => run(req, res, (id) => creator().getDashboard(id)));
router.get('/deliverables', (req: AuthedRequest, res) => run(req, res, (id) => creator().getDeliverables(id)));
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

router.get('/notifications', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getNotifications(id, parseListQuery(req.query as Record<string, unknown>) as never)),
);
router.patch('/notifications/:id/read', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().markNotificationRead(id, paramId(req))),
);

router.get('/settings', (req: AuthedRequest, res) => run(req, res, (id) => creator().getSettings(id)));
router.put('/settings', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => creator().updateSettings(id, req.body), {
    action: 'UPDATE_CREATOR_SETTINGS',
    entity: 'Creator',
    entityId: () => req.user!.id,
  }),
);

export const creatorRouter = router;
