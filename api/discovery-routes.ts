import { Router } from 'express';
import { fail, ok, paramId } from './lib/http';
import { parseListQuery } from './lib/query';
import { getDiscoveryService } from './lib/services';

const router = Router();
const discovery = () => getDiscoveryService();

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
      return fail(res, message || 'Request failed', status);
    }
    console.error('Discovery route error:', error);
    return fail(res, error instanceof Error ? error.message : 'Internal server error', 500);
  }
}

router.get('/categories', (req, res) =>
  runPublic(res, () => discovery().getCategories(typeof req.query.type === 'string' ? req.query.type : undefined)),
);

router.get('/locations', (_req, res) => runPublic(res, () => discovery().getLocations()));

router.get('/search', (req, res) =>
  runPublic(res, () => discovery().search(parseListQuery(req.query as Record<string, unknown>) as never)),
);

router.post('/events', (req, res) => runPublic(res, () => discovery().trackEvent(req.body)));

router.post('/:slug/enquiry', (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req.ip;
  return runPublic(res, () =>
    discovery().createEnquiry(paramId(req, 'slug'), req.body, req.headers.authorization, ip),
  );
});

router.get('/:slug', (req, res) => runPublic(res, () => discovery().getBySlug(paramId(req, 'slug'))));

export { router as discoveryRouter };
