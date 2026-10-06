import { Router } from 'express';
import { fail, ok, paramId } from './lib/http';
import { parseListQuery } from './lib/query';
import { getListingService } from './lib/services';

const router = Router();
const listings = () => getListingService();

async function runPublic(res: import('express').Response, fn: () => Promise<unknown>) {
  try {
    const data = await fn();
    return ok(res, data);
  } catch (error: unknown) {
    const { HttpException } = require('@nestjs/common') as typeof import('@nestjs/common');
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const body = error.getResponse();
      const message =
        typeof body === 'string' ? body : (body as { message?: string }).message || error.message;
      return fail(res, Array.isArray(message) ? message.join(', ') : message || 'Request failed', status);
    }
    console.error('Discover route error:', error);
    return fail(res, error instanceof Error ? error.message : 'Internal server error', 500);
  }
}

router.get('/categories', (req, res) =>
  runPublic(res, () => listings().getCategories(typeof req.query.type === 'string' ? req.query.type : undefined)),
);

router.get('/locations', (_req, res) => runPublic(res, () => listings().getLocations()));

router.get('/search', (req, res) =>
  runPublic(res, () => listings().searchPublic(parseListQuery(req.query as Record<string, unknown>) as never)),
);

router.post('/events', (req, res) => runPublic(res, () => listings().trackEvent(req.body)));

router.get('/business/:slug', (req, res) =>
  runPublic(res, () => listings().getPublic('BUSINESS', paramId(req, 'slug'))),
);

router.get('/creator/:slug', (req, res) =>
  runPublic(res, () => listings().getPublic('CREATOR', paramId(req, 'slug'))),
);

router.post('/:id/enquiry', (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req.ip;
  return runPublic(res, () => listings().createEnquiry(paramId(req, 'id'), req.body, req.headers.authorization, ip));
});

router.post('/:id/report', (req, res) =>
  runPublic(res, () => listings().report(paramId(req, 'id'), req.body)),
);

export { router as discoverRouter };
