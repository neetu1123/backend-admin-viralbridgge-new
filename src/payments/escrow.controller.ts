import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateEscrowDto,
  EscrowActionDto,
  EscrowRefundDto,
  OpenDisputeDto,
} from './dto/escrow.dto';
import { EscrowService } from './escrow.service';

@ApiTags('Escrow')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('create')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create escrow and lock brand funds' })
  create(@Request() req: { user: { id: string } }, @Body() body: CreateEscrowDto) {
    return this.escrowService.createEscrow(req.user.id, body);
  }

  @Get(':id')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get escrow by ID' })
  get(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.escrowService.getEscrow(req.user.id, id);
  }

  @Post('release')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Release escrow to creator wallet' })
  release(@Request() req: { user: { id: string } }, @Body() body: EscrowActionDto) {
    return this.escrowService.releaseEscrow(req.user.id, body.escrow_id);
  }

  @Post('refund')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Refund escrow to brand wallet' })
  refund(@Request() req: { user: { id: string } }, @Body() body: EscrowRefundDto) {
    return this.escrowService.refundEscrow(req.user.id, body.escrow_id);
  }

  @Post('dispute')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Open a dispute on an escrow' })
  dispute(
    @Request() req: { user: { id: string; role?: { name: string } } },
    @Body() body: OpenDisputeDto,
  ) {
    const roleName = req.user.role?.name ?? 'CREATOR';
    const role = roleName === 'BRAND' ? 'brand' : 'creator';
    return this.escrowService.openDispute(req.user.id, role, body);
  }
}
