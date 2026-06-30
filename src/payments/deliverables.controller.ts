import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { DELIVERABLE_MAX_UPLOAD_BYTES } from '../storage/storage.constants';
import { DeliverablesService } from './deliverables.service';
import {
  DeliverableRejectDto,
  DeliverableRevisionDto,
  SubmitDeliverableDto,
} from './dto/deliverables.dto';

function toUploadPayload(file: Express.Multer.File) {
  return {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}

@ApiTags('Deliverables')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Post('upload')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload deliverable video/image to storage (returns URL)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        thumbnail: { type: 'string', format: 'binary' },
        campaign_id: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      { limits: { fileSize: DELIVERABLE_MAX_UPLOAD_BYTES } },
    ),
  )
  upload(
    @Request() req: { user: { id: string } },
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    @Body() body: { campaign_id?: string },
  ) {
    const file = files.file?.[0];
    if (!file) throw new BadRequestException('file is required');
    return this.deliverablesService.uploadMedia(req.user.id, toUploadPayload(file), {
      campaignId: body.campaign_id,
      thumbnail: files.thumbnail?.[0] ? toUploadPayload(files.thumbnail[0]) : undefined,
    });
  }

  @Post('submit-file')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file and submit deliverable in one step (escrow must be HELD)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        thumbnail: { type: 'string', format: 'binary' },
        deliverable_id: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['file', 'deliverable_id'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      { limits: { fileSize: DELIVERABLE_MAX_UPLOAD_BYTES } },
    ),
  )
  submitFile(
    @Request() req: { user: { id: string } },
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    @Body() body: { deliverable_id: string; notes?: string },
  ) {
    const file = files.file?.[0];
    if (!file) throw new BadRequestException('file is required');
    if (!body.deliverable_id) throw new BadRequestException('deliverable_id is required');
    return this.deliverablesService.submitWithUpload(
      req.user.id,
      body.deliverable_id,
      toUploadPayload(file),
      body.notes,
      files.thumbnail?.[0] ? toUploadPayload(files.thumbnail[0]) : undefined,
    );
  }

  @Post('submit')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Submit deliverable with existing file URL (requires escrow HELD)' })
  submit(@Request() req: { user: { id: string } }, @Body() body: SubmitDeliverableDto) {
    return this.deliverablesService.submit(req.user.id, body);
  }

  @Get(':campaignId')
  @Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List deliverables for a campaign' })
  list(
    @Request() req: { user: { id: string; role?: { name: string } } },
    @Param('campaignId') campaignId: string,
  ) {
    return this.deliverablesService.listByCampaign(req.user.id, campaignId, req.user.role?.name);
  }

  @Post(':id/request-revision')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Request revision on a deliverable' })
  requestRevision(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: DeliverableRevisionDto,
  ) {
    return this.deliverablesService.requestRevision(req.user.id, id, body);
  }

  @Post(':id/approve')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve deliverable and release escrow when all approved' })
  approve(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.deliverablesService.approve(req.user.id, id);
  }

  @Post(':id/reject')
  @Roles('BRAND', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Reject a deliverable' })
  reject(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: DeliverableRejectDto,
  ) {
    return this.deliverablesService.reject(req.user.id, id, body);
  }
}
