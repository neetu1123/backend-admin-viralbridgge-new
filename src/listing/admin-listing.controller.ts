import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { ListingService } from './listing.service';
import { AdminListingUpdateDto, ListingSearchQueryDto } from './listing.dto';

@ApiTags('Admin Listings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/listings')
export class AdminListingController {
  constructor(private readonly listings: ListingService) {}

  @Get()
  @ApiOperation({ summary: 'Admin free listing queue' })
  list(@Query() query: ListingSearchQueryDto) {
    return this.listings.adminList(query);
  }

  @Get('reports')
  reports() {
    return this.listings.adminReports();
  }

  @Get('analytics')
  analytics() {
    return this.listings.adminAnalytics();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: AdminListingUpdateDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.listings.adminUpdate(id, body, req.user!.id);
  }
}
