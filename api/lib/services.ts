import { getPrisma } from './prisma';

type BrandServiceType = import('../../dist/src/brand/brand.service').BrandService;
type CreatorServiceType = import('../../dist/src/creator/creator.service').CreatorService;
type MatchingServiceType = import('../../dist/src/matching/matching.service').MatchingService;
type AdminServiceType = import('../../dist/src/admin/admin.service').AdminService;
type OrganizationServiceType = import('../../dist/src/organization/organization.service').OrganizationService;
type SecurityServiceType = import('../../dist/src/security/security.service').SecurityService;
type CreatorAnalyticsServiceType = import('../../dist/src/analytics/creator-analytics.service').CreatorAnalyticsService;
type AdminAnalyticsServiceType = import('../../dist/src/analytics/admin-analytics.service').AdminAnalyticsService;
type WalletServiceType = import('../../dist/src/payments/wallet.service').WalletService;
type EscrowServiceType = import('../../dist/src/payments/escrow.service').EscrowService;
type DeliverablesServiceType = import('../../dist/src/payments/deliverables.service').DeliverablesService;
type WithdrawalServiceType = import('../../dist/src/payments/withdrawal.service').WithdrawalService;
type RazorpayServiceType = import('../../dist/src/payments/razorpay.service').RazorpayService;
type StorageServiceType = import('../../dist/src/storage/storage.service').StorageService;
type PublicServiceType = import('../../dist/src/public/public.service').PublicService;

let brandService: BrandServiceType | undefined;
let creatorService: CreatorServiceType | undefined;
let matchingService: MatchingServiceType | undefined;
let adminService: AdminServiceType | undefined;
let organizationService: OrganizationServiceType | undefined;
let securityService: SecurityServiceType | undefined;
let creatorAnalyticsService: CreatorAnalyticsServiceType | undefined;
let adminAnalyticsService: AdminAnalyticsServiceType | undefined;
let notificationsService: import('../../dist/src/notifications/notifications.service').NotificationsService | undefined;
let emailService: import('../../dist/src/email/email.service').EmailService | undefined;
let walletService: WalletServiceType | undefined;
let escrowService: EscrowServiceType | undefined;
let deliverablesService: DeliverablesServiceType | undefined;
let withdrawalService: WithdrawalServiceType | undefined;
let razorpayService: RazorpayServiceType | undefined;
let storageService: StorageServiceType | undefined;
let publicService: PublicServiceType | undefined;
let configService: import('@nestjs/config').ConfigService | undefined;

function getConfigService() {
  if (!configService) {
    const { ConfigService } = require('@nestjs/config') as typeof import('@nestjs/config');
    configService = new ConfigService();
  }
  return configService;
}

function getEmailService() {
  if (!emailService) {
    const { EmailService } = require('../../dist/src/email/email.service') as typeof import('../../dist/src/email/email.service');
    emailService = new EmailService(getConfigService());
  }
  return emailService;
}

function getNotificationsService() {
  if (!notificationsService) {
    const { NotificationsService } = require('../../dist/src/notifications/notifications.service') as typeof import('../../dist/src/notifications/notifications.service');
    notificationsService = new NotificationsService(getPrisma() as never);
  }
  return notificationsService;
}

function getRazorpayService(): RazorpayServiceType {
  if (!razorpayService) {
    const { RazorpayService } = require('../../dist/src/payments/razorpay.service') as typeof import('../../dist/src/payments/razorpay.service');
    razorpayService = new RazorpayService(getConfigService(), getPrisma() as never);
  }
  return razorpayService;
}

function getWalletService(): WalletServiceType {
  if (!walletService) {
    const { WalletService } = require('../../dist/src/payments/wallet.service') as typeof import('../../dist/src/payments/wallet.service');
    walletService = new WalletService(getPrisma() as never, getNotificationsService(), getRazorpayService());
  }
  return walletService;
}

function getPlatformWalletService() {
  const { PlatformWalletService } = require('../../dist/src/payments/platform-wallet.service') as typeof import('../../dist/src/payments/platform-wallet.service');
  return new PlatformWalletService(getPrisma() as never);
}

function getEscrowService(): EscrowServiceType {
  if (!escrowService) {
    const { EscrowService } = require('../../dist/src/payments/escrow.service') as typeof import('../../dist/src/payments/escrow.service');
    escrowService = new EscrowService(
      getPrisma() as never,
      getWalletService(),
      getPlatformWalletService(),
      getNotificationsService(),
    );
  }
  return escrowService;
}

function getStorageService(): StorageServiceType {
  if (!storageService) {
    const { StorageService } = require('../../dist/src/storage/storage.service') as typeof import('../../dist/src/storage/storage.service');
    storageService = new StorageService();
  }
  return storageService;
}

function getDeliverablesService(): DeliverablesServiceType {
  if (!deliverablesService) {
    const { DeliverablesService } = require('../../dist/src/payments/deliverables.service') as typeof import('../../dist/src/payments/deliverables.service');
    deliverablesService = new DeliverablesService(
      getPrisma() as never,
      getNotificationsService(),
      getEscrowService(),
      getStorageService(),
    );
  }
  return deliverablesService;
}

function getWithdrawalService(): WithdrawalServiceType {
  if (!withdrawalService) {
    const { WithdrawalService } = require('../../dist/src/payments/withdrawal.service') as typeof import('../../dist/src/payments/withdrawal.service');
    withdrawalService = new WithdrawalService(getPrisma() as never, getWalletService(), getNotificationsService());
  }
  return withdrawalService;
}

export function getMatchingService(): MatchingServiceType {
  if (!matchingService) {
    const { MatchingService } = require('../../dist/src/matching/matching.service') as typeof import('../../dist/src/matching/matching.service');
    matchingService = new MatchingService(getPrisma() as never);
  }
  return matchingService;
}

export function getBrandService(): BrandServiceType {
  if (!brandService) {
    const { BrandService } = require('../../dist/src/brand/brand.service') as typeof import('../../dist/src/brand/brand.service');
    brandService = new BrandService(
      getPrisma() as never,
      getMatchingService(),
      getNotificationsService(),
      getWalletService(),
      getEscrowService(),
      getDeliverablesService(),
      getRazorpayService(),
    );
  }
  return brandService;
}

export function getCreatorService(): CreatorServiceType {
  if (!creatorService) {
    const { CreatorService } = require('../../dist/src/creator/creator.service') as typeof import('../../dist/src/creator/creator.service');
    creatorService = new CreatorService(
      getPrisma() as never,
      getMatchingService(),
      getNotificationsService(),
      getWalletService(),
      getWithdrawalService(),
      getDeliverablesService(),
      getEscrowService(),
    );
  }
  return creatorService;
}

export function getAdminService(): AdminServiceType {
  if (!adminService) {
    const { AdminService } = require('../../dist/src/admin/admin.service') as typeof import('../../dist/src/admin/admin.service');
    adminService = new AdminService(getPrisma() as never, getMatchingService());
  }
  return adminService;
}

export function getOrganizationService(): OrganizationServiceType {
  if (!organizationService) {
    const { OrganizationService } = require('../../dist/src/organization/organization.service') as typeof import('../../dist/src/organization/organization.service');
    organizationService = new OrganizationService(getPrisma() as never, getNotificationsService(), getEmailService());
  }
  return organizationService;
}

export function getSecurityService(): SecurityServiceType {
  if (!securityService) {
    const { initializeFirebaseAdmin } = require('../../dist/src/firebase/firebase-admin.config') as typeof import('../../dist/src/firebase/firebase-admin.config');
    initializeFirebaseAdmin();

    const { SecurityService } = require('../../dist/src/security/security.service') as typeof import('../../dist/src/security/security.service');
    const { FirebaseSecurityService } = require('../../dist/src/security/firebase-security.service') as typeof import('../../dist/src/security/firebase-security.service');
    securityService = new SecurityService(
      getPrisma() as never,
      getNotificationsService(),
      new FirebaseSecurityService(),
    );
  }
  return securityService;
}

function getAnalyticsCacheService() {
  const { AnalyticsCacheService } = require('../../dist/src/analytics/analytics-cache.service') as typeof import('../../dist/src/analytics/analytics-cache.service');
  return new AnalyticsCacheService();
}

export function getCreatorAnalyticsService(): CreatorAnalyticsServiceType {
  if (!creatorAnalyticsService) {
    const { CreatorAnalyticsService } = require('../../dist/src/analytics/creator-analytics.service') as typeof import('../../dist/src/analytics/creator-analytics.service');
    creatorAnalyticsService = new CreatorAnalyticsService(getPrisma() as never, getAnalyticsCacheService());
  }
  return creatorAnalyticsService;
}

export function getAdminAnalyticsService(): AdminAnalyticsServiceType {
  if (!adminAnalyticsService) {
    const { AdminAnalyticsService } = require('../../dist/src/analytics/admin-analytics.service') as typeof import('../../dist/src/analytics/admin-analytics.service');
    adminAnalyticsService = new AdminAnalyticsService(getPrisma() as never, getAnalyticsCacheService());
  }
  return adminAnalyticsService;
}

export function getPublicService(): PublicServiceType {
  if (!publicService) {
    const { PublicService } = require('../../dist/src/public/public.service') as typeof import('../../dist/src/public/public.service');
    publicService = new PublicService(getPrisma() as never);
  }
  return publicService;
}

// Exported for payment routes and admin email/broadcast on Vercel express path
export {
  getEmailService,
  getNotificationsService,
  getWalletService,
  getEscrowService,
  getDeliverablesService,
  getWithdrawalService,
  getRazorpayService,
};
