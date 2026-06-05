import { getPrisma } from './prisma';

/** Log user activity (admin, brand, or creator). Uses admin_id column as actor user id. */
export async function writeActivityLog(
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, unknown>,
  actorRole?: string,
) {
  try {
    await getPrisma().auditLog.create({
      data: {
        admin_id: actorId,
        action,
        entity,
        entity_id: entityId,
        metadata: {
          ...(metadata ?? {}),
          ...(actorRole ? { actorRole } : {}),
        },
      },
    });
  } catch (error) {
    console.error('Activity log write failed:', error);
  }
}
