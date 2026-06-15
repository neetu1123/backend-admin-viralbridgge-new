import { Controller, Get, Post, Body, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { KycService } from './kyc.service';

@ApiTags('KYC')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('status')
  getStatus(@Request() req) {
    return this.kycService.getStatus(req.user.id);
  }

  @Post('creator/submit')
  submitCreator(@Request() req, @Body() body: Record<string, unknown>) {
    const role = (req.user.role?.name ?? '').toUpperCase();
    if (role !== 'CREATOR') throw new ForbiddenException('Only creators can submit creator KYC');
    return this.kycService.submitCreator(req.user.id, body);
  }

  @Post('brand/submit')
  submitBrand(@Request() req, @Body() body: Record<string, unknown>) {
    const role = (req.user.role?.name ?? '').toUpperCase();
    if (role !== 'BRAND') throw new ForbiddenException('Only brands can submit brand KYC');
    return this.kycService.submitBrand(req.user.id, body);
  }
}
