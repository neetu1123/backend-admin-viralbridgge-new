import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { ResolveDisputeDto } from './dto/escrow.dto';
import { DisputeQueryDto, RejectWithdrawalDto } from './dto/withdrawal.dto';
import { DisputeService } from './dispute.service';
import { EscrowService } from './escrow.service';
import { WithdrawalService } from './withdrawal.service';

@ApiTags('Admin Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminPaymentsController {
  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly disputeService: DisputeService,
    private readonly escrowService: EscrowService,
  ) {}

  @Get('withdrawals')
  @ApiOperation({ summary: 'List withdrawal requests for admin review' })
  getWithdrawals(@Query('status') status?: string) {
    return this.withdrawalService.listAdminWithdrawals(status ?? 'PENDING');
  }

  @Post('withdrawals/:id/approve')
  @ApiOperation({ summary: 'Approve a withdrawal request' })
  approveWithdrawal(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.withdrawalService.approveWithdrawal(id, req.user.id);
  }

  @Patch('withdrawals/:id/approve')
  approveWithdrawalPatch(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.withdrawalService.approveWithdrawal(id, req.user.id);
  }

  @Post('withdrawals/:id/reject')
  @ApiOperation({ summary: 'Reject a withdrawal request' })
  rejectWithdrawal(
    @Param('id') id: string,
    @Body() body: RejectWithdrawalDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.withdrawalService.rejectWithdrawal(id, req.user.id, body.reason);
  }

  @Patch('withdrawals/:id/reject')
  rejectWithdrawalPatch(
    @Param('id') id: string,
    @Body() body: RejectWithdrawalDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.withdrawalService.rejectWithdrawal(id, req.user.id, body.reason);
  }

  @Get('disputes/stats')
  @ApiOperation({ summary: 'Dispute dashboard stats' })
  getDisputeStats() {
    return this.disputeService.getAdminDisputeStats();
  }

  @Get('escrows')
  @ApiOperation({ summary: 'Monitor all escrows (admin)' })
  getEscrows(@Query('status') status?: string) {
    return this.escrowService.listAdminEscrows(status);
  }

  @Get('disputes')
  @ApiOperation({ summary: 'List all disputes' })
  getDisputes(@Query() query: DisputeQueryDto) {
    return this.disputeService.listAdminDisputes(query);
  }

  @Get('disputes/:id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  getDispute(@Param('id') id: string) {
    return this.disputeService.getAdminDispute(id);
  }

  @Post('disputes/:id/resolve')
  @ApiOperation({ summary: 'Resolve dispute — release full or partial amount to creator' })
  resolveDispute(
    @Param('id') id: string,
    @Body() body: ResolveDisputeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.disputeService.resolveDispute(id, req.user.id, body);
  }

  @Patch('disputes/:id/resolve')
  resolveDisputePatch(
    @Param('id') id: string,
    @Body() body: ResolveDisputeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.disputeService.resolveDispute(id, req.user.id, body);
  }

  @Post('disputes/:id/refund')
  @ApiOperation({ summary: 'Refund dispute — return funds to brand' })
  refundDispute(
    @Param('id') id: string,
    @Body() body: ResolveDisputeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.disputeService.refundDispute(id, req.user.id, body.notes);
  }

  @Patch('disputes/:id/refund')
  refundDisputePatch(
    @Param('id') id: string,
    @Body() body: ResolveDisputeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.disputeService.refundDispute(id, req.user.id, body.notes);
  }

  @Patch('disputes/:id/escalate')
  escalateDispute(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.disputeService.escalateDispute(id, req.user.id);
  }

  @Patch('disputes/:id/partial-payout')
  partialPayout(
    @Param('id') id: string,
    @Body() body: ResolveDisputeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.disputeService.resolveDispute(id, req.user.id, body);
  }
}
