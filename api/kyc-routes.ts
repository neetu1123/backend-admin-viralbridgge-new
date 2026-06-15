import { Router } from 'express';
import { requireAuth, type AuthedRequest } from './lib/auth-middleware';
import { getPrisma } from './lib/prisma';
import { getKycStatus, submitBrandKyc, submitCreatorKyc } from './lib/kyc';

const router = Router();
const prisma = () => getPrisma();

function ok(res: any, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res: any, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

router.use(requireAuth);

router.get('/status', async (req: AuthedRequest, res) => {
  try {
    return ok(res, await getKycStatus(prisma(), req.user!.id));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load KYC status', 500);
  }
});

router.post('/creator/submit', async (req: AuthedRequest, res) => {
  try {
    const role = (req.user?.role?.name ?? '').toUpperCase();
    if (role !== 'CREATOR') return fail(res, 'Only creators can submit creator KYC', 403);
    if (!req.body?.instagram_handle || !req.body?.selfie_url) {
      return fail(res, 'instagram_handle and selfie_url are required');
    }
    return ok(res, await submitCreatorKyc(prisma(), req.user!.id, req.body ?? {}), 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to submit creator KYC', 500);
  }
});

router.post('/brand/submit', async (req: AuthedRequest, res) => {
  try {
    const role = (req.user?.role?.name ?? '').toUpperCase();
    if (role !== 'BRAND') return fail(res, 'Only brands can submit brand KYC', 403);
    if (!req.body?.company_name || !req.body?.business_email || !req.body?.website) {
      return fail(res, 'company_name, business_email, and website are required');
    }
    return ok(res, await submitBrandKyc(prisma(), req.user!.id, req.body ?? {}), 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to submit brand KYC', 500);
  }
});

export const kycRouter = router;
