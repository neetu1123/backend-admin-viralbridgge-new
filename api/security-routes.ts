import { Router } from 'express';
import { requireBrandOrCreator, type AuthedRequest } from './lib/auth-middleware';
import { fail, ok, paramId, run, runWithAudit } from './lib/http';
import { getSecurityService } from './lib/services';
import { sessionMetaFromRequest } from './lib/request-meta';

const router = Router();
const security = () => getSecurityService();

router.use(requireBrandOrCreator);

router.get('/settings', (req: AuthedRequest, res) => run(req, res, (id) => security().getSettings(id)));

router.post('/change-password', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => security().changePassword(id, req.body, sessionMetaFromRequest(req)), {
    action: 'PASSWORD_CHANGED',
    entity: 'Security',
    entityId: () => req.user!.id,
  }),
);

router.get('/2fa/status', (req: AuthedRequest, res) => run(req, res, (id) => security().get2FaStatus(id)));

router.post('/2fa/enable', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => security().enable2Fa(id, req.body, sessionMetaFromRequest(req)), {
    action: '2FA_ENABLED',
    entity: 'Security',
    entityId: () => req.user!.id,
  }),
);

router.post('/2fa/confirm', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => security().confirm2Fa(id, req.body ?? {}, sessionMetaFromRequest(req)), {
    action: '2FA_ENABLED',
    entity: 'Security',
    entityId: () => req.user!.id,
  }),
);

router.post('/2fa/disable', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => security().disable2Fa(id, sessionMetaFromRequest(req)), {
    action: '2FA_DISABLED',
    entity: 'Security',
    entityId: () => req.user!.id,
  }),
);

router.get('/sessions', (req: AuthedRequest, res) =>
  run(req, res, (id) => security().listSessions(id, req.jwtPayload?.jti)),
);

router.delete('/sessions/:id', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => security().removeSession(id, paramId(req), req.jwtPayload?.jti, sessionMetaFromRequest(req)), {
    action: 'SESSION_REMOVED',
    entity: 'Security',
    entityId: () => paramId(req),
  }),
);

router.post('/signout-all', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => security().signOutAll(id, req.body ?? {}, req.jwtPayload?.jti, sessionMetaFromRequest(req)), {
    action: 'LOGOUT_ALL',
    entity: 'Security',
    entityId: () => req.user!.id,
  }),
);

router.get('/activity', async (req: AuthedRequest, res) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
    const limit = parseInt(String(req.query.limit ?? '20'), 10) || 20;
    const data = await security().listActivity(req.user!.id, { page, limit });
    return ok(res, data);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load activity', 500);
  }
});

export const securityRouter = router;
