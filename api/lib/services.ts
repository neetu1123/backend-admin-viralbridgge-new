import { getPrisma } from './prisma';

type BrandServiceType = import('../../dist/brand/brand.service').BrandService;
type CreatorServiceType = import('../../dist/creator/creator.service').CreatorService;
type MatchingServiceType = import('../../dist/matching/matching.service').MatchingService;
type AdminServiceType = import('../../dist/admin/admin.service').AdminService;

let brandService: BrandServiceType | undefined;
let creatorService: CreatorServiceType | undefined;
let matchingService: MatchingServiceType | undefined;
let adminService: AdminServiceType | undefined;

export function getMatchingService(): MatchingServiceType {
  if (!matchingService) {
    const { MatchingService } = require('../../dist/matching/matching.service') as typeof import('../../dist/matching/matching.service');
    matchingService = new MatchingService(getPrisma() as never);
  }
  return matchingService;
}

export function getBrandService(): BrandServiceType {
  if (!brandService) {
    const { BrandService } = require('../../dist/brand/brand.service') as typeof import('../../dist/brand/brand.service');
    brandService = new BrandService(getPrisma() as never, getMatchingService());
  }
  return brandService;
}

export function getCreatorService(): CreatorServiceType {
  if (!creatorService) {
    const { CreatorService } = require('../../dist/creator/creator.service') as typeof import('../../dist/creator/creator.service');
    creatorService = new CreatorService(getPrisma() as never, getMatchingService());
  }
  return creatorService;
}

export function getAdminService(): AdminServiceType {
  if (!adminService) {
    const { AdminService } = require('../../dist/admin/admin.service') as typeof import('../../dist/admin/admin.service');
    adminService = new AdminService(getPrisma() as never, getMatchingService());
  }
  return adminService;
}
