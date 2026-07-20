import { Router } from 'express';
import { fail, ok, paramId } from './lib/http';
import { parseListQuery } from './lib/query';
import { getPublicService } from './lib/services';

const router = Router();
const publicService = () => getPublicService();

async function runPublic(
  res: import('express').Response,
  fn: () => Promise<unknown>,
) {
  try {
    const data = await fn();
    return ok(res, data);
  } catch (error: unknown) {
    const { HttpException } = require('@nestjs/common') as typeof import('@nestjs/common');
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const body = error.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : (body as { message?: string }).message || error.message;
      return fail(res, message || 'Request failed', status);
    }
    console.error('Public route error:', error);
    return fail(res, error instanceof Error ? error.message : 'Internal server error', 500);
  }
}

router.get('/creators', (req, res) =>
  runPublic(res, () => publicService().listCreators(parseListQuery(req.query as Record<string, unknown>) as never)),
);

router.get('/creators/:username', (req, res) =>
  runPublic(res, () => publicService().getCreatorByUsername(paramId(req, 'username'))),
);

router.get('/campaigns', (req, res) =>
  runPublic(res, () => publicService().listCampaigns(parseListQuery(req.query as Record<string, unknown>) as never)),
);

router.get('/campaigns/:id', (req, res) =>
  runPublic(res, () => publicService().getCampaignById(paramId(req))),
);

router.get('/stats', (req, res) => runPublic(res, () => publicService().getPlatformStats()));

export { router as publicRouter };
