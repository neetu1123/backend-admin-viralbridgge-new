import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TRANSACTION_TYPES } from './constants';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class PlatformWalletService {
  private platformUserId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getPlatformWallet(tx?: TxClient) {
    const client = tx ?? this.prisma;
    const userId = await this.ensurePlatformUser(client);
    return client.wallet.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        is_platform: true,
        currency: 'INR',
      },
    });
  }

  async creditPlatformFee(tx: TxClient, amount: number, referenceId?: string) {
    if (amount <= 0) return null;
    const wallet = await this.getPlatformWallet(tx);
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { available_balance: { increment: amount } },
    });
    await tx.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: TRANSACTION_TYPES.PLATFORM_FEE,
        amount,
        balance_after: updated.available_balance,
        reference_type: 'Escrow',
        reference_id: referenceId,
        status: 'COMPLETED',
      },
    });
    return updated;
  }

  private async ensurePlatformUser(client: TxClient | PrismaService): Promise<string> {
    if (this.platformUserId) return this.platformUserId;

    const existing = await client.wallet.findFirst({
      where: { is_platform: true },
      select: { user_id: true },
    });
    if (existing) {
      this.platformUserId = existing.user_id;
      return existing.user_id;
    }

    const role = await client.role.upsert({
      where: { name: 'PLATFORM' },
      update: {},
      create: { name: 'PLATFORM', description: 'Platform treasury account' },
    });

    const user = await client.user.create({
      data: {
        email: 'platform@viralbridge.internal',
        name: 'ViralBridge Platform',
        role_id: role.id,
        is_verified: true,
        wallets: {
          create: { is_platform: true, currency: 'INR' },
        },
      },
    });

    this.platformUserId = user.id;
    return user.id;
  }
}
