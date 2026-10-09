import { Router } from 'express';
import { requireAdmin, requireCreator, type AuthedRequest } from './lib/auth-middleware';
import { fail, ok, run } from './lib/http';
import { getAdminAnalyticsService, getCreatorAnalyticsService } from './lib/services';

const router = Router();

function parseQuery(req: AuthedRequest) {
  return {
    period: req.query.period ? String(req.query.period) : undefined,
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
  };
}

router.get('/creator/dashboard', requireCreator, (req: AuthedRequest, res) =>
  run(req, res, (id) => getCreatorAnalyticsService().getDashboard(id, parseQuery(req))),
);
router.get('/creator/earnings', requireCreator, (req: AuthedRequest, res) =>
  run(req, res, (id) => getCreatorAnalyticsService().getEarnings(id, parseQuery(req))),
);
router.get('/creator/profile-performance', requireCreator, (req: AuthedRequest, res) =>
  run(req, res, (id) => getCreatorAnalyticsService().getProfilePerformance(id, parseQuery(req))),
);
router.get('/creator/top-brands', requireCreator, (req: AuthedRequest, res) =>
  run(req, res, (id) => getCreatorAnalyticsService().getTopBrands(id, parseQuery(req))),
);

router.get('/admin/dashboard', requireAdmin, (req: AuthedRequest, res) =>
  run(req, res, (id) => getAdminAnalyticsService().getDashboard(id, parseQuery(req))),
);
router.get('/admin/users', requireAdmin, (req: AuthedRequest, res) =>
  run(req, res, (id) => getAdminAnalyticsService().getUsers(id, parseQuery(req))),
);
router.get('/admin/revenue', requireAdmin, (req: AuthedRequest, res) =>
  run(req, res, (id) => getAdminAnalyticsService().getRevenue(id, parseQuery(req))),
);
router.get('/admin/campaigns', requireAdmin, (req: AuthedRequest, res) =>
  run(req, res, (id) => getAdminAnalyticsService().getCampaigns(id, parseQuery(req))),
);
router.get('/admin/kyc', requireAdmin, (req: AuthedRequest, res) =>
  run(req, res, (id) => getAdminAnalyticsService().getKyc(id, parseQuery(req))),
);
router.get('/admin/platforms', requireAdmin, (req: AuthedRequest, res) =>
  run(req, res, (id) => getAdminAnalyticsService().getPlatforms(id, parseQuery(req))),
);

export const analyticsRouter = router;
