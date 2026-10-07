import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { PROFILE_MAX_UPLOAD_BYTES } from '../storage/storage.constants';
import { ListingService } from './listing.service';
import { CreateListingDto, ListingSuggestionQueryDto, UpdateListingDto } from './listing.dto';

@ApiTags('Listings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('listings')
export class ListingOwnerController {
  constructor(private readonly listings: ListingService) {}

  @Post()
  @ApiOperation({ summary: 'Create or resume a free listing draft' })
  create(@Request() req: { user: { id: string } }, @Body() body: CreateListingDto) {
    return this.listings.create(req.user.id, body);
  }

  @Get('me')
  mine(@Request() req: { user: { id: string } }) {
    return this.listings.getMine(req.user.id);
  }

  @Get('me/enquiries')
  enquiries(@Request() req: { user: { id: string } }) {
    return this.listings.getEnquiries(req.user.id);
  }

  @Get('me/analytics')
  analytics(@Request() req: { user: { id: string } }) {
    return this.listings.getAnalytics(req.user.id);
  }

  @Get('me/suggestions')
  suggestions(
    @Request() req: { user: { id: string } },
    @Query() query: ListingSuggestionQueryDto,
  ) {
    return this.listings.getSuggestions(req.user.id, query);
  }

  @Post('me/request-access')
  requestAccess(@Request() req: { user: { id: string } }) {
    return this.listings.requestFullAccess(req.user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: PROFILE_MAX_UPLOAD_BYTES } }))
  upload(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('image file is required');
    }
    return this.listings.uploadImage(req.user.id, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: UpdateListingDto,
  ) {
    return this.listings.update(req.user.id, id, body);
  }

  @Post(':id/publish')
  publish(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.listings.publish(req.user.id, id);
  }

  @Post(':id/unpublish')
  unpublish(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.listings.unpublish(req.user.id, id);
  }

  @Post(':id/archive')
  archive(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.listings.archive(req.user.id, id);
  }

  @Post(':id/upgrade')
  upgrade(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.listings.upgrade(req.user.id, id);
  }
}
