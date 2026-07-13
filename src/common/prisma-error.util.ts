import { Prisma } from '@prisma/client';

export function isPrismaMissingTableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2021' || error.code === 'P2010';
  }
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('does not exist') ||
    msg.includes('P2021') ||
    msg.includes('user_activity') ||
    msg.includes('re_engagement_email_logs') ||
    msg.includes('campaign_prompt_events')
  );
}

export function isPrismaMissingColumnError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('column') && msg.includes('does not exist') ||
    msg.includes('reengagement_')
  );
}
