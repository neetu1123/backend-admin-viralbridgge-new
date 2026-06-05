import type { Request, Response } from 'express';
import { HttpException } from '@nestjs/common';
import type { AuthedRequest } from './auth-middleware';
import { writeActivityLog } from './audit';

export function paramId(req: Request, key = 'id'): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

function errorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof HttpException) {
    const status = error.getStatus();
    const body = error.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : Array.isArray((body as { message?: string | string[] }).message)
          ? ((body as { message: string[] }).message).join(', ')
          : (body as { message?: string }).message || error.message;
    return { message: message || 'Request failed', status };
  }
  console.error(error);
  return {
    message: error instanceof Error ? error.message : 'Internal server error',
    status: 500,
  };
}

export async function run(
  req: AuthedRequest,
  res: Response,
  fn: (userId: string) => Promise<unknown>,
) {
  try {
    const data = await fn(req.user!.id);
    return ok(res, data);
  } catch (error: unknown) {
    const { message, status } = errorMessage(error);
    return fail(res, message, status);
  }
}

type AuditConfig = {
  action: string;
  entity: string;
  entityId: (result: unknown) => string;
  metadata?: (result: unknown) => Record<string, unknown>;
};

export async function runWithAudit(
  req: AuthedRequest,
  res: Response,
  fn: (userId: string) => Promise<unknown>,
  audit: AuditConfig,
) {
  try {
    const data = await fn(req.user!.id);
    const entityId = audit.entityId(data);
    if (entityId) {
      await writeActivityLog(
        req.user!.id,
        audit.action,
        audit.entity,
        entityId,
        audit.metadata?.(data),
        req.user?.role?.name,
      );
    }
    return ok(res, data);
  } catch (error: unknown) {
    const { message, status } = errorMessage(error);
    return fail(res, message, status);
  }
}
