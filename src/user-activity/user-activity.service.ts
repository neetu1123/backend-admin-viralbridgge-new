import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ActivityField =
  | 'last_login'
  | 'last_active'
  | 'last_campaign_activity'
  | 'last_wallet_activity'
  | 'last_message_activity';

@Injectable()
export class UserActivityService {
  constructor(private prisma: PrismaService) {}

  private now() {
    return new Date();
  }

  async touch(userId: string, fields: ActivityField | ActivityField[]) {
    const list = Array.isArray(fields) ? fields : [fields];
    const ts = this.now();
    const data: Record<string, Date> = {};
    for (const field of list) {
      data[field] = ts;
    }

    try {
      await this.prisma.userActivity.upsert({
        where: { user_id: userId },
        create: { user_id: userId, ...data },
        update: data,
      });
    } catch (e) {
      console.error('UserActivity touch failed:', e);
    }
  }

  async recordLogin(userId: string) {
    return this.touch(userId, ['last_login', 'last_active']);
  }

  async recordActive(userId: string) {
    return this.touch(userId, 'last_active');
  }

  async recordCampaignActivity(userId: string) {
    return this.touch(userId, ['last_campaign_activity', 'last_active']);
  }

  async recordWalletActivity(userId: string) {
    return this.touch(userId, ['last_wallet_activity', 'last_active']);
  }

  async recordMessageActivity(userId: string) {
    return this.touch(userId, ['last_message_activity', 'last_active']);
  }

  async getActivity(userId: string) {
    return this.prisma.userActivity.findUnique({ where: { user_id: userId } });
  }

  async getOrCreate(userId: string) {
    const existing = await this.getActivity(userId);
    if (existing) return existing;
    return this.prisma.userActivity.create({ data: { user_id: userId } });
  }
}
