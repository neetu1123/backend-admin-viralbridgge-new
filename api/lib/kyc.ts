import type { PrismaClient } from '@prisma/client';
import { createNotification, notifyAdmins } from './notifications';

const KYC_STATUSES = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'] as const;

export async function submitCreatorKyc(
  prisma: PrismaClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const data = {
    mobile_number: body.mobile_number ? String(body.mobile_number) : undefined,
    mobile_verified: Boolean(body.mobile_verified),
    email_verified: Boolean(body.email_verified),
    instagram_handle: body.instagram_handle ? String(body.instagram_handle) : undefined,
    youtube_handle: body.youtube_handle ? String(body.youtube_handle) : undefined,
    tiktok_handle: body.tiktok_handle ? String(body.tiktok_handle) : undefined,
    instagram_profile_url: body.instagram_profile_url ? String(body.instagram_profile_url) : undefined,
    selfie_url: body.selfie_url ? String(body.selfie_url) : undefined,
    followers_count: Number(body.followers_count) || 0,
    engagement_rate: Number(body.engagement_rate) || 0,
    verification_status: 'PENDING',
  };

  const creatorKyc = await prisma.creatorKyc.upsert({
    where: { user_id: userId },
    create: { user_id: userId, ...data },
    update: data,
  });

  const kycRequest = await prisma.kycRequest.create({
    data: {
      user_id: userId,
      user_type: 'CREATOR',
      status: 'PENDING',
    },
  });

  await prisma.creatorKyc.update({
    where: { id: creatorKyc.id },
    data: { kyc_request_id: kycRequest.id },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'PENDING_KYC' },
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await notifyAdmins(prisma, {
    title: 'New Creator KYC Submission',
    message: `${user?.name ?? 'A creator'} submitted KYC for review.`,
    type: 'KYC',
    entityType: 'KycRequest',
    entityId: kycRequest.id,
  });

  return { kycRequest, creatorKyc };
}

export async function submitBrandKyc(
  prisma: PrismaClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const data = {
    company_name: body.company_name ? String(body.company_name) : undefined,
    gst_number: body.gst_number ? String(body.gst_number) : undefined,
    website: body.website ? String(body.website) : undefined,
    business_email: body.business_email ? String(body.business_email) : undefined,
    business_email_verified: Boolean(body.business_email_verified),
    linkedin_url: body.linkedin_url ? String(body.linkedin_url) : undefined,
    logo_url: body.logo_url ? String(body.logo_url) : undefined,
    business_address: body.business_address ? String(body.business_address) : undefined,
    verification_status: 'PENDING',
  };

  const brandKyc = await prisma.brandKyc.upsert({
    where: { user_id: userId },
    create: { user_id: userId, ...data },
    update: data,
  });

  const kycRequest = await prisma.kycRequest.create({
    data: {
      user_id: userId,
      user_type: 'BRAND',
      status: 'PENDING',
    },
  });

  await prisma.brandKyc.update({
    where: { id: brandKyc.id },
    data: { kyc_request_id: kycRequest.id },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'PENDING_KYC' },
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await notifyAdmins(prisma, {
    title: 'New Brand KYC Submission',
    message: `${data.company_name ?? user?.name ?? 'A brand'} submitted KYC for review.`,
    type: 'KYC',
    entityType: 'KycRequest',
    entityId: kycRequest.id,
  });

  return { kycRequest, brandKyc };
}

export async function getKycStatus(prisma: PrismaClient, userId: string) {
  const [creatorKyc, brandKyc, latestRequest] = await Promise.all([
    prisma.creatorKyc.findUnique({ where: { user_id: userId } }),
    prisma.brandKyc.findUnique({ where: { user_id: userId } }),
    prisma.kycRequest.findFirst({
      where: { user_id: userId },
      orderBy: { submitted_at: 'desc' },
      include: { creator_kyc: true, brand_kyc: true },
    }),
  ]);

  return {
    creatorKyc,
    brandKyc,
    latestRequest,
    status: latestRequest?.status ?? creatorKyc?.verification_status ?? brandKyc?.verification_status ?? 'UNVERIFIED',
  };
}

export async function listAdminKyc(
  prisma: PrismaClient,
  query: { status?: string; user_type?: string; page?: number; limit?: number } = {},
) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, query.limit ?? 20);
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status.toUpperCase();
  if (query.user_type) where.user_type = query.user_type.toUpperCase();

  const [rows, total] = await Promise.all([
    prisma.kycRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submitted_at: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        creator_kyc: true,
        brand_kyc: true,
      },
    }),
    prisma.kycRequest.count({ where }),
  ]);

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function approveKyc(
  prisma: PrismaClient,
  requestId: string,
  adminId: string,
  remarks?: string,
) {
  const request = await prisma.kycRequest.findUnique({
    where: { id: requestId },
    include: { creator_kyc: true, brand_kyc: true, user: true },
  });
  if (!request) throw new Error('KYC request not found');

  const now = new Date();
  await prisma.kycRequest.update({
    where: { id: requestId },
    data: { status: 'VERIFIED', reviewed_at: now, reviewed_by: adminId, remarks },
  });

  if (request.user_type === 'CREATOR' && request.creator_kyc) {
    await prisma.creatorKyc.update({
      where: { id: request.creator_kyc.id },
      data: { verification_status: 'VERIFIED' },
    });
  }
  if (request.user_type === 'BRAND' && request.brand_kyc) {
    await prisma.brandKyc.update({
      where: { id: request.brand_kyc.id },
      data: { verification_status: 'VERIFIED' },
    });
  }

  await prisma.user.update({
    where: { id: request.user_id },
    data: { is_verified: true, status: 'ACTIVE' },
  });

  await createNotification(prisma, {
    userId: request.user_id,
    title: 'KYC Approved',
    message: 'Your identity verification has been approved. You can now access all platform features.',
    type: 'KYC',
    entityType: 'KycRequest',
    entityId: requestId,
  });

  return request;
}

export async function rejectKyc(
  prisma: PrismaClient,
  requestId: string,
  adminId: string,
  remarks?: string,
) {
  if (!remarks?.trim()) {
    throw new Error('Rejection reason is required');
  }
  const request = await prisma.kycRequest.findUnique({
    where: { id: requestId },
    include: { creator_kyc: true, brand_kyc: true },
  });
  if (!request) throw new Error('KYC request not found');

  const now = new Date();
  await prisma.kycRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED', reviewed_at: now, reviewed_by: adminId, remarks },
  });

  if (request.user_type === 'CREATOR' && request.creator_kyc) {
    await prisma.creatorKyc.update({
      where: { id: request.creator_kyc.id },
      data: { verification_status: 'REJECTED' },
    });
  }
  if (request.user_type === 'BRAND' && request.brand_kyc) {
    await prisma.brandKyc.update({
      where: { id: request.brand_kyc.id },
      data: { verification_status: 'REJECTED' },
    });
  }

  await prisma.user.update({
    where: { id: request.user_id },
    data: { is_verified: false, status: 'PENDING_KYC' },
  });

  await createNotification(prisma, {
    userId: request.user_id,
    title: 'KYC Rejected',
    message: remarks ?? 'Your KYC submission was rejected. Please review and resubmit.',
    type: 'KYC',
    entityType: 'KycRequest',
    entityId: requestId,
  });

  return request;
}

export { KYC_STATUSES };
