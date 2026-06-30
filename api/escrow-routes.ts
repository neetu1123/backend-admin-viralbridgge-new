import { Router } from 'express';
import { requireBrand, type AuthedRequest } from './lib/auth-middleware';
import { fail, ok } from './lib/http';
import { getEscrowService } from './lib/services';

const router = Router();

router.use(requireBrand);

router.post('/create', async (req: AuthedRequest, res) => {
  try {
    const body = req.body as { campaign_id?: string; creator_id?: string; amount?: number };
    if (!body?.campaign_id || !body?.creator_id) {
      return fail(res, 'campaign_id and creator_id are required', 400);
    }
    const data = await getEscrowService().createEscrow(req.user!.id, {
      campaign_id: body.campaign_id,
      creator_id: body.creator_id,
      amount: body.amount,
    });
    return ok(res, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fund escrow';
    const status = message.includes('Insufficient') ? 400 : 500;
    return fail(res, message, status);
  }
});

export { router as escrowRouter };
