import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithdrawalDto, WithdrawalQueryDto } from './dto/withdrawal.dto';
import { WithdrawalService } from './withdrawal.service';

@ApiTags('Withdrawals')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post('request')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Request a withdrawal from creator wallet' })
  request(@Request() req: { user: { id: string } }, @Body() body: RequestWithdrawalDto) {
    return this.withdrawalService.requestWithdrawal(req.user.id, body);
  }

  @Get()
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List own withdrawal requests' })
  list(@Request() req: { user: { id: string } }, @Query() query: WithdrawalQueryDto) {
    return this.withdrawalService.listUserWithdrawals(req.user.id, query);
  }
}
