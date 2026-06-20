import { Router } from 'express';
import { requireAuth, requireBrandOrCreator, type AuthedRequest } from './lib/auth-middleware';
import { fail, ok, paramId, run, runWithAudit } from './lib/http';
import { getOrganizationService } from './lib/services';

const router = Router();
const org = () => getOrganizationService();

router.post('/team/accept', requireAuth, (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => org().acceptInvitation(id, req.body), {
    action: 'ORG_INVITATION_ACCEPTED',
    entity: 'OrganizationMember',
    entityId: (r) => String((r as { id?: string })?.id ?? ''),
  }),
);

router.get('/team/invitations/mine', requireAuth, (req: AuthedRequest, res) =>
  run(req, res, (id) => org().getMyInvitations(id)),
);

router.use(requireBrandOrCreator);

router.get('/team', (req: AuthedRequest, res) => run(req, res, (id) => org().getTeam(id)));

router.post('/team/invite', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => org().inviteMember(id, req.body), {
    action: 'ORG_MEMBER_INVITED',
    entity: 'OrganizationInvitation',
    entityId: (r) => String((r as { invitation?: { id?: string } })?.invitation?.id ?? ''),
    metadata: () => ({ email: req.body?.email, role: req.body?.role }),
  }),
);

router.patch('/team/member/:id/role', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => org().changeMemberRole(id, paramId(req), req.body), {
    action: 'ORG_MEMBER_ROLE_CHANGED',
    entity: 'OrganizationMember',
    entityId: () => paramId(req),
    metadata: () => ({ role: req.body?.role }),
  }),
);

router.delete('/team/member/:id', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => org().removeMember(id, paramId(req)), {
    action: 'ORG_MEMBER_REMOVED',
    entity: 'OrganizationMember',
    entityId: () => paramId(req),
  }),
);

router.post('/team/member/:id/reinvite', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => org().reinviteMember(id, paramId(req)), {
    action: 'ORG_INVITATION_RESENT',
    entity: 'OrganizationInvitation',
    entityId: () => paramId(req),
  }),
);

router.post('/team/invitation/:id/cancel', (req: AuthedRequest, res) =>
  runWithAudit(req, res, (id) => org().cancelInvitation(id, paramId(req)), {
    action: 'ORG_INVITATION_CANCELLED',
    entity: 'OrganizationInvitation',
    entityId: () => paramId(req),
  }),
);

router.get('/team/roles/permissions', async (req: AuthedRequest, res) => {
  try {
    const type = String(req.query.type ?? 'BRAND') as 'BRAND' | 'CREATOR';
    const role = String(req.query.role ?? '');
    return ok(res, org().getRolePermissions(type, role));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to load permissions', 500);
  }
});

export const organizationRouter = router;
