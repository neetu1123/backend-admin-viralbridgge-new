import { getPrisma } from './prisma';

type BrandServiceType = import('../../dist/src/brand/brand.service').BrandService;
type CreatorServiceType = import('../../dist/src/creator/creator.service').CreatorService;
type MatchingServiceType = import('../../dist/src/matching/matching.service').MatchingService;
type AdminServiceType = import('../../dist/src/admin/admin.service').AdminService;
type OrganizationServiceType = import('../../dist/src/organization/organization.service').OrganizationService;
type SecurityServiceType = import('../../dist/src/security/security.service').SecurityService;

let brandService: BrandServiceType | undefined;
let creatorService: CreatorServiceType | undefined;
let matchingService: MatchingServiceType | undefined;
let adminService: AdminServiceType | undefined;
let organizationService: OrganizationServiceType | undefined;
let securityService: SecurityServiceType | undefined;
let notificationsService: import('../../dist/src/notifications/notifications.service').NotificationsService | undefined;

function getNotificationsService() {
  if (!notificationsService) {
    const { NotificationsService } = require('../../dist/src/notifications/notifications.service') as typeof import('../../dist/src/notifications/notifications.service');
    notificationsService = new NotificationsService(getPrisma() as never);
  }
  return notificationsService;
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
    brandService = new BrandService(getPrisma() as never, getMatchingService());
  }
  return brandService;
}

export function getCreatorService(): CreatorServiceType {
  if (!creatorService) {
    const { CreatorService } = require('../../dist/src/creator/creator.service') as typeof import('../../dist/src/creator/creator.service');
    creatorService = new CreatorService(getPrisma() as never, getMatchingService());
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
    organizationService = new OrganizationService(getPrisma() as never, getNotificationsService());
  }
  return organizationService;
}

export function getSecurityService(): SecurityServiceType {
  if (!securityService) {
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
