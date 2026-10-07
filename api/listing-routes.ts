import { Router } from 'express';
import { requireAuth, type AuthedRequest } from './lib/auth-middleware';
import { fail, ok, paramId, run } from './lib/http';
import { getListingService } from './lib/services';

const router = Router();
const listings = () => getListingService();

router.use(requireAuth);

router.post('/', (req: AuthedRequest, res) => run(req, res, (id) => listings().create(id, req.body)));

router.get('/me', (req: AuthedRequest, res) => run(req, res, (id) => listings().getMine(id)));

router.get('/me/enquiries', (req: AuthedRequest, res) => run(req, res, (id) => listings().getEnquiries(id)));

router.get('/me/analytics', (req: AuthedRequest, res) => run(req, res, (id) => listings().getAnalytics(id)));

router.get('/me/suggestions', (req: AuthedRequest, res) =>
  run(req, res, (id) =>
    listings().getSuggestions(id, {
      budgetMin: req.query.budgetMin ? Number(req.query.budgetMin) : undefined,
      budgetMax: req.query.budgetMax ? Number(req.query.budgetMax) : undefined,
    }),
  ),
);

router.post('/me/request-access', (req: AuthedRequest, res) =>
  run(req, res, (id) => listings().requestFullAccess(id)),
);

router.post('/upload', (req: AuthedRequest, res) => {
  const { profileUploadMiddleware, toProfileUploadPayload } = require('./lib/multer-profile') as typeof import('./lib/multer-profile');
  profileUploadMiddleware(req, res, async (err: unknown) => {
    if (err) return fail(res, err instanceof Error ? err.message : 'Upload failed', 400);
    try {
      const file = req.file;
      if (!file) return fail(res, 'image file is required', 400);
      const result = await listings().uploadImage(req.user!.id, toProfileUploadPayload(file));
      return ok(res, result);
    } catch (error) {
      return fail(res, error instanceof Error ? error.message : 'Upload failed', 500);
    }
  });
});

router.patch('/:id', (req: AuthedRequest, res) =>
  run(req, res, (id) => listings().update(id, paramId(req), req.body)),
);

router.post('/:id/publish', (req: AuthedRequest, res) =>
  run(req, res, (id) => listings().publish(id, paramId(req))),
);

router.post('/:id/unpublish', (req: AuthedRequest, res) =>
  run(req, res, (id) => listings().unpublish(id, paramId(req))),
);

router.post('/:id/archive', (req: AuthedRequest, res) =>
  run(req, res, (id) => listings().archive(id, paramId(req))),
);

router.post('/:id/upgrade', (req: AuthedRequest, res) =>
  run(req, res, (id) => listings().upgrade(id, paramId(req))),
);

export { router as listingRouter };
