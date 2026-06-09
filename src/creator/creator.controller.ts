import {
  Body,
  Controller,
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
import { CreatorService } from './creator.service';
import {
  ApplyCampaignDto,
  ApplicationQueryDto,
  CreatorCampaignQueryDto,
  NotificationQueryDto,
  SendMessageDto,
  SubmitDeliverableDto,
  TransactionQueryDto,
  UpdateCreatorProfileDto,
  UploadDto,
  WithdrawDto,
} from './creator.dto';

@ApiTags('Creator')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('creator')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.creatorService.getProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() body: UpdateCreatorProfileDto) {
    return this.creatorService.updateProfile(req.user.id, body);
  }

  @Post('upload-photo')
  uploadPhoto(@Request() req: any, @Body() body: UploadDto) {
    return this.creatorService.uploadPhoto(req.user.id, body);
  }

  @Post('upload-media-kit')
  uploadMediaKit(@Request() req: any, @Body() body: UploadDto) {
    return this.creatorService.uploadMediaKit(req.user.id, body);
  }

  @Get('campaigns')
  getCampaigns(@Request() req: any, @Query() query: CreatorCampaignQueryDto) {
    return this.creatorService.getCampaigns(req.user?.id, query);
  }

  @Get('campaigns/:id')
  getCampaign(@Param('id') id: string) {
    return this.creatorService.getCampaign(id);
  }

  @Post('apply/:campaignId')
  apply(@Request() req: any, @Param('campaignId') campaignId: string, @Body() body: ApplyCampaignDto) {
    return this.creatorService.apply(req.user.id, campaignId, body);
  }

  @Get('applications')
  getApplications(@Request() req: any, @Query() query: ApplicationQueryDto) {
    return this.creatorService.getApplications(req.user.id, query);
  }

  @Get('applications/:id')
  getApplication(@Request() req: any, @Param('id') id: string) {
    return this.creatorService.getApplication(req.user.id, id);
  }

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.creatorService.getDashboard(req.user.id);
  }

  @Get('deliverables')
  getDeliverables(@Request() req: any) {
    return this.creatorService.getDeliverables(req.user.id);
  }

  @Post('deliverables/:id/submit')
  submitDeliverable(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: SubmitDeliverableDto,
  ) {
    return this.creatorService.submitDeliverable(req.user.id, id, body);
  }

  @Get('wallet')
  getWallet(@Request() req: any) {
    return this.creatorService.getWallet(req.user.id);
  }

  @Post('wallet/withdraw')
  withdraw(@Request() req: any, @Body() body: WithdrawDto) {
    return this.creatorService.withdraw(req.user.id, body);
  }

  @Get('wallet/transactions')
  getWalletTransactions(@Request() req: any, @Query() query: TransactionQueryDto) {
    return this.creatorService.getWalletTransactions(req.user.id, query);
  }

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.creatorService.getConversations(req.user.id);
  }

  @Get('messages/:conversationId')
  getMessages(@Request() req: any, @Param('conversationId') conversationId: string) {
    return this.creatorService.getMessages(req.user.id, conversationId);
  }

  @Post('messages/send')
  sendMessage(@Request() req: any, @Body() body: SendMessageDto) {
    return this.creatorService.sendMessage(req.user.id, body);
  }

  @Get('notifications')
  getNotifications(@Request() req: any, @Query() query: NotificationQueryDto) {
    return this.creatorService.getNotifications(req.user.id, query);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(@Request() req: any, @Param('id') id: string) {
    return this.creatorService.markNotificationRead(req.user.id, id);
  }

  @Get('settings')
  getSettings(@Request() req: any) {
    return this.creatorService.getSettings(req.user.id);
  }

  @Put('settings')
  updateSettings(@Request() req: any, @Body() body: Record<string, any>) {
    return this.creatorService.updateSettings(req.user.id, body);
  }
}
