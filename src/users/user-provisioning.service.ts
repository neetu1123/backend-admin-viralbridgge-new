import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserProvisioningService {
  constructor(private readonly prisma: PrismaService) {}

  /** Creates wallet, security settings, notification prefs, and KYC shell for a new user. */
  async provisionUserResources(userId: string, roleName: string, displayName: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.wallet.upsert({
        where: { user_id: userId },
        update: {},
        create: {
          user_id: userId,
          available_balance: 0,
          locked_balance: 0,
          pending_balance: 0,
          lifetime_earnings: 0,
          currency: 'INR',
        },
      });

      await tx.securitySetting.upsert({
        where: { user_id: userId },
        update: {},
        create: { user_id: userId },
      });

      await tx.notificationPreference.upsert({
        where: { user_id: userId },
        update: {},
        create: { user_id: userId },
      });

      const kycRequest = await tx.kycRequest.create({
        data: {
          user_id: userId,
          user_type: roleName,
          status: 'PENDING',
        },
      });

      if (roleName === 'CREATOR') {
        await tx.creatorKyc.upsert({
          where: { user_id: userId },
          update: {},
          create: {
            user_id: userId,
            kyc_request_id: kycRequest.id,
            verification_status: 'UNVERIFIED',
          },
        });
      }

      if (roleName === 'BRAND') {
        await tx.brandKyc.upsert({
          where: { user_id: userId },
          update: {},
          create: {
            user_id: userId,
            kyc_request_id: kycRequest.id,
            company_name: displayName,
            verification_status: 'UNVERIFIED',
          },
        });
      }
    });
  }
}
