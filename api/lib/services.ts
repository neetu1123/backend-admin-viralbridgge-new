import { getPrisma } from './prisma';

type BrandServiceType = import('../../dist/brand/brand.service').BrandService;
type CreatorServiceType = import('../../dist/creator/creator.service').CreatorService;

let brandService: BrandServiceType | undefined;
let creatorService: CreatorServiceType | undefined;

export function getBrandService(): BrandServiceType {
  if (!brandService) {
    const { BrandService } = require('../../dist/brand/brand.service') as typeof import('../../dist/brand/brand.service');
    brandService = new BrandService(getPrisma() as never);
  }
  return brandService;
}

export function getCreatorService(): CreatorServiceType {
  if (!creatorService) {
    const { CreatorService } = require('../../dist/creator/creator.service') as typeof import('../../dist/creator/creator.service');
    creatorService = new CreatorService(getPrisma() as never);
  }
  return creatorService;
}
