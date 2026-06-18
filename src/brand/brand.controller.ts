import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { BrandService } from './brand.service';
import {
  BrandCampaignQueryDto,
  CampaignDto,
  CreatePaymentOrderDto,
  CreatorDiscoveryQueryDto,
  FundsDto,
  NotificationQueryDto,
  RevisionDto,
  SendMessageDto,
  TransactionQueryDto,
  UpdateBrandProfileDto,
  VerifyPaymentDto,
} from './brand.dto';

@ApiTags('Brand')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.brandService.getProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() body: UpdateBrandProfileDto) {
    return this.brandService.updateProfile(req.user.id, body);
  }

  @Post('campaigns')
  createCampaign(@Request() req: any, @Body() body: CampaignDto) {
    return this.brandService.createCampaign(req.user.id, body);
  }

  @Get('campaigns')
  getCampaigns(@Request() req: any, @Query() query: BrandCampaignQueryDto) {
    return this.brandService.getCampaigns(req.user.id, query);
  }

  @Get('campaigns/:id')
  getCampaign(@Request() req: any, @Param('id') id: string) {
    return this.brandService.getCampaign(req.user.id, id);
  }

  @Get('campaigns/:id/detail')
  getCampaignDetail(@Request() req: any, @Param('id') id: string) {
    return this.brandService.getCampaignDetail(req.user.id, id);
  }

  @Put('campaigns/:id')
  updateCampaign(@Request() req: any, @Param('id') id: string, @Body() body: CampaignDto) {
    return this.brandService.updateCampaign(req.user.id, id, body);
  }

  @Delete('campaigns/:id')
  deleteCampaign(@Request() req: any, @Param('id') id: string) {
    return this.brandService.deleteCampaign(req.user.id, id);
  }

  @Get('campaigns/:id/applicants')
  getApplicants(@Request() req: any, @Param('id') id: string) {
    return this.brandService.getApplicants(req.user.id, id);
  }

  @Get('campaigns/:id/recommendations')
  getCampaignRecommendations(@Request() req: any, @Param('id') id: string) {
    return this.brandService.getCampaignRecommendations(req.user.id, id);
  }

  @Post('applications/:id/approve')
  approveApplication(@Request() req: any, @Param('id') id: string) {
    return this.brandService.updateApplication(req.user.id, id, 'ACCEPTED');
  }

  @Post('applications/:id/reject')
  rejectApplication(@Request() req: any, @Param('id') id: string) {
    return this.brandService.updateApplication(req.user.id, id, 'REJECTED');
  }

  @Post('applications/:id/shortlist')
  shortlistApplication(@Request() req: any, @Param('id') id: string) {
    return this.brandService.updateApplication(req.user.id, id, 'SHORTLISTED');
  }

  @Post('campaigns/:id/invite/:creatorId')
  inviteCreator(
    @Request() req: any,
    @Param('id') id: string,
    @Param('creatorId') creatorId: string,
  ) {
    return this.brandService.inviteCreator(req.user.id, id, creatorId);
  }

  @Get('creators')
  getCreators(@Query() query: CreatorDiscoveryQueryDto) {
    return this.brandService.getCreators(query);
  }

  @Get('my-creators')
  getMyCreators(@Request() req: any, @Query() query: CreatorDiscoveryQueryDto) {
    return this.brandService.getMyCreators(req.user.id, query);
  }

  @Get('campaigns/:id/deliverables')
  getCampaignDeliverables(@Request() req: any, @Param('id') id: string) {
    return this.brandService.getCampaignDeliverables(req.user.id, id);
  }

  @Post('deliverables/:id/approve')
  approveDeliverable(@Request() req: any, @Param('id') id: string) {
    return this.brandService.reviewDeliverable(req.user.id, id, 'APPROVED');
  }

  @Post('deliverables/:id/revise')
  reviseDeliverable(@Request() req: any, @Param('id') id: string, @Body() body: RevisionDto) {
    return this.brandService.reviewDeliverable(req.user.id, id, 'REVISION_REQUESTED', body.notes);
  }

  @Post('escrows/:id/release')
  releaseEscrow(@Request() req: any, @Param('id') id: string) {
    return this.brandService.releaseEscrow(req.user.id, id);
  }

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.brandService.getDashboard(req.user.id);
  }

  @Get('wallet')
  getWallet(@Request() req: any) {
    return this.brandService.getWallet(req.user.id);
  }

  @Post('wallet/add-funds')
  addFunds(@Request() req: any, @Body() body: FundsDto) {
    return this.brandService.addFunds(req.user.id, body);
  }

  @Post('wallet/create-order')
  createPaymentOrder(@Request() req: any, @Body() body: CreatePaymentOrderDto) {
    return this.brandService.createPaymentOrder(req.user.id, body.amount);
  }

  @Post('wallet/verify-payment')
  verifyPayment(@Request() req: any, @Body() body: VerifyPaymentDto) {
    return this.brandService.verifyPayment(req.user.id, body);
  }

  @Get('wallet/razorpay-key')
  getRazorpayKey() {
    return this.brandService.getRazorpayKey();
  }

  @Get('wallet/transactions')
  getWalletTransactions(@Request() req: any, @Query() query: TransactionQueryDto) {
    return this.brandService.getWalletTransactions(req.user.id, query);
  }

  @Get('analytics')
  getAnalytics(@Request() req: any) {
    return this.brandService.getAnalytics(req.user.id);
  }

  @Get('analytics/roi')
  getRoi(@Request() req: any) {
    return this.brandService.getRoi(req.user.id);
  }

  @Get('analytics/top-creators')
  getTopCreators(@Request() req: any) {
    return this.brandService.getTopCreators(req.user.id);
  }

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.brandService.getConversations(req.user.id);
  }

  @Get('messages/:conversationId')
  getMessages(@Request() req: any, @Param('conversationId') conversationId: string) {
    return this.brandService.getMessages(req.user.id, conversationId);
  }

  @Post('messages/send')
  sendMessage(@Request() req: any, @Body() body: SendMessageDto) {
    return this.brandService.sendMessage(req.user.id, body);
  }

  @Get('notifications/unread-count')
  getUnreadNotificationCount(@Request() req: any) {
    return this.brandService.getUnreadNotificationCount(req.user.id);
  }

  @Patch('notifications/read-all')
  markAllNotificationsRead(@Request() req: any) {
    return this.brandService.markAllNotificationsRead(req.user.id);
  }

  @Get('notifications')
  getNotifications(@Request() req: any, @Query() query: NotificationQueryDto) {
    return this.brandService.getNotifications(req.user.id, query);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(@Request() req: any, @Param('id') id: string) {
    return this.brandService.markNotificationRead(req.user.id, id);
  }

  @Get('settings')
  getSettings(@Request() req: any) {
    return this.brandService.getSettings(req.user.id);
  }

  @Put('settings')
  updateSettings(@Request() req: any, @Body() body: Record<string, any>) {
    return this.brandService.updateSettings(req.user.id, body);
  }
}
