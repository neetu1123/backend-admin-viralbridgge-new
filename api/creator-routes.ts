import { Router } from 'express';
import { requireCreator, type AuthedRequest } from './lib/auth-middleware';
import { paramId, run } from './lib/http';
import { getCreatorService } from './lib/services';

const router = Router();
const creator = () => getCreatorService();

router.use(requireCreator);

router.get('/profile', (req: AuthedRequest, res) => run(req, res, (id) => creator().getProfile(id)));
router.put('/profile', (req: AuthedRequest, res) => run(req, res, (id) => creator().updateProfile(id, req.body)));

router.post('/upload-photo', (req: AuthedRequest, res) => run(req, res, (id) => creator().uploadPhoto(id, req.body)));
router.post('/upload-media-kit', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().uploadMediaKit(id, req.body)),
);

router.get('/campaigns', (req: AuthedRequest, res) => run(req, res, () => creator().getCampaigns(req.query as never)));
router.get('/campaigns/:id', (req: AuthedRequest, res) => run(req, res, () => creator().getCampaign(paramId(req))));

router.post('/apply/:campaignId', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().apply(id, paramId(req, 'campaignId'), req.body)),
);

router.get('/applications', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getApplications(id, req.query as never)),
);
router.get('/applications/:id', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getApplication(id, paramId(req))),
);

router.get('/dashboard', (req: AuthedRequest, res) => run(req, res, (id) => creator().getDashboard(id)));
router.get('/deliverables', (req: AuthedRequest, res) => run(req, res, (id) => creator().getDeliverables(id)));
router.post('/deliverables/:id/submit', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().submitDeliverable(id, paramId(req), req.body)),
);

router.get('/wallet/transactions', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getWalletTransactions(id, req.query as never)),
);
router.post('/wallet/withdraw', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().withdraw(id, req.body)),
);
router.get('/wallet', (req: AuthedRequest, res) => run(req, res, (id) => creator().getWallet(id)));

router.get('/conversations', (req: AuthedRequest, res) => run(req, res, (id) => creator().getConversations(id)));
router.get('/messages/:conversationId', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getMessages(id, paramId(req, 'conversationId'))),
);
router.post('/messages/send', (req: AuthedRequest, res) => run(req, res, (id) => creator().sendMessage(id, req.body)));

router.get('/notifications', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().getNotifications(id, req.query as never)),
);
router.patch('/notifications/:id/read', (req: AuthedRequest, res) =>
  run(req, res, (id) => creator().markNotificationRead(id, paramId(req))),
);

router.get('/settings', (req: AuthedRequest, res) => run(req, res, (id) => creator().getSettings(id)));
router.put('/settings', (req: AuthedRequest, res) => run(req, res, (id) => creator().updateSettings(id, req.body)));

export const creatorRouter = router;
